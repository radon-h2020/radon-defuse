import os
import shutil
import time
import threading

from flask import jsonify, make_response
from flask_restful import Resource, Api, reqparse
from repominer.mining.ansible import AnsibleMiner
from repominer.mining.tosca import ToscaMiner
from repominer.files import FixedFileDecoder, FixedFileEncoder, FailureProneFileEncoder

import sys


class Mine(Resource):

    def __init__(self, **kwargs):
        print(kwargs['db'])
        self.db = kwargs['db']

    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('id', type=int, required=True)
        parser.add_argument('language', type=str, required=True)
        parser.add_argument('branch', type=str, required=True)

        self.args = parser.parse_args()  # parse arguments to dictionary

        # Create Task
        task_id = self.db.collection('tasks').add({
            'task': 'mine',
            'repo_id': self.args.get('id'),
            'language': self.args.get('language'),
            'branch': self.args.get('branch'),
            'status': 'progress',
            'started_at': time.time()
        })[1].id

        thread = threading.Thread(target=self.run_task, name="miner", args=(task_id,))
        thread.start()

        return make_response(jsonify({}), 202)

    def run_task(self, task_id: str):
        status = 'completed'

        clone_repo_to = os.path.join('/tmp', task_id)
        os.makedirs(clone_repo_to)

        try:
            url = self.db.collection('repositories').document(str(self.args.get('id'))).get().to_dict().get('url')

            if self.args.get('language').lower() == 'ansible':
                miner = AnsibleMiner(url, self.args.get('branch'), clone_repo_to)
            elif self.args.get('language').lower() == 'tosca':
                miner = ToscaMiner(url, self.args.get('branch'), clone_repo_to)
            else:
                return jsonify({'error': 'Language not supported. Select ansible or tosca'}), 403

            for hash, defects in miner.get_fixing_commits().items():

                commit_ref = self.db.collection('commits').document(hash)
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
                        'hash': hash,
                        'is_valid': True,
                        'repository_id': int(self.args.get('id')),
                        'defects': defects,
                        'languages': [self.args.get('language').lower()]
                    })

            existing_files = [
                doc.to_dict() for doc in self.db.collection('fixed-files') \
                    .where('repository_id', '==', self.args.get('id')) \
                    .where('language', '==', self.args.get('language')).stream()
            ]

            print(existing_files, file=sys.stderr)

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
