// ─── Core Domain Types ────────────────────────────────────────────────────────

export interface Topic {
  id: string;
  title: string;
  subject: string;
  level: "lycee" | "superieur" | "professionnel";
  deadline?: string;
  coefficient?: number;
  createdAt: string;
}

export interface Recording {
  id: string;
  topicId: string;
  audioUri: string;
  durationSeconds: number;
  transcript?: string;
  analysis?: VoiceAnalysis;
  createdAt: string;
}

// ─── AI Analysis Types ─────────────────────────────────────────────────────────

export interface VoiceAnalysis {
  content_accuracy: number;       // 0-100
  structure_score: number;        // 0-10
  avg_pace_wpm: number;
  filler_count: number;
  missing_concepts: string[];
  advice: string[];
  next_exercise: string;
  confidence: number;             // 0.0-1.0
  filler_words?: FillerWord[];
  processing_time_ms?: number;
  from_cache?: boolean;
  from_fallback?: boolean;
}

export interface FillerWord {
  word: string;
  count: number;
  timestamps?: number[];
}

export interface AnalysisError {
  error: "transcript_too_short" | "off_topic" | "api_timeout" | "invalid_json";
  message: string;
}

export type AnalysisResult = VoiceAnalysis | AnalysisError;

// ─── Dashboard / Progress Types ────────────────────────────────────────────────

export interface ProgressEntry {
  date: string;
  recordingId: string;
  content_accuracy: number;
  structure_score: number;
  avg_pace_wpm: number;
  filler_count: number;
}

export interface UserStats {
  totalRecordings: number;
  avgContentAccuracy: number;
  avgPaceWpm: number;
  totalFillers: number;
  currentStreak: number;
  longestStreak: number;
  lastActivity?: string;
}

// ─── UI State Types ────────────────────────────────────────────────────────────

export type RecordingStatus =
  | "idle"
  | "requesting_permission"
  | "recording"
  | "paused"
  | "stopped"
  | "uploading"
  | "analyzing"
  | "done"
  | "error";

export type TabRoute = "planning" | "vocal" | "dashboard" | "viewer";

// ─── Auth Types ────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}

// ─── API Types ─────────────────────────────────────────────────────────────────

export interface AnalyzeRequest {
  audio_base64: string;
  topic: string;
  level: string;
  duration_seconds: number;
}

export interface ApiResponse<T> {
  data: T;
  status: "ok" | "fallback" | "error";
  latency_ms?: number;
}
