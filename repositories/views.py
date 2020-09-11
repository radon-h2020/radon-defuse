# Built-in
import statistics

# Third-party
from django.shortcuts import render

# Project
from radon_defect_predictor.mongodb import MongoDBManager


def repository_index(request):
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
                'avg_releases': int(statistics.mean([d['releases'] for d in repos])),
                'avg_stars': int(statistics.mean([d['stars'] for d in repos])),
                'avg_watchers': int(statistics.mean([d['watchers'] for d in repos]))
            }
        }

    return render(request, 'repository_index.html', context)


def repository_detail(request, id):
    repo = MongoDBManager.get_instance().get_single_repo(id)
    context = {'repository': repo}
    return render(request, 'repository_detail.html', context)
