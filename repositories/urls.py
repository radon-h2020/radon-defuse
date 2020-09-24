from django.urls import path
from repositories import views

urlpatterns = [
    path('', views.repositories_index, name='repositories_index'),
    path('dump/', views.repositories_dump, name='repositories_dump'),
    path('<str:id>/', views.repository_home, name='repository_main'),
    path('<str:id>/dump/metrics', views.repository_metrics_dump, name='repository_metrics_dump'),
    path('<str:id>/home', views.repository_home, name='repository_home'),
    path('<str:id>/fixing-commits', views.repository_fixing_commits, name='repository_fixing_commits'),
    path('<str:id>/fixing-files', views.repository_fixing_files, name='repository_fixing_files'),
    path('<str:id>/labeled-files', views.repository_labeled_files, name='repository_labeled_files'),
    path('<str:id>/score', views.repository_score, name='repository_score'),
    path('<str:id>/mine', views.repository_mine, name='repository_mine'),
    path('<str:id>/train', views.repository_train, name='repository_train')
]