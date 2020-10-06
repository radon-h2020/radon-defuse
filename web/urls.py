from django.urls import path
from django.views.generic import TemplateView
from . import views


urlpatterns = [
    path('repositories/', TemplateView.as_view(template_name='repositories_index.html'), name='repositories_index'),
    path('repositories/<pk>/', views.repository_home),
    path('repositories/<pk>/mine', views.repository_mine, name='repository_mine'),
]
