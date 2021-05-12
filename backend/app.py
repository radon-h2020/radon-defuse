import os, json
from firebase_admin import credentials, firestore, initialize_app, storage
from flask import Flask
from flask_restful import Api

from endpoints.mine import Mine
from endpoints.train import Train

# Initialize Firestore DB
with open('.key.json') as f:
    fb_storage_path = f'{json.load(f)["project_id"]}.appspot.com'

cred = credentials.Certificate('.key.json')
initialize_app(cred, {'storageBucket': fb_storage_path})
db = firestore.client()
bucket = storage.bucket(fb_storage_path)

app = Flask(__name__)
api = Api(app)

api.add_resource(Mine, '/mine', resource_class_kwargs={'db': db})
api.add_resource(Train, '/train', resource_class_kwargs={'db': db, 'bucket': bucket})

#
# @app.route('/')
# def hello_world():
#     return 'Hello, World!'
#
#


if __name__ == "__main__":
    app.run(host=os.getenv('FLASK_HOST'), port=os.getenv('FLASK_PORT'), debug=True)
