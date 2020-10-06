from rest_framework import serializers
from apis.models import FixingCommit, Repositories


class RepositorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Repositories
        fields = ('id',
                  'owner',
                  'name',
                  'url',
                  'default_branch',
                  'description',
                  'issue_count',
                  'release_count',
                  'star_count',
                  'watcher_count',
                  'primary_language',
                  'created_at',
                  'pushed_at')


class FixingCommitSerializer(serializers.ModelSerializer):
    class Meta:
        model = FixingCommit
        fields = ('sha',
                  'msg',
                  'date',
                  'is_false_positive',
                  'repository')

