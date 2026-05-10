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