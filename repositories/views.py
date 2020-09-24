# Built-in
import os
import shutil
import statistics
from io import StringIO

# Third-party
import git
import pandas as pd

from ansiblemetrics import metrics_extractor
from bson.json_util import dumps
from django.http import HttpResponse
from django.shortcuts import render
from repositoryscorer.scorer import score_repository
from miner.repository import RepositoryMiner, GitRepository
from pydriller.repository_mining import RepositoryMining

# Project
from radon_defect_predictor.mongodb import MongoDBManager
from repositories.forms import RepositoryScorerForm, RepositoryMinerForm
from repositories.train import ModelsManager


def repositories_index(request):
    repos = MongoDBManager.get_instance().get_all_repos()

    light_repos = []
    for repo in repos:
        light_repos.append(
            dict(
                id=repo['id'],
                url=repo['url'],
                owner=repo['owner'],
                name=repo['name'],
                default_branch=repo['default_branch'],
                description=repo['description'],
                created_at=repo['pushed_at'],
                pushed_at=repo['created_at'],
                issues=repo['created_at'],
                releases=repo['releases'],
                stars=repo['stars'],
                watchers=repo['watchers'],
                primary_language=repo['primary_language']
            )
        )

    if not repos:
        context = {
            'repositories': repos,
            'metadata': {
                'repos': 0,
                'avg_issues': 0,
                'std_issues': 0,
                'avg_releases': 0,
                'std_releases': 0,
                'avg_stars': 0,
                'std_stars': 0,
                'avg_watchers': 0,
                'std_watchers': 0
            }
        }
    else:
        context = {
            'repositories': light_repos,
            'metadata': {
                'repos': len(repos),
                'avg_issues': int(statistics.mean([d['issues'] for d in repos])),
                'std_issues': int(statistics.stdev([d['issues'] for d in repos])),
                'avg_releases': int(statistics.mean([d['releases'] for d in repos])),
                'std_releases': int(statistics.stdev([d['releases'] for d in repos])),
                'avg_stars': int(statistics.mean([d['stars'] for d in repos])),
                'std_stars': int(statistics.stdev([d['stars'] for d in repos])),
                'avg_watchers': int(statistics.mean([d['watchers'] for d in repos])),
                'std_watchers': int(statistics.stdev([d['watchers'] for d in repos]))
            }
        }

    return render(request, 'repositories_index.html', context)


def repositories_dump(request):
    repos = dumps(MongoDBManager.get_instance().get_all_repos())
    size = len(repos)
    response = HttpResponse(repos, content_type='application/json')
    response['Content-Length'] = size
    response['Content-Disposition'] = 'attachment; filename=%s' % 'repositories.json'
    return response


def onerror(func, path, exc_info):
    """
    Error handler for ``shutil.rmtree``.

    If the error is due to an access error (read only file)
    it attempts to add write permission and then retries.

    If the error is for another reason it re-raises the error.

    Usage : ``shutil.rmtree(path, onerror=onerror)``
    """
    import stat
    if not os.access(path, os.W_OK):
        # Is the error an access error ?
        os.chmod(path, stat.S_IWUSR)
        func(path)
    else:
        raise


def repository_detail(request, id):
    repo = MongoDBManager.get_instance().get_single_repo(id)

    context = {'repository': {
        'id': repo['id']
    }}

    return render(request, 'repository_detail.html', context)


def repository_home(request, id: str):
    repo = MongoDBManager.get_instance().get_single_repo(id)

    context = {
        'repository': {
            'id': repo['id'],
            'url': repo['url'],
            'owner': repo['owner'],
            'name': repo['name'],
            'scores': repo.get('scores', {})
        }
    }
    return render(request, 'repository_home.html', context)


def repository_fixing_commits(request, id: str):
    repo = MongoDBManager.get_instance().get_single_repo(id)
    context = {
        'repository': {
            'id': repo['id'],
            'url': repo['url'],
            'owner': repo['owner'],
            'name': repo['name'],
            'fixing_commits': repo.get('fixing_commits', list())
        }
    }
    return render(request, 'repository_fixing_commits.html', context)


def repository_fixing_files(request, id: str):
    repo = MongoDBManager.get_instance().get_single_repo(id)
    context = {
        'repository': {
            'id': repo['id'],
            'url': repo['url'],
            'owner': repo['owner'],
            'name': repo['name'],
            'fixing_commits': repo.get('fixing_commits', list())
        }
    }

    return render(request, 'repository_fixing_files.html', context)


def repository_labeled_files(request, id: str):
    repo = MongoDBManager.get_instance().get_single_repo(id)
    context = {
        'repository': {
            'id': repo['id'],
            'url': repo['url'],
            'owner': repo['owner'],
            'name': repo['name'],
            'releases': repo.get('releases_obj', list())
        }
    }

    return render(request, 'repository_labeled_files.html', context)


