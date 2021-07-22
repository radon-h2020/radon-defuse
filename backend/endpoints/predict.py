import joblib
import pandas as pd

from flask import jsonify, make_response, request
from flask_restful import Resource, reqparse
from google.cloud.exceptions import NotFound

from .classifier import DefectPredictor


class Predict(Resource):

    def __init__(self, **kwargs):
        self.db = kwargs['db']
        self.bucket = kwargs['bucket']

    def get(self):

        model_id = None
        metrics = {}

        for k, v in dict(request.args).items():
            if k == 'model_id':
                model_id = v
            else:
                metrics[k] = float(v)

        try:
            blob = self.bucket.blob(f'models/{model_id}.joblib')

            with blob.open("rb") as f:
                model = joblib.load(f)

            dp = DefectPredictor()
            dp.load(estimator=model['estimator'], features=model['features'])

            unseen_data = pd.DataFrame(metrics, index=[0])
            prediction = dp.predict(unseen_data)

            return make_response(prediction, 200)

        except NotFound:
            return make_response({}, 404)
