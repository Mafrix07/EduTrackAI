import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTopicsStore, useProgressStore, useAuthStore } from "../store";
import { Colors, Typography, Spacing, Radius, cardStyle } from "../lib/theme";
import { createTopic } from "../lib/api";
import { differenceInDays, parseISO } from "date-fns";
import type { Topic } from "../types";

// ─── Sub-components ────────────────────────────────────────────────────────────

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
      style={[cardStyle, styles.topicCard, isActive && styles.topicCardActive]}
    >
      <View style={styles.topicRow}>
        <View
          style={[
            styles.levelDot,
            {
              backgroundColor:
                topic.level === "lycee"
                  ? Colors.accent
                  : topic.level === "superieur"
                  ? Colors.primary
                  : Colors.accentWarm,
            },
          ]}
        />
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

// ─── Add Topic Modal ───────────────────────────────────────────────────────────

const LEVEL_OPTIONS: { key: Topic["level"]; label: string; color: string }[] = [
  { key: "lycee", label: "Lycée", color: Colors.accent },
  { key: "superieur", label: "Supérieur", color: Colors.primary },
  { key: "professionnel", label: "Professionnel", color: Colors.accentWarm },
];

const QUICK_DATES = [
  { label: "+1 sem.", days: 7 },
  { label: "+2 sem.", days: 14 },
  { label: "+1 mois", days: 30 },
];

