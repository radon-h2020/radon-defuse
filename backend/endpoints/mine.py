import os
import shutil
import time
import threading

from flask import jsonify, make_response
from flask_restful import Resource, reqparse
from pydriller.repository import Repository
from repominer.mining.ansible import AnsibleMiner
from repominer.mining.tosca import ToscaMiner


class Mine(Resource):

    def __init__(self, **kwargs):
        self.db = kwargs['db']

    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('id', type=int, required=True)
        parser.add_argument('language', type=str, required=True)

        self.args = parser.parse_args()  # parse arguments to dictionary

        # Create Task
        task_id = self.db.collection('tasks').add({
            'name': 'mine',
            'repository_id': self.args.get('id'),
            'language': self.args.get('language'),
            'status': 'progress',
            'started_at': time.time()
        })[1].id

        thread = threading.Thread(target=self.run_task, name="miner", args=(task_id,))
        thread.start()

        return make_response({}, 202)

    def run_task(self, task_id: str):
        status = 'completed'

        clone_repo_to = os.path.join('/tmp', task_id)
        os.makedirs(clone_repo_to)

        try:
            repo_doc = self.db.collection('repositories').document(str(self.args.get('id'))).get().to_dict()
            full_name = repo_doc.get('full_name')
            url = repo_doc.get('url')
            default_branch = repo_doc.get('default_branch')

            if self.args.get('language').lower() == 'ansible':
                miner = AnsibleMiner(url_to_repo=url, clone_repo_to=clone_repo_to, branch=default_branch)
            elif self.args.get('language').lower() == 'tosca':
                miner = ToscaMiner(url_to_repo=url, clone_repo_to=clone_repo_to, branch=default_branch)
            else:
                return jsonify({'error': 'Language not supported. Select ansible or tosca'}), 403

            hash_msg = {}
            path_to_local_repo = os.path.join(clone_repo_to, full_name.split('/')[1])
            for commit in Repository(path_to_repo=path_to_local_repo).traverse_commits():
                hash_msg[commit.hash] = commit.msg

            for commit_hash, defects in miner.get_fixing_commits().items():

                commit_ref = self.db.collection('commits').document(commit_hash)
                commit_doc = commit_ref.get()

                if commit_doc.exists:
                    doc_languages = commit_doc.to_dict().get('languages', [])

                    if self.args.get('language').lower() not in doc_languages:
                        doc_languages.append(self.args.get('language').lower())
                        commit_ref.update({
                            'languages': list(set(doc_languages))
                        })
                else:
                    commit_ref.set({
                        'hash': commit_hash,
                        'msg': hash_msg.pop(commit_hash, ''),
                        'is_valid': True,
                        'repository_id': int(self.args.get('id')),
                        'defects': defects,
                        'languages': [self.args.get('language').lower()]
                    })

            existing_files = [
                doc.to_dict() for doc in self.db.collection('fixed-files')
                    .where('repository_id', '==', self.args.get('id'))
                    .where('language', '==', self.args.get('language'))
                    .stream()
            ]

            for file in miner.get_fixed_files():

                if not any(
                        [doc['hash_fix'] == file.fic and doc['filepath'] == file.filepath] for doc in existing_files):
                    self.db.collection('fixed-files').add({
                        'hash_fix': file.fic,
                        'hash_bic': file.bic,
                        'filepath': file.filepath,
                        'is_valid': True,
                        'repository_id': int(self.args.get('id')),
                        'language': self.args.get('language').lower()
                    })

        except Exception:
            status = 'failed'

        finally:
            shutil.rmtree(clone_repo_to)

        doc_ref = self.db.collection('tasks').document(task_id)
        doc_ref.update({
            'status': status,
            'ended_at': time.time()
        })
