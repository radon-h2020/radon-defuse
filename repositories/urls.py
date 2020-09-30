from django.urls import path

from repositories import views

urlpatterns = [
    path('', views.list_repositories, name='repositories_index'),
    path('labels/', views.collect_repositories_labels, name='collect_repositories_labels'),
    path('dump/', views.dump_repositories, name='repositories_dump'),
    path('<str:id>/', views.repository_details, name='repository_details'),
    path('<str:id>/delete/', views.delete_repository, name='repository_delete'),
    path('<str:id>/dump/', views.dump_repository, name='repository_dump'),
    path('<str:id>/fixing-commits/', views.repository_fixing_commits, name='repository_fixing_commits'),
    path('<str:id>/fixing-commits/<str:sha>/delete/', views.delete_fixing_commit, name='delete_fixing_commit'),
    path('<str:id>/fixing-files/', views.repository_fixing_files, name='repository_fixing_files'),
    #path('<str:id>/fixing-files/{pk}', views.repository_fixing_files, name='repository_fixing_files'),
    path('<str:id>/labeled-files/', views.repository_labeled_files, name='repository_labeled_files'),
    path('<str:id>/dump/metrics/', views.repository_metrics_dump, name='repository_metrics_dump'),
    path('<str:id>/score/', views.repository_score, name='repository_score'),
    path('<str:id>/mine/', views.repository_mine, name='repository_mine'),
    path('<str:id>/train/', views.repository_train, name='repository_train')
]