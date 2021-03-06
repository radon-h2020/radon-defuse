import joblib
import re

from flask import make_response
from flask_restful import Resource, reqparse
from google.cloud.exceptions import NotFound


class Report(Resource):

    def __init__(self, **kwargs):
        self.bucket = kwargs['bucket']
        self.db = kwargs['db']

    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('model_id', type=str, required=True, location='args')
        model_id = parser.parse_args().get('model_id')

        try:
            blob = self.bucket.blob(f'models/{model_id}.joblib')

            with blob.open("rb") as f:
                model = joblib.load(f)

            auc_pr = {}
            mcc = {}
            precision = {}
            recall = {}

            splits = [key for key in model['report'].keys() if 'split' in key]
            splits.sort()

            n_releases = int(re.match(r'split(\d+)', splits[-1]).groups()[0]) + 1

            for i in range(n_releases):
                auc_pr[i] = model['report'][f'split{i}_test_average_precision']
                mcc[i] = model['report'][f'split{i}_test_mcc']
                precision[i] = model['report'][f'split{i}_test_precision']
                recall[i] = model['report'][f'split{i}_test_recall']

            report = {
                'splits': {
                    'auc-pr': auc_pr,
                    'mcc': mcc,
                    'precision': precision,
                    'recall': recall
                },
                'overall': {
                    'mean_test_auc_pr': model['report']['mean_test_average_precision'],
                    'std_test_auc_pr': model['report']['std_test_average_precision'],
                    'mean_test_mcc': model['report']['mean_test_mcc'],
                    'std_test_mcc': model['report']['std_test_mcc'],
                    'mean_test_precision': model['report']['mean_test_precision'],
                    'std_test_precision': model['report']['std_test_precision'],
                    'mean_test_recall': model['report']['mean_test_recall'],
                    'std_test_recall': model['report']['std_test_recall']
                }
            }

            return make_response(report, 200)

        except NotFound:
            return make_response({}, 404)
