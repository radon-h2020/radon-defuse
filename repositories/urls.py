from django.urls import path
from repositories import views

urlpatterns = [
    path('', views.repositories_index, name='repositories_index'),
    path('dump/', views.repositories_dump, name='repositories_dump'),
    path('<str:id>/', views.repository_detail, name='repository_detail')
]