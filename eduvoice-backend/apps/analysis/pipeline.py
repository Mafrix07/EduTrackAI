"""
pipeline.py — Pipeline IA EduVoice
Audio (base64) → STT (Groq/Whisper) → LLM (Llama 3) → dict validé
Fallback automatique à chaque étape.
"""
import base64
import dataclasses
import hashlib
import json
import logging
import time
from typing import Optional

import httpx
from django.conf import settings
from django.core.cache import cache

logger = logging.getLogger(__name__)


# ─── Schema (dataclasses Python natif, zéro dépendance externe) ───────────────

@dataclasses.dataclass
class FillerWord:
    word: str
    count: int


@dataclasses.dataclass
class VoiceAnalysis:
    content_accuracy: int        # 0-100
    structure_score: int         # 0-10
    avg_pace_wpm: int
    filler_count: int
    missing_concepts: list
    advice: list
    next_exercise: str
    confidence: float            # 0.0-1.0
    filler_words: list = dataclasses.field(default_factory=list)
    from_fallback: bool = False
    from_cache: bool = False
    processing_time_ms: Optional[int] = None
    transcript: str = ""

    def model_dump(self) -> dict:
        return dataclasses.asdict(self)

    def model_copy(self) -> "VoiceAnalysis":
        return dataclasses.replace(self)


def _coerce_list(v) -> list:
    if isinstance(v, str):
        return [v]
    return v or []


def _parse_filler_words(raw: list) -> list[FillerWord]:
    result = []
    for item in raw:
        if isinstance(item, dict):
            result.append(FillerWord(word=str(item.get("word", "")), count=int(item.get("count", 0))))
    return result


def _clamp(value, lo, hi):
    return max(lo, min(hi, value))


def _voice_analysis_from_dict(data: dict) -> "VoiceAnalysis":
    return VoiceAnalysis(
        content_accuracy=_clamp(int(data.get("content_accuracy", 65)), 0, 100),
        structure_score=_clamp(int(data.get("structure_score", 6)), 0, 10),
        avg_pace_wpm=_clamp(int(data.get("avg_pace_wpm", 130)), 0, 400),
        filler_count=max(0, int(data.get("filler_count", 0))),
        missing_concepts=_coerce_list(data.get("missing_concepts")),
        advice=_coerce_list(data.get("advice")),
        next_exercise=str(data.get("next_exercise", "")),
        confidence=_clamp(float(data.get("confidence", 0.5)), 0.0, 1.0),
        filler_words=_parse_filler_words(data.get("filler_words", [])),
    )


# ─── Fallback réaliste ─────────────────────────────────────────────────────────

FALLBACK_RESPONSE = VoiceAnalysis(
    content_accuracy=65,
    structure_score=6,
    avg_pace_wpm=132,
    filler_count=7,
    missing_concepts=["définition précise du concept", "exemple concret"],
    advice=[
        "Structurez votre propos en 3 temps : contexte → développement → conclusion.",
        "Réduisez les tics de langage en faisant une pause silencieuse plutôt que de dire 'euh'.",
    ],
    next_exercise="Réenregistrez uniquement votre introduction en visant 0 tic sur 20 secondes.",
    confidence=0.5,
    filler_words=[
        FillerWord(word="euh", count=4),
        FillerWord(word="donc", count=2),
        FillerWord(word="en fait", count=1),
    ],
    from_fallback=True,
    processing_time_ms=50,
)

# ─── Prompt LLM ───────────────────────────────────────────────────────────────

ANALYSIS_PROMPT = """Tu es un coach pédagogique spécialisé dans les examens togolais (BEPC, BAC 1/Probatoire, BAC 2).
Analyse la transcription suivante sur le sujet: "{topic}" (niveau: {level})

Transcription:
\"\"\"
{transcript}
\"\"\"

Règles STRICTES:
1. Évalue la JUSTESSE du contenu par rapport au sujet (0-100)
2. Évalue la STRUCTURE : intro claire, développement, conclusion (0-10)
3. Compte les tics verbaux ("euh", "donc", "en fait", "voilà", "bon", "hein") et calcule le débit (mots/min)
4. Propose exactement 2 conseils ACTIONNABLES et précis adaptés au contexte togolais
5. Propose 1 exercice de rattrapage ciblé sur le point le plus faible
6. Liste les concepts importants du sujet NON mentionnés

Retourne UNIQUEMENT ce JSON valide, rien d'autre, sans markdown:
{{
  "content_accuracy": <0-100>,
  "structure_score": <0-10>,
  "avg_pace_wpm": <nombre entier>,
  "filler_count": <nombre total de tics>,
  "missing_concepts": ["concept1", "concept2"],
  "advice": ["conseil précis 1", "conseil précis 2"],
  "next_exercise": "exercice ciblé en 1 phrase",
  "confidence": <0.0-1.0>,
  "filler_words": [
    {{"word": "euh", "count": <n>}},
    {{"word": "donc", "count": <n>}}
  ]
}}"""

