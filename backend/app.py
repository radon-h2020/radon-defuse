import json
import os
from flask import Flask

app = Flask(__name__)


@app.route('/')
def hello_world():
    return 'Hello, World!'


@app.route('/mine')
def mine():
    return json.dumps({'operation': 'mining'})


if __name__ == "__main__":
    app.run(host=os.getenv('FLASK_HOST'), port=os.getenv('FLASK_PORT'))
