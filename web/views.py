import json
from apis.models import FixingCommit, Repositories
from apis.serializers import FixingCommitSerializer
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, HttpRequest
from django.views.decorators.http import require_POST

from backend.miner import BackendRepositoryMiner


def repository_home(request, pk):
    repository = get_object_or_404(Repositories, pk=pk)
    return render(request=request, context={'repository': repository}, template_name='repository_home.html', status=200)


def repository_fixing_commits(request, pk):
    repository = get_object_or_404(Repositories, pk=pk)
    return render(request=request, context={'repository': repository}, template_name='repository_fixing_commits.html',
                  status=200)


def repository_fixing_files(request, pk):
    repository = get_object_or_404(Repositories, pk=pk)
    return render(request=request, context={'repository': repository}, template_name='repository_fixing_files.html',
                  status=200)


@require_POST
def repository_mine(request, pk):
    access_token = request.headers.get('ACCESS-TOKEN')
    body_unicode = request.body.decode('utf-8')
    body = json.loads(body_unicode)

    labels = body.get('labels')
    regex = body.get('regex')
    path_to_repo = body.get('path_to_repo')

    if not (access_token and path_to_repo):
        return HttpResponse(status=400)  # Bad request

    fixing_commits_count, fixing_files_count = BackendRepositoryMiner(
        access_token=access_token,
        path_to_repo=str(body.get('path_to_repo')),
        repo_id=pk,
        labels=labels,
        regex=regex).mine()

    results = json.dumps({
        'fixing_commits_count': fixing_commits_count,
        'fixing_files_count': fixing_files_count
    })

    response = HttpResponse(results, content_type='application/json', status=200)
    response["Content-Length"] = len(results)
    return response


def repository_train_settings(request, pk):
    repository = get_object_or_404(Repositories, pk=pk)
    return render(request=request, context={'repository': repository}, template_name='repository_train_settings.html',
                  status=200)
