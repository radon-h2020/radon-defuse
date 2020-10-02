# Built-in
import os
import shutil

# Third-party
import git
import pandas as pd

from bson.json_util import dumps
from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from github import Github, Repository
from repositoryscorer.scorer import score_repository

# Project
from radon_defect_predictor.mongodb import MongoDBManager
from repositories.forms import RepositoryScorerForm, RepositoryMinerForm
from repositories.miners import Mining
from repositories.train import ModelsManager


# /repositories/
def list_repositories(request):
    repositories = MongoDBManager.get_instance().get_repositories()
    repositories_to_show = []
    labels = set()

    for repo in repositories:
        language = repo['primary_language'] if repo['primary_language'] else '-'
        repositories_to_show.append(
            dict(
                id=repo['id'],
                url=repo['url'],
                owner=repo['owner'],
                name=repo['name'],
                default_branch=repo['default_branch'],
                issues=repo['issues'],
                releases=repo['releases'],
                stars=repo['stars'],
                watchers=repo['watchers'],
                primary_language=language,
                scores=repo.get('scores', list())
            )
        )

        labels = labels.union(set(repo.get('bug_related_labels', set())))

    context = dict()
    context['repositories'] = repositories_to_show
    context['labels'] = labels
    return render(request=request, context=context, template_name='repositories_index.html', status=200)



# /repositories/add/
def add_repository(request):
    print(request)
    data = {'is_added': True}
    return JsonResponse(data)


# /repositories/labels/
def collect_repositories_labels(request):
    """
    Collect bug-related labels from all the repositories
    :param request:
    :return:
    """
    """
    repositories = MongoDBManager.get_instance().get_repositories()

    repo = self.__github.get_repo('/'.join([self.repo_owner, self.repo_name]))  # repo_owner/repo_name
    labels = set()
    for label in repo.get_labels():
        if type(label) == github.Label.Label:
            labels.add(label.name)

    return labels
    """


# /repositories/dump/
def dump_repositories(request):
    repositories = dumps(MongoDBManager.get_instance().get_repositories())
    size = len(repositories)
    response = HttpResponse(repositories, content_type='application/json')
    response['Content-Length'] = size
    response['Content-Disposition'] = 'attachment; filename=%s' % 'repositories.json'
    return response


# /repository/{id}/
def repository_details(request, id: str):
    repo = MongoDBManager.get_instance().get_repository(id)

    context = {
        'repository': {
            'id': repo['id'],
            'url': repo['url'],
            'owner': repo['owner'],
            'name': repo['name'],
            'scores': repo.get('scores', {})
        }
    }
    return render(request=request, context=context, template_name='repository_home.html', status=200)


# /repository/{id}/delete/
def delete_repository(request, id: str):
    data = {'is_taken': True}
    return JsonResponse(data)


# /repository/{id}/dump/
def dump_repository(request, id: str):
    repository = MongoDBManager.get_instance().get_repository(id)
    name = repository['name']
    repository = dumps(repository)
    size = len(repository)
    response = HttpResponse(repository, content_type='application/json')
    response['Content-Length'] = size
    response['Content-Disposition'] = 'attachment; filename=%s.json' % name
    return response


# /repository/{id}/fixing-commits/
def repository_fixing_commits(request, id: str):
    repo = MongoDBManager.get_instance().get_repository(id)
    context = {
        'repository': {
            'id': repo['id'],
            'url': repo['url'],
            'owner': repo['owner'],
            'name': repo['name'],
            'fixing_commits': repo.get('fixing_commits', list()),
            'fp_fixing_commits': repo.get('false_positive_fixing_commits', list())
        }
    }
    return render(request, 'repository_fixing_commits.html', context)


# /repository/{id}/fixing-commits/{sha}/delete
def delete_fixing_commit(request, id: str, sha: str):
    repo = MongoDBManager.get_instance().get_repository(id)

    if sha in repo.get('false_positive_fixing_commits', list()):
        # First search in false-positive fixing-commits
        repo['false_positive_fixing_commits'].remove(sha)
    else:
        # the user is moving a commit from fixing_commits to false_positive_fixing_commits
        index = [index for index, commit in enumerate(repo['fixing_commits']) if commit['sha'] == sha][0]
        if index >= 0:
            repo.setdefault('false_positive_fixing_commits', list()).append(repo['fixing_commits'][index]['sha'])
            del repo['fixing_commits'][index]

    MongoDBManager.get_instance().replace_repository(repo)

    return repository_fixing_commits(request, id)


# /repository/{id}/fixing-files/
def repository_fixing_files(request, id: str):
    repo = MongoDBManager.get_instance().get_repository(id)

    files = list()
    for commit in repo.get('fixing_commits', list()):
        for file in commit.get('files', list()):
            files.append({
                'filepath': file['filepath'],
                'sha_fixing_commit': commit['sha'],
                'sha_bug_inducing_commit': file['bug_inducing_commit']
            })

    context = {
        'repository': {
            'id': repo['id'],
            'url': repo['url'],
            'owner': repo['owner'],
            'name': repo['name'],
        },
        'files': files
    }

    return render(request, 'repository_fixing_files.html', context)


# /repository/{id}/labeled-files/
def repository_labeled_files(request, id: str):
    repo = MongoDBManager.get_instance().get_repository(id)
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


def repository_score(request, id: str):
    repo = MongoDBManager.get_instance().get_repository(id)
    form = RepositoryScorerForm(request.GET)

    if request.method == 'POST':
        form = RepositoryScorerForm(request.POST)

        if form.is_valid():
            path_to_clones = form.cleaned_data['input_path_to_clones']
            path_to_repo = str(os.path.join(path_to_clones, repo['name']))
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
                MongoDBManager.get_instance().replace_repository(repo)

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
    repository = MongoDBManager.get_instance().get_repository(id)
    form = RepositoryMinerForm(request.GET)

    if request.method == 'POST':
        form = RepositoryMinerForm(request.POST)
        if form.is_valid():
            path_to_clones = form.cleaned_data['input_path_to_clones']
            path_to_repo = str(os.path.join(path_to_clones, repository['name']))
            is_cloned = False

            try:

                if repository['name'] not in os.listdir(path_to_clones):
                    # Clone repository to path_to_repo
                    git.Git(path_to_clones).clone(repository['url'])
                    is_cloned = True

                Mining(access_token=form.cleaned_data['input_github_token'],
                       path_to_repo=path_to_repo,
                       repo_id=id,
                       labels=None,
                       regex=None
                       ).mine()

                return repository_fixing_commits(request, id)

            finally:
                if is_cloned:
                    # Delete cloned repo
                    shutil.rmtree(path_to_repo, onerror=onerror)

    context = {
        'repository': {
            'id': repository['id'],
            'url': repository['url'],
            'owner': repository['owner'],
            'name': repository['name']
        },
        'form': form
    }

    return render(request, 'repository_mine.html', context)


def repository_metrics_dump(request, id: str):
    repo = MongoDBManager.get_instance().get_repository(id)

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
    repo = MongoDBManager.get_instance().get_repository(id)

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
    cv_results, pkl_model = model_manager.train()
    # response = HttpResponse(cv_results, content_type='text/json')
    response = HttpResponse(pkl_model, content_type='text/json')
    response['Content-Disposition'] = 'attachment; filename=model.json'
    return response
