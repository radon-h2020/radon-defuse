import docker
import json
import os
import re
import threading

from apis.models import Repository, Task


class BackendScorer:

    def __init__(self, repository: Repository):
        self.repository = repository

    def score(self):

        task = Task(state=Task.ACCEPTED, name=Task.SCORING, repository=self.repository)
        task.save()

        scorer_thread = threading.Thread(target=self.run_task, name="scorer", args=(task,))
        scorer_thread.start()

        return task.id, task.state

    def run_task(self, task: Task):

        host = 'github' if 'github' in self.repository.url else 'gitlab'

        task.state = Task.RUNNING
        task.save()

        docker_client = docker.from_env()
        container = docker_client.containers.run(image='radonconsortium/repo-scorer:latest',
                                                 command=f'{host} {self.repository.full_name} /tmp/',
                                                 detach=True,
                                                 environment={
                                                     'GITHUB_ACCESS_TOKEN': os.getenv('GITHUB_ACCESS_TOKEN'),
                                                     'GITLAB_ACCESS_TOKEN': os.getenv('GITLAB_ACCESS_TOKEN')
                                                 })

        result = container.wait()
        output = container.logs(stdout=True, stderr=True)
        container.remove()

        if result['StatusCode'] == 0:
            try:
                match = re.search(r'(\{\".*}$)', output.decode())
                indicators = json.loads(match.groups()[0])

                self.repository.indicators = indicators
                self.repository.save()

                task.state = Task.COMPLETED
                task.save()
            except json.decoder.JSONDecodeError:
                task.state = Task.ERROR
                task.save()
                # for debug
                print('Scoring: JSONDecodeError')
        else:
            task.state = Task.ERROR
            task.save()
            # for debug
            print('ERROR:', output)
