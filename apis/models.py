from djongo import models


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

    default_indicators = {
        "comments_ratio": 0,
        "commit_frequency": 0,
        "core_contributors": 0,
        "has_ci": False,
        "has_license": False,
        "iac_ratio": 0,
        "issue_frequency":0,
        "repository_size": 0,
    }

    indicators = models.JSONField(default={})

    def __hash__(self):
        return super().__hash__()

    def __eq__(self, other):
        if not isinstance(other, Repository):
            return False

        return self.id == other.id


class Label(models.Model):
    label = models.CharField(max_length=50)

    class Meta:
        abstract = True


class FixingCommit(models.Model):
    sha = models.CharField(max_length=50, blank=False, editable=False, primary_key=True, unique=True)
    msg = models.TextField(blank=True, default='')
    date = models.CharField(max_length=30, blank=True, default='')
    is_false_positive = models.BooleanField(blank=True, default=False)
    labels = models.ArrayField(model_container=Label, default=[{'label': 'FAILURE-PRONE'}])
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
    SCORING = 'scoring'
    TRAIN = 'train'

    NAME_CHOICES = [
        (NONE, 'none'),
        (EXTRACT_METRICS, 'extract-metrics'),
        (MINE_FIXING_COMMITS, 'mine-fixing-commits'),
        (MINE_FIXED_FILES, 'mine-fixed-files'),
        (MINE_FAILURE_PRONE_FILES, 'mine-failure-prone-files'),
        (SCORING, 'scoring'),
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
