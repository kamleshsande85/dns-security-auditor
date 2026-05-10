

from rest_framework import serializers
from .models import AuditHistory

class ScanRequestSerializer(serializers.Serializer):
    domain = serializers.CharField(max_length=255)

class AuditHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditHistory
        fields = ['id', 'domain', 'security_score', 'grade', 'created_at']