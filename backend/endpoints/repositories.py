import datetime
import pandas as pd
import re
import threading

from flask import make_response, send_file
from flask_restful import Resource, reqparse
from repocollector.github import GithubRepositoriesCollector


def is_ansible_dir(path: str) -> bool:
    """
    Check whether the path is an Ansible directory
    :param path: a path
    :return: True if the path link to an Ansible directory. False, otherwise
    """
    return path and ('playbooks' == path or 'meta' == path or 'tasks' == path or 'handlers' == path or 'roles' == path)


def is_ansible_repository(full_name: str, description: str, root_dirs: list) -> bool:
    """
    Check if the repository has Ansible files
    :param full_name: the repository full name (owner/name)
    :param description: the repository's description
    :param root_dirs: a list of directory names at the root of the repository
    :return: True if the repository has Ansible files; False otherwise
    """
    return 'ansible' in description.lower() \
           or 'ansible' in full_name.lower() \
           or sum([1 for path in root_dirs if is_ansible_dir(path)]) >= 2


class Repositories(Resource):

    def __init__(self, **kwargs):
        self.db = kwargs['db']

    def get(self):
        repos_df = pd.DataFrame()
        repositories = self.db.collection('repositories').stream()

        for repo in repositories:
            repos_df = repos_df.append({
                'full_name': repo.to_dict()['full_name'],
                'id': repo.to_dict()['id']
            }, ignore_index=True)

        response = make_response(repos_df.to_csv(index=False))
        response.headers["Content-Disposition"] = "attachment; filename=repositories.csv"
        response.headers["Content-Type"] = "text/csv"
        return response

    def post(self):
        """ Collect repositories from GitHub based on search criteria """
        parser = reqparse.RequestParser()
        parser.add_argument('token', type=str, required=True)
        parser.add_argument('start', type=str, required=True)
        parser.add_argument('end', type=str, required=True)
        parser.add_argument('language', type=str, required=True)
        parser.add_argument('pushed_after', type=str, required=True)
        parser.add_argument('timedelta', type=str, required=False)
        parser.add_argument('min_stars', type=int, required=False)
        parser.add_argument('min_releases', type=int, required=False)
        args = parser.parse_args()

        thread = threading.Thread(target=self.run_task, name="collect", args=(args,))
        thread.start()

        return make_response({}, 202)

    def run_task(self, args: dict):
        # Converting Mon Oct 04 2021 00:00:00 GMT 0200 (Central European Summer Time) to Oct 04 2021
        since = re.findall(r'(\w+\s\d{2}\s\d{4})\s00:00:00', args.get('start'))[0]
        until = re.findall(r'(\w+\s\d{2}\s\d{4})\s00:00:00', args.get('end'))[0]
        pushed_after = re.findall(r'(\w+\s\d{2}\s\d{4})\s00:00:00', args.get('pushed_after'))[0]

        # and convert to datetime object
        since = datetime.datetime.strptime(since, '%b %d %Y')
        until = datetime.datetime.strptime(until, '%b %d %Y')
        pushed_after = datetime.datetime.strptime(pushed_after, '%b %d %Y')

        while since + datetime.timedelta(days=1) < until:

            github_crawler = GithubRepositoriesCollector(
                access_token=args.get('token'),
                since=since,
                until=since + datetime.timedelta(days=1),
                pushed_after=pushed_after,
                min_issues=0,
                min_releases=args.get('min_releases', 0),
                min_stars=args.get('min_stars', 0),
                min_watchers=0,
                primary_language=args.get('language') if args.get('language') not in ('ansible', 'tosca') else None
            )

            for repo in github_crawler.collect_repositories():

                if args.get('language') == 'ansible' and not is_ansible_repository(f'{repo["owner"]}/{repo["name"]}', repo['description'], repo['dirs']):
                    continue
                elif args.get('language') == 'tosca':
                    continue
                else:
                    repo_ref = self.db.collection('repositories').document(str(repo['id']))
                    repo_ref.set({
                        'id': repo['id'],
                        'full_name': f'{repo["owner"]}/{repo["name"]}',
                        'url': repo['url'],
                        'default_branch': repo['default_branch']
                    })

            since += datetime.timedelta(days=1)
