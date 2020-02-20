import io
import yaml
import random

from ansiblemetrics.main import MetricExtractor

class DefectPredictor():

    def __init__(self, script):
        self.isValid = False 
        self.isEmpty = False 
        self.isPlaybook = False 
        self.metrics = {}
        self.script = io.StringIO(script.decode("utf-8"))
        
        # Check if valid yaml
        try:
            self.yml = yaml.safe_load(self.script.getvalue())

            if self.yml is None or (not isinstance(self.yml, list) and not isinstance(self.yml, dict)):
                return

            self.isValid = True

        except yaml.YAMLError:
            return
        
        # Check empty file (note: empty files are valid yaml files)
        if self.yml is None or len(self.yml) == 0:
            self.isEmpty = True
        
        i = 0
        while(i < len(self.yml) and self.yml[i].get('hosts') is None):
            i += 1 

        if i < len(self.yml): 
            self.isPlaybook = True
        
    def extract_metrics(self):
        product_metrics = {}

        ansible_metrics = MetricExtractor().run(self.script)

        for item in ansible_metrics:    
            if ansible_metrics[item]['count'] is None:
                break

            for k in ansible_metrics[item]:
                metric = f'{item}_{k}'
                product_metrics[metric] = ansible_metrics[item][k]

        return product_metrics


    def classify(self):
        self.extract_metrics()
        # Predict
        return random.choice([True, False])