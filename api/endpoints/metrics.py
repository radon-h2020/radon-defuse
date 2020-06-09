import json

from io import StringIO
from ansiblemetrics.import_metrics import general_metrics, playbook_metrics
from ansiblemetrics.metrics_extractor import extract_all
from flask import abort, jsonify, Response


def list_all():
    """
    This function responds to a request for /api/metrics/all (GET)
    :return: a lists of metrics' names.
    """
    metrics = dict(list(general_metrics.items()) + list(playbook_metrics.items()))
    l = []
    for name in metrics:
        l.append(name)

    return json.dumps(l), 200

def run_all(script):
    """
    This function responds to a request for /api/metrics/all (POST)
    :return: a json object with metrics values.
    """
    script = str(script, "utf-8")

    try:
        metrics = extract_all(StringIO(script))
        return metrics, 200

    except ValueError:
        abort(Response({'Not a valid yaml script:', str(script)}, 400))

    
