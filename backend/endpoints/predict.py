import time

from flask import jsonify, make_response
from flask_restful import Resource, Api, reqparse


class Predict(Resource):

    def __init__(self, **kwargs):
        self.db = kwargs['db']
        self.bucket = kwargs['bucket']

    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('id', type=str, required=True)  # Model id
        self.args = parser.parse_args()  # parse arguments to dictionary

        # Create Task
        task_id = self.db.collection('tasks').add({
            'name': 'predict',
            'repository_id': self.args.get('id'),
            'status': 'progress',
            'started_at': time.time()
        })[1].id

        # Predict
        # blob = self.bucket.blob(f'{self.args.get("id")}.joblib')
        # b_model = blob.download_as_bytes()

        # Save prediction in collection "predictions"?

        doc_ref = self.db.collection('tasks').document(task_id)
        doc_ref.update({
            'status': 'completed',
            'ended_at': time.time()
        })

        return make_response(jsonify({"failure-prone": True}), 200)
