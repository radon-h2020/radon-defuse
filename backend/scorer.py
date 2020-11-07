import docker
import json
import os
import shutil
import threading

import docker
from pydriller.repository_mining import RepositoryMining
import time
import random
from apis.models import FailureProneFile, FixingCommit, FixedFile, Repository, Task


class BackendScorer:

    def __init__(self, repository: Repository):
        self.repository = repository

    def score(self):

        host = 'github' if 'github' in self.repository.url else 'gitlab'

        docker_client = docker.from_env()
        container = docker_client.containers.run(image='radonconsortium/repo-scorer:latest',
                                                 command=f'{host} {self.repository.full_name} /tmp/',
                                                 detach=True,
                                                 environment={
                                                     'GITHUB_ACCESS_TOKEN': os.getenv('GITHUB_ACCESS_TOKEN'),
                                                     'GITLAB_ACCESS_TOKEN': os.getenv('GITLAB_ACCESS_TOKEN')
                                                 })

        result = container.wait()
        print(result)
        indicators = dict()
        if result['StatusCode'] == 0:
            output = container.logs(stdout=True, stderr=True)
            print(output)
            indicators = json.loads(output.decode())
            print(indicators)
            # TODO: save scores in repository
        else:
            print(container.logs(stdout=True, stderr=True))

        container.remove()
        return indicators
