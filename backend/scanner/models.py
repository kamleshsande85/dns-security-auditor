from django.db import models

class AuditHistory(models.Model):
    domain = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    security_score = models.IntegerField(default=0)
    grade = models.CharField(max_length=10, default='F')
    full_report = models.JSONField(default=dict)
    
    def __str__(self):
        return f"{self.domain} - {self.created_at}"
    
    class Meta:
        ordering = ['-created_at']