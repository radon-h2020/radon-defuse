from django.urls import path
from mine_github import views

urlpatterns = [
    path('', views.miner_settings, name='miner_settings'),
]