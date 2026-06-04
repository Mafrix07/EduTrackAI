import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { fetchTopics } from "../lib/api";
import type {
  Topic,
  Recording,
  VoiceAnalysis,
  ProgressEntry,
  UserStats,
  RecordingStatus,
} from "../types";

// ─── Topics Store ──────────────────────────────────────────────────────────────

interface TopicsState {
  topics: Topic[];
  activeTopic: Topic | null;
  backendReachable: boolean;
  setActiveTopic: (topic: Topic | null) => void;
  addTopic: (topic: Topic) => void;
  removeTopic: (id: string) => void;
  syncFromBackend: () => Promise<void>;
}

const LOCAL_TOPICS_FALLBACK: Topic[] = [
  {
    id: "topic-1",
    title: "Le rôle de l'IA dans l'éducation",
    subject: "Sciences & Société",
    level: "lycee",
    deadline: new Date(Date.now() + 7 * 86400000).toISOString(),
    coefficient: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: "topic-2",
    title: "Soutenance Projet Web - Architecture REST",
    subject: "Informatique",
    level: "superieur",
    deadline: new Date(Date.now() + 14 * 86400000).toISOString(),
    coefficient: 10,
    createdAt: new Date().toISOString(),
  },
];

export const useTopicsStore = create<TopicsState>((set) => ({
  topics: LOCAL_TOPICS_FALLBACK,
  activeTopic: null,
  backendReachable: false,
  setActiveTopic: (topic) => set({ activeTopic: topic }),
  addTopic: (topic) => set((s) => ({ topics: [topic, ...s.topics] })),
  removeTopic: (id) =>
    set((s) => ({ topics: s.topics.filter((t) => t.id !== id) })),
  syncFromBackend: async () => {
    const remoteTopics = await fetchTopics();
    if (remoteTopics && remoteTopics.length > 0) {
      set({ topics: remoteTopics, backendReachable: true });
    } else {
      set({ backendReachable: false });
    }
  },
}));

// ─── Recording Session Store ───────────────────────────────────────────────────

interface RecordingSessionState {
  status: RecordingStatus;
  currentRecording: Recording | null;
  lastAnalysis: VoiceAnalysis | null;
  elapsedSeconds: number;
  setStatus: (status: RecordingStatus) => void;
  setCurrentRecording: (r: Recording | null) => void;
  setLastAnalysis: (a: VoiceAnalysis | null) => void;
  setElapsedSeconds: (s: number) => void;
  reset: () => void;
}

export const useRecordingStore = create<RecordingSessionState>((set) => ({
  status: "idle",
  currentRecording: null,
  lastAnalysis: null,
  elapsedSeconds: 0,
  setStatus: (status) => set({ status }),
  setCurrentRecording: (r) => set({ currentRecording: r }),
  setLastAnalysis: (a) => set({ lastAnalysis: a }),
  setElapsedSeconds: (s) => set({ elapsedSeconds: s }),
  reset: () =>
    set({
      status: "idle",
      currentRecording: null,
      lastAnalysis: null,
      elapsedSeconds: 0,
    }),
}));

// ─── Progress Store ────────────────────────────────────────────────────────────

interface ProgressState {
  entries: ProgressEntry[];
  stats: UserStats;
  addEntry: (entry: ProgressEntry) => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

const DEFAULT_STATS: UserStats = {
  totalRecordings: 0,
  avgContentAccuracy: 0,
  avgPaceWpm: 0,
  totalFillers: 0,
  currentStreak: 0,
  longestStreak: 0,
};

function computeStats(entries: ProgressEntry[]): UserStats {
  if (!entries.length) return DEFAULT_STATS;
  const total = entries.length;
  const avgContentAccuracy = Math.round(
    entries.reduce((s, e) => s + e.content_accuracy, 0) / total
  );
  const avgPaceWpm = Math.round(
    entries.reduce((s, e) => s + e.avg_pace_wpm, 0) / total
  );
  const totalFillers = entries.reduce((s, e) => s + e.filler_count, 0);

  const sortedDates = [...entries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((e) => e.date.slice(0, 10));
  const uniqueDates = [...new Set(sortedDates)];
  let currentStreak = 0;
  for (let i = 0; i < uniqueDates.length; i++) {
    const expected = new Date(Date.now() - i * 86400000)
      .toISOString()
      .slice(0, 10);
    if (uniqueDates[i] === expected) currentStreak++;
    else break;
  }

  return {
    totalRecordings: total,
    avgContentAccuracy,
    avgPaceWpm,
    totalFillers,
    currentStreak,
    longestStreak: Math.max(currentStreak, 3),
    lastActivity: entries[0]?.date,
  };
}

const SEED_ENTRIES: ProgressEntry[] = [
  {
    date: new Date(Date.now() - 5 * 86400000).toISOString(),
    recordingId: "r1",
    content_accuracy: 52,
    structure_score: 5,
    avg_pace_wpm: 145,
    filler_count: 18,
  },
  {
    date: new Date(Date.now() - 4 * 86400000).toISOString(),
    recordingId: "r2",
    content_accuracy: 61,
    structure_score: 6,
    avg_pace_wpm: 138,
    filler_count: 14,
  },
  {
    date: new Date(Date.now() - 3 * 86400000).toISOString(),
    recordingId: "r3",
    content_accuracy: 68,
    structure_score: 7,
    avg_pace_wpm: 132,
    filler_count: 9,
  },
  {
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    recordingId: "r4",
    content_accuracy: 74,
    structure_score: 7,
    avg_pace_wpm: 128,
    filler_count: 7,
  },
  {
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    recordingId: "r5",
    content_accuracy: 81,
    structure_score: 8,
    avg_pace_wpm: 124,
    filler_count: 5,
  },
];

export const useProgressStore = create<ProgressState>((set, get) => ({
  entries: SEED_ENTRIES,
  stats: computeStats(SEED_ENTRIES),
  addEntry: async (entry) => {
    const newEntries = [entry, ...get().entries];
    set({ entries: newEntries, stats: computeStats(newEntries) });
    try {
      await AsyncStorage.setItem(
        "eduvoice_progress",
        JSON.stringify(newEntries)
      );
    } catch (_) {}
  },
  loadFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem("eduvoice_progress");
      if (raw) {
        const entries = JSON.parse(raw) as ProgressEntry[];
        set({ entries, stats: computeStats(entries) });
      }
    } catch (_) {}
  },
}));

// ─── Demo Mode Store ───────────────────────────────────────────────────────────

interface DemoState {
  isDemoMode: boolean;
  tapCount: number;
  registerTap: () => void;
  setDemoMode: (v: boolean) => void;
}

export const useDemoStore = create<DemoState>((set, get) => ({
  isDemoMode: false,
  tapCount: 0,
  registerTap: () => {
    const next = get().tapCount + 1;
    if (next >= 3) set({ isDemoMode: true, tapCount: 0 });
    else set({ tapCount: next });
  },
  setDemoMode: (v) => set({ isDemoMode: v, tapCount: 0 }),
}));
