import os
import datetime
from typing import List

from apis.models import Repository
from repocollector.github import GithubRepositoriesCollector


def is_ansible_dir(path: str) -> bool:
    """
    Check whether the path is an Ansible directory
    :param path: a path
    :return: True if the path link to an Ansible directory. False, otherwise
    """
    return path and ('playbooks' == path or 'meta' == path or 'tasks' == path or 'handlers' == path or 'roles' == path)


def is_ansible_repository(full_name: str, description: str, root_dirs: List[str]) -> bool:
    """
    Check if the repository has Ansible files
    :param full_name: the repository's name
    :param description: the repository's description
    :param root_dirs: a list of directory names at the root of the repository
    :return: True if the repository has Ansible files; False otherwise
    """
    return 'ansible' in description.lower() \
           or 'ansible' in full_name.lower() \
           or sum([1 for path in root_dirs if is_ansible_dir(path)]) >= 2


def is_tosca_repository(full_name: str, description: str) -> bool:
    """
    Check if the repository has Ansible files
    :param full_name: the repository's name
    :param description: the repository's description
    :return: True if the repository has Ansible files; False otherwise
    """
    return 'tosca' in description.lower() \
           or 'tosca' in full_name.lower()


class BackendRepositoriesCollector:
    def __init__(self, settings: dict):
        self.settings = settings

    def crawl(self):

        language = self.settings.get('input_language', [])

        if language not in ('ansible', 'tosca'):
            raise ValueError(f'Language not supported.')

        since = self.settings.get('input_date_from')
        until = since + datetime.timedelta(hours=self.settings.get('input_timedelta'))
        while since <= self.settings.get('input_date_to'):

            github_crawler = GithubRepositoriesCollector(
                access_token=os.getenv('GITHUB_ACCESS_TOKEN'),
                since=self.settings.get('input_date_from'),
                until=self.settings.get('input_date_to'),
                pushed_after=self.settings.get('input_pushed_after'),
                min_issues=self.settings.get('input_issues', 0),
                min_releases=self.settings.get('input_releases', 0),
                min_stars=self.settings.get('input_stars', 0),
                min_watchers=self.settings.get('input_watchers', 0))

            for repo in github_crawler.collect_repositories():
                full_name = f'{repo["owner"]}/{repo["name"]}'

                if language == 'ansible' and not is_ansible_repository(full_name, repo['description'], repo['dirs']):
                    continue
                elif language == 'tosca' and not is_tosca_repository(full_name, repo['description']):
                    continue

                Repository.objects.get_or_create(id=repo.get('id'),
                                                 defaults=dict(
                                                     full_name=full_name,
                                                     url=repo.get('url'),
                                                     default_branch=repo.get('default_branch'),
                                                     description=repo.get('description'),
                                                     issue_count=repo.get('issues'),
                                                     release_count=repo.get('releases'),
                                                     star_count=repo.get('stars'),
                                                     watcher_count=repo.get('watchers'),
                                                     primary_language=repo.get('primary_language'),
                                                     created_at=repo.get('created_at'),
                                                     pushed_at=repo.get('pushed_at')))

                mining_data = dict(
                    repository=repo,
                    search_since=since,
                    search_until=until,
                    quota=github_crawler.quota,
                    quota_reset_at=github_crawler.quota_reset_at
                )

                yield mining_data

            since = until
            until = since + datetime.timedelta(hours=self.settings.get('input_timedelta'))
