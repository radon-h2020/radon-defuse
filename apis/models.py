from djongo import models

"""
class Metric(models.Model):
    name = models.CharField(max_length=200, blank=False)
    value = models.FloatField(blank=False)


class File(models.Model):
    filepath = models.CharField(max_length=200, blank=False)
    fixing_commit = models.CharField(max_length=50, blank=True)
    bug_inducing_commit = models.CharField(max_length=50)
    metrics = models.ArrayField(
        model_container=Metric,
        blank=True
    )


class FixingCommit(models.Model):
    sha = models.CharField(max_length=50, blank=False, editable=False)
    msg = models.CharField(blank=True)
    date = models.DateTimeField(blank=True)
    files = models.ArrayField(
        model_container=File,
        blank=True
    )
"""


class Repositories(models.Model):
    id = models.CharField(max_length=32, blank=False, unique=True, primary_key=True)
    owner = models.CharField(max_length=100, blank=False)
    name = models.CharField(max_length=100, blank=False)
    url = models.CharField(max_length=200, blank=False)
    default_branch = models.CharField(max_length=100, blank=True, default='master')
    description = models.TextField(blank=True, default='')
    num_issues = models.IntegerField(default=0, blank=True)
    num_releases = models.IntegerField(default=0, blank=True)
    num_stars = models.IntegerField(default=0, blank=True)
    num_watchers = models.IntegerField(default=0, blank=True)
    primary_language = models.CharField(max_length=50, blank=True, default='')
    created_at = models.CharField(max_length=30, blank=True, default='')
    pushed_at = models.CharField(max_length=30, blank=True, default='')
    """
    fixing_commits = models.ArrayField(
        model_container=FixingCommit,
        blank=True
    )
    """
    # fp_fixing_commits = ArrayField(models.CharField(max_length=50), blank=True)
