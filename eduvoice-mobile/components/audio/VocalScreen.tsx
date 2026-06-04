import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  Platform,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAudioRecorder } from "../../hooks/useAudioRecorder";
import { useTopicsStore, useDemoStore, useRecordingStore, useProgressStore } from "../../store";
import { ScoreGauge, FillerBadge, AnalysisSkeleton } from "../ui/ScoreComponents";
import { Colors, Typography, Spacing, Radius, Shadow, cardStyle } from "../../lib/theme";
import { formatDuration, wpmToLabel } from "../../lib/api";

// ─── Pulsing Record Button ──────────────────────────────────────────────────────

function RecordButton({
  isRecording,
  isDisabled,
  onPress,
}: {
  isRecording: boolean;
  isDisabled: boolean;
  onPress: () => void;
}) {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 1.18, duration: 600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulse.stopAnimation();
      pulse.setValue(1);
    }
  }, [isRecording]);

  return (
    <View style={styles.recordButtonWrapper}>
      {isRecording && (
        <Animated.View
          style={[
            styles.recordPulse,
            { transform: [{ scale: pulse }] },
          ]}
        />
      )}
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[
          styles.recordButton,
          isRecording && styles.recordButtonActive,
          isDisabled && styles.recordButtonDisabled,
        ]}
      >
        <Ionicons
          name={isRecording ? "stop" : "mic"}
          size={36}
          color={isDisabled ? Colors.textMuted : "#fff"}
        />
      </TouchableOpacity>
    </View>
  );
}

// ─── Topic Picker (simplified) ─────────────────────────────────────────────────

const LEVEL_LABELS: Record<string, string> = {
  lycee: "Lycée",
  superieur: "Supérieur",
  professionnel: "Pro",
};

