from django.db import models


class IntelligencePoint(models.Model):
    SOURCE_TYPES = [
        ('OSINT', 'Open Source Intelligence'),
        ('HUMINT', 'Human Intelligence'),
        ('IMINT', 'Imagery Intelligence'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    latitude = models.FloatField()
    longitude = models.FloatField()
    source_type = models.CharField(max_length=10, choices=SOURCE_TYPES, default='OSINT')
    image = models.ImageField(upload_to='uploads/', blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.source_type}] {self.title}"
