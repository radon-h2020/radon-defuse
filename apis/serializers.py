from rest_framework import serializers
from apis.models import FailureProneFile, FixingCommit, FixedFile, Repository, Task


class RepositorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Repository
        fields = ('id',
                  'full_name',
                  'url',
                  'default_branch',
                  'description',
                  'issue_count',
                  'release_count',
                  'star_count',
                  'watcher_count',
                  'primary_language',
                  'created_at',
                  'pushed_at',
                  'indicators')
                  #'commit_frequency',
                  #'issue_frequency',
                  #'core_contributors',
                  #'comments_ratio',
                  #'iac_ratio',
                  #'sloc',
                  #'has_ci',
                  #'has_license')


class FixingCommitSerializer(serializers.ModelSerializer):
    class Meta:
        model = FixingCommit
        fields = ('sha',
                  'msg',
                  'date',
                  'is_false_positive',
                  'repository')


class FixedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FixedFile
        fields = ('id',
                  'is_false_positive',
                  'filepath',
                  'bug_inducing_commit',
                  'fixing_commit')


class FailureProneFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FailureProneFile
        fields = ('id',
                  'filepath',
                  'commit',
                  'fixing_commit')


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ('id',
                  'state',
                  'name',
                  'repository')
