import os
from io import StringIO
from pathlib import Path

# from ansiblemetrics import metrics_extractor
from pydriller.repository_mining import RepositoryMining, GitRepository
from repositoryminer.repository import RepositoryMiner

from apis.models import Repositories
from apis.serializers import RepositorySerializer


def is_ansible_file(path: str) -> bool:
    """
    Check whether the path is an Ansible file
    :param path: a path
    :return: True if the path link to an Ansible file. False, otherwise
    """
    return path and ('test' not in path) \
           and ('ansible' in path or 'playbooks' in path or 'meta' in path or 'tasks' in path or 'handlers' in path or 'roles' in path) \
           and path.endswith('.yml')


def get_file_content(path: str) -> str:
    """
    Return the content of a file
    :param path: the path to the file
    :return: the content of the file, if exists; None, otherwise.
    """
    if not os.path.isfile(path):
        return ''

    with open(path, 'r') as f:
        return f.read()


class BackendRepositoryMiner:

    def __init__(self, access_token: str, path_to_repo: str, repo_id: str, labels=None, regex: str = None):
        """
        :param access_token:
        :param path_to_repo:
        :param repo_id:
        :param labels:
        :param regex:
        """
        self.access_token = access_token
        self.path_to_repo = str(Path(path_to_repo))
        self.repository = RepositorySerializer(Repositories.objects.get(pk=repo_id)).data
        self.labels = labels
        self.regex = regex

    def get_files(self) -> set:
        """
        Return all the files in the repository
        :return: a set of strings representing the path of the files in the repository
        """

        files = set()

        for root, _, filenames in os.walk(self.path_to_repo):
            if '.git' in root:
                continue
            for filename in filenames:
                path = os.path.join(root, filename)
                path = path.replace(self.path_to_repo, '')
                if path.startswith('/'):
                    path = path[1:]

                files.add(path)

        return files

    def mine(self):
        miner = RepositoryMiner(
            access_token=self.access_token,
            path_to_repo=self.path_to_repo,
            repo_owner=self.repository['owner'],
            repo_name=self.repository['name'],
            branch=self.repository['default_branch']
        )

        # miner.get_fixing_commits_from_closed_issues(self.labels) (currently only supported for Github)
        print(f'Mining fixing commits with regex {self.regex}')
        miner.get_fixing_commits_from_commit_messages(self.regex)
        #miner.get_fixing_files()

        # Fixing-commits
        fixing_commits = list()
        i = 0
        for commit in RepositoryMining(path_to_repo=self.path_to_repo,
                                       only_commits=list(miner.fixing_commits),
                                       order='reverse').traverse_commits():

            # Filter-out false positive previously discarded by the user
            if commit.hash in self.repository.get('false_positive_fixing_commits',
                                                  list()) and commit.hash in miner.fixing_commits:
                miner.fixing_commits.remove(commit.hash)
            else:
                fixing_commits.append(dict(
                    sha=commit.hash,
                    msg=commit.msg,
                    date=commit.committer_date.strftime("%d/%m/%Y %H:%M"),
                    #files=[{'filepath': file.filepath, 'bug_inducing_commit': file.bic}
                    #       for file in miner.fixing_files
                    #       if file.fic == commit.hash]
                ))


        # Save scores in DB
        #self.repository.save()
        return len(miner.fixing_commits)