function AddTopicModal({
  visible,
  onClose,
  onSave,
}: {
  visible: boolean;
  onClose: () => void;
  onSave: (t: Omit<Topic, "id" | "createdAt">) => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState<Topic["level"]>("lycee");
  const [deadline, setDeadline] = useState("");
  const [coefficient, setCoefficient] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setTitle("");
    setSubject("");
    setLevel("lycee");
    setDeadline("");
    setCoefficient("");
    setError(null);
    setSaving(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = async () => {
    if (!title.trim()) { setError("Le titre est obligatoire."); return; }
    if (!subject.trim()) { setError("La matière est obligatoire."); return; }

    let deadlineIso: string | undefined;
    if (deadline.trim()) {
      const d = new Date(deadline.trim() + "T00:00:00Z");
      if (isNaN(d.getTime())) { setError("Date invalide. Format : AAAA-MM-JJ"); return; }
      deadlineIso = d.toISOString();
    }

    const coef = coefficient.trim() ? parseFloat(coefficient) : undefined;
    if (coef !== undefined && isNaN(coef)) { setError("Coefficient invalide."); return; }

    setError(null);
    setSaving(true);
    await onSave({
      title: title.trim(),
      subject: subject.trim(),
      level,
      deadline: deadlineIso,
      coefficient: coef,
    });
    reset();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleClose}
    >
      <Pressable style={styles.modalBackdrop} onPress={handleClose}>
        <Pressable style={styles.modalSheet} onPress={() => {}}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            {/* Handle */}
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>Nouveau sujet</Text>

            {/* Titre */}
            <Text style={styles.fieldLabel}>Titre *</Text>
            <TextInput
              style={styles.fieldInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Ex. La photosynthèse"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="sentences"
            />

            {/* Matière */}
            <Text style={styles.fieldLabel}>Matière *</Text>
            <TextInput
              style={styles.fieldInput}
              value={subject}
              onChangeText={setSubject}
              placeholder="Ex. SVT, Histoire, Maths…"
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="sentences"
            />

            {/* Niveau */}
            <Text style={styles.fieldLabel}>Niveau</Text>
            <View style={styles.levelRow}>
              {LEVEL_OPTIONS.map(({ key, label, color }) => (
                <TouchableOpacity
                  key={key}
                  onPress={() => setLevel(key)}
                  style={[
                    styles.levelChip,
                    level === key && { backgroundColor: color + "22", borderColor: color },
                  ]}
                >
                  <Text
                    style={[
                      styles.levelChipText,
                      { color: level === key ? color : Colors.textMuted },
                    ]}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Date d'examen */}
            <Text style={styles.fieldLabel}>Date d'examen <Text style={styles.optional}>(optionnel)</Text></Text>
            <TextInput
              style={styles.fieldInput}
              value={deadline}
              onChangeText={setDeadline}
              placeholder="AAAA-MM-JJ"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
            />
            <View style={styles.quickDateRow}>
              {QUICK_DATES.map(({ label, days }) => (
                <TouchableOpacity
                  key={days}
                  style={styles.quickDateBtn}
                  onPress={() => {
                    const d = new Date(Date.now() + days * 86400000);
                    setDeadline(d.toISOString().slice(0, 10));
                  }}
                >
                  <Text style={styles.quickDateText}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Coefficient */}
            <Text style={styles.fieldLabel}>Coefficient <Text style={styles.optional}>(optionnel)</Text></Text>
            <TextInput
              style={[styles.fieldInput, { width: 100 }]}
              value={coefficient}
              onChangeText={setCoefficient}
              placeholder="Ex. 4"
              placeholderTextColor={Colors.textMuted}
              keyboardType="decimal-pad"
            />

            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={13} color={Colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose}>
                <Text style={styles.cancelText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, saving && { opacity: 0.6 }]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color={Colors.text} size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={16} color={Colors.text} />
                    <Text style={styles.saveText}>Enregistrer</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Planning Screen ───────────────────────────────────────────────────────────

export default function PlanningScreen() {
  const topics = useTopicsStore((s) => s.topics);
  const activeTopic = useTopicsStore((s) => s.activeTopic);
  const setActiveTopic = useTopicsStore((s) => s.setActiveTopic);
  const addTopic = useTopicsStore((s) => s.addTopic);
  const stats = useProgressStore((s) => s.stats);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [modalVisible, setModalVisible] = useState(false);
  const firstName = user?.name?.split(" ")[0] ?? "";

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Voulez-vous vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Déconnexion", style: "destructive", onPress: logout },
    ]);
  };

  const handleSaveTopic = async (data: Omit<Topic, "id" | "createdAt">) => {
    const localTopic: Topic = {
      ...data,
      id: `local-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const remote = await createTopic(data, accessToken ?? undefined);
    addTopic(remote ?? localTopic);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Welcome */}
        <View style={styles.welcome}>
          <View style={styles.welcomeRow}>
            <Text style={styles.welcomeTitle}>
              Bonjour{firstName ? ` ${firstName}` : ""} 👋
            </Text>
            <TouchableOpacity
              onPress={handleLogout}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="log-out-outline" size={22} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
          <Text style={styles.welcomeSub}>
            {stats.totalRecordings} enregistrement{stats.totalRecordings > 1 ? "s" : ""} ·{" "}
            {stats.currentStreak > 0
              ? `🔥 ${stats.currentStreak} jours de suite`
              : "Commencez votre série"}
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
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>

        {topics.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={32} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Aucun sujet. Ajoutez-en un pour commencer.</Text>
          </View>
        )}

        {topics.map((t) => (
          <TopicCard
            key={t.id}
            topic={t}
            isActive={activeTopic?.id === t.id}
            onSelect={() => setActiveTopic(activeTopic?.id === t.id ? null : t)}
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

      <AddTopicModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveTopic}
      />
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.lg },

  welcome: { marginBottom: Spacing.lg },
  welcomeRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  welcomeTitle: {
    fontFamily: Typography.display,
    fontSize: Typography.sizes["2xl"],
    color: Colors.text,
  },
  welcomeSub: { color: Colors.textMuted, fontSize: Typography.sizes.sm, marginTop: 4 },

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
  quickStatLabel: { color: Colors.textMuted, fontSize: Typography.sizes.xs, marginTop: 2 },
  divider: { width: 1, height: 40, backgroundColor: Colors.border },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  sectionTitle: { fontFamily: Typography.display, fontSize: Typography.sizes.md, color: Colors.text },

  topicCard: { marginBottom: Spacing.sm },
  topicCardActive: { borderColor: Colors.primary + "66" },
  topicRow: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  levelDot: { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  topicTitle: { color: Colors.text, fontSize: Typography.sizes.md, fontWeight: "600", marginBottom: 2 },
  topicSubject: { color: Colors.textMuted, fontSize: Typography.sizes.xs },
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
  coefRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: Spacing.xs },
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

  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
    gap: Spacing.sm,
  },
  emptyText: { color: Colors.textMuted, fontSize: Typography.sizes.sm, textAlign: "center" },

  ctaCard: {
    ...cardStyle,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    borderColor: Colors.primary + "44",
    marginTop: Spacing.md,
  },
  ctaTitle: { color: Colors.text, fontWeight: "700", fontSize: Typography.sizes.md, marginBottom: 2 },
  ctaText: { color: Colors.textMuted, fontSize: Typography.sizes.sm },

  // ── Modal ──
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: Colors.bgCard,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing["2xl"],
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontFamily: Typography.display,
    fontSize: Typography.sizes.xl,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    color: Colors.textSub,
    fontSize: Typography.sizes.sm,
    fontWeight: "600",
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  optional: { color: Colors.textMuted, fontWeight: "400" },
  fieldInput: {
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    color: Colors.text,
    fontSize: Typography.sizes.base,
  },
  levelRow: { flexDirection: "row", gap: Spacing.sm, marginTop: 2 },
  levelChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: 8,
    alignItems: "center",
  },
  levelChipText: { fontSize: Typography.sizes.sm, fontWeight: "600" },
  quickDateRow: { flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.xs },
  quickDateBtn: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickDateText: { color: Colors.textSub, fontSize: Typography.sizes.xs, fontWeight: "600" },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.danger + "22",
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
  },
  errorText: { color: Colors.danger, fontSize: Typography.sizes.xs, flex: 1 },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: Radius.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelText: { color: Colors.textMuted, fontSize: Typography.sizes.base, fontWeight: "600" },
  saveBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: Radius.md,
    alignItems: "center",
    backgroundColor: Colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  saveText: { color: Colors.text, fontSize: Typography.sizes.base, fontWeight: "700" },
});
