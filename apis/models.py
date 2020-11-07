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


class Repository(models.Model):
    id = models.CharField(max_length=40, blank=False, unique=True, primary_key=True)
    full_name = models.CharField(max_length=200, blank=False)
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

    # Scores
    indicators = JSONField(blank=True, null=True)
    #commit_frequency = models.FloatField(default=0, blank=True)
    #issue_frequency = models.FloatField(default=0, blank=True)
    #core_contributors = models.IntegerField(default=0, blank=True)
    #comments_ratio = models.FloatField(default=0, blank=True)
    #iac_ratio = models.FloatField(default=0, blank=True)
    #sloc = models.IntegerField(default=0, blank=True)
    #has_ci = models.BooleanField(blank=True, default=False)
    #has_license = models.BooleanField(blank=True, default=False)

    def __hash__(self):
        return super().__hash__()

    def __eq__(self, other):
        if not isinstance(other, Repository):
            return False

        return self.id == other.id


class FixingCommit(models.Model):
    sha = models.CharField(max_length=50, blank=False, editable=False, primary_key=True, unique=True)
    msg = models.TextField(blank=True, default='')
    date = models.CharField(max_length=30, blank=True, default='')
    is_false_positive = models.BooleanField(blank=True, default=False)
    repository = models.ForeignKey(Repository, on_delete=models.CASCADE)

    def __hash__(self):
        return super().__hash__()

    def __eq__(self, other):
        if not isinstance(other, FixingCommit):
            return False

        return self.sha == other.sha


class FixedFile(models.Model):
    id = models.AutoField(primary_key=True, blank=False)
    is_false_positive = models.BooleanField(blank=True, default=False)
    filepath = models.CharField(max_length=300, blank=False, editable=False)
    bug_inducing_commit = models.CharField(max_length=50, blank=False, editable=False)
    fixing_commit = models.ForeignKey(FixingCommit, on_delete=models.CASCADE)

    def __hash__(self):
        return super().__hash__()

    def __eq__(self, other):
        if not isinstance(other, FixedFile):
            return False

        if self.id == other.id:
            return True

        return self.filepath == other.filepath \
               and self.fixing_commit == other.fixing_commit \
               and self.bug_inducing_commit == other.bug_inducing_commit


class FailureProneFile(models.Model):
    id = models.AutoField(primary_key=True, blank=False)
    filepath = models.CharField(max_length=300, blank=False, editable=False)
    commit = models.CharField(max_length=50, blank=False, editable=False)
    fixing_commit = models.ForeignKey(FixingCommit, on_delete=models.CASCADE)

    def __hash__(self):
        return super().__hash__()

    def __eq__(self, other):
        if not isinstance(other, FixedFile):
            return False

        if self.id == other.id:
            return True

        return self.filepath == other.filepath \
               and self.fixing_commit == other.fixing_commit \
               and self.commit == other.commit


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
    repository = models.ForeignKey(Repository, on_delete=models.CASCADE)

    def __hash__(self):
        return super().__hash__()

    def __eq__(self, other):
        if not isinstance(other, Task):
            return False

        return self.id == other.id


class MetricsFile(models.Model):
    id = models.AutoField(primary_key=True, blank=False)
    file = models.BinaryField()
    language = models.CharField(max_length=50, blank=False)
    repository = models.ForeignKey(Repository, on_delete=models.CASCADE)

    def __eq__(self, other):
        if not isinstance(other, MetricsFile):
            return False

        return self.id == other.id or (self.repository == other.repository and self.language == other.language)


class PredictiveModel(models.Model):
    id = models.AutoField(primary_key=True, blank=False)
    file = models.BinaryField()
    language = models.CharField(max_length=50, blank=False)
    repository = models.ForeignKey(Repository, on_delete=models.CASCADE)

    def __eq__(self, other):
        if not isinstance(other, PredictiveModel):
            return False

        return self.id == other.id or (self.repository == other.repository and self.language == other.language)
