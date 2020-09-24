# Built-in
import os
import shutil
import statistics

# Third-party
import git
from bson.json_util import dumps
from django.http import HttpResponse
from django.shortcuts import render
from repositoryscorer.scorer import score_repository
from miner.repository import RepositoryMiner
from pydriller.repository_mining import RepositoryMining

# Project
from radon_defect_predictor.mongodb import MongoDBManager
from repositories.forms import RepositoryScorerForm, RepositoryMinerForm


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
                repo['releases'] = list()
                for commit in RepositoryMining(path_to_repo=path_to_repo,
                                               only_releases=True,
                                               order='reverse').traverse_commits():
                    release = dict(
                        sha=commit.hash,
                        date=commit.committer_date.strftime("%d/%m/%Y %H:%M"),
                        files=list()
                    )

                    for file in labeled_file:
                        if file.commit == commit.hash:
                            release['files'].append(dict(
                                filepath=file.filepath,
                                fixing_commit=file.fixing_commit
                            ))

                    repo['releases_obj'].append(release)

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
