from django.urls import include, path
from rest_framework import routers
from apis import views

router = routers.DefaultRouter()
router.register('repositories', views.RepositoriesViewSet, basename='repositories')
router.register('fixing-commits', views.FixingCommitsViewSet, basename='fixing-commits')
router.register('fixing-files', views.FixingFilesViewSet, basename='fixing-files')
#router.register('models', views.ModelsViewSet, basename='models')

# Wire up our API using automatic URL routing.
# Additionally, we include login URLs for the browsable API.
urlpatterns = [
   path('', include(router.urls)),
   #path('predictions/', views.GetPredictionView.as_view(), name='get-prediction'),
   #path('predictions/<int:id>/', views.UpdatePredictionView.as_view(), name='update-prediction')
]