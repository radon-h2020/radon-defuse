from django.urls import include, path
from django.views.generic import TemplateView

urlpatterns = [
    path('api-docs/', TemplateView.as_view(template_name="swagger-ui.html"), name="api-docs"),
    path('', TemplateView.as_view(template_name='main.html')),
    path('api/', include(('apis.urls', 'api'), namespace='api')),
    path('web/', include(('web.urls', 'web'), namespace='web')),
]
