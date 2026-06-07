import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Typography, Spacing, Radius, cardStyle } from "../../lib/theme";

// ─── Data ──────────────────────────────────────────────────────────────────────

interface ConceptFiche {
  keyEquation?: string;
  keyFacts: { label: string; value: string }[];
  examTip: string;
  typicalQuestion: string;
}

interface ConceptItem {
  id: string;
  title: string;
  subject: string;
  emoji: string;
  color: string;
  description: string;
  layers: string[];
  fiche: ConceptFiche;
}

const CONCEPTS: ConceptItem[] = [
  {
    id: "1",
    title: "La photosynthèse",
    subject: "SVT • Terminale",
    emoji: "🌿",
    color: Colors.success,
    description:
      "Processus par lequel les végétaux chlorophylliens synthétisent du glucose à partir de CO₂, d'eau et d'énergie lumineuse. Se déroule dans les chloroplastes en deux phases : claire et sombre.",
    layers: ["Lumière solaire", "Chloroplaste", "CO₂ + H₂O", "Glucose + O₂"],
    fiche: {
      keyEquation: "6CO₂ + 6H₂O + lumière → C₆H₁₂O₆ + 6O₂",
      keyFacts: [
        { label: "Lieu", value: "Chloroplastes" },
        { label: "Pigment", value: "Chlorophylle a et b" },
        { label: "Phase claire", value: "Thylakoïdes → ATP + NADPH₂" },
        { label: "Phase sombre", value: "Stroma → Cycle de Calvin" },
        { label: "Produit final", value: "Glucose (C₆H₁₂O₆)" },
      ],
      examTip:
        "Distinguer systématiquement phase claire (thylakoïdes, besoin de lumière) et phase sombre (stroma, peut se dérouler sans lumière directe).",
      typicalQuestion:
        "Décrivez les deux phases de la photosynthèse en précisant leur lieu et leurs réactifs/produits.",
    },
  },
  {
    id: "2",
    title: "La Révolution française",
    subject: "Histoire • 1ère",
    emoji: "🏛️",
    color: Colors.primary,
    description:
      "Période de bouleversements politiques radicaux en France (1789-1799) qui abolit la monarchie absolue et proclama les droits de l'homme. Influence déterminante sur les démocraties modernes.",
    layers: ["Crise financière", "États généraux", "Prise de la Bastille", "DDHC", "Ière République"],
    fiche: {
      keyFacts: [
        { label: "États généraux", value: "5 mai 1789" },
        { label: "Prise de la Bastille", value: "14 juillet 1789" },
        { label: "DDHC adoptée", value: "26 août 1789" },
        { label: "Ière République", value: "22 septembre 1792" },
        { label: "Fin (Bonaparte)", value: "9 novembre 1799" },
      ],
      examTip:
        "Mémoriser les 5 dates clés et associer chaque phase à ses acteurs : Louis XVI, Robespierre (Terreur), puis Bonaparte.",
      typicalQuestion:
        "Analysez les causes et les principales étapes de la Révolution française de 1789.",
    },
  },
  {
    id: "3",
    title: "Les fonctions affines",
    subject: "Mathématiques • 2nde",
    emoji: "📐",
    color: Colors.accent,
    description:
      "Fonctions de la forme f(x) = ax + b, représentées par des droites dans le plan. Le coefficient a est la pente et b l'ordonnée à l'origine. Fondamentales pour l'algèbre et l'analyse.",
    layers: ["f(x) = ax + b", "Pente a", "Ordonnée b", "Droite (D)"],
    fiche: {
      keyEquation: "f(x) = ax + b  (a ≠ 0)",
      keyFacts: [
        { label: "a > 0", value: "Droite croissante" },
        { label: "a < 0", value: "Droite décroissante" },
        { label: "Point (0 ; b)", value: "Intersection axe des ordonnées" },
        { label: "Zéro de f", value: "x = −b / a" },
        { label: "a = 0", value: "Fonction constante (droite horizontale)" },
      ],
      examTip:
        "Toujours vérifier le signe de a pour le sens de variation. Calculer f(0) = b pour tracer le premier point. Trouver x tel que f(x) = 0 pour l'intersection avec l'axe des abscisses.",
      typicalQuestion:
        "Déterminez l'équation de la droite passant par A(1 ; 3) et B(4 ; 9), puis tracez-la.",
    },
  },
  {
    id: "4",
    title: "La respiration cellulaire",
    subject: "SVT • 1ère",
    emoji: "🔬",
    color: Colors.accentWarm,
    description:
      "Processus catabolique dans les mitochondries : dégradation du glucose en présence d'O₂ pour produire de l'ATP. Réaction globalement inverse de la photosynthèse.",
    layers: ["Glucose + O₂", "Glycolyse", "Cycle de Krebs", "Chaîne respiratoire", "38 ATP"],
    fiche: {
      keyEquation: "C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + 38 ATP",
      keyFacts: [
        { label: "Glycolyse", value: "Cytoplasme → 2 pyruvates + 2 ATP" },
        { label: "Cycle de Krebs", value: "Matrice mito. → NADH + CO₂" },
        { label: "Chaîne resp.", value: "Crêtes mito. → 34 ATP" },
        { label: "Rendement total", value: "38 ATP / molécule de glucose" },
        { label: "Déchet", value: "CO₂ + H₂O" },
      ],
      examTip:
        "Différencier les 3 étapes et leurs localisations. La glycolyse est anaérobie ; les 2 autres étapes requièrent O₂ (aérobies).",
      typicalQuestion:
        "Expliquez les trois étapes de la respiration cellulaire et donnez le bilan énergétique global.",
    },
  },
  {
    id: "5",
    title: "Les indépendances africaines",
    subject: "Histoire • Terminale",
    emoji: "🌍",
    color: Colors.warning,
    description:
      "Vague de décolonisation des années 1950-1960 qui permit à la majorité des pays africains d'accéder à la souveraineté. 1960 est surnommée « Année de l'Afrique ». Le Togo obtint son indépendance le 27 avril 1960.",
    layers: ["Colonisation", "Mouvements nationalistes", "Loi Defferre 1956", "1960 : Indépendances", "OUA 1963"],
    fiche: {
      keyFacts: [
        { label: "Indép. du Togo", value: "27 avril 1960" },
        { label: "« Année de l'Afrique »", value: "17 pays indépendants en 1960" },
        { label: "Conférence de Bandung", value: "1955 — tiers-monde non-aligné" },
        { label: "Loi-cadre Defferre", value: "1956 — autonomie interne" },
        { label: "OUA fondée", value: "25 mai 1963, Addis-Abeba" },
      ],
      examTip:
        "Connaître impérativement la date d'indépendance du Togo (27 avril 1960). Citer 3 leaders : Kwame Nkrumah (Ghana), Sylvanus Olympio (Togo), Félix Houphouët-Boigny (Côte d'Ivoire).",
      typicalQuestion:
        "Analysez les causes et les modalités de l'accès à l'indépendance des pays d'Afrique subsaharienne dans les années 1960.",
    },
  },
  {
    id: "6",
    title: "L'argumentation",
    subject: "Français • Terminale",
    emoji: "✍️",
    color: "#8B5CF6",
    description:
      "Art de convaincre par le raisonnement (logos) et de persuader par les émotions (pathos). Structure toute dissertation : thèse — antithèse — synthèse. Base de l'oral et de l'écrit du BAC.",
    layers: ["Thèse", "Argument", "Exemple", "Contre-argument", "Concession → Synthèse"],
    fiche: {
      keyFacts: [
        { label: "Logos", value: "Raisonnement logique, preuves, faits" },
        { label: "Ethos", value: "Crédibilité, autorité de l'orateur" },
        { label: "Pathos", value: "Appel aux émotions du lecteur" },
        { label: "Plan dissert.", value: "Thèse → Antithèse → Synthèse" },
        { label: "Connecteurs clés", value: "Certes / Or / Mais / Donc / Ainsi" },
      ],
      examTip:
        "Chaque argument doit être suivi d'un exemple concret tiré des œuvres étudiées. La concession montre la nuance : elle renforce la thèse finale, ne l'affaiblit pas.",
      typicalQuestion:
        "Dans quelle mesure la littérature peut-elle changer le monde ? Répondez en vous appuyant sur des œuvres étudiées.",
    },
  },
];

