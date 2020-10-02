from rest_framework import status
from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Repositories
from .serializers import RepositorySerializer


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

    queryset = Repositories.objects.all()
    serializer_class = RepositorySerializer

    def list(self, request):
        repositories = Repositories.objects.all()
        serializer = RepositorySerializer(repositories, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        try:
            repository = Repositories.objects.get(id=pk)
            serializer = RepositorySerializer(repository)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Repositories.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

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
