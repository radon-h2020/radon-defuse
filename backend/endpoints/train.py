from flask import jsonify, make_response
from flask_restful import Resource, Api, reqparse
from repominer.mining.ansible import AnsibleMiner
from repominer.mining.tosca import ToscaMiner
from repominer.metrics.ansible import AnsibleMetricsExtractor
from repominer.metrics.tosca import ToscaMetricsExtractor
from repominer.files import FixedFileDecoder, FixedFileEncoder, FailureProneFileEncoder


class Train(Resource):

    def __init__(self, **kwargs):
        print(kwargs['db'])
        self.db = kwargs['db']

    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('id', required=True)
        parser.add_argument('language', required=True)
        parser.add_argument('branch', required=True)

        args = parser.parse_args()  # parse arguments to dictionary
        url = self.db.collection('repositories').document(str(args.get('id'))).get().to_dict().get('url')

        if args.get('language').lower() == 'ansible':
            miner = AnsibleMiner(url, args.get('branch'))
            metricsExtractor = AnsibleMetricsExtractor(url, at='release')
        elif args.get('language').lower() == 'tosca':
            miner = ToscaMiner(url, args.get('branch'))
            metricsExtractor = ToscaMetricsExtractor(url, at='release')
        else:
            return jsonify({'error': 'Language not supported. Select ansible or tosca'}), 403

        # Get valid fixing-commits for the repository and language
        commits = self.db.collection('commits') \
            .where('repository_id', '==', id) \
            .where('is_valid', '==', True) \
            .where('languages', 'array_contains', args.get('language')).stream()

        for doc in commits:
            miner.fixing_commits.append(doc.to_dict().get('hash'))

        miner.sort_commits(miner.fixing_commits)

        # Get valid fixed-files for the repository and language
        files = self.db.collection('fixed-files') \
            .where('repository_id', '==', id) \
            .where('is_valid', '==', True) \
            .where('languages', 'array_contains', args.get('language')).stream()

        decoder = FixedFileDecoder()
        for doc in files:
            doc = doc.to_dict()
            doc['fic'] = doc['hash_fix']
            doc['bic'] = doc['hash_bic']
            miner.fixed_files.append(decoder.to_object(doc))

        failure_prone_files = [file for file in miner.label()]
        metricsExtractor.extract(failure_prone_files, product=True, process=False, delta=False)

        # Train using metricsExtractor.dataset
        print(metricsExtractor.dataset)

        return make_response(jsonify({"status": 'completed'}), 200)