def repository_score(request, id: str):
    repo = MongoDBManager.get_instance().get_single_repo(id)
    form = RepositoryScorerForm(request.GET)

    if request.method == 'POST':
        form = RepositoryScorerForm(request.POST)

        if form.is_valid():
            path_to_clones = form.cleaned_data['input_path_to_clones']
            path_to_repo = os.path.join(path_to_clones, repo['name'])
            is_cloned = False

            try:

                if repo['name'] not in os.listdir(path_to_clones):
                    # Clone repository to path_to_repo
                    git.Git(path_to_clones).clone(repo['url'])
                    is_cloned = True

                # Compute scores
                scores = score_repository(path_to_repo=path_to_repo,
                                          access_token=form.cleaned_data['input_github_token'],
                                          repo_owner=repo['owner'],
                                          repo_name=repo['name'])

                del scores['repository']
                scores["percent_comment"] = int(scores["percent_comment"] * 100)
                scores["iac_ratio"] = int(scores["iac_ratio"] * 100)

                repo['scores'] = scores

                # Save scores in DB
                MongoDBManager.get_instance().replace_repo(repo)

                context = {
                    'repository': {
                        'id': repo['id'],
                        'url': repo['url'],
                        'owner': repo['owner'],
                        'name': repo['name'],
                        'scores': scores
                    }
                }

                return render(request, 'repository_home.html', context)

            finally:
                if is_cloned:
                    # Delete cloned repo
                    shutil.rmtree(path_to_repo, onerror=onerror)

    context = {
        'repository': {
            'id': repo['id'],
            'url': repo['url'],
            'owner': repo['owner'],
            'name': repo['name']
        },
        'form': form
    }

    return render(request, 'repository_score.html', context)


def get_file_content(path) -> str:
    """
    Return the content of a file
    :param path: the path to the file
    :return: the content of the file, if exists; None, otherwise.
    """
    if not os.path.isfile(path):
        return ''

    with open(path, 'r') as f:
        return f.read()


def get_files(path_to_repo) -> set:
    """
    Return all the files in the repository
    :return: a set of strings representing the path of the files in the repository
    """

    files = set()

    for root, _, filenames in os.walk(path_to_repo):
        if '.git' in root:
            continue
        for filename in filenames:
            path = os.path.join(root, filename)
            path = path.replace(path_to_repo, '')
            if path.startswith('/'):
                path = path[1:]

            files.add(path)

    return files


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


def repository_mine(request, id: str):
    repo = MongoDBManager.get_instance().get_single_repo(id)
    form = RepositoryMinerForm(request.GET)

    if request.method == 'POST':
        form = RepositoryMinerForm(request.POST)
        if form.is_valid():
            path_to_clones = form.cleaned_data['input_path_to_clones']
            path_to_repo = os.path.join(path_to_clones, repo['name'])
            is_cloned = False

            try:

                if repo['name'] not in os.listdir(path_to_clones):
                    # Clone repository to path_to_repo
                    git.Git(path_to_clones).clone(repo['url'])
                    is_cloned = True

                # Mine
                miner = RepositoryMiner(
                    access_token=form.cleaned_data['input_github_token'],
                    path_to_repo=path_to_repo,
                    repo_owner=repo['owner'],
                    repo_name=repo['name'],
                    branch=repo['default_branch']
                )

                labeled_file = [file for file in miner.mine()]

                # Fixing-commits
                repo['fixing_commits'] = list()
                for commit in RepositoryMining(path_to_repo=path_to_repo,
                                               only_commits=miner.fixing_commits,
                                               order='reverse').traverse_commits():
                    repo['fixing_commits'].append(dict(
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

                # Saving failure-prone-scripts
                git_repo = GitRepository(path_to_repo)
                repo['releases_obj'] = list()

                for commit in RepositoryMining(path_to_repo=path_to_repo,
                                               only_releases=True,
                                               order='reverse').traverse_commits():

                    git_repo.checkout(commit.hash)

                    repo_files = get_files(path_to_repo)

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
                        content = get_file_content(os.path.join(path_to_repo, file['filepath']))

                        try:
                            file['metrics'] = metrics_extractor.extract_all(StringIO(content))
                        except (TypeError, ValueError):
                            # Not a valid YAML or empty content
                            pass

                    repo['releases_obj'].append(release)

                    git_repo.reset()

                # Save scores in DB
                MongoDBManager.get_instance().replace_repo(repo)

                return repository_fixing_commits(request, id)

            finally:
                if is_cloned:
                    # Delete cloned repo
                    shutil.rmtree(path_to_repo, onerror=onerror)

    context = {
        'repository': {
            'id': repo['id'],
            'url': repo['url'],
            'owner': repo['owner'],
            'name': repo['name']
        },
        'form': form
    }

    return render(request, 'repository_mine.html', context)


def repository_metrics_dump(request, id: str):
    repo = MongoDBManager.get_instance().get_single_repo(id)

    df = pd.DataFrame()

    for release in repo.get('releases_obj', list()):
        for file in release['files']:
            row = file['metrics']
            row.update({
                'release': release['sha'],
                'date': release['date'],
                'filepath': file['filepath'],
                'label': file['label']
            })

            df = df.append(row, ignore_index=True)

    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename=metrics.csv'
    df.to_csv(path_or_buf=response)
    return response


def repository_train(request, id: str):
    repo = MongoDBManager.get_instance().get_single_repo(id)

    df = pd.DataFrame()

    for release in repo.get('releases_obj', list()):
        for file in release['files']:
            row = file['metrics']
            row.update({
                'release': release['sha'],
                'date': release['date'],
                'filepath': file['filepath'],
                'label': 0 if file['label'] == 'clean' else 1
            })

            df = df.append(row, ignore_index=True)

    # Train model
    model_manager = ModelsManager(df)
    results = model_manager.train()
    response = HttpResponse(results, content_type='text/json')
    response['Content-Disposition'] = 'attachment; filename=model.json'
    return response
