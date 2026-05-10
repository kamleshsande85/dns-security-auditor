# """
# DNS SECURITY AUDITOR - VIEWS (SIMPLIFIED VERSION)
# COPY THIS ENTIRE CODE TO: backend/scanner/views.py
# """

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework import status
# from django.shortcuts import get_object_or_404
# from django.http import HttpResponse
# from io import BytesIO
# import re
# from datetime import datetime

# from .dns_scanner import DNSSecurityScanner
# from .models import AuditHistory
# from .serializers import ScanRequestSerializer, AuditHistorySerializer
# from reportlab.lib.pagesizes import letter
# from reportlab.pdfgen import canvas

# class ScanDomainView(APIView):
#     """POST /api/scan/ - Scan a domain"""
    
#     def post(self, request):
#         serializer = ScanRequestSerializer(data=request.data)
        
#         if not serializer.is_valid():
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
#         domain = serializer.validated_data['domain']
        
#         # Domain format validation
#         domain_pattern = r'^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$'
#         if not re.match(domain_pattern, domain):
#             return Response(
#                 {'error': 'Invalid domain format'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         try:
#             scanner = DNSSecurityScanner(domain)
#             results = scanner.scan_all()
            
#             # Save to database
#             audit = AuditHistory.objects.create(
#                 domain=domain,
#                 security_score=results['security_score'],
#                 grade=results['grade'],
#                 full_report=results
#             )
            
#             results['audit_id'] = audit.id
#             return Response(results, status=status.HTTP_200_OK)
        
#         except Exception as e:
#             return Response(
#                 {'error': f'Scan failed: {str(e)}'},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class GetHistoryView(APIView):
#     """GET /api/history/ - Get recent scans"""
    
#     def get(self, request):
#         history = AuditHistory.objects.all()[:50]
#         serializer = AuditHistorySerializer(history, many=True)
#         return Response(serializer.data)

# class GetHistoryDetailView(APIView):
#     """GET /api/history/<id>/ - Get specific scan"""
    
#     def get(self, request, audit_id):
#         audit = get_object_or_404(AuditHistory, id=audit_id)
#         return Response(audit.full_report)

# class ExportPDFView(APIView):
#     """GET /api/export/<id>/ - Export as PDF"""
    
#     def get(self, request, audit_id):
#         audit = get_object_or_404(AuditHistory, id=audit_id)
#         report = audit.full_report
        
#         buffer = BytesIO()
#         p = canvas.Canvas(buffer, pagesize=letter)
        
#         # Header
#         p.setFont("Helvetica-Bold", 24)
#         p.drawString(50, 750, "DNS Security Audit Report")
        
#         p.setFont("Helvetica", 12)
#         p.drawString(50, 700, f"Domain: {report['domain']}")
#         p.drawString(50, 680, f"Security Score: {report['security_score']}/100")
#         p.drawString(50, 660, f"Grade: {report['grade']}")
#         p.drawString(50, 640, f"Generated: {audit.created_at.strftime('%Y-%m-%d %H:%M:%S')}")
        
#         # Email Security Section
#         p.setFont("Helvetica-Bold", 16)
#         p.drawString(50, 600, "Email Security")
#         p.setFont("Helvetica", 10)
        
#         email_sec = report['email_security']
#         p.drawString(50, 580, f"SPF: {email_sec['spf']['status'].upper()} - {email_sec['spf']['details']}")
#         p.drawString(50, 560, f"DMARC: {email_sec['dmarc']['status'].upper()} - {email_sec['dmarc']['details']}")
        
#         # Infrastructure Section
#         p.setFont("Helvetica-Bold", 16)
#         p.drawString(50, 520, "Infrastructure Security")
#         p.setFont("Helvetica", 10)
        
#         infra = report['infrastructure']
#         y = 500
#         p.drawString(50, y, f"DNSSEC: {infra['dnssec']['status'].upper()} - {infra['dnssec']['details']}")
#         p.drawString(50, y-20, f"TTL Analysis: {infra['ttl_analysis']['status'].upper()}")
        
#         if 'domain_expiry' in infra:
#             p.drawString(50, y-40, f"Domain Expiry: {infra['domain_expiry']['status'].upper()} - {infra['domain_expiry']['details']}")
        
#         p.save()
        
#         buffer.seek(0)
#         response = HttpResponse(buffer, content_type='application/pdf')
#         response['Content-Disposition'] = f'attachment; filename="dns_audit_{report["domain"]}.pdf"'
        
#         return response


# class AdvancedScanView(APIView):
#     """POST /api/advanced-scan/ - Advanced scan with more details"""
    
#     def post(self, request):
#         serializer = ScanRequestSerializer(data=request.data)
        
#         if not serializer.is_valid():
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
#         domain = serializer.validated_data['domain']
        
#         # Domain format validation
#         domain_pattern = r'^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$'
#         if not re.match(domain_pattern, domain):
#             return Response(
#                 {'error': 'Invalid domain format'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )
        
