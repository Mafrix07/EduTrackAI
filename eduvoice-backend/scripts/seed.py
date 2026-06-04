"""
Script de seed : insère des données réalistes pour la démo
Usage : python manage.py shell < scripts/seed.py
"""
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from apps.topics.models import Topic
from apps.recordings.models import Recording
from django.utils import timezone
from datetime import timedelta

print("🌱 Seeding EduVoice database...")

# Topics
topics_data = [
    {
        "title": "Le rôle de l'IA dans l'éducation",
        "subject": "Sciences & Société",
        "level": "lycee",
        "deadline": timezone.now() + timedelta(days=7),
        "coefficient": 5,
    },
    {
        "title": "Soutenance Projet Web — Architecture REST",
        "subject": "Informatique",
        "level": "superieur",
        "deadline": timezone.now() + timedelta(days=14),
        "coefficient": 10,
    },
    {
        "title": "Les enjeux du changement climatique",
        "subject": "Géographie",
        "level": "lycee",
        "deadline": timezone.now() + timedelta(days=3),
        "coefficient": 4,
    },
]

Topic.objects.all().delete()
topics = [Topic.objects.create(**t) for t in topics_data]
print(f"  ✓ {len(topics)} topics créés")

# Recordings (sessions passées réalistes)
sessions = [
    {"days_ago": 5, "accuracy": 52, "duration": 58, "fallback": True},
    {"days_ago": 4, "accuracy": 61, "duration": 63, "fallback": False},
    {"days_ago": 3, "accuracy": 68, "duration": 71, "fallback": False},
    {"days_ago": 2, "accuracy": 74, "duration": 68, "fallback": False},
    {"days_ago": 1, "accuracy": 81, "duration": 75, "fallback": False},
]

Recording.objects.all().delete()
for s in sessions:
    r = Recording.objects.create(
        topic=topics[0],
        topic_title=topics[0].title,
        level="lycee",
        duration_seconds=s["duration"],
        status="done",
        from_fallback=s["fallback"],
        processing_time_ms=1800 if not s["fallback"] else 120,
    )
    # Backdate created_at
    Recording.objects.filter(pk=r.pk).update(
        created_at=timezone.now() - timedelta(days=s["days_ago"])
    )

print(f"  ✓ {len(sessions)} recordings créés")
print("\n✅ Seed terminé ! Lancez : python manage.py runserver")
