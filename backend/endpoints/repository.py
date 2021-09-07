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