#         try:
#             scanner = DNSSecurityScanner(domain)
#             results = scanner.scan_all()
            
#             # Save to database
#             audit = AuditHistory.objects.create(
#                 domain=domain,
#                 security_score=results['security_score'],
#                 grade=results['grade'],
#                 full_report=results
#             )
            
#             results['audit_id'] = audit.id
#             return Response(results, status=status.HTTP_200_OK)
        
#         except Exception as e:
#             return Response(
#                 {'error': f'Scan failed: {str(e)}'},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )


# class ScanDetailView(APIView):
#     """GET /api/scan/<id>/ - Get scan details"""
    
#     def get(self, request, scan_id):
#         audit = get_object_or_404(AuditHistory, id=scan_id)
#         return Response(audit.full_report)


# class DashboardStatsView(APIView):
#     """GET /api/dashboard/stats/ - Get dashboard statistics"""
    
#     def get(self, request):
#         total_scans = AuditHistory.objects.count()
#         completed_scans = AuditHistory.objects.count()
        
#         all_audits = AuditHistory.objects.all()
#         average_score = 0
#         critical_count = 0
        
#         if all_audits.exists():
#             average_score = sum(audit.security_score for audit in all_audits) // len(all_audits)
            
#             for audit in all_audits:
#                 if 'findings' in audit.full_report:
#                     for finding in audit.full_report.get('findings', []):
#                         if finding.get('risk') == 'critical':
#                             critical_count += 1
        
#         return Response({
#             'total_scans': total_scans,
#             'completed_scans': completed_scans,
#             'average_score': average_score,
#             'critical_vulnerabilities': critical_count
#         })


"""
DNS SECURITY AUDITOR - COMPLETE VIEWS WITH ALL FEATURES
COPY THIS ENTIRE CODE TO: backend/scanner/views.py
"""

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from io import BytesIO
import re
from datetime import datetime

from .dns_scanner import DNSSecurityScanner
from .models import AuditHistory
from .serializers import ScanRequestSerializer, AuditHistorySerializer
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas


