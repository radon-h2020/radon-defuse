import json
from flask import abort, Response
from api.defect_prediction import DefectPredictor
import random # TODO remove after imiplementing classify()

def classify(script):
    """
    This function responds to a request for /api/classification/classify (POST)
    with the result of a classification on the passed script

    :return:  a boolean indicating whether the script has been detected has defective (true) or not )(false).
    """

    dp = DefectPredictor(script)
    
    if not dp.isValid:
        abort(Response({'Not a valid yaml file.'}, 400))
    
    # Check empty file (note: empty files are valid yaml files)
    if dp.isEmpty:
        abort(Response({'Empty file.'}, 400))

    is_defective = dp.classify()
    result = {
        "defective": is_defective,
        "metrics": dp.ansible_metrics
    }
    
    return result, 200