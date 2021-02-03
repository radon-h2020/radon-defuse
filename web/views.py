import io
import json
import pandas as pd

from datetime import datetime

from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, StreamingHttpResponse
from django.views.decorators.http import require_GET, require_POST

from github import Github, GithubException

from apis.models import FixingCommit, FixedFile, MetricsFile, PredictiveModel, Repository, Task
from apis.serializers import FixingCommitSerializer, FixedFileSerializer, RepositorySerializer
from backend.crawler import BackendRepositoriesCollector
from backend.miner import BackendRepositoryMiner
from backend.metrics import BackendMetrics
from backend.predictor import BackendTrainer
from backend.scorer import BackendScorer
from web.forms import CrawlerSettingsForm


def __tmp_crawl(settings: dict):
    yield """
        <html>
            <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css" integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO" crossorigin="anonymous">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
            <body class="bg-dark">
                <div class="py-5 text-center bg-dark text-white">
                    <h2>Mining report</h2>
                    <p class="lead font-weight-bold">Attention! Do not close this page while the analysis is running!</p>
                    <p class="lead font-weight-light">Mining started at: {0}</p>
                </div>
                <table class="table table-striped table-dark">
                    <thead>
                        <tr>
                          <th scope="col">#</th>
                          <th scope="col">Repository</th>
                          <th scope="col"><span class="badge badge-pill badge-danger">Issues</span></th>
                          <th scope="col"><span class="badge badge-pill badge-success">Releases</span></th>
                          <th scope="col"><span class="badge badge-pill badge-warning">Stars</span></th>
                          <th scope="col"><span class="badge badge-pill badge-info">Watchers</span></th>
                          <th scope="col"><span class="badge badge-pill badge-secondary">Primary language</span></th>
                          <th scope="col"><span class="badge badge-pill badge-light">Last push</span></th>
                        </tr>
                    </thead>
                    <tbody>
        """.format(datetime.now().today())

    i = 0

    last_date_from = ''
    crawler = BackendRepositoriesCollector(settings)
    for crawl_data in crawler.crawl():
        if str(crawl_data['search_since']) > str(last_date_from):
            last_date_from = crawl_data['search_since']
            yield """
                    <tr><td colspan="8" style='text-align:center;vertical-align:middle'>
                        Search interval: {0} - {1} <br> 
                        Quota: {2} - Reset at {3}
                    </td></tr>
                """.format(crawl_data['search_since'],
                           crawl_data['search_until'],
                           crawl_data['quota'],
                           crawl_data['quota_reset_at'])

        i += 1

        repo = crawl_data['repository']

        yield """
                    <tr>
                      <th scope="row">{0}</th>
                      <td><a href="{1}" target="_blank">{2}/{3}</a></td>
                      <td>{4}</td>
                      <td>{5}</td>
                      <td>{6}</td>
                      <td>{7}</td>
                      <td>{8}</td>
                      <td>{9}</td>
                    </tr>
                """.format(
            i,
            repo['url'],
            repo['owner'],
            repo['name'],
            repo['issues'],
            repo['releases'],
            repo['stars'],
            repo['watchers'],
            repo['primary_language'],
            repo['pushed_at']
        )

    yield """</tbody>
                </table>

                <div class="py-5 text-center bg-dark text-white">
                    <p class="lead font-weight-light">Mining completed at: {0}</p>
                </div>
            </body>
            <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js" integrity="sha384-ZMP7rVo3mIykV+2+9J3UJ46jBk0WLaUAdn689aCwoqbBJiSnjAK/l8WvCWPIPm49" crossorigin="anonymous"></script>
            <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/js/bootstrap.min.js" integrity="sha384-ChfqqxuZUCnJSK3+MXmPNIyE6ZbWh2IMqE241rYiqJxyMiZ6OW/JmZQ5stwEULTy" crossorigin="anonymous"></script>
            </html>""".format(datetime.now().today())


def crawler_settings(request):
    form = CrawlerSettingsForm(request.GET)

    if request.method == 'POST':
        form = CrawlerSettingsForm(request.POST)
        if form.is_valid():
            return StreamingHttpResponse(__tmp_crawl(form.cleaned_data))

    return render(request, 'crawler_settings.html', {'form': form})


@require_GET
def get_github_repository(request):
    access_token = request.headers.get('token')
    full_name_or_id = request.GET['full_name_or_id']

    try:
        g = Github(login_or_token=access_token)
        repo = g.get_repo(full_name_or_id)
    except GithubException as e:

        if access_token and e.status == 401:
            return HttpResponse(status=401)

        return HttpResponse(status=404)

    content = {
        'id': repo.id,
        'full_name': repo.full_name,
        'url': repo.html_url,
        'default_branch': repo.default_branch,
        'description': repo.description,
        'created_at': repo.created_at.strftime("%Y-%d-%m %H:%M:%S"),
        'star_count': repo.stargazers_count,
    }

    return HttpResponse(content=json.dumps(content), content_type='application/json', status=200)