class ScanDomainView(APIView):
    """POST /api/scan/ - Scan a domain (Basic Scan)"""

    def post(self, request):
        serializer = ScanRequestSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        domain = serializer.validated_data['domain']

        # Domain format validation
        domain_pattern = r'^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$'
        if not re.match(domain_pattern, domain):
            return Response(
                {'error': 'Invalid domain format'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            scanner = DNSSecurityScanner(domain)
            results = scanner.scan_all()

            # Save to database
            audit = AuditHistory.objects.create(
                domain=domain,
                security_score=results['security_score'],
                grade=results['grade'],
                full_report=results
            )

            results['audit_id'] = audit.id
            return Response(results, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': f'Scan failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AdvancedScanView(APIView):
    """POST /api/advanced-scan/ - Advanced scan with detailed analysis"""

    def post(self, request):
        serializer = ScanRequestSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        domain = serializer.validated_data['domain']

        # Domain format validation
        domain_pattern = r'^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$'
        if not re.match(domain_pattern, domain):
            return Response(
                {'error': 'Invalid domain format'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            scanner = DNSSecurityScanner(domain)
            results = scanner.scan_all()

            # Save to database
            audit = AuditHistory.objects.create(
                domain=domain,
                security_score=results['security_score'],
                grade=results['grade'],
                full_report=results
            )

            results['audit_id'] = audit.id
            return Response(results, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': f'Advanced scan failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class GetHistoryView(APIView):
    """GET /api/history/ - Get recent scans history"""

    def get(self, request):
        history = AuditHistory.objects.all()[:50]
        serializer = AuditHistorySerializer(history, many=True)
        return Response(serializer.data)


class GetHistoryDetailView(APIView):
    """GET /api/history/<id>/ - Get specific scan details"""

    def get(self, request, audit_id):
        audit = get_object_or_404(AuditHistory, id=audit_id)
        return Response(audit.full_report)


class ScanDetailView(APIView):
    """GET /api/scan/<id>/ - Get scan details (alias for GetHistoryDetailView)"""

    def get(self, request, scan_id):
        audit = get_object_or_404(AuditHistory, id=scan_id)
        return Response(audit.full_report)


class DashboardStatsView(APIView):
    """GET /api/dashboard/stats/ - Get dashboard statistics"""

    def get(self, request):
        total_scans = AuditHistory.objects.count()

        all_audits = AuditHistory.objects.all()
        average_score = 0
        critical_count = 0
        high_count = 0
        medium_count = 0
        low_count = 0

        if all_audits.exists():
            # Calculate average score
            total_score = sum(audit.security_score for audit in all_audits)
            average_score = total_score // len(all_audits)

            # Count vulnerabilities from reports
            for audit in all_audits:
                full_report = audit.full_report

                # Check email security issues
                email_sec = full_report.get('email_security', {})
                for key in ['spf', 'dmarc']:
                    if email_sec.get(key, {}).get('risk') == 'critical':
                        critical_count += 1
                    elif email_sec.get(key, {}).get('risk') == 'warning':
                        medium_count += 1

                # Check infrastructure issues
                infra = full_report.get('infrastructure', {})
                for key in infra:
                    if key == 'domain_expiry' and infra[key].get('risk') == 'critical':
                        critical_count += 1
                    elif infra[key].get('risk') == 'warning':
                        medium_count += 1
                    elif infra[key].get('risk') == 'critical':
                        critical_count += 1

        return Response({
            'total_scans': total_scans,
            'completed_scans': total_scans,
            'failed_scans': 0,
            'average_score': average_score,
            'critical_vulnerabilities': critical_count,
            'high_vulnerabilities': high_count,
            'medium_vulnerabilities': medium_count,
            'low_vulnerabilities': low_count,
            'recent_scans': [
                {
                    'domain': audit.domain,
                    'score': audit.security_score,
                    'grade': audit.grade,
                    'date': audit.created_at,
                    'scan_id': audit.id
                } for audit in all_audits[:10]
            ]
        })


class DeleteHistoryView(APIView):
    """DELETE /api/history/<id>/ - Delete specific scan"""

    def delete(self, request, audit_id):
        try:
            audit = get_object_or_404(AuditHistory, id=audit_id)
            domain = audit.domain
            audit.delete()
            return Response({
                'message': f'Successfully deleted scan for {domain}',
                'deleted_id': audit_id
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
            
            
class ClearHistoryView(APIView):
    """DELETE /api/clear-history/ - Clear all scan history"""

    def delete(self, request):
        try:
            count = AuditHistory.objects.all().count()
            AuditHistory.objects.all().delete()
            return Response({
                'message': f'Successfully deleted {count} scan records',
                'deleted_count': count
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ExportPDFView(APIView):
    """GET /api/export/<audit_id>/ - Export scan results as PDF"""

    def get(self, request, audit_id):
        audit = get_object_or_404(AuditHistory, id=audit_id)
        report = audit.full_report

        buffer = BytesIO()
        p = canvas.Canvas(buffer, pagesize=letter)

        # Header
        p.setFont("Helvetica-Bold", 24)
        p.drawString(50, 750, "DNS Security Audit Report")

        p.setFont("Helvetica", 12)
        p.drawString(50, 700, f"Domain: {report['domain']}")
        p.drawString(
            50, 680, f"Security Score: {report['security_score']}/100")
        p.drawString(50, 660, f"Grade: {report['grade']}")
        p.drawString(
            50, 640, f"Generated: {audit.created_at.strftime('%Y-%m-%d %H:%M:%S')}")

        # Score indicator
        score = report['security_score']
        if score >= 80:
            score_status = "EXCELLENT"
        elif score >= 60:
            score_status = "GOOD"
        elif score >= 40:
            score_status = "NEEDS IMPROVEMENT"
        else:
            score_status = "CRITICAL ISSUES FOUND"

        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, 610, f"Status: {score_status}")

        # Email Security Section
        p.setFont("Helvetica-Bold", 16)
        p.drawString(50, 580, "Email Security")
        p.setFont("Helvetica", 10)

        email_sec = report.get('email_security', {})
        p.drawString(
            50, 560, f"SPF: {email_sec.get('spf', {}).get('status', 'unknown').upper()} - {email_sec.get('spf', {}).get('details', 'N/A')}")
        p.drawString(
            50, 540, f"DMARC: {email_sec.get('dmarc', {}).get('status', 'unknown').upper()} - {email_sec.get('dmarc', {}).get('details', 'N/A')}")

        # Infrastructure Section
        p.setFont("Helvetica-Bold", 16)
        p.drawString(50, 500, "Infrastructure Security")
        p.setFont("Helvetica", 10)

        infra = report.get('infrastructure', {})
        y = 480
        p.drawString(
            50, y, f"DNSSEC: {infra.get('dnssec', {}).get('status', 'unknown').upper()} - {infra.get('dnssec', {}).get('details', 'N/A')}")
        p.drawString(
            50, y-20, f"TTL Analysis: {infra.get('ttl_analysis', {}).get('status', 'unknown').upper()}")

        if 'domain_expiry' in infra:
            p.drawString(
                50, y-40, f"Domain Expiry: {infra['domain_expiry'].get('status', 'unknown').upper()} - {infra['domain_expiry'].get('details', 'N/A')}")

        # DNS Records (brief)
        records = report.get('records', {})
        y_pos = y - 80
        if records:
            p.setFont("Helvetica-Bold", 12)
            p.drawString(50, y_pos, "DNS Records Summary:")
            p.setFont("Helvetica", 9)
            y_pos -= 20

            # Show first 5 record types
            for record_type, values in list(records.items())[:5]:
                if values:
                    p.drawString(
                        50, y_pos, f"{record_type}: {', '.join(str(v)[:30] for v in values[:2])}")
                    y_pos -= 15
                    if y_pos < 50:
                        break

        p.save()

        buffer.seek(0)
        response = HttpResponse(buffer, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="dns_audit_{report["domain"]}_{audit.id}.pdf"'

        return response
