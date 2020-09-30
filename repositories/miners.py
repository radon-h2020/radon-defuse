import os
from io import StringIO

from ansiblemetrics import metrics_extractor
from pydriller.repository_mining import RepositoryMining, GitRepository
from repositoryminer.repository import RepositoryMiner

from radon_defect_predictor.mongodb import MongoDBManager

BUG_RELATED_LABELS = {'bug', 'Bug', 'bug :bug:', 'Bug - Medium', 'Bug - Low', 'Bug - Critical', 'ansible_bug',
                      'Type: Bug', 'Type: bug', 'Type/Bug', 'type: bug 🐛', 'type:bug', 'type: bug', 'type/bug',
                      'kind/bug', 'kind/bugs', 'bug/bugfix', 'bugfix', 'critical-bug', '01 type: bug', 'bug_report',
                      'minor-bug'}

FIXING_COMMITS_REGEX = r'(bug|fix|error|crash|problem|fail|defect|patch)'


def is_ansible_file(path: str) -> bool:
    """
    Check whether the path is an Ansible file
    :param path: a path
    :return: True if the path link to an Ansible file. False, otherwise
    """
    return path and ('test' not in path) \
           and (
                   'ansible' in path or 'playbooks' in path or 'meta' in path or 'tasks' in path or 'handlers' in path or 'roles' in path) \
           and path.endswith('.yml')


def get_file_content(path:str) -> str:
    """
    Return the content of a file
    :param path: the path to the file
    :return: the content of the file, if exists; None, otherwise.
    """
    if not os.path.isfile(path):
        return ''

    with open(path, 'r') as f:
        return f.read()


class Mining:

    def __init__(self, access_token: str, path_to_repo: str, repo_id: str, labels=None, regex: str = None):
        """

        :param access_token:
        :param path_to_repo:
        :param repo_id:
        :param labels:
        :param regex:
        """
        self.access_token = access_token
        self.path_to_repo = path_to_repo
        self.repository = MongoDBManager.get_instance().get_repository(repo_id)
        self.labels = labels
        self.regex = regex

        if not self.labels:
            self.labels = BUG_RELATED_LABELS

        if not self.regex:
            self.regex = FIXING_COMMITS_REGEX

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
        # Mine
        miner = RepositoryMiner(
            access_token=self.access_token,
            path_to_repo=self.path_to_repo,
            repo_owner=self.repository['owner'],
            repo_name=self.repository['name'],
            branch=self.repository['default_branch']
        )

        miner.get_fixing_commits_from_closed_issues(self.labels)
        miner.get_fixing_commits_from_commit_messages(self.regex)
        miner.get_fixing_files()

        # Fixing-commits
        self.repository['fixing_commits'] = list()
        for commit in RepositoryMining(path_to_repo=self.path_to_repo,
                                       only_commits=list(miner.fixing_commits),
                                       order='reverse').traverse_commits():

            # Filter-out false positive previously discarded by the user
            if commit.hash in self.repository.get('false_positive_fixing_commits', list()) and commit.hash in miner.fixing_commits:
                miner.fixing_commits.remove(commit.hash)
            else:
                self.repository['fixing_commits'].append(dict(
                    sha=commit.hash,
                    msg=commit.msg,
                    date=commit.committer_date.strftime("%d/%m/%Y %H:%M"),
                    files=[{'filepath': file.filepath,
                            'bug_inducing_commit': file.bic,
                            'diff': [modified_file.diff for modified_file in commit.modifications][0]
                            }
                           for file in miner.fixing_files
                           if file.fic == commit.hash]
                ))

        labeled_file = [file for file in miner.label()]

        if labeled_file:
            # Extract metric from failure-prone scripts and save them
            git_repo = GitRepository(self.path_to_repo)
            self.repository['releases_obj'] = list()

            for commit in RepositoryMining(path_to_repo=self.path_to_repo,
                                           only_releases=True,
                                           order='reverse').traverse_commits():

                git_repo.checkout(commit.hash)

                repo_files = self.get_files()

                release = dict(
                    sha=commit.hash,
                    date=commit.committer_date.strftime("%d/%m/%Y %H:%M"),
                    files=list()
                )

                # Label the failure-prone scripts
                for file in labeled_file:
                    if file.commit == commit.hash:
                        release['files'].append(dict(
                            filepath=file.filepath,
                            fixing_commit=file.fixing_commit,
                            label='failure_prone'
                        ))

                        if file.filepath in repo_files:
                            repo_files.remove(file.filepath)

                # Label the remaining files as "clean"
                for filepath in repo_files:
                    if not is_ansible_file(filepath):
                        continue

                    release['files'].append(dict(
                        filepath=filepath,
                        fixing_commit=None,
                        label='clean'
                    ))

                # Extract Ansible metrics from files
                for file in release['files']:
                    content = get_file_content(os.path.join(self.path_to_repo, file.get('filepath')))

                    try:
                        file['metrics'] = metrics_extractor.extract_all(StringIO(content))
                    except (TypeError, ValueError):
                        # Not a valid YAML or empty content
                        pass

                self.repository['releases_obj'].append(release)

                git_repo.reset()

        # Save scores in DB
        MongoDBManager.get_instance().replace_repository(self.repository)
