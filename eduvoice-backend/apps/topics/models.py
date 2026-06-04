from django.db import models
import uuid


class Topic(models.Model):
    LEVEL_CHOICES = [
        ("lycee", "Lycée"),
        ("superieur", "Supérieur"),
        ("professionnel", "Professionnel"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255)
    subject = models.CharField(max_length=100)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default="lycee")
    deadline = models.DateTimeField(null=True, blank=True)
    coefficient = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} ({self.level})"
