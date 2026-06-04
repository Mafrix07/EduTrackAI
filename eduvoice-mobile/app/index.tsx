import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTopicsStore, useProgressStore } from "../store";
import { Colors, Typography, Spacing, Radius, cardStyle } from "../lib/theme";
import { format, parseISO, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import type { Topic } from "../types";

function DeadlineBadge({ deadline }: { deadline?: string }) {
  if (!deadline) return null;
  const days = differenceInDays(parseISO(deadline), new Date());
  const color = days <= 3 ? Colors.danger : days <= 7 ? Colors.warning : Colors.success;
  return (
    <View style={[styles.deadlineBadge, { borderColor: color }]}>
      <Ionicons name="time-outline" size={10} color={color} />
      <Text style={[styles.deadlineText, { color }]}>
        {days === 0 ? "Aujourd'hui" : days < 0 ? "Passé" : `J-${days}`}
      </Text>
    </View>
  );
}

function TopicCard({
  topic,
  isActive,
  onSelect,
}: {
  topic: Topic;
  isActive: boolean;
  onSelect: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onSelect}
      activeOpacity={0.8}
      style={[
        cardStyle,
        styles.topicCard,
        isActive && styles.topicCardActive,
      ]}
    >
      <View style={styles.topicRow}>
        <View style={[styles.levelDot, { backgroundColor: topic.level === "lycee" ? Colors.accent : Colors.primary }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.topicTitle}>{topic.title}</Text>
          <Text style={styles.topicSubject}>{topic.subject}</Text>
        </View>
        <DeadlineBadge deadline={topic.deadline} />
      </View>
      {topic.coefficient && (
        <View style={styles.coefRow}>
          <Ionicons name="star-outline" size={12} color={Colors.textMuted} />
          <Text style={styles.coefText}>Coefficient {topic.coefficient}</Text>
        </View>
      )}
      {isActive && (
        <View style={styles.activeIndicator}>
          <Ionicons name="checkmark-circle" size={14} color={Colors.primary} />
          <Text style={styles.activeText}>Sujet actif pour l'entraînement vocal</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function PlanningScreen() {
  const topics = useTopicsStore((s) => s.topics);
  const activeTopic = useTopicsStore((s) => s.activeTopic);
  const setActiveTopic = useTopicsStore((s) => s.setActiveTopic);
  const stats = useProgressStore((s) => s.stats);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Welcome */}
        <View style={styles.welcome}>
          <Text style={styles.welcomeTitle}>Bonjour 👋</Text>
          <Text style={styles.welcomeSub}>
            {stats.totalRecordings} enregistrement{stats.totalRecordings > 1 ? "s" : ""} · {stats.currentStreak > 0 ? `🔥 ${stats.currentStreak} jours de suite` : "Commencez votre série"}
          </Text>
        </View>

        {/* Quick Stats */}
        <View style={styles.quickStats}>
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{stats.avgContentAccuracy}%</Text>
            <Text style={styles.quickStatLabel}>précision moy.</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{stats.avgPaceWpm}</Text>
            <Text style={styles.quickStatLabel}>mots/min moy.</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.quickStat}>
            <Text style={styles.quickStatValue}>{stats.totalFillers}</Text>
            <Text style={styles.quickStatLabel}>tics totaux</Text>
          </View>
        </View>

        {/* Topics */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sujets actifs</Text>
          <TouchableOpacity
            onPress={() =>
              Alert.alert("Ajouter un sujet", "Fonctionnalité disponible en V1")
            }
          >
            <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {topics.map((t) => (
          <TopicCard
            key={t.id}
            topic={t}
            isActive={activeTopic?.id === t.id}
            onSelect={() =>
              setActiveTopic(activeTopic?.id === t.id ? null : t)
            }
          />
        ))}

        {/* CTA */}
        <View style={styles.ctaCard}>
          <Ionicons name="mic" size={28} color={Colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>Prêt à vous entraîner ?</Text>
            <Text style={styles.ctaText}>
              Sélectionnez un sujet et rendez-vous dans l'onglet Vocal.
            </Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.lg },
  welcome: { marginBottom: Spacing.lg },
  welcomeTitle: {
    fontFamily: Typography.display,
    fontSize: Typography.sizes["2xl"],
    color: Colors.text,
  },
  welcomeSub: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.sm,
    marginTop: 4,
  },
  quickStats: {
    ...cardStyle,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    marginBottom: Spacing.lg,
  },
  quickStat: { alignItems: "center" },
  quickStatValue: {
    fontFamily: Typography.mono,
    fontSize: Typography.sizes.xl,
    color: Colors.text,
    fontWeight: "700",
  },
  quickStatLabel: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Typography.display,
    fontSize: Typography.sizes.md,
    color: Colors.text,
  },
  topicCard: { marginBottom: Spacing.sm },
  topicCardActive: { borderColor: Colors.primary + "66" },
  topicRow: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  levelDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  topicTitle: {
    color: Colors.text,
    fontSize: Typography.sizes.md,
    fontWeight: "600",
    marginBottom: 2,
  },
  topicSubject: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
  },
  deadlineBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: 6,
    paddingVertical: 2,
    gap: 3,
  },
  deadlineText: { fontSize: Typography.sizes.xs, fontWeight: "600" },
  coefRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: Spacing.xs,
  },
  coefText: { color: Colors.textMuted, fontSize: Typography.sizes.xs },
  activeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  activeText: { color: Colors.primary, fontSize: Typography.sizes.xs },
  ctaCard: {
    ...cardStyle,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    borderColor: Colors.primary + "44",
    marginTop: Spacing.md,
  },
  ctaTitle: {
    color: Colors.text,
    fontWeight: "700",
    fontSize: Typography.sizes.md,
    marginBottom: 2,
  },
  ctaText: { color: Colors.textMuted, fontSize: Typography.sizes.sm },
});
