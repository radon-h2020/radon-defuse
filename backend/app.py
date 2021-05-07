import json
import os
from flask import Flask, request, jsonify
from repominer.mining.ansible import AnsibleMiner
from repominer.mining.tosca import ToscaMiner
from repominer.files import FailureProneFileEncoder, FixedFileEncoder

from firebase_admin import credentials, firestore, initialize_app


# Initialize Firestore DB
cred = credentials.Certificate('.key.json')
initialize_app(cred)
db = firestore.client()

repos_ref = db.collection('repositories')
commits_ref = db.collection('commits')
fixed_files_ref = db.collection('fixed-files')
failure_prone_files_ref = db.collection('fixed-files')

app = Flask(__name__)


@app.route('/')
def hello_world():
    return 'Hello, World!'


@app.route('/mine', methods=['GET'])
def mine():
    id = request.args.get('id')
    language = request.args.get('language')
    branch = request.args.get('branch', 'master')

    if not (id and language):
        return jsonify({}), 403

    url = repos_ref.document(str(id)).get().to_dict().get('url')

    miner = AnsibleMiner(url, branch) if language.lower() == 'ansible' else ToscaMiner(url, branch)

    for hash, defects in miner.get_fixing_commits().items():
        commits_ref.document(hash).set({
            'hash': hash,
            'defects': defects,
            'is_valid': True,
            'repository_id': id
            # todo Add msg
        })

    for file in miner.get_fixed_files():
        file = FixedFileEncoder().default(file)
        # TODO check it does not exist
        fixed_files_ref.add({
            'hash_fix': file['fic'],
            'hash_bic': file['bic'],
            'path': file['filepath'],
            'is_valid': True,
            'repository_id': id
        })

    for file in miner.label():
        file = FailureProneFileEncoder().default(file)
        # TODO check it does not exist
        failure_prone_files_ref.add({
            'commit': file['commit'],
            'fixing_commit': file['fixing_commit'],
            'path': file['filepath'],
            'is_valid': True,
            'repository_id': id
        })

    return jsonify({"status": "completed"}), 200


if __name__ == "__main__":
    app.run(host=os.getenv('FLASK_HOST'), port=os.getenv('FLASK_PORT'), debug=True)
