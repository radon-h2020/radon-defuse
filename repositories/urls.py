from django.urls import path
from repositories import views

urlpatterns = [
    path('', views.repository_index, name='repository_index'),
    path('<str:id>/', views.repository_detail, name='repository_detail')
]