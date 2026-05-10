"""
MAIN URL CONFIGURATION
COPY THIS ENTIRE CODE TO: backend/backend/urls.py
"""

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('scanner.urls')),
]

# Serve React Frontend (for all other paths)
re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
