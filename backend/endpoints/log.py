from flask import make_response
from flask_restful import Resource, reqparse
from google.cloud.exceptions import NotFound


class Log(Resource):

    def __init__(self, **kwargs):
        self.bucket = kwargs['bucket']
        self.db = kwargs['db']

    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('task_id', type=str, required=True)
        task_id = parser.parse_args().get('task_id')

        try:
            blob = self.bucket.blob(f'logs/{task_id}.log')
            log = blob.download_as_string()
            return log.decode()

        except NotFound:
            return make_response({}, 404)
