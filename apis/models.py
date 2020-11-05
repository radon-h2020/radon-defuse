from djongo import models
from django.core.serializers.json import DjangoJSONEncoder
import json


class JSONField(models.TextField):
    """
    JSONField specialize a TextField to (de)serialize JSON objects.

    Example:
        class Page(models.Model):
            data = JSONField(blank=True, null=True)

        page = Page.objects.get(pk=5)
        page.data = {'title': 'test', 'type': 3}
        page.save()
    """

    def to_python(self, value):
        if value == "":
            return None

        try:
            if isinstance(value, str):
                return json.loads(value)
        except ValueError:
            pass
        return value

    def from_db_value(self, value, *args):
        return self.to_python(value)

    def get_db_prep_save(self, value, *args, **kwargs):
        if value == "":
            return None
        if isinstance(value, dict):
            value = json.dumps(value, cls=DjangoJSONEncoder)
        return value


"""
class Metric(models.Model):
    name = models.CharField(max_length=200, blank=False)
    value = models.FloatField(blank=False)


class File(models.Model):
    filepath = models.CharField(max_length=200, blank=False)
    fixing_commit = models.CharField(max_length=50, blank=True)
    bug_inducing_commit = models.CharField(max_length=50)
    #metrics = models.ArrayField(
    #    model_container=Metric,
    #    blank=True
    #)
"""


class Repositories(models.Model):
    id = models.CharField(max_length=40, blank=False, unique=True, primary_key=True)
    owner = models.CharField(max_length=100, blank=False)
    name = models.CharField(max_length=100, blank=False)
    url = models.CharField(max_length=200, blank=False)
    default_branch = models.CharField(max_length=100, blank=True, default='master')
    description = models.TextField(blank=True, default='')
    issue_count = models.IntegerField(default=0, blank=True)
    release_count = models.IntegerField(default=0, blank=True)
    star_count = models.IntegerField(default=0, blank=True)
    watcher_count = models.IntegerField(default=0, blank=True)
    primary_language = models.CharField(max_length=50, blank=True, default='')
    created_at = models.CharField(max_length=30, blank=True, default='')
    pushed_at = models.CharField(max_length=30, blank=True, default='')

    def __hash__(self):
        return super().__hash__()

    def __eq__(self, other):
        if not isinstance(other, Repositories):
            return False

        return self.id == other.id


class FixingCommit(models.Model):
    sha = models.CharField(max_length=50, blank=False, editable=False, primary_key=True, unique=True)
    msg = models.TextField(blank=True, default='')
    date = models.CharField(max_length=30, blank=True, default='')
    is_false_positive = models.BooleanField(blank=True, default=False)
    repository = models.ForeignKey(Repositories, on_delete=models.CASCADE)

    def __hash__(self):
        return super().__hash__()

    def __eq__(self, other):
        if not isinstance(other, FixingCommit):
            return False

        return self.sha == other.sha


class FixingFile(models.Model):
    id = models.AutoField(primary_key=True, blank=False)
    is_false_positive = models.BooleanField(blank=True, default=False)
    filepath = models.CharField(max_length=300, blank=False, editable=False)
    bug_inducing_commit = models.CharField(max_length=50, blank=False, editable=False)
    fixing_commit = models.ForeignKey(FixingCommit, on_delete=models.CASCADE)

    def __hash__(self):
        return super().__hash__()

    def __eq__(self, other):
        if not isinstance(other, FixingFile):
            return False

        if self.id == other.id:
            return True

        return self.filepath == other.filepath \
               and self.fixing_commit == other.fixing_commit \
               and self.bug_inducing_commit == other.bug_inducing_commit


class Task(models.Model):
    PENDING = 'pending'
    ACCEPTED = 'accepted'
    RUNNING = 'running'
    COMPLETED = 'completed'
    ERROR = 'error'

    STATE_CHOICES = [
        (PENDING, 'pending'),
        (ACCEPTED, 'accepted'),
        (RUNNING, 'running'),
        (COMPLETED, 'completed'),
        (ERROR, 'error')
    ]

    NONE = 'none'
    MINE_FIXING_COMMITS = 'mine-fixing-commits'
    MINE_FIXED_FILES = 'mine-fixed-files'
    MINE_FAILURE_PRONE_FILES = 'mine-failure-prone-files'
    EXTRACT_METRICS = 'extract-metrics'
    TRAIN = 'train'

    NAME_CHOICES = [
        (NONE, 'none'),
        (MINE_FIXING_COMMITS, 'mine-fixing-commits'),
        (MINE_FIXED_FILES, 'mine-fixed-files'),
        (MINE_FAILURE_PRONE_FILES, 'mine-failure-prone-files'),
        (EXTRACT_METRICS, 'extract-metrics'),
        (TRAIN, 'train')
    ]

    id = models.AutoField(primary_key=True, blank=False)
    state = models.CharField(max_length=10, blank=False, editable=False, choices=STATE_CHOICES, default=PENDING)
    name = models.CharField(max_length=50, blank=False, choices=NAME_CHOICES, default=NONE)
    repository = models.ForeignKey(Repositories, on_delete=models.CASCADE)

    def __hash__(self):
        return super().__hash__()

    def __eq__(self, other):
        if not isinstance(other, Task):
            return False

        return self.id == other.id
