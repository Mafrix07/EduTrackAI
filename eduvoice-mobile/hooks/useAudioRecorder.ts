import { useState, useEffect, useRef, useCallback } from "react";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import { useRecordingStore } from "../store";
import { analyzeRecording, formatDuration } from "../lib/api";
import { useTopicsStore, useDemoStore } from "../store";
import type { VoiceAnalysis } from "../types";

const MIN_DURATION_S = 10; // 45s for prod, 10s for demo
const MAX_DURATION_S = 180;

export function useAudioRecorder() {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { status, setStatus, setElapsedSeconds, elapsedSeconds, setLastAnalysis, setCurrentRecording } =
    useRecordingStore();
  const activeTopic = useTopicsStore((s) => s.activeTopic);
  const isDemoMode = useDemoStore((s) => s.isDemoMode);

  const [error, setError] = useState<string | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
    };
  }, []);

  const requestPermission = useCallback(async () => {
    const { status: perm } = await Audio.requestPermissionsAsync();
    return perm === "granted";
  }, []);

  const startRecording = useCallback(async () => {
    setError(null);
    setStatus("requesting_permission");

    const granted = await requestPermission();
    if (!granted) {
      setError("Permission micro refusée. Autorisez l'accès dans les réglages.");
      setStatus("error");
      return;
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setStatus("recording");
      setElapsedSeconds(0);

      timerRef.current = setInterval(() => {
        setElapsedSeconds(useRecordingStore.getState().elapsedSeconds + 1);
        if (useRecordingStore.getState().elapsedSeconds >= MAX_DURATION_S) {
          stopAndAnalyze();
        }
      }, 1000);
    } catch (e) {
      setError("Impossible de démarrer l'enregistrement.");
      setStatus("error");
    }
  }, []);

  const stopAndAnalyze = useCallback(async () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const recording = recordingRef.current;
    if (!recording) return;

    const duration = useRecordingStore.getState().elapsedSeconds;

    if (duration < MIN_DURATION_S && !isDemoMode) {
      setError(
        `Parlez au moins ${MIN_DURATION_S} secondes sur le sujet. (${formatDuration(duration)} enregistré)`
      );
      setStatus("idle");
      await recording.stopAndUnloadAsync().catch(() => {});
      recordingRef.current = null;
      return;
    }

    setStatus("uploading");

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI() ?? "";
      recordingRef.current = null;

      setCurrentRecording({
        id: `rec-${Date.now()}`,
        topicId: activeTopic?.id ?? "unknown",
        audioUri: uri,
        durationSeconds: duration,
        createdAt: new Date().toISOString(),
      });

      setStatus("analyzing");

      // In production: read file as base64 and send
      // Here: use demo mode or real API
      let base64 = "";
      if (!isDemoMode) {
        try {
          base64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
        } catch {
          base64 = "DEMO_BASE64";
        }
      }

      const result = await analyzeRecording(
        {
          audio_base64: base64,
          topic: activeTopic?.title ?? "Sujet libre",
          level: activeTopic?.level ?? "lycee",
          duration_seconds: duration,
        },
        isDemoMode
      );

      if (result.status === "fallback") {
        setError("⚡ Mode hors-ligne : analyse basée sur modèle local.");
      }

      setLastAnalysis(result.data);
      setStatus("done");
    } catch (e) {
      setError("Erreur lors de l'analyse. Réessayez.");
      setStatus("error");
    }
  }, [activeTopic, isDemoMode]);

  const reset = useCallback(() => {
    useRecordingStore.getState().reset();
    setError(null);
  }, []);

  return {
    status,
    elapsedSeconds,
    error,
    startRecording,
    stopAndAnalyze,
    reset,
    isRecording: status === "recording",
    isAnalyzing: status === "analyzing" || status === "uploading",
    isDone: status === "done",
  };
}