// ─── Steps Flow (replaces neural-net diagram) ─────────────────────────────────

function StepsFlow({ steps, color }: { steps: string[]; color: string }) {
  return (
    <View style={styles.stepsFlow}>
      {steps.map((step, i) => (
        <React.Fragment key={i}>
          <View style={[styles.stepPill, { borderColor: color + "66", backgroundColor: color + "11" }]}>
            <Text style={[styles.stepText, { color }]}>{step}</Text>
          </View>
          {i < steps.length - 1 && (
            <Ionicons name="arrow-forward-outline" size={11} color={color + "99"} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

// ─── Concept Card (Concepts tab) ──────────────────────────────────────────────

function ConceptCard({
  concept,
  isActive,
  onPress,
}: {
  concept: ConceptItem;
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[cardStyle, styles.conceptCard, isActive && { borderColor: concept.color + "88" }]}
    >
      <View style={styles.conceptHeader}>
        <Text style={styles.conceptEmoji}>{concept.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.conceptTitle}>{concept.title}</Text>
          <Text style={[styles.conceptSubject, { color: concept.color }]}>{concept.subject}</Text>
        </View>
        <Ionicons
          name={isActive ? "chevron-up" : "chevron-down"}
          size={16}
          color={Colors.textMuted}
        />
      </View>

      {isActive && (
        <View style={styles.conceptExpanded}>
          <StepsFlow steps={concept.layers} color={concept.color} />
          <Text style={styles.conceptDescription}>{concept.description}</Text>
          <View style={[styles.examTipBox, { borderLeftColor: concept.color }]}>
            <Text style={styles.examTipLabel}>Conseil examen</Text>
            <Text style={styles.examTipText}>{concept.fiche.examTip}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Fiche Express (Fiche express tab) ────────────────────────────────────────

function FicheExpress({ concept }: { concept: ConceptItem }) {
  const { fiche } = concept;
  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.ficheScroll}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.ficheHeader, { borderColor: concept.color + "55" }]}>
        <Text style={styles.ficheEmoji}>{concept.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.ficheTitle}>{concept.title}</Text>
          <Text style={[styles.ficheSubject, { color: concept.color }]}>{concept.subject}</Text>
        </View>
      </View>

      {/* Équation / formule clé */}
      {fiche.keyEquation && (
        <View style={[styles.equationBox, { borderColor: concept.color + "44" }]}>
          <Text style={styles.equationLabel}>Formule clé</Text>
          <Text style={[styles.equationText, { color: concept.color }]}>{fiche.keyEquation}</Text>
        </View>
      )}

      {/* Tableau des faits */}
      <Text style={styles.ficheSection}>Faits essentiels</Text>
      <View style={[cardStyle, { padding: 0, overflow: "hidden" }]}>
        {fiche.keyFacts.map(({ label, value }, i) => (
          <View
            key={i}
            style={[
              styles.factRow,
              i < fiche.keyFacts.length - 1 && styles.factRowBorder,
            ]}
          >
            <Text style={styles.factLabel}>{label}</Text>
            <Text style={styles.factValue}>{value}</Text>
          </View>
        ))}
      </View>

      {/* Conseil examen */}
      <View style={[styles.tipCard, { borderLeftColor: concept.color }]}>
        <View style={styles.tipHeader}>
          <Ionicons name="bulb-outline" size={14} color={concept.color} />
          <Text style={[styles.tipTitle, { color: concept.color }]}>Conseil pour l'examen</Text>
        </View>
        <Text style={styles.tipBody}>{fiche.examTip}</Text>
      </View>

      {/* Question type */}
      <View style={styles.questionCard}>
        <View style={styles.tipHeader}>
          <Ionicons name="help-circle-outline" size={14} color={Colors.textMuted} />
          <Text style={styles.questionLabel}>Question type</Text>
        </View>
        <Text style={styles.questionText}>« {fiche.typicalQuestion} »</Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── Main Screen ───────────────────────────────────────────────────────────────

export default function ViewerScreen() {
  const [activeConceptId, setActiveConceptId] = useState("1");
  const [tab, setTab] = useState<"concepts" | "fiche">("concepts");

  const selectedConcept = CONCEPTS.find((c) => c.id === activeConceptId) ?? CONCEPTS[0];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Concepts & Fiches</Text>
        <View style={styles.tabRow}>
          <TouchableOpacity
            onPress={() => setTab("concepts")}
            style={[styles.tab, tab === "concepts" && styles.tabActive]}
          >
            <Ionicons
              name="book-outline"
              size={14}
              color={tab === "concepts" ? Colors.primary : Colors.textMuted}
            />
            <Text style={[styles.tabText, tab === "concepts" && { color: Colors.primary }]}>
              Concepts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTab("fiche")}
            style={[styles.tab, tab === "fiche" && styles.tabActive]}
          >
            <Ionicons
              name="document-text-outline"
              size={14}
              color={tab === "fiche" ? Colors.accent : Colors.textMuted}
            />
            <Text style={[styles.tabText, tab === "fiche" && { color: Colors.accent }]}>
              Fiche express
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {tab === "concepts" ? (
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subtitle}>
            Tapez sur un concept pour le développer. Les fiches express sont disponibles dans l'onglet dédié.
          </Text>
          {CONCEPTS.map((c) => (
            <ConceptCard
              key={c.id}
              concept={c}
              isActive={activeConceptId === c.id}
              onPress={() => setActiveConceptId(activeConceptId === c.id ? "" : c.id)}
            />
          ))}
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        <View style={styles.ficheContainer}>
          {/* Concept selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.selectorRow}
          >
            {CONCEPTS.map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => setActiveConceptId(c.id)}
                style={[
                  styles.selectorChip,
                  activeConceptId === c.id && {
                    backgroundColor: c.color + "22",
                    borderColor: c.color,
                  },
                ]}
              >
                <Text style={styles.selectorEmoji}>{c.emoji}</Text>
                <Text
                  style={[
                    styles.selectorText,
                    { color: activeConceptId === c.id ? c.color : Colors.textMuted },
                  ]}
                  numberOfLines={1}
                >
                  {c.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <FicheExpress concept={selectedConcept} />
        </View>
      )}
    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },

  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  screenTitle: {
    fontFamily: Typography.display,
    fontSize: Typography.sizes["2xl"],
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  subtitle: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    padding: 3,
    gap: 3,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    gap: 4,
  },
  tabActive: { backgroundColor: Colors.bgCard },
  tabText: { color: Colors.textMuted, fontSize: Typography.sizes.sm, fontWeight: "600" },

  scroll: { padding: Spacing.lg },

  // Concept card
  conceptCard: { marginBottom: Spacing.sm },
  conceptHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  conceptEmoji: { fontSize: 24 },
  conceptTitle: { color: Colors.text, fontSize: Typography.sizes.md, fontWeight: "600" },
  conceptSubject: { fontSize: Typography.sizes.xs, fontWeight: "600", marginTop: 1 },
  conceptExpanded: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  conceptDescription: {
    color: Colors.textSub,
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
  },
  examTipBox: {
    borderLeftWidth: 3,
    paddingLeft: Spacing.sm,
    paddingVertical: 4,
  },
  examTipLabel: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  examTipText: { color: Colors.textSub, fontSize: Typography.sizes.sm, lineHeight: 18 },

  // Steps flow
  stepsFlow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 5,
  },
  stepPill: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  stepText: { fontSize: Typography.sizes.xs, fontWeight: "600" },

  // Fiche express container
  ficheContainer: { flex: 1 },
  selectorRow: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  selectorChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Colors.bgCard,
  },
  selectorEmoji: { fontSize: 14 },
  selectorText: { fontSize: Typography.sizes.xs, fontWeight: "600", maxWidth: 110 },

  // Fiche card
  ficheScroll: { paddingHorizontal: Spacing.lg },
  ficheHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    backgroundColor: Colors.bgCard,
    marginBottom: Spacing.md,
  },
  ficheEmoji: { fontSize: 36 },
  ficheTitle: {
    fontFamily: Typography.display,
    fontSize: Typography.sizes.lg,
    color: Colors.text,
  },
  ficheSubject: { fontSize: Typography.sizes.sm, fontWeight: "600", marginTop: 2 },

  equationBox: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    backgroundColor: Colors.bgCard,
    marginBottom: Spacing.md,
    alignItems: "center",
  },
  equationLabel: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  equationText: {
    fontFamily: Typography.mono,
    fontSize: Typography.sizes.base,
    fontWeight: "700",
    textAlign: "center",
  },

  ficheSection: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },
  factRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    gap: Spacing.sm,
  },
  factRowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  factLabel: {
    width: 110,
    color: Colors.textMuted,
    fontSize: Typography.sizes.sm,
    fontWeight: "600",
    flexShrink: 0,
  },
  factValue: { flex: 1, color: Colors.text, fontSize: Typography.sizes.sm },

  tipCard: {
    borderLeftWidth: 3,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tipHeader: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 6 },
  tipTitle: { fontSize: Typography.sizes.xs, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  tipBody: { color: Colors.textSub, fontSize: Typography.sizes.sm, lineHeight: 20 },

  questionCard: {
    ...cardStyle,
    marginTop: Spacing.md,
  },
  questionLabel: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  questionText: {
    color: Colors.text,
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
    fontStyle: "italic",
    marginTop: 6,
  },
});
