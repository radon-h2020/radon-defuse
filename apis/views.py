from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import FixingCommit, FixingFile, Repositories
from .serializers import FixingCommitSerializer, FixingFileSerializer, RepositorySerializer


class RepositoriesViewSet(viewsets.ViewSet):
    """
    API endpoint that allows repositories to be viewed or edited.

    list:
    Retrieve all the repositories.

    retrieve:
    Retrieve a repository.

    create:
    Create a repository.

    partial_update:
    Update one or more fields on an existing repository.

    destroy:
    Delete a repository.
    """

    def list(self, request):
        repositories = Repositories.objects.all()
        serializer = RepositorySerializer(repositories, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        repository = get_object_or_404(Repositories, id=pk)
        serializer = RepositorySerializer(repository)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request):

        try:  # to get the repository, if exists
            repository = Repositories.objects.get(id=request.data.get('id', None))
            return Response(status=status.HTTP_409_CONFLICT)
        except Repositories.DoesNotExist:
            serializer = RepositorySerializer(data=request.data)

            if not request.data.get('id'):
                return Response({'message': 'id is missing'}, status=status.HTTP_400_BAD_REQUEST)
            elif not request.data.get('owner'):
                return Response({'message': 'owner is missing'}, status=status.HTTP_400_BAD_REQUEST)
            elif not request.data.get('name'):
                return Response({'message': 'name is missing'}, status=status.HTTP_400_BAD_REQUEST)
            elif not request.data.get('url'):
                return Response({'message': 'url is missing'}, status=status.HTTP_400_BAD_REQUEST)
            elif serializer.is_valid():
                serializer.save()
                return Response(status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def partial_update(self, request, pk=None):
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)

    def destroy(self, request, pk=None):
        try:  # to get the repository, if exists
            repository = Repositories.objects.get(id=pk)
            repository.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Repositories.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


# ===================================== FIXING COMMITS ===============================================================#

class FixingCommitsViewSet(viewsets.ViewSet):
    """
    API endpoint that allows fixing-commits to be viewed or edited.

    list:
    Retrieve all the fixing-commits.

    retrieve:
    Retrieve a fixing-commit.

    create:
    Create a fixing-commit.

    partial_update: Set up the is_false_positive field of a fixing-commit. If is_false_positive equals False,
    then it switches to True, and vice-versa.

    destroy:
    Delete a fixing-commit.
    """

    def list(self, request):
        fixing_commits = FixingCommit.objects.all()
        serializer = FixingCommitSerializer(fixing_commits, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk):
        fixing_commit = get_object_or_404(FixingCommit, sha=pk)
        serializer = FixingCommitSerializer(fixing_commit)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def create(self, request):

        try:  # to get the fixing-commit, if exists
            FixingCommit.objects.get(sha=request.data.get('sha', None))
            return Response(status=status.HTTP_409_CONFLICT)
        except FixingCommit.DoesNotExist:
            if not request.data.get('sha'):
                return Response('Primary key \'sha\' is missing.', status=status.HTTP_400_BAD_REQUEST)

            serializer = FixingCommitSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                serializer.save()
                return Response(status=status.HTTP_201_CREATED)

    def partial_update(self, request, pk):
        fixing_commit = get_object_or_404(FixingCommit, sha=pk)
        fixing_commit.is_false_positive = not fixing_commit.is_false_positive
        fixing_commit.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def destroy(self, request, pk=None):
        fixing_commit = get_object_or_404(FixingCommit, sha=pk)
        fixing_commit.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ===================================== FIXING FILES ===============================================================#

class FixingFilesViewSet(viewsets.ViewSet):
    """
    API endpoint that allows fixing-files to be viewed or edited.

    list:
    Retrieve all the fixing-files.

    retrieve:
    Retrieve a fixing-file.

    create:
    Create a fixing-file.

    partial_update: Set up the is_false_positive field of a fixing-file. If is_false_positive equals False,
    then it switches to True, and vice-versa.

    destroy:
    Delete a fixing-file.
    """

    def list(self, request):
        fixing_commit = self.request.query_params.get('fixing_commit', None)
        if fixing_commit:
            fixing_files = FixingFile.objects.filter(fixing_commit=fixing_commit)
        else:
            fixing_files = FixingFile.objects.all()

        serializer = FixingFileSerializer(fixing_files, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk):
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)

    def create(self, request):
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)
        """
        try:  # to get the fixing-commit, if exists
            FixingCommit.objects.get(sha=request.data.get('sha', None))
            return Response(status=status.HTTP_409_CONFLICT)
        except FixingCommit.DoesNotExist:
            if not request.data.get('sha'):
                return Response('Primary key \'sha\' is missing.', status=status.HTTP_400_BAD_REQUEST)

            serializer = FixingCommitSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            else:
                serializer.save()
                return Response(status=status.HTTP_201_CREATED)
        """

    def partial_update(self, request, pk):
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)
        # fixing_commit = get_object_or_404(FixingCommit, sha=pk)
        # fixing_commit.is_false_positive = not fixing_commit.is_false_positive
        # fixing_commit.save()
        # return Response(status=status.HTTP_204_NO_CONTENT)

    def destroy(self, request, pk=None):
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)
        # fixing_commit = get_object_or_404(FixingCommit, sha=pk)
        # fixing_commit.delete()
        # return Response(status=status.HTTP_204_NO_CONTENT)


# ===================================================================================================================#

class GetPredictionView(APIView):
    """
    get:
    Get the prediction for an IaC script.
    """

    def get(self, request, pk):
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)


class UpdatePredictionView(APIView):
    """
    put:
    Update a prediction obtained from the GET /predictions/ endpoint.
    """

    def put(self, request, pk):
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)


class ModelsViewSet(viewsets.ViewSet):
    """
    list:
    List all the pre-trained models.

    retrieve:
    Retrieve a pre-trained model.

    create:
    Upload a pre-trained model.

    destroy:
    Delete a pre-trained model.
    """

    def list(self, request):
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)

    def retrieve(self, request, pk=None):
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)

    def create(self, request, pk=None):
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)

    def destroy(self, request, pk=None):
        return Response(status=status.HTTP_501_NOT_IMPLEMENTED)