# ─── Client Groq ──────────────────────────────────────────────────────────────

def _groq_headers() -> dict:
    return {
        "Authorization": f"Bearer {settings.GROQ_API_KEY}",
        "Content-Type": "application/json",
    }


def transcribe_audio(audio_base64: str, duration_seconds: float) -> Optional[str]:
    """Whisper STT via Groq API. Retourne la transcription ou None."""
    if not settings.GROQ_API_KEY or audio_base64 in ("DEMO_BASE64", ""):
        return None

    try:
        audio_bytes = base64.b64decode(audio_base64)
        with httpx.Client(timeout=settings.AI_TIMEOUT_SECONDS) as client:
            resp = client.post(
                "https://api.groq.com/openai/v1/audio/transcriptions",
                headers={"Authorization": f"Bearer {settings.GROQ_API_KEY}"},
                files={"file": ("audio.m4a", audio_bytes, "audio/m4a")},
                data={
                    "model": settings.GROQ_STT_MODEL,
                    "language": "fr",
                    "response_format": "text",
                },
            )
            resp.raise_for_status()
            return resp.text.strip()
    except Exception as e:
        logger.warning(f"[STT] Groq Whisper failed: {e}")
        return None


def analyze_with_llm(transcript: str, topic: str, level: str) -> Optional[VoiceAnalysis]:
    """Llama 3 via Groq → JSON → VoiceAnalysis. Retourne None si échec."""
    if not settings.GROQ_API_KEY:
        return None

    prompt = ANALYSIS_PROMPT.format(topic=topic, level=level, transcript=transcript)
    raw = ""

    try:
        with httpx.Client(timeout=settings.AI_TIMEOUT_SECONDS) as client:
            resp = client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers=_groq_headers(),
                json={
                    "model": settings.GROQ_LLM_MODEL,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.2,
                    "max_tokens": 800,
                },
            )
            resp.raise_for_status()
            raw = resp.json()["choices"][0]["message"]["content"].strip()

            # Strip markdown fences si présents
            if raw.startswith("```"):
                raw = raw.split("```")[1]
                if raw.startswith("json"):
                    raw = raw[4:]
            raw = raw.strip()

            data = json.loads(raw)
            return _voice_analysis_from_dict(data)

    except json.JSONDecodeError as e:
        logger.warning(f"[LLM] JSON invalide: {e} — raw: {raw[:200]}")
        return None
    except Exception as e:
        logger.warning(f"[LLM] Groq failed: {e}")
        return None


# ─── Pipeline principal ────────────────────────────────────────────────────────

def run_analysis_pipeline(
    audio_base64: str,
    topic: str,
    level: str,
    duration_seconds: float,
) -> VoiceAnalysis:
    """
    Pipeline complet :
    1. Cache (hash topic+level)
    2. STT Whisper
    3. LLM Llama 3
    4. Fallback automatique si timeout/erreur
    """
    t0 = time.time()

    # 1. Cache check
    cache_key = f"eduvoice:analysis:{hashlib.md5(f'{topic}:{level}'.encode()).hexdigest()}"
    cached = cache.get(cache_key)
    if cached:
        result = _voice_analysis_from_dict(cached)
        result.from_cache = True
        result.processing_time_ms = int((time.time() - t0) * 1000)
        logger.info(f"[Pipeline] Cache hit for {topic[:30]}")
        return result

    # 2. STT
    transcript = transcribe_audio(audio_base64, duration_seconds)
    if not transcript:
        word_count = max(50, int(duration_seconds * 2.2))
        transcript = f"[Transcription simulée — {word_count} mots estimés sur le sujet: {topic}]"
        logger.info("[Pipeline] STT unavailable, using simulated transcript")

    # 3. LLM Analysis
    result = analyze_with_llm(transcript, topic, level)

    if result is None:
        logger.warning("[Pipeline] LLM failed, using fallback")
        result = FALLBACK_RESPONSE.model_copy()
        result.from_fallback = True
    else:
        result.from_fallback = False
        cache.set(cache_key, result.model_dump(), timeout=settings.AI_CACHE_TTL)

    result.processing_time_ms = int((time.time() - t0) * 1000)
    result.transcript = transcript
    return result
