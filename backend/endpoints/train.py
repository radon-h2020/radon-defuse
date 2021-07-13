import joblib
import os
import shutil
import time
import threading

from contextlib import redirect_stdout

from io import BytesIO, StringIO
from flask import jsonify, make_response
from flask_restful import Resource, reqparse

from repominer.mining.ansible import AnsibleMiner
from repominer.mining.tosca import ToscaMiner
from repominer.metrics.ansible import AnsibleMetricsExtractor
from repominer.metrics.tosca import ToscaMetricsExtractor
from repominer.files import FixedFileDecoder

from .classifier import DefectPredictor

from enum import Enum


class Status(Enum):
    COMPLETED = 'completed'
    FAILED = 'failed'
    PROGRESS = 'progress'


class Train(Resource):

    def __init__(self, **kwargs):
        self.db = kwargs['db']
        self.bucket = kwargs['bucket']
        self.task_id = None
        self.status = None

    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('id', type=int, required=True)
        parser.add_argument('language', type=str, required=True, choices=('ansible', 'tosca'))
        parser.add_argument('defect', type=str, required=True,
                            choices=('conditional', 'configuration_data', 'dependency', 'documentation', 'idempotency',
                                     'security', 'service', 'syntax'))

        self.args = parser.parse_args()  # parse arguments to dictionary

        # Create Task
        self.task_id = self.db.collection('tasks').add({
            'name': 'train',
            'repository_id': self.args.get('id'),
            'language': self.args.get('language'),
            'defect': self.args.get('defect'),
            'status': 'progress',
            'started_at': time.time()
        })[1].id

        thread = threading.Thread(target=self.run_task, name="trainer")
        thread.start()

        return make_response(jsonify({}), 202)

    def run_task(self):
        self.status = Status.PROGRESS
        clone_repo_to = os.path.join('/tmp', self.task_id)
        os.makedirs(clone_repo_to)

        repo_doc = self.db.collection('repositories').document(str(self.args.get('id'))).get().to_dict()
        url = repo_doc.get('url')
        default_branch = repo_doc.get('default_branch')

        if self.args.get('language').lower() == 'ansible':
            miner = AnsibleMiner(url, default_branch, clone_repo_to)
            metrics_extractor = AnsibleMetricsExtractor(url, 'release', clone_repo_to)
        elif self.args.get('language').lower() == 'tosca':
            miner = ToscaMiner(url, default_branch, clone_repo_to)
            metrics_extractor = ToscaMetricsExtractor(url, 'release', clone_repo_to)

        # Get valid fixing-commits for the repository, language, and defect
        commits = self.db.collection('commits') \
            .where('repository_id', '==', self.args.get('id')) \
            .where('is_valid', '==', True) \
            .where('languages', 'array_contains', self.args.get('language')).stream()

        for doc in commits:
            doc = doc.to_dict()
            if self.args.get('defect').upper() in doc['defects']:
                miner.fixing_commits.append(doc['hash'])

        miner.sort_commits(miner.fixing_commits)

        # Get valid fixed-files for the repository and language
        files = self.db.collection('fixed-files') \
            .where('repository_id', '==', self.args.get('id')) \
            .where('is_valid', '==', True) \
            .where('language', '==', self.args.get('language')).stream()

        decoder = FixedFileDecoder()
        for doc in files:
            doc = doc.to_dict()

            if doc['hash_fix'] in miner.fixing_commits:
                doc['fic'] = doc['hash_fix']
                doc['bic'] = doc['hash_bic']
                miner.fixed_files.append(decoder.to_object(doc))

        failure_prone_files = [file for file in miner.label()]
        metrics_extractor.extract(failure_prone_files, product=True, process=False, delta=False)

        try:
            self.train_model(metrics_extractor.dataset)
        finally:
            shutil.rmtree(clone_repo_to)

        # Update status
        doc_ref = self.db.collection('tasks').document(self.task_id)
        doc_ref.update({
            'status': self.status.value,
            'ended_at': time.time()
        })

    def train_model(self, data):
        # Remove releases with only failure_prone equal 0 or 1
        for commit in data.commit.unique():
            tmp = data[data.commit == commit]
            if tmp.failure_prone.to_list().count(0) == 0 or tmp.failure_prone.to_list().count(1) == 0:
                indices = data[data.commit == commit].index
                data.drop(indices, inplace=True)

        dp = DefectPredictor(data)

        with StringIO() as buf, redirect_stdout(buf):
            dp.train()
            output = buf.getvalue()

            if not dp.model:
                self.status = Status.FAILED
                blob = self.bucket.blob(f'logs/{self.task_id}.log')
                blob.upload_from_string(output)
                return

        # Create model record in collection models/
        model_id = self.db.collection('models').add({
            'repository_id': self.args.get('id'),
            'language': self.args.get('language'),
            'defect': self.args.get('defect'),
            'created_at': time.time(),
            'average_precision': round(dp.model['report']['mean_test_average_precision'], 2),
            'mcc': round(dp.model['report']['mean_test_mcc'], 2),
        })[1].id

        buf = BytesIO()
        joblib.dump(dp.model, buf)
        b_model = buf.getvalue()
        buf.close()

        blob = self.bucket.blob(f'{model_id}.joblib')
        blob.upload_from_string(b_model)

        self.status = Status.COMPLETED
