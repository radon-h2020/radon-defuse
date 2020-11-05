import json
from apis.models import Repositories, Task
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse
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
    body_unicode = request.body.decode('utf-8')
    body = json.loads(body_unicode)
    task_id, task_state = BackendRepositoryMiner(
        repo_id=pk,
        language=body.get('language'),
        labels=body.get('labels'),
        regex=body.get('regex')).mine()

    if task_state == Task.ACCEPTED:
        return HttpResponse(status=202, content=task_id)
    else:
        return HttpResponse(status=500)


def repository_train_settings(request, pk):
    repository = get_object_or_404(Repositories, pk=pk)
    return render(request=request, context={'repository': repository}, template_name='repository_train_settings.html',
                  status=200)


def repository_train_start(request, pk):
    body_unicode = request.body.decode('utf-8')
    body = json.loads(body_unicode)

    # TODO: call radondp.predictors.DefectPredictor
    return HttpResponse(status=501)
