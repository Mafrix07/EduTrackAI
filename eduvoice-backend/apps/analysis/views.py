import logging
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from apps.recordings.models import Recording
from .pipeline import run_analysis_pipeline

logger = logging.getLogger(__name__)


class AnalyzeView(APIView):
    """
    POST /api/analyze/
    Body: { audio_base64, topic, level, duration_seconds }
    Returns: VoiceAnalysis JSON
    """

    def post(self, request):
        # Validation entrée
        audio_base64 = request.data.get("audio_base64", "")
        topic = request.data.get("topic", "Sujet libre")
        level = request.data.get("level", "lycee")
        duration_seconds = float(request.data.get("duration_seconds", 0))

        if duration_seconds < 5 and audio_base64 not in ("DEMO_BASE64", ""):
            return Response(
                {
                    "error": "transcript_too_short",
                    "message": "Parlez au moins 10 secondes sur le sujet.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Pipeline IA
        try:
            result = run_analysis_pipeline(
                audio_base64=audio_base64,
                topic=topic,
                level=level,
                duration_seconds=duration_seconds,
            )
        except Exception as e:
            logger.error(f"[Analyze] Pipeline exception: {e}")
            from .pipeline import FALLBACK_RESPONSE
            result = FALLBACK_RESPONSE

        # Sauvegarder en DB
        try:
            Recording.objects.create(
                topic_title=topic,
                level=level,
                duration_seconds=duration_seconds,
                status="done",
                from_fallback=result.from_fallback,
                processing_time_ms=result.processing_time_ms,
            )
        except Exception as e:
            logger.warning(f"[Analyze] DB save failed: {e}")

        return Response(result.model_dump())


class HealthView(APIView):
    """GET /api/health/ — vérification rapide"""

    def get(self, request):
        from django.conf import settings
        return Response({
            "status": "ok",
            "groq_configured": bool(settings.GROQ_API_KEY),
            "version": "0.1.0",
        })
