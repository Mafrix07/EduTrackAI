import type { VoiceAnalysis, AnalyzeRequest, ApiResponse } from "../types";

// ─── Realistic Mock Response ────────────────────────────────────────────────────

export const MOCK_ANALYSIS: VoiceAnalysis = {
  content_accuracy: 78,
  structure_score: 7,
  avg_pace_wpm: 126,
  filler_count: 6,
  missing_concepts: ["biais algorithmique", "confidentialité des données"],
  advice: [
    "Ralentissez légèrement : 120 mots/min est le rythme idéal pour l'oral académique.",
    "Structurez votre conclusion en 3 temps : synthèse → ouverture → perspective personnelle.",
  ],
  next_exercise:
    "Réenregistrez uniquement votre conclusion en visant 0 tic de langage sur 30 secondes.",
  confidence: 0.87,
  filler_words: [
    { word: "euh", count: 3 },
    { word: "donc", count: 2 },
    { word: "en fait", count: 1 },
  ],
  processing_time_ms: 1840,
  from_fallback: false,
};

const MOCK_ANALYSIS_FALLBACK: VoiceAnalysis = {
  ...MOCK_ANALYSIS,
  from_fallback: true,
  processing_time_ms: 120,
  confidence: 0.6,
};

// ─── API Client ─────────────────────────────────────────────────────────────────

const API_BASE = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8000";
const ANALYZE_TIMEOUT_MS = 25000; // Groq STT + LLM peut prendre jusqu'à 15s
const FETCH_TIMEOUT_MS = 5000;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), ms)
    ),
  ]);
}

export async function analyzeRecording(
  req: AnalyzeRequest,
  isDemoMode = false
): Promise<ApiResponse<VoiceAnalysis>> {
  if (isDemoMode) {
    await new Promise((r) => setTimeout(r, 1200));
    return { data: MOCK_ANALYSIS, status: "ok" };
  }

  try {
    const t0 = Date.now();
    const res = await withTimeout(
      fetch(`${API_BASE}/api/analyze/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req),
      }),
      ANALYZE_TIMEOUT_MS
    );

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return {
      data: json,
      status: "ok",
      latency_ms: Date.now() - t0,
    };
  } catch (err) {
    console.warn("[EduVoice] API fallback activated:", err);
    return {
      data: MOCK_ANALYSIS_FALLBACK,
      status: "fallback",
    };
  }
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const res = await withTimeout(fetch(`${API_BASE}/api/health/`), 3000);
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchTopics(): Promise<import("../types").Topic[] | null> {
  try {
    const res = await withTimeout(fetch(`${API_BASE}/api/topics/`), FETCH_TIMEOUT_MS);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const list = Array.isArray(data) ? data : data.results ?? [];
    return list.map((t: any) => ({
      id: String(t.id),
      title: t.title,
      subject: t.subject,
      level: t.level,
      deadline: t.deadline ?? undefined,
      coefficient: t.coefficient ?? undefined,
      createdAt: t.created_at,
    }));
  } catch {
    return null;
  }
}

export async function createTopic(
  data: {
    title: string;
    subject: string;
    level: "lycee" | "superieur" | "professionnel";
    deadline?: string;
    coefficient?: number;
  },
  token?: string
): Promise<import("../types").Topic | null> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const res = await withTimeout(
      fetch(`${API_BASE}/api/topics/`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: data.title,
          subject: data.subject,
          level: data.level,
          deadline: data.deadline ?? null,
          coefficient: data.coefficient ?? null,
        }),
      }),
      FETCH_TIMEOUT_MS
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const t = await res.json();
    return {
      id: String(t.id),
      title: t.title,
      subject: t.subject,
      level: t.level,
      deadline: t.deadline ?? undefined,
      coefficient: t.coefficient ?? undefined,
      createdAt: t.created_at,
    };
  } catch {
    return null;
  }
}

// ─── Audio Helpers ──────────────────────────────────────────────────────────────

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function wpmToLabel(wpm: number): { label: string; color: string } {
  if (wpm < 100) return { label: "Trop lent", color: "#F59E0B" };
  if (wpm <= 130) return { label: "Idéal", color: "#10B981" };
  if (wpm <= 160) return { label: "Rapide", color: "#F59E0B" };
  return { label: "Trop rapide", color: "#EF4444" };
}

export function scoreToColor(score: number, max = 100): string {
  const pct = score / max;
  if (pct >= 0.75) return "#10B981";
  if (pct >= 0.5) return "#F59E0B";
  return "#EF4444";
}
