from apis.models import Repositories
from django.shortcuts import render, get_object_or_404


def repository_home(request, pk):
    repository = get_object_or_404(Repositories, pk=pk)
    return render(request=request, context={'repository': repository}, template_name='repository_home.html', status=200)
