import json

from ansiblemetrics.import_metrics import general_metrics, playbook_metrics, tasks_metrics
from flask import abort, jsonify

from api.defect_prediction import DefectPredictor

def list_all():
    """
    This function responds to a request for /api/metrics/all (GET)
    :return: a lists of metrics' names.
    """
    metrics = dict(list(general_metrics.items()) + list(playbook_metrics.items()) + list(tasks_metrics.items()))
    l = []
    for name in metrics:
        l.append(name)

    return json.dumps(l), 200

def run_all(script):
    """
    This function responds to a request for /api/metrics/all (POST)
    :return: a json object with metrics values.
    """
    dp = DefectPredictor(script)
    
    if not dp.isValid:
        abort(400, 'Not a valid yaml file.')
    
    # Check empty file (note: empty files are valid yaml files)
    if dp.isEmpty:
        abort(400, 'Empty file.')

    return dp.extract_metrics(), 200
    
