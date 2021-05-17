from flask import make_response
from flask_restful import Resource, reqparse
from google.cloud.exceptions import NotFound


class Model(Resource):

    def __init__(self, **kwargs):
        self.bucket = kwargs['bucket']
        self.db = kwargs['db']

    def delete(self):
        parser = reqparse.RequestParser()
        parser.add_argument('id', type=str, required=True)
        model_id = parser.parse_args().get('id')

        try:
            blob = self.bucket.blob(f'{model_id}.joblib')
            blob.delete()

            self.db.collection('models').document(model_id).delete()
            return make_response({}, 204)
        except NotFound:
            return make_response({}, 404)