function TopicBanner() {
  const activeTopic = useTopicsStore((s) => s.activeTopic);
  const topics = useTopicsStore((s) => s.topics);
  const setActiveTopic = useTopicsStore((s) => s.setActiveTopic);

  useEffect(() => {
    if (!activeTopic && topics.length > 0) {
      setActiveTopic(topics[0]);
    }
  }, [topics]);

  return (
    <View style={styles.topicBanner}>
      <Ionicons name="book-outline" size={14} color={Colors.accent} />
      <Text style={styles.topicText} numberOfLines={1}>
        {activeTopic?.title ?? "Sélectionnez un sujet dans Planning"}
      </Text>
      {activeTopic && (
        <View style={styles.levelChip}>
          <Text style={styles.levelChipText}>
            {LEVEL_LABELS[activeTopic.level] ?? activeTopic.level}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Analysis Results Card ─────────────────────────────────────────────────────

function AnalysisCard() {
  const analysis = useRecordingStore((s) => s.lastAnalysis);
  const status = useRecordingStore((s) => s.status);
  const addEntry = useProgressStore((s) => s.addEntry);
  const activeTopic = useTopicsStore((s) => s.activeTopic);

  useEffect(() => {
    if (analysis && status === "done") {
      addEntry({
        date: new Date().toISOString(),
        recordingId: `rec-${Date.now()}`,
        content_accuracy: analysis.content_accuracy,
        structure_score: analysis.structure_score,
        avg_pace_wpm: analysis.avg_pace_wpm,
        filler_count: analysis.filler_count,
      });
    }
  }, [analysis, status]);

  if (status === "analyzing" || status === "uploading") {
    return (
      <View style={[cardStyle, styles.card]}>
        <Text style={styles.cardTitle}>🧠 Analyse en cours…</Text>
        <AnalysisSkeleton />
      </View>
    );
  }

  if (!analysis) return null;

  const paceInfo = wpmToLabel(analysis.avg_pace_wpm);

  return (
    <ScrollView style={styles.card} showsVerticalScrollIndicator={false}>
      {/* Scores row */}
      <Text style={styles.cardTitle}>📊 Résultats</Text>
      {analysis.from_fallback && (
        <View style={styles.fallbackBadge}>
          <Ionicons name="flash-outline" size={12} color={Colors.warning} />
          <Text style={styles.fallbackText}> Analyse locale (hors-ligne)</Text>
        </View>
      )}

      <View style={styles.gaugesRow}>
        <ScoreGauge
          value={analysis.content_accuracy}
          label="Précision contenu"
          unit="%"
        />
        <ScoreGauge
          value={analysis.structure_score}
          max={10}
          label="Structure"
          unit="/10"
        />
        <ScoreGauge
          value={analysis.avg_pace_wpm}
          max={180}
          label={paceInfo.label}
          unit="mots/min"
        />
      </View>

      {/* Tics de langage */}
      {analysis.filler_words && analysis.filler_words.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗣 Tics de langage</Text>
          <View style={styles.badgeRow}>
            {analysis.filler_words.map((fw, i) => (
              <FillerBadge key={i} word={fw.word} count={fw.count} />
            ))}
          </View>
        </View>
      )}

      {/* Concepts manquants */}
      {analysis.missing_concepts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Concepts à approfondir</Text>
          {analysis.missing_concepts.map((c, i) => (
            <View key={i} style={styles.conceptRow}>
              <View style={styles.conceptDot} />
              <Text style={styles.conceptText}>{c}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Conseils */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💡 Conseils actionnables</Text>
        {analysis.advice.map((a, i) => (
          <View key={i} style={styles.adviceCard}>
            <Text style={styles.adviceNumber}>0{i + 1}</Text>
            <Text style={styles.adviceText}>{a}</Text>
          </View>
        ))}
      </View>

      {/* Exercice */}
      <View style={[styles.exerciseCard]}>
        <Ionicons name="barbell-outline" size={18} color={Colors.primary} />
        <View style={{ flex: 1, marginLeft: Spacing.sm }}>
          <Text style={styles.exerciseTitle}>Exercice ciblé</Text>
          <Text style={styles.exerciseText}>{analysis.next_exercise}</Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function VocalScreen() {
  const {
    status,
    elapsedSeconds,
    error,
    startRecording,
    stopAndAnalyze,
    reset,
    isRecording,
    isAnalyzing,
    isDone,
  } = useAudioRecorder();

  const isDemoMode = useDemoStore((s) => s.isDemoMode);
  const setDemoMode = useDemoStore((s) => s.setDemoMode);
  const registerTap = useDemoStore((s) => s.registerTap);

  // Auto-enable demo mode on web (no mic access)
  useEffect(() => {
    if (Platform.OS === "web") setDemoMode(true);
  }, []);

  const handleMainButton = () => {
    if (isRecording) stopAndAnalyze();
    else if (isDone) reset();
    else startRecording();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={registerTap}>
          <Text style={styles.logo}>EduVoice</Text>
        </Pressable>
        {isDemoMode && (
          <View style={styles.demoBadge}>
            <Text style={styles.demoBadgeText}>DEMO</Text>
          </View>
        )}
      </View>

      <TopicBanner />

      {/* Timer */}
      <View style={styles.timerSection}>
        <Text style={styles.timer}>{formatDuration(elapsedSeconds)}</Text>
        <Text style={styles.timerLabel}>
          {isRecording
            ? "● REC"
            : isAnalyzing
            ? "Analyse…"
            : isDone
            ? "✓ Terminé"
            : "Prêt"}
        </Text>
        {!isRecording && !isAnalyzing && !isDone && (
          <Text style={styles.hint}>Maintenez au moins 10 secondes</Text>
        )}
      </View>

      {/* Record Button */}
      <View style={styles.buttonArea}>
        <RecordButton
          isRecording={isRecording}
          isDisabled={isAnalyzing}
          onPress={handleMainButton}
        />
        {isDone && (
          <TouchableOpacity onPress={reset} style={styles.retryButton}>
            <Ionicons name="refresh" size={16} color={Colors.textSub} />
            <Text style={styles.retryText}>Recommencer</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning-outline" size={14} color={Colors.warning} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Results */}
      <View style={styles.resultsArea}>
        <AnalysisCard />
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  logo: {
    fontFamily: Typography.display,
    fontSize: Typography.sizes.xl,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  demoBadge: {
    marginLeft: Spacing.sm,
    backgroundColor: Colors.warning + "33",
    borderRadius: Radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: Colors.warning,
  },
  demoBadgeText: {
    color: Colors.warning,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  topicBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.accent + "44",
    gap: Spacing.xs,
  },
  topicText: {
    flex: 1,
    color: Colors.textSub,
    fontSize: Typography.sizes.sm,
  },
  levelChip: {
    backgroundColor: Colors.accent + "22",
    borderRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  levelChipText: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: "600",
  },
  timerSection: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  timer: {
    fontFamily: Typography.mono,
    fontSize: Typography.sizes["3xl"],
    color: Colors.text,
    letterSpacing: 4,
  },
  timerLabel: {
    color: Colors.danger,
    fontSize: Typography.sizes.sm,
    fontWeight: "700",
    letterSpacing: 2,
    marginTop: 4,
  },
  hint: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    marginTop: Spacing.xs,
  },
  buttonArea: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  recordButtonWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: 100,
    height: 100,
  },
  recordPulse: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.recording + "33",
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    ...Shadow.glow,
  },
  recordButtonActive: {
    backgroundColor: Colors.recording,
  },
  recordButtonDisabled: {
    backgroundColor: Colors.bgElevated,
  },
  retryButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
    gap: 4,
  },
  retryText: {
    color: Colors.textSub,
    fontSize: Typography.sizes.sm,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.warning + "22",
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    gap: 6,
  },
  errorText: {
    color: Colors.warning,
    fontSize: Typography.sizes.sm,
    flex: 1,
  },
  resultsArea: {
    flex: 1,
    marginHorizontal: Spacing.lg,
  },
  card: {
    ...cardStyle,
    flex: 1,
  } as any,
  cardTitle: {
    fontFamily: Typography.display,
    fontSize: Typography.sizes.md,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  fallbackBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  fallbackText: {
    color: Colors.warning,
    fontSize: Typography.sizes.xs,
  },
  gaugesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    color: Colors.textSub,
    fontSize: Typography.sizes.sm,
    fontWeight: "600",
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  conceptRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  conceptDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  conceptText: {
    color: Colors.textSub,
    fontSize: Typography.sizes.sm,
  },
  adviceCard: {
    flexDirection: "row",
    backgroundColor: Colors.bgMuted,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
    borderLeftWidth: 2,
    borderLeftColor: Colors.primary,
  },
  adviceNumber: {
    fontFamily: Typography.mono,
    color: Colors.primary,
    fontSize: Typography.sizes.lg,
    fontWeight: "700",
    minWidth: 28,
  },
  adviceText: {
    color: Colors.textSub,
    fontSize: Typography.sizes.sm,
    flex: 1,
    lineHeight: 20,
  },
  exerciseCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.primary + "15",
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primary + "44",
    marginTop: Spacing.sm,
  },
  exerciseTitle: {
    color: Colors.primary,
    fontSize: Typography.sizes.sm,
    fontWeight: "700",
    marginBottom: 4,
  },
  exerciseText: {
    color: Colors.textSub,
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
  },
});
