import joblib

from flask import make_response
from flask_restful import Resource, reqparse
from google.cloud.exceptions import NotFound


class Report(Resource):

    def __init__(self, **kwargs):
        self.bucket = kwargs['bucket']
        self.db = kwargs['db']

    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('model_id', type=str, required=True)
        model_id = parser.parse_args().get('model_id')

        try:
            blob = self.bucket.blob(f'models/{model_id}.joblib')

            with blob.open("rb") as f:
                model = joblib.load(f)

            return make_response(model['report'], 200)

        except NotFound:
            return make_response({}, 404)
