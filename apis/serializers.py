from rest_framework import serializers
from apis.models import FailureProneFile, FixingCommit, FixedFile, Label, Repository, Task


class RepositorySerializer(serializers.ModelSerializer):

    indicators = serializers.SerializerMethodField()

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

    def get_indicators(self, obj):
        return dict(obj.indicators)


class LabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Label
        fields = ('label')


class FixingCommitSerializer(serializers.ModelSerializer):
    class Meta:
        model = FixingCommit
        fields = ('sha',
                  'msg',
                  'date',
                  'is_false_positive',
                  'labels',
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
