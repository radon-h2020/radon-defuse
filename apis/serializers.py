from rest_framework import serializers
from apis.models import Repositories


class RepositorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Repositories
        fields = ('id',
                  'owner',
                  'name',
                  'url',
                  'default_branch',
                  'description',
                  'num_issues',
                  'num_releases',
                  'num_stars',
                  'num_watchers',
                  'primary_language',
                  'created_at',
                  'pushed_at')
