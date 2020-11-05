from typing import List

from radondp.predictors import DefectPredictor
from repominer.files import FixingFile
from repominer.mining.ansible import AnsibleMiner
from repominer.mining.tosca import ToscaMiner
from repominer.metrics.ansible import AnsibleMetricsExtractor
from repominer.metrics.tosca import ToscaMetricsExtractor

from apis.models import FixingFile, Repositories




def train(self, path_to_repo: str, repo_id: str, language: str, metrics:List[str], classifiers:List[str], balancers:List[str]=None, normalizers:List[str]=None):
    # pass full_name_or_id instead of path_to_repo and repo_id

    if language == 'ansible':
        Miner = AnsibleMiner
        MetricsExtractor = AnsibleMetricsExtractor
    else:
        Miner = ToscaMiner
        MetricsExtractor = ToscaMetricsExtractor

    # Create training data
    false_positives = [FixingFile(filepath=file.filepath,
                                  fic=file.fixing_commit,
                                  bic=file.bug_inducing_commit)
                       for file in FixingFile.objects.all() if file.is_false_positive]

    true_positives = [FixingFile(filepath=file.filepath,
                                  fic=file.fixing_commit,
                                  bic=file.bug_inducing_commit)
                       for file in FixingFile.objects.all() if not file.is_false_positive]

    # miner.authenticate(host, access_token[remove access_token])
    miner = Miner.label
    miner.fixing_files = [FixingFile for file in db.fixing_files]
    # miner.label()

    dp = DefectPredictor()
    dp.balancers(balancers)
    dp.normalizers(normalizers)
    dp.classifiers(classifiers)



    MetricsExtractor(path_to_repo).extract(labeled_files=labeled_files,
                                                  product=metrics.get('product', False),
                                                  process=metrics.get('process', False),
                                                  delta=metrics.get('delta', False),
                                                  at='release')


    data = self.extract_metrics()
    self.dp.train(data)



