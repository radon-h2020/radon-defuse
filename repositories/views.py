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

# Project
from radon_defect_predictor.mongodb import MongoDBManager
from repositories.forms import RepositoryScorerForm


def repositories_index(request):
    repos = MongoDBManager.get_instance().get_all_repos()

    if not repos:
        context = {
            'repositories': repos,
            'metadata': {
                'repos': 0,
                'avg_issues': 0,
                'avg_releases': 0,
                'avg_stars': 0,
                'avg_watchers': 0
            }
        }
    else:
        context = {
            'repositories': repos,
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
    form = RepositoryScorerForm(request.GET)

    if request.method == 'POST':
        form = RepositoryScorerForm(request.POST)
        if form.is_valid():
            path_to_clones = form.cleaned_data['input_path_to_clones']

            # Clone repository to path_to_repo
            git.Git(path_to_clones).clone(repo['url'])
            path_to_repo = os.path.join(path_to_clones, repo['name'])

            # Compute scores
            repo['scores'] = score_repository(path_to_repo=path_to_repo,
                                              access_token=form.cleaned_data['input_github_token'],
                                              repo_owner=repo['owner'],
                                              repo_name=repo['name'])
            del repo['scores']['repository']

            # Save scores in DB
            MongoDBManager.get_instance().replace_repo(repo)

            # Delete cloned repo
            shutil.rmtree(path_to_repo, onerror=onerror)

    context = {'repository': repo,
               'form': form}
    return render(request, 'repository_detail.html', context)
