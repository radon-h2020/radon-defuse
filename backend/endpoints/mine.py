from flask import jsonify, make_response
from flask_restful import Resource, Api, reqparse
from repominer.mining.ansible import AnsibleMiner
from repominer.mining.tosca import ToscaMiner
from repominer.files import FixedFileDecoder, FixedFileEncoder, FailureProneFileEncoder


class Mine(Resource):

    def __init__(self, **kwargs):
        print(kwargs['db'])
        self.db = kwargs['db']

    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('id', required=True)
        parser.add_argument('language', required=True)

        args = parser.parse_args()  # parse arguments to dictionary
        url = self.db.collection('repositories').document(str(args.get('id'))).get().to_dict().get('url')

        if args.get('language').lower() == 'ansible':
            miner = AnsibleMiner(url, args.get('branch'))
        elif args.get('language').lower() == 'tosca':
            miner = ToscaMiner(url, args.get('branch'))
        else:
            return jsonify({'error': 'Language not supported. Select ansible or tosca'}), 403

        for hash, defects in miner.get_fixing_commits().items():
            self.db.collection('commits').document(hash).set({
                'hash': hash,
                'is_valid': True,
                'repository_id': args.get('id'),
                'defects': defects,
                'languages': [args.get('language').lower()]  # if exists: set(languages + new language)
            })

        for file in miner.get_fixed_files():
            file = FixedFileEncoder().default(file)
            # TODO check it does not exist
            self.db.collection('fixed-files').add({
                'hash_fix': file['fic'],
                'hash_bic': file['bic'],
                'filepath': file['filepath'],
                'is_valid': True,
                'repository_id': args.get('id'),
                'languages': [args.get('language').lower()]  # if exists: set(languages + new language)
            })

        return make_response(jsonify({"status": 'completed'}), 200)
