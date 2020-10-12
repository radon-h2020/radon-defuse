from django.urls import path
from django.views.generic import TemplateView
from . import views


urlpatterns = [
    path('repositories/', TemplateView.as_view(template_name='repositories_index.html'), name='repositories_index'),
    path('repositories/<pk>/', views.repository_home, name='repository_home'),
    path('repositories/<str:pk>/fixing-commits', views.repository_fixing_commits, name='repository_fixing_commits'),
    path('repositories/<str:pk>/fixing-files', views.repository_fixing_files, name='repository_fixing_files'),
    path('repositories/<str:pk>/mine', views.repository_mine, name='repository_mine'),
    path('repositories/<str:pk>/train', views.repository_train_settings, name='repository_train_settings'),
]
