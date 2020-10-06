import json
from apis.models import Repositories
from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, HttpRequest
from django.views.decorators.http import require_POST

from backend.miner import BackendRepositoryMiner


def repository_home(request, pk):
    repository = get_object_or_404(Repositories, pk=pk)
    return render(request=request, context={'repository': repository}, template_name='repository_home.html', status=200)


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

    fixing_commit_count = BackendRepositoryMiner(
            access_token=access_token,
            path_to_repo=str(body.get('path_to_repo')),
            repo_id=pk,
            labels=labels,
            regex=regex).mine()

    results = json.dumps({
        'fixing_commit_count': fixing_commit_count
    })

    response = HttpResponse(results, content_type='application/json', status=200)
    response["Content-Length"] = len(results)
    return response

    """
    try:
        

        return HttpResponse(status=204)

    except Exception as e:
        print(e)
        return HttpResponse(status=500)
    """