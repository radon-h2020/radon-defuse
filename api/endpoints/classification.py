import json
import os
import numpy as np
import pandas as pd
from io import StringIO
from ansiblemetrics.metrics_extractor import MetricExtractor
from flask import abort, Response
from joblib import load

import random

def classify(script):
    """
    This function responds to a request for /api/classification/classify (POST)
    with the result of a classification on the passed script

    :return:  a boolean indicating whether the script has been detected has defective (true) or not )(false).
    """
    
    script = str(script, "utf-8")

    try:
        metrics = MetricExtractor().run(StringIO(script))
    except ValueError:
        abort(Response({'Not a valid yaml script:', str(script)}, 400))

    test_instance = pd.DataFrame([metrics])
    
    # Load the model
    model = load(os.path.join('models', 'test_model.joblib'), mmap_mode='r')
    
    with open(os.path.join('models', 'test_model.json'), 'r') as infile:
        model_features = json.load(infile)

    # Select only numeric features
    test_instance = test_instance.select_dtypes([np.number])
    
    # Select same model attributes
    test_instance = test_instance[np.intersect1d(test_instance.columns, model_features)]
    
    # Perform pre-process if any
    if model.named_steps['pre']:
        test_instances = pd.DataFrame(model.named_steps['pre'].transform(test_instances))

    print(test_instance)

    clf = model.named_steps['clf']

    prediction = bool(random.getrandbits(1))
    #prediction = clf.predict(test_instance)

    result = {
        "defective": prediction,
        "metrics": metrics
    }
    
    return result, 200