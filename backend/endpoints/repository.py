import re
import requests

from flask import make_response
from flask_restful import Resource, reqparse


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
        parser = reqparse.RequestParser()
        parser.add_argument('id', type=int, required=True)
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
        parser.add_argument('url', type=str, required=True)
        parser.add_argument('token', type=str, required=False)
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
