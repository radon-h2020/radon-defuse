import git
import os
import re
import requests
import shutil
import time
import threading

from flask import make_response, jsonify
from flask_restful import Resource, reqparse
from reposcorer.scorer import score_repository


class Repository(Resource):

    def __init__(self, **kwargs):
        self.bucket = kwargs['bucket']
        self.db = kwargs['db']

    def __delete_commits(self, repo_id: int):
        batch = self.db.batch()
        commits = self.db.collection('commits').where('repository_id', '==', repo_id).stream()
        for doc in commits:
            batch.delete(doc.reference)

        batch.commit()

    def __delete_files(self, repo_id: int):
        batch = self.db.batch()
        files = self.db.collection('fixed-files').where('repository_id', '==', repo_id).stream()
        for doc in files:
            batch.delete(doc.reference)

        batch.commit()

    def __delete_models(self, repo_id: int):
        batch = self.db.batch()
        models = self.db.collection('models').where('repository_id', '==', repo_id).stream()
        for doc in models:
            blob = self.bucket.blob(f'models/{doc.id}.joblib')
            if blob.exists():
                blob.delete()

            batch.delete(doc.reference)

        batch.commit()

    def __delete_tasks(self, repo_id: int):
        batch = self.db.batch()
        tasks = self.db.collection('tasks').where('repository_id', '==', repo_id).stream()
        for doc in tasks:
            # Delete log if exists
            blob = self.bucket.blob(f'logs/{doc.id}.joblib')
            if blob.exists():
                blob.delete()

            batch.delete(doc.reference)

        batch.commit()

    def delete(self):
        """ Delete repository """
        parser = reqparse.RequestParser()
        parser.add_argument('id', type=int, required=True, location='args')
        repo_id = parser.parse_args().get('id')

        self.__delete_commits(repo_id)
        self.__delete_files(repo_id)
        self.__delete_models(repo_id)
        self.__delete_tasks(repo_id)

        # Finally, delete from collection 'repositories'
        self.db.collection('repositories').document(str(repo_id)).delete()

        return make_response({}, 204)

    def post(self):
        parser = reqparse.RequestParser()
        parser.add_argument('url', type=str, required=True, location='args')
        parser.add_argument('token', type=str, required=False, location='args')
        args = parser.parse_args()

        regex = r'https:\/\/(github|gitlab)\.com\/([\w\W]+)\/?'
        match = re.findall(regex, args.get('url'))

        if not match:
            return make_response({}, 400)

        host = match[0][0]
        full_name = match[0][1]
        headers = None

        if host == 'github':
            api_url = f'https://api.github.com/repos/{full_name}'
            if args.get('token'):
                headers = {'Authorization': f'token {args.get("token")}'}

        elif host == 'gitlab':
            api_url = f'https://gitlab.com/api/v4/projects/{full_name}'
            if args.get('token'):
                headers = {'PRIVATE-TOKEN': args.get('token')}
        else:
            return make_response({}, 400)

        response = requests.get(api_url, headers=headers)
        if response.status_code != 200:
            return make_response({}, response.status_code)

        repo = response.json()
        repo = {
            'id': repo['id'],
            'full_name': full_name,
            'url': args.get('url'),
            'default_branch': repo['default_branch']
        }

        if args.get('token'):
            repo.update({'token': args.get('token')})

        repo_ref = self.db.collection('repositories').document(str(repo['id']))
        repo_ref.set(repo)

        return make_response({}, 204)

    def patch(self):
        """ Compute scores for repository """
        parser = reqparse.RequestParser()
        parser.add_argument('id', type=int, required=True, location='args')
        self.args = parser.parse_args()

        # Create Task
        task_id = self.db.collection('tasks').add({
            'name': 'score',
            'repository_id': self.args.get('id'),
            'language': self.args.get('language'),
            'status': 'progress',
            'started_at': time.time()
        })[1].id

        thread = threading.Thread(target=self.calculate_scores, name="calculate_scores", args=(task_id,))
        thread.start()

        return make_response({}, 202)

    def calculate_scores(self, task_id: str):
        status = 'completed'

        clone_repo_to = os.path.join('/tmp', task_id)
        os.makedirs(clone_repo_to)

        try:
            repo_doc = self.db.collection('repositories').document(str(self.args.get('id'))).get().to_dict()
            full_name = repo_doc.get('full_name')

            git.Repo.clone_from(repo_doc.get('url'), clone_repo_to)

            scores = score_repository(
                path_to_repo=clone_repo_to,
                full_name=full_name,
                host='github' if 'github.com' in repo_doc.get('url') else 'gitlab',
                calculate_comments_ratio=True,
                calculate_commit_frequency=True,
                calculate_core_contributors=True,
                calculate_has_ci=True,
                calculate_has_license=True,
                calculate_iac_ratio=True,
                calculate_issue_frequency=False,
                calculate_repository_size=True)

            doc_ref = self.db.collection('repositories').document(str(repo_doc.get('id')))
            doc_ref.update(scores)

        except Exception as e:
            status = 'failed'
            print(e)

        finally:
            shutil.rmtree(clone_repo_to)

        doc_ref = self.db.collection('tasks').document(task_id)
        doc_ref.update({
            'status': status,
            'ended_at': time.time()
        })
