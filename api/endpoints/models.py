import base64
import numpy as np
import os
import json
import pandas as pd

import joblib
import jsonpickle
from sklearn.metrics.pairwise import cosine_similarity

MODELS_ROOT = os.path.join(os.path.realpath(__file__).rsplit(os.sep, 3)[0], 'models')


def get_pre_trained_model(body: dict):
    """
    Get the pre-trained model of the most similar project.
    :param body: a json containing scores for the following attributes:
     - commit_frequency
     - core_contributors
     - issue_frequency
     - percent_comments
     - percent_iac
     - sloc
     - releases
     - percent_defects
     - commits

    :return: a JSON file consisting of two properties:
    attributes: List<strings>
    model: <string>
    """

    repos = pd.read_csv(os.path.join(MODELS_ROOT, 'repositories.csv'))

    X = np.array([body.get('commitFrequency', 0),
                  body.get('coreContributors', 0),
                  body.get('issueFrequency', 0),
                  body.get('percentComments', 0),
                  body.get('percentIac', 0),
                  body.get('sloc', 0),
                  body.get('releases', 0),
                  body.get('percentDefects', 0),
                  body.get('commits', 0)]).reshape(1, -1)

    most_similar = [0, None]

    similarities = dict()
    for _, row in repos.iterrows():

        Y = np.array([row['commit_frequency'],
                      row['core_contributors'],
                      row['issue_frequency'],
                      row['percent_comments'],
                      row['percent_iac'],
                      row['sloc'],
                      row['releases'],
                      row['percent_defects'],
                      row['commits']]).reshape(1, -1)

        try:
            cos = cosine_similarity(X, Y)[0][0]

            if cos > most_similar[0]:
                most_similar[0] = cos
                most_similar[1] = row['repository']

        except ValueError:
            continue

    model = joblib.load(os.path.join(MODELS_ROOT, f'{most_similar[1]}.pkl'), mmap_mode='r')

    with open(os.path.join(MODELS_ROOT, f'{most_similar[1]}.json')) as file:
        attributes = json.load(file)

    response = dict(
        model=jsonpickle.encode(model),
        attributes=attributes
    )

    return response, 200
