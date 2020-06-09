import json
import os
import numpy as np
import pandas as pd
from io import StringIO
from ansiblemetrics.metrics_extractor import extract_all
from flask import abort, Response
from joblib import load

MODELS_ROOT = os.path.join(os.path.realpath(__file__).rsplit(os.sep, 3)[0], 'models')


def classify(script):
    """
    This function responds to a request for /api/classification/classify (POST)
    with the result of a classification on the passed script

    :return:  a boolean indicating whether the script has been detected has defective (true) or not )(false).
    """

    script = str(script, "utf-8")

    metrics = {}

    try:
        metrics = extract_all(StringIO(script))
    except ValueError:
        abort(Response({'Not a valid yaml script:', str(script)}, 400))

    test_instance = pd.DataFrame([metrics])

    # Load the model
    model = load(os.path.join(MODELS_ROOT, 'ansible__workshops.pkl'), mmap_mode='r')

    with open(os.path.join(MODELS_ROOT, 'ansible__workshops.json'), 'r') as infile:
        model_features = json.load(infile)

    # Select same model attributes
    test_instance = test_instance[np.intersect1d(test_instance.columns, model_features)]

    # Perform pre-process if any
    if model.named_steps['pre']:
        test_instance = pd.DataFrame(model.named_steps['pre'].transform(test_instance))

    clf = model.named_steps['clf']

    prediction = bool(clf.predict(test_instance)[0])

    result = {
        "defective": prediction,
        "metrics": metrics
    }

    return result, 200
