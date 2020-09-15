# Built-in
import datetime

# Third-party
from iacminer.filters import is_ansible_repository
from iacminer.miners.github import GithubMiner

# Project
from radon_defect_predictor.mongodb import MongoDBManager


def mine(token: str, date_from: datetime.date, date_to: datetime.date,
         push_after: datetime.date, timedelta: int = 24, min_issues: int = 0, min_releases: int = 0, min_stars: int = 0,
         min_watchers: int = 0):
    """
    :param token: a Github developer token to query public repositories on Github
    :param date_from: collect repositories from this date
    :param date_to: collect repositories up this date
    :param push_after: collect only repositories with a push event after this date
    :param timedelta: mine Github at this interval (in hours). Github will be analyzed as follows: \
        [date_from, date_from + time_delta] \
        [date_from + time_delta, date_from + 2*time_delta]
        ...
        [date_from + n*time_delta, date_to]
    :param min_issues: collect repositories with at least this <min_issues> issues
    :param min_releases: collect repositories with at least this <min_releases> releases
    :param min_stars: collect repositories with at least this <min_stars> stars
    :param min_watchers: collect repositories with at least this <min_watchers> watchers
    :return: yield a dict with repository data
    """

    db_manager = MongoDBManager.get_instance()

    date_from = datetime.datetime.strptime(f'{date_from} 00:00:00', '%Y-%m-%d %H:%M:%S')
    date_to = datetime.datetime.strptime(f'{date_to} 23:59:59', '%Y-%m-%d %H:%M:%S')
    push_after = datetime.datetime.strptime(f'{push_after} 00:00:00', '%Y-%m-%d %H:%M:%S')

    while date_from < date_to:

        print(f'Crawling from: {date_from} to: {date_from + datetime.timedelta(hours=timedelta)}')

        # add single row over all the columns with date_from - date_to
        github_miner = GithubMiner(
            access_token=token,
            date_from=date_from,
            date_to=date_from + datetime.timedelta(hours=timedelta),
            pushed_after=push_after,
            min_issues=min_issues,
            min_releases=min_releases,
            min_stars=min_stars,
            min_watchers=min_watchers
        )

        for repo in github_miner.mine():

            # Filter out non-Ansible repositories
            if not is_ansible_repository(repo['owner'], repo['name'], repo['description'], repo['dirs']):
                continue

            # Save repository to MongoDB
            if db_manager.get_single_repo(repo['id']):
                db_manager.replace_repo(repo)
            else:
                db_manager.add_repo(repo)

            mining_data = dict(
                repository=repo,
                search_from=date_from,
                search_to=date_from + datetime.timedelta(hours=timedelta),
                quota=github_miner.quota,
                quota_reset_at=github_miner.quota_reset_at
            )
            yield mining_data

        date_from += datetime.timedelta(hours=timedelta)
