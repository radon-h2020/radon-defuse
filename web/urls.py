from django.urls import path
from django.views.generic import TemplateView
from . import views


urlpatterns = [
    path('repositories/', TemplateView.as_view(template_name='repositories_index.html')),
]