@require_GET
def repository_dump_fixing_commits(request, pk: str):
    repository = get_object_or_404(Repository, pk=pk)
    commits = FixingCommit.objects.filter(repository=repository)
    serialized_commits = FixingCommitSerializer(commits, many=True)
    content = json.dumps(serialized_commits.data)

    filename = f'{repository.full_name}_fixing_commits.json'
    size = len(content)
    response = HttpResponse(content, content_type='application/json')
    response['Content-Length'] = size
    response['Content-Disposition'] = 'attachment; filename=%s' % filename
    return response


@require_GET
def repository_dump_fixed_files(request, pk: str):
    repository = get_object_or_404(Repository, pk=pk)
    fixed_files = FixedFile.objects.filter(fixing_commit__repository=repository)
    serialized_files = FixedFileSerializer(fixed_files, many=True)
    content = json.dumps(serialized_files.data)

    filename = f'{repository.full_name}_fixed_files.json'
    size = len(content)
    response = HttpResponse(content, content_type='application/json')
    response['Content-Length'] = size
    response['Content-Disposition'] = 'attachment; filename=%s' % filename
    return response


@require_GET
def repository_dump_metrics(request, pk: str):
    repository = get_object_or_404(Repository, pk=pk)
    metrics = get_object_or_404(MetricsFile, repository=repository, language='ansible')
    df = pd.read_csv(io.StringIO(metrics.file))

    filename = f'{repository.full_name.replace("/", "__")}__ansible_metrics.csv'
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename=' + filename
    df.to_csv(path_or_buf=response, index=False)

    return response


@require_GET
def repository_dump_model(request, pk: str):
    repository = get_object_or_404(Repository, pk=pk)
    model = get_object_or_404(PredictiveModel, repository=repository, language='ansible')
    b_model = model.file

    filename = f'{repository.full_name}_ansible_model.joblib'
    response = HttpResponse(b_model, content_type='application/octet-streamapplication/octet-stream')
    response['Content-Disposition'] = 'attachment; filename=' + filename

    return response


@require_GET
def repositories_dump(request):
    """
    Dump all repositories in the db to a json file
    :param request:
    :return: HttpResponse
    """
    repos = Repository.objects.all()
    serialized_repos = RepositorySerializer(repos, many=True)
    content = json.dumps(serialized_repos.data)

    size = len(content)
    response = HttpResponse(content, content_type='application/json')
    response['Content-Length'] = size
    response['Content-Disposition'] = 'attachment; filename=repositories.json'
    return response


def repository_home(request, pk):
    repository = get_object_or_404(Repository, pk=pk)
    return render(request=request, context={'repository': repository}, template_name='repository_home.html', status=200)


def repository_fixing_commits(request, pk):
    repository = get_object_or_404(Repository, pk=pk)
    return render(request=request, context={'repository': repository}, template_name='repository_fixing_commits.html',
                  status=200)


def repository_fixed_files(request, pk):
    repository = get_object_or_404(Repository, pk=pk)
    return render(request=request, context={'repository': repository}, template_name='repository_fixed_files.html',
                  status=200)


@require_POST
def repository_mine(request, pk):
    body_unicode = request.body.decode('utf-8')
    body = json.loads(body_unicode)
    task_id, task_state = BackendRepositoryMiner(repo_id=pk, language=body.get('language')).mine()

    if task_state == Task.ACCEPTED or task_state == Task.RUNNING:
        return HttpResponse(status=202, content=task_id)
    else:
        return HttpResponse(status=500)


@require_GET
def repository_score(request, pk):
    repository = get_object_or_404(Repository, pk=pk)
    task_id, task_state = BackendScorer(repository).score()

    if task_state == Task.ACCEPTED or task_state == Task.RUNNING:
        return HttpResponse(status=202, content=task_id)
    else:
        return HttpResponse(status=500)


def repository_train_settings(request, pk):
    repository = get_object_or_404(Repository, pk=pk)
    return render(request=request, context={'repository': repository}, template_name='repository_train_settings.html',
                  status=200)


def repository_train_start(request, pk):
    body_unicode = request.body.decode('utf-8')
    body = json.loads(body_unicode)

    task_id, task_state = BackendTrainer(
        repo_id=pk,
        language=body.get('language'),
        classifiers=body.get('classifiers'),
        balancers=body.get('balancers'),
        normalizers=body.get('normalizers'),
        selectors=body.get('selectors')).train()

    if task_state == Task.ACCEPTED or task_state == Task.RUNNING:
        return HttpResponse(status=202, content=task_id)
    else:
        return HttpResponse(status=500)


def repository_extract_metrics(request, pk):
    body_unicode = request.body.decode('utf-8')
    body = json.loads(body_unicode)
    task_id, task_state = BackendMetrics(repo_id=pk, language=body.get('language'), label=body.get('label')).extract()

    if task_state == Task.ACCEPTED or task_state == Task.RUNNING:
        return HttpResponse(status=202, content=task_id)
    elif task_state == Task.COMPLETED:
        return HttpResponse(status=204, content=task_id)
    else:
        return HttpResponse(status=500)
