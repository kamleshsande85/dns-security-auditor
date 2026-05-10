# """
# DNS SECURITY AUDITOR - URL CONFIGURATION
# COPY THIS ENTIRE CODE TO: backend/scanner/urls.py
# """

# from django.urls import path
# from . import views

# urlpatterns = [
#     # Basic scan endpoints
#     path('api/scan/', views.ScanDomainView.as_view(), name='scan'),
#     path('api/history/', views.GetHistoryView.as_view(), name='history'),
#     path('api/history/<int:audit_id>/', views.GetHistoryDetailView.as_view(), name='history-detail'),
#     path('api/export/<int:audit_id>/', views.ExportPDFView.as_view(), name='export-pdf'),

#     # Advanced scan endpoints
#     path('api/advanced-scan/', views.AdvancedScanView.as_view(), name='advanced-scan'),
#     path('api/scan/<int:scan_id>/', views.ScanDetailView.as_view(), name='scan-detail'),
#     path('api/dashboard/stats/', views.DashboardStatsView.as_view(), name='dashboard-stats'),
# ]


"""
COMPLETE URL CONFIGURATION
COPY THIS CODE TO: backend/scanner/urls.py
"""

from django.urls import path
from . import views

urlpatterns = [
    # Basic scan endpoints
    path('api/scan/', views.ScanDomainView.as_view(), name='scan'),
    path('api/advanced-scan/', views.AdvancedScanView.as_view(), name='advanced-scan'),

    # History endpoints
    path('api/history/', views.GetHistoryView.as_view(), name='history'),
    path('api/history/<int:audit_id>/',
         views.GetHistoryDetailView.as_view(), name='history-detail'),
    path('api/scan/<int:scan_id>/',
         views.ScanDetailView.as_view(), name='scan-detail'),

    # Dashboard stats
    path('api/dashboard/stats/', views.DashboardStatsView.as_view(),
         name='dashboard-stats'),

    # PDF Export
    path('api/export/<int:audit_id>/',
         views.ExportPDFView.as_view(), name='export-pdf'),
    path('api/history/<int:audit_id>/delete/',
         views.DeleteHistoryView.as_view(), name='delete-history'),
    path('api/clear-history/', views.ClearHistoryView.as_view(), name='clear-history'),
]
