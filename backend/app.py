import os
from firebase_admin import credentials, firestore, initialize_app
from flask import Flask, request, jsonify
from flask_restful import Api

from endpoints.mine import Mine
from endpoints.train import Train

# Initialize Firestore DB
cred = credentials.Certificate('.key.json')
initialize_app(cred)
db = firestore.client()

app = Flask(__name__)
api = Api(app)

api.add_resource(Mine, '/mine', resource_class_kwargs={'db': db})
api.add_resource(Train, '/train', resource_class_kwargs={'db': db})

#
# @app.route('/')
# def hello_world():
#     return 'Hello, World!'
#
#


if __name__ == "__main__":
    app.run(host=os.getenv('FLASK_HOST'), port=os.getenv('FLASK_PORT'), debug=True)
