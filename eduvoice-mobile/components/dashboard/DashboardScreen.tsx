import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useProgressStore } from "../../store";
import { ScoreGauge } from "../ui/ScoreComponents";
import { LineChart, BarChart } from "../ui/Charts";
import { Colors, Typography, Spacing, Radius, cardStyle } from "../../lib/theme";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

// ─── Stat Tile ─────────────────────────────────────────────────────────────────

function StatTile({
  icon,
  value,
  label,
  color = Colors.primary,
}: {
  icon: string;
  value: string | number;
  label: string;
  color?: string;
}) {
  return (
    <View style={styles.statTile}>
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Streak Badge ──────────────────────────────────────────────────────────────

function StreakBadge({ streak }: { streak: number }) {
  return (
    <View style={styles.streakBadge}>
      <Text style={styles.streakEmoji}>🔥</Text>
      <View>
        <Text style={styles.streakValue}>{streak} jours</Text>
        <Text style={styles.streakLabel}>Série en cours</Text>
      </View>
    </View>
  );
}

// ─── Main Dashboard ────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const entries = useProgressStore((s) => s.entries);
  const stats = useProgressStore((s) => s.stats);

  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const last7 = sorted.slice(-7);

  const labels = last7.map((e) => {
    try {
      return format(parseISO(e.date), "dd/MM", { locale: fr });
    } catch {
      return "—";
    }
  });

  const accuracyData = last7.map((e) => e.content_accuracy);
  const fillerData = last7.map((e) => e.filler_count);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Progression</Text>
          <StreakBadge streak={stats.currentStreak} />
        </View>

        {/* Top Stats */}
        <View style={styles.statsGrid}>
          <StatTile
            icon="mic-outline"
            value={stats.totalRecordings}
            label="Enregistrements"
            color={Colors.primary}
          />
          <StatTile
            icon="checkmark-circle-outline"
            value={`${stats.avgContentAccuracy}%`}
            label="Précision moy."
            color={Colors.success}
          />
          <StatTile
            icon="speedometer-outline"
            value={`${stats.avgPaceWpm}`}
            label="mots/min moy."
            color={Colors.accent}
          />
          <StatTile
            icon="chatbubbles-outline"
            value={stats.totalFillers}
            label="Tics totaux"
            color={Colors.warning}
          />
        </View>

        {/* Score Gauges */}
        <View style={[cardStyle, styles.card]}>
          <Text style={styles.cardTitle}>📈 Snapshot actuel</Text>
          <View style={styles.gaugesRow}>
            <ScoreGauge
              value={stats.avgContentAccuracy}
              label="Contenu"
              unit="%"
              size={88}
            />
            <ScoreGauge
              value={Math.min(stats.avgPaceWpm, 180)}
              max={180}
              label="Débit"
              unit="wpm"
              size={88}
            />
            <ScoreGauge
              value={Math.max(0, 100 - stats.totalFillers * 3)}
              label="Fluidité"
              unit="%"
              size={88}
            />
          </View>
        </View>

        {/* Accuracy Line Chart */}
        {last7.length >= 2 && (
          <View style={[cardStyle, styles.card]}>
            <Text style={styles.cardTitle}>🎯 Précision contenu (7 jours)</Text>
            <LineChart
              data={accuracyData}
              labels={labels}
              color={Colors.primary}
              suffix="%"
            />
          </View>
        )}

        {/* Filler Bar Chart */}
        {last7.length >= 2 && (
          <View style={[cardStyle, styles.card]}>
            <Text style={styles.cardTitle}>🗣 Tics de langage</Text>
            <BarChart
              data={fillerData}
              labels={labels}
              color={Colors.danger}
            />
            <Text style={styles.chartHint}>
              Objectif : descendre à 0 tic avant votre passage
            </Text>
          </View>
        )}

        {/* Empty state */}
        {entries.length === 0 && (
          <View style={[cardStyle, styles.emptyCard]}>
            <Ionicons name="mic-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Pas encore d'enregistrement</Text>
            <Text style={styles.emptyText}>
              Rendez-vous dans l'onglet Vocal pour démarrer votre premier entraînement.
            </Text>
          </View>
        )}

        {/* Recent sessions */}
        <Text style={styles.sectionTitle}>Sessions récentes</Text>
        {sorted.slice(-5).reverse().map((entry, i) => (
          <View key={i} style={[cardStyle, styles.sessionRow]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sessionDate}>
                {format(parseISO(entry.date), "dd MMM yyyy · HH:mm", { locale: fr })}
              </Text>
              <View style={styles.sessionMetrics}>
                <Text style={styles.sessionMetric}>📚 {entry.content_accuracy}%</Text>
                <Text style={styles.sessionMetric}>🎙 {entry.avg_pace_wpm} wpm</Text>
                <Text style={styles.sessionMetric}>💬 {entry.filler_count} tics</Text>
              </View>
            </View>
            <View
              style={[
                styles.sessionScore,
                {
                  backgroundColor:
                    entry.content_accuracy >= 75
                      ? Colors.success + "22"
                      : Colors.warning + "22",
                },
              ]}
            >
              <Text
                style={[
                  styles.sessionScoreText,
                  {
                    color:
                      entry.content_accuracy >= 75
                        ? Colors.success
                        : Colors.warning,
                  },
                ]}
              >
                {entry.content_accuracy}%
              </Text>
            </View>
          </View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.lg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Typography.display,
    fontSize: Typography.sizes["2xl"],
    color: Colors.text,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    gap: Spacing.xs,
  },
  streakEmoji: { fontSize: 22 },
  streakValue: {
    color: Colors.text,
    fontWeight: "700",
    fontSize: Typography.sizes.sm,
  },
  streakLabel: { color: Colors.textMuted, fontSize: Typography.sizes.xs },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statTile: {
    flex: 1,
    minWidth: "44%",
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: Typography.sizes.xl,
    fontFamily: Typography.mono,
    fontWeight: "700",
  },
  statLabel: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    textAlign: "center",
  },
  card: { marginBottom: Spacing.md },
  cardTitle: {
    fontFamily: Typography.display,
    fontSize: Typography.sizes.md,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  gaugesRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  chartHint: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  sectionTitle: {
    fontFamily: Typography.display,
    fontSize: Typography.sizes.md,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  sessionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  sessionDate: {
    color: Colors.textSub,
    fontSize: Typography.sizes.sm,
    marginBottom: 4,
  },
  sessionMetrics: { flexDirection: "row", gap: Spacing.sm, flexWrap: "wrap" },
  sessionMetric: { color: Colors.textMuted, fontSize: Typography.sizes.xs },
  sessionScore: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    marginLeft: Spacing.sm,
  },
  sessionScoreText: {
    fontWeight: "700",
    fontSize: Typography.sizes.md,
    fontFamily: Typography.mono,
  },
  emptyCard: {
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.xl,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: Typography.sizes.md,
    fontWeight: "600",
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.sm,
    textAlign: "center",
    lineHeight: 20,
  },
});
