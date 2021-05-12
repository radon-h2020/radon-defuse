import os
import shutil
import time
import threading

from flask import jsonify, make_response
from flask_restful import Resource, Api, reqparse

from radondp.predictors import DefectPredictor
from repominer.mining.ansible import AnsibleMiner
from repominer.mining.tosca import ToscaMiner
from repominer.metrics.ansible import AnsibleMetricsExtractor
from repominer.metrics.tosca import ToscaMetricsExtractor
from repominer.files import FixedFileDecoder, FixedFileEncoder, FailureProneFileEncoder


class Train(Resource):

    def __init__(self, **kwargs):
        self.db = kwargs['db']
        self.bucket = kwargs['bucket']

    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('id', type=int, required=True)
        parser.add_argument('language', type=str, required=True, choices=('ansible', 'tosca'))
        parser.add_argument('defect', type=str, required=True,
                            choices=('conditional', 'configuration_data', 'dependency', 'security', 'service'))

        self.args = parser.parse_args()  # parse arguments to dictionary

        # Create Task
        task_id = self.db.collection('tasks').add({
            'name': 'train',
            'repository_id': self.args.get('id'),
            'language': self.args.get('language'),
            'defect': self.args.get('defect'),
            'status': 'progress',
            'started_at': time.time()
        })[1].id

        thread = threading.Thread(target=self.run_task, name="trainer", args=(task_id,))
        thread.start()

        return make_response(jsonify({}), 202)

    def run_task(self, task_id: str):
        status = 'completed'
        clone_repo_to = os.path.join('/tmp', task_id)
        os.makedirs(clone_repo_to)

        try:
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
            metrics_extractor.extract(failure_prone_files, product=False, process=True, delta=False)

            trained = self.__train_model(metrics_extractor.dataset)

            if not trained:
                status = 'failed'

        except Exception as e:
            status = 'failed'
        finally:
            shutil.rmtree(clone_repo_to)

        doc_ref = self.db.collection('tasks').document(task_id)
        doc_ref.update({
            'status': status,
            'ended_at': time.time()
        })

    def __train_model(self, data):

        dp = DefectPredictor()
        dp.balancers = ['none']
        dp.normalizers = ['minmax']
        dp.classifiers = ['dt']

        # Remove releases with only failure_prone equal 0 or 1
        for commit in data.commit.unique():
            tmp = data[data.commit == commit]
            if tmp.failure_prone.to_list().count(0) == 0 or tmp.failure_prone.to_list().count(1) == 0:
                indices = data[data.commit == commit].index
                data.drop(indices, inplace=True)

        try:
            dp.train(data)
            b_model = dp.dumps_model()

            # Create model record
            model_id = self.db.collection('models').add({
                'repository_id': self.args.get('id'),
                'language': self.args.get('language'),
                'defect': self.args.get('defect'),
                'created_at': time.time(),
                'average_precision': round(dp.best_estimator_average_precision, 4)
            })[1].id

            blob = self.bucket.blob(f'{model_id}.joblib')
            metadata = {
                'defect': self.args.get('defect'),
                'language': self.args.get('language'),
                'repository_id': self.args.get('id')
            }
            blob.metadata = metadata
            blob.upload_from_string(b_model)

        except:
            return False

        return True
