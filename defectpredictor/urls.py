from django.urls import include, path
from django.views.generic import TemplateView
from rest_framework.schemas import get_schema_view
from django.conf.urls.static import static
from defectpredictor import settings

schema_url_patterns = [
    path('api/', include('apis.urls')),
]

urlpatterns = [
    path('api-docs/', TemplateView.as_view(template_name="index.html")),
    path('', TemplateView.as_view(template_name='main.html')),
    path('api/', include('apis.urls')),
]

"""
    path('openapi', get_schema_view(
        title="IaC Defect Predictor",
        description="API for crawling, mining repositories based on Infrastructure-as-Code, and access pre-trained "
                    "Machine-Learning models to assess the failure-proneness of IaC scripts",
        version="v0",
        patterns=schema_url_patterns,
    ), name='openapi-schema'),
    path('api-docs/', TemplateView.as_view(
        template_name='swagger-ui.html',
        extra_context={'schema_url': 'openapi-schema'}
    ), name='swagger-dist-ui'),
    """