from django.db import models
import uuid


class Recording(models.Model):
    STATUS_CHOICES = [
        ("pending", "En attente"),
        ("processing", "En cours"),
        ("done", "Terminé"),
        ("error", "Erreur"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    topic = models.ForeignKey(
        "topics.Topic",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="recordings",
    )
    topic_title = models.CharField(max_length=255, blank=True)
    level = models.CharField(max_length=20, default="lycee")
    duration_seconds = models.FloatField(default=0)
    transcript = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    from_fallback = models.BooleanField(default=False)
    processing_time_ms = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Recording {self.id} — {self.topic_title} ({self.status})"
