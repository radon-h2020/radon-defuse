import base64
import numpy as np
import os
import json
import pandas as pd

from sklearn.metrics.pairwise import cosine_similarity

MODELS_ROOT = os.path.join(os.path.realpath(__file__).rsplit(os.sep, 3)[0], 'models')

"""
def get_pre_trained_model(commitFrequency: float,
                          coreContributors: int,
                          issueFrequency: float,
                          percentComments: float,
                          percentIac: float,
                          loc: int,
                          releases: int,
                          percentDefects: float,
                          commits: int):
"""

def get_pre_trained_model(body: dict):
    """

    :param body:
    :return:
    """

    repos = pd.read_csv(os.path.join(MODELS_ROOT, 'repositories.csv'))

    X = np.array([body['commitFrequency'],
                  body['coreContributors'],
                  body['issueFrequency'],
                  body['percentComments'],
                  body['percentIac'],
                  body['sloc'],
                  body['releases'],
                  body['percentDefects'],
                  body['commits']])

    most_similar = [0, None]

    return {"msg": "to implement"}, 200

    """
    similarities = dict()
    for _, row in repos.iterrows():

        Y = [row['commit_frequency'],
             row['core_contributors'],
             row['issue_frequency'],
             row['percent_comments'],
             row['percent_iac'],
             row['sloc'],
             row['releases'],
             row['percent_defects'],
             row['commits']]

        cos = cosine_similarity(X, Y)
        similarities[row['repository']] = cos
        if cos > most_similar[0]:
            most_similar[0] = cos
            most_similar[1] = row['repository']

    return {"sim": similarities}, 200

    
    
    with open(os.path.join(MODELS_ROOT, f'{most_similar[1]}.pkl')) as file:
        model = base64.b64encode(file.read())

    with open(os.path.join(MODELS_ROOT, f'{most_similar[1]}.json')) as file:
        attributes = json.load(file)

    response = dict(
        model=model,
        attributes=attributes
    )

    return response, 200
    """