import joblib
import pandas as pd

from flask import jsonify, make_response
from flask_restful import Resource, reqparse
from google.cloud.exceptions import NotFound

from .classifier import DefectPredictor


class Predict(Resource):

    def __init__(self, **kwargs):
        self.db = kwargs['db']
        self.bucket = kwargs['bucket']

    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('model_id', type=str, required=True)
        parser.add_argument('metrics', type=dict, required=True)

        model_id = parser.parse_args().get('model_id')
        metrics = parser.parse_args().get('metrics')

        try:
            blob = self.bucket.blob(f'models/{model_id}.joblib')

            with blob.open("rb") as f:
                model = joblib.load(f)

            dp = DefectPredictor()
            dp.load(estimator=model['estimator'], features=model['features'])

            unseen_data = pd.DataFrame(metrics)
            prediction = dp.predict(unseen_data)

            return make_response(prediction, 200)

        except NotFound:
            return make_response({}, 404)
