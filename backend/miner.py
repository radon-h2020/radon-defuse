import json
import os
import shutil
import threading

import docker
from pydriller.repository_mining import RepositoryMining

from apis.models import FixingCommit, FixingFile, Repositories, Task


class BackendRepositoryMiner:

    EXCLUDED_COMMITS_FILENAME = 'excluded_commits.json'
    INCLUDED_COMMITS_FILENAME = 'included_commits.json'
    EXCLUDED_FILES_FILENAME = 'excluded_files.json'

    def __init__(self, repo_id: str, language: str, labels: list = None, regex: str = None):
        """
        :param repo_id:
        :param labels:
        :param regex:
        """

        if language not in ('ansible', 'tosca'):
            raise ValueError(f'Language {language} not supported.')

        self.repository = Repositories.objects.get(pk=repo_id)
        self.language = language
        self.labels = labels if labels else None
        self.regex = regex if regex else None

    def mine(self):

        task = Task(state=Task.ACCEPTED, name=Task.MINE_FIXED_FILES, repository=self.repository)
        task.save()

        mine_fixing_commits_thread = threading.Thread(target=self.run_task, name="miner", args=(task,))
        mine_fixing_commits_thread.start()

        return task.id, task.state

    def run_task(self, task: Task):

        path_to_task = os.path.join('/tmp', 'radondp_tasks', str(task.id))
        path_to_excluded_commits = os.path.join(path_to_task, self.EXCLUDED_COMMITS_FILENAME)
        path_to_included_commits = os.path.join(path_to_task, self.INCLUDED_COMMITS_FILENAME)
        path_to_excluded_files = os.path.join(path_to_task, self.EXCLUDED_FILES_FILENAME)

        try:
            os.makedirs(path_to_task)

            false_positive_commits = [commit.sha for commit in FixingCommit.objects.all() if commit.is_false_positive]
            true_positive_commits = [commit.sha for commit in FixingCommit.objects.all() if
                                     not commit.is_false_positive]

            false_positive_files = [dict(
                filepath=file.filepath,
                bic=file.bug_inducing_commit,
                fic=file.fixing_commit.sha) for file in FixingFile.objects.all() if file.is_false_positive]

            with open(path_to_excluded_commits, 'w') as f:
                json.dump(false_positive_commits, f)

            with open(path_to_included_commits, 'w') as f:
                json.dump(true_positive_commits, f)

            with open(path_to_excluded_files, 'w') as f:
                json.dump(false_positive_files, f)

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

        host = 'github' if 'github.com' in self.repository.url else 'gitlab'
        full_name = f'{self.repository.owner}/{self.repository.name}'
        branch = self.repository.default_branch
        command = 'repo-miner mine fixed-files {0} {1} {2} . -b {3} --exclude-commits {4} --include-commits {5} --exclude-files {6}'.format(
            host,
            self.language,
            full_name,
            branch,
            self.EXCLUDED_COMMITS_FILENAME,
            self.INCLUDED_COMMITS_FILENAME,
            self.EXCLUDED_FILES_FILENAME)
        
        print(command)

        docker_client = docker.from_env()
        container = docker_client.containers.run(image='radonconsortium/repo-miner:latest',
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
        print(result)

        task.state = Task.COMPLETED

        if result['StatusCode'] != 0:
            task.state = Task.ERROR
        else:
            with open(os.path.join(path_to_task, 'fixing-commits.json')) as f:
                fixing_commits = json.load(f)

                # Save fixing-commits
                for commit in RepositoryMining(path_to_repo=self.repository.url,
                                               only_commits=fixing_commits,
                                               order='reverse').traverse_commits():
                    FixingCommit.objects.get_or_create(sha=commit.hash,
                                                       defaults=dict(
                                                           msg=commit.msg,
                                                           date=commit.committer_date.strftime("%d/%m/%Y %H:%M"),
                                                           is_false_positive=False,
                                                           repository=self.repository
                                                       ))

            with open(os.path.join(path_to_task, 'fixed-files.json')) as f:
                fixed_files = json.load(f)

                # Remove existing true positives (they might be replaced by new files given new fixing-commits)
                existing_files = FixingFile.objects.all()
                for file in existing_files:
                    if not file.is_false_positive:
                        file.delete()

                # Insert new fixed files
                for file in fixed_files:
                    fixing_commit = FixingCommit.objects.get(sha=file['fic'])

                    FixingFile.objects.get_or_create(filepath=file['filepath'],
                                                     fixing_commit=fixing_commit,
                                                     defaults=dict(
                                                         bug_inducing_commit=file['bic'],
                                                         is_false_positive=False,
                                                     ))

        task.save()

        try:
            shutil.rmtree(path_to_task)
        except Exception as e:
            print(e)
