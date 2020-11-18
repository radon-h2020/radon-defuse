import docker
import json
import os
import pandas as pd
import shutil
import threading

from radondp.predictors import DefectPredictor
from typing import List

from apis.models import PredictiveModel, FailureProneFile, MetricsFile, Repository, Task


class BackendTrainer:

    FAILURE_PRONE_FILES_FILENAME = 'failure_prone_files.json'

    def __init__(self, repo_id: str, language: str, classifiers: List[str], balancers: List[str] = None,
                 normalizers: List[str] = None, selectors: List[str] = None):

        if language not in ('ansible', 'tosca'):
            raise ValueError(f'Language {language} not supported.')

        self.classifiers = classifiers
        self.balancers = balancers
        self.normalizers = normalizers
        self.selectors = selectors

        self.repository = Repository.objects.get(pk=repo_id)
        self.language = language

    def train(self):
        task = Task(state=Task.ACCEPTED, name=Task.EXTRACT_METRICS, repository=self.repository)
        task.save()

        mine_fixing_commits_thread = threading.Thread(target=self.run_task, name="miner", args=(task,))
        mine_fixing_commits_thread.start()

        return task.id, task.state

    def run_task(self, task: Task):

        path_to_task = os.path.join('/tmp', 'radondp_tasks', str(task.id))
        path_to_failure_prone_files = os.path.join(path_to_task, self.FAILURE_PRONE_FILES_FILENAME)

        try:
            os.makedirs(path_to_task)

            labeled_files = [dict(
                filepath=file.filepath,
                commit=file.commit,
                fixing_commit=file.fixing_commit.sha)
                for file in FailureProneFile.objects.filter(fixing_commit__repository=self.repository)]

            with open(path_to_failure_prone_files, 'w') as f:
                json.dump(labeled_files, f)

        except Exception as e:
            print(e)

        volumes = {
            path_to_task: {
                'bind': '/app',
                'mode': 'rw'
            }
        }

        task.state = Task.RUNNING
        task.save()

        command = 'repo-miner extract-metrics {0} {1} {2} all release . '.format(self.repository.url,
                                                                                 self.FAILURE_PRONE_FILES_FILENAME,
                                                                                 self.language)
        docker_client = docker.from_env()
        container_name = f'{self.repository.full_name}-metrics-extractor'
        container_name = container_name.replace('/', '_')
        container = docker_client.containers.run(image='radonconsortium/repo-miner:latest',
                                                 name=container_name,
                                                 command=command,
                                                 detach=True,
                                                 volumes=volumes,
                                                 environment={
                                                     'GITHUB_ACCESS_TOKEN': os.getenv('GITHUB_ACCESS_TOKEN'),
                                                     'GITLAB_ACCESS_TOKEN': os.getenv('GITLAB_ACCESS_TOKEN')
                                                 })

        result = container.wait()
        container.remove()

        # For debug
        print(self.repository.full_name, result)

        if result['StatusCode'] != 0:
            task.state = Task.ERROR
            task.save()
        else:
            task.name = Task.TRAIN
            task.save()

            path_to_csv = os.path.join(path_to_task, 'metrics.csv')
            with(open(path_to_csv, 'rb')) as f:
                res = f.read()

            obj, created = MetricsFile.objects.get_or_create(repository=self.repository, language=self.language,
                                                             defaults=dict(file=res))

            if not created and obj:
                obj.file = res
                obj.save()

            # Train
            dp = DefectPredictor()
            dp.balancers = self.balancers
            dp.normalizers = self.normalizers
            dp.classifiers = self.classifiers

            data = pd.read_csv(path_to_csv)

            # Remove releases with only failure_prone equal 0 or 1
            for commit in data.commit.unique():
                tmp = data[data.commit == commit]
                if tmp.failure_prone.to_list().count(0) == 0 or tmp.failure_prone.to_list().count(1) == 0:
                    indices = data[data.commit == commit].index
                    data.drop(indices, inplace=True)

            dp.train(data)
            b_model = dp.dumps_model()

            obj, created = PredictiveModel.objects.get_or_create(repository=self.repository, language=self.language,
                                                                 defaults=dict(file=b_model))

            if not created:
                obj.file = b_model
                obj.save()

            task.state = Task.COMPLETED
            task.save()

        try:
            shutil.rmtree(path_to_task)
        except Exception as e:
            print(e)
