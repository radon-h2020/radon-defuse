import docker
import json
import io
import os
import pandas as pd
import shutil
import threading

from apis.models import FailureProneFile, MetricsFile, Repository, Task


class BackendMetrics:

    FAILURE_PRONE_FILES_FILENAME = 'failure_prone_files.json'

    def __init__(self, repo_id: str, language: str):

        if language not in ('ansible', 'tosca'):
            raise ValueError(f'Language {language} not supported.')

        self.repository = Repository.objects.get(pk=repo_id)
        self.language = language

    def extract(self):
        task = Task(state=Task.ACCEPTED, name=Task.EXTRACT_METRICS, repository=self.repository)
        task.save()

        thread_name = f'{self.repository.full_name.replace("/", "_")}_metrics_thread'
        metrics_thread = threading.Thread(target=self.run_task, name=thread_name, args=(task,))
        metrics_thread.start()

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

        task.state = Task.ERROR # Temporary, in case next steps fail
        task.save()

        if result['StatusCode'] == 0:
            path_to_csv = os.path.join(path_to_task, 'metrics.csv')
            data = pd.read_csv(path_to_csv)

            # Remove releases with only failure_prone equal 0 or 1
            for commit in data.commit.unique():
                tmp = data[data.commit == commit]
                if tmp.failure_prone.to_list().count(0) == 0 or tmp.failure_prone.to_list().count(1) == 0:
                    indices = data[data.commit == commit].index
                    data.drop(indices, inplace=True)

            res = io.StringIO()
            data.to_csv(res, index=False)

            obj, created = MetricsFile.objects.get_or_create(repository=self.repository, language=self.language,
                                                             defaults=dict(file=res.getvalue()))

            if not created and obj:
                obj.file = res.getvalue()
                obj.save()

            task.state = Task.COMPLETED
            task.save()

        try:
            shutil.rmtree(path_to_task)
        except Exception as e:
            print(e)
