import os, json
from firebase_admin import credentials, firestore, initialize_app, storage
from flask import Flask
from flask_restful import Api

import endpoints

# Initialize Firestore DB
with open('.key.json') as f:
    fb_storage_path = f'{json.load(f)["project_id"]}.appspot.com'

cred = credentials.Certificate('.key.json')
initialize_app(cred, {'storageBucket': fb_storage_path})
db = firestore.client()
bucket = storage.bucket(fb_storage_path)

app = Flask(__name__)
api = Api(app)

api.add_resource(endpoints.Log, '/log', resource_class_kwargs={'db': db, 'bucket': bucket})
api.add_resource(endpoints.Mine, '/mine', resource_class_kwargs={'db': db})
api.add_resource(endpoints.Model, '/model', resource_class_kwargs={'db': db, 'bucket': bucket})
api.add_resource(endpoints.Train, '/train', resource_class_kwargs={'db': db, 'bucket': bucket})
api.add_resource(endpoints.Predict, '/predict', resource_class_kwargs={'db': db, 'bucket': bucket})
api.add_resource(endpoints.Report, '/report', resource_class_kwargs={'db': db, 'bucket': bucket})
api.add_resource(endpoints.Repository, '/repository', resource_class_kwargs={'db': db, 'bucket': bucket})


@app.route('/')
def hello_world():
    return 'Welcome to DEFUSE\'s APIs'


if __name__ == "__main__":
    FLASK_HOST = os.getenv('FLASK_HOST') if os.getenv('FLASK_HOST') else '0.0.0.0'
    FLASK_PORT = os.getenv('FLASK_PORT') if os.getenv('FLASK_PORT') else '5000'
    app.run(host=FLASK_HOST, port=FLASK_PORT, debug=True)
