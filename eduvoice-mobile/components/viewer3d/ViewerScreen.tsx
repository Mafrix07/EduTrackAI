import React, { Suspense, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Device from "expo-device";
import { Colors, Typography, Spacing, Radius, cardStyle } from "../../lib/theme";

// ─── 3D Scene (lazy to avoid crash if unsupported) ─────────────────────────────
// We conditionally import to avoid build errors on low-end devices.

let Canvas: any = null;
let ThreeScene: any = null;

try {
  // Dynamic import simulation — in real build use React.lazy or conditional require
  // Canvas = require("@react-three/fiber/native").Canvas;
  // ThreeScene = require("./NeuralScene").default;
  // For this POC template, we leave as null to always show the fallback
  // which will be replaced with real 3D imports in the actual build
} catch (_) {}

// ─── Concept Cards (2D Fallback content) ──────────────────────────────────────

const CONCEPTS = [
  {
    id: "1",
    title: "Réseau de neurones",
    emoji: "🧠",
    color: Colors.primary,
    description:
      "Un réseau de neurones artificiels imite le cerveau humain : des nœuds interconnectés (neurones) transmettent des signaux pondérés pour apprendre des patterns.",
    layers: ["Entrée", "Caché ×3", "Sortie"],
    connections: 847,
  },
  {
    id: "2",
    title: "Apprentissage par renforcement",
    emoji: "🎮",
    color: Colors.accent,
    description:
      "Un agent explore un environnement, reçoit des récompenses ou pénalités, et optimise sa politique de décision via l'équation de Bellman.",
    layers: ["Agent", "Environnement", "Récompense"],
    connections: 0,
  },
  {
    id: "3",
    title: "Transformer & Attention",
    emoji: "⚡",
    color: Colors.accentWarm,
    description:
      "Mécanisme d'auto-attention qui pondère l'importance de chaque token par rapport aux autres — la base de GPT, BERT, et LLaMA.",
    layers: ["Encodeur", "Multi-Head Attention", "Décodeur"],
    connections: 512,
  },
];

// ─── Animated Neural Net (SVG-based 2D fallback) ──────────────────────────────

function NeuralNetDiagram({ color }: { color: string }) {
  const layers = [[3, 0], [4, 1], [4, 2], [2, 3]]; // [neurons, layerIdx]

  // Simple ASCII-art style SVG representation
  return (
    <View style={styles.diagramContainer}>
      <View style={styles.diagramRow}>
        {[3, 4, 4, 2].map((neurons, li) => (
          <View key={li} style={styles.diagramLayer}>
            {Array.from({ length: neurons }).map((_, ni) => (
              <View
                key={ni}
                style={[
                  styles.neuron,
                  {
                    backgroundColor: color + "33",
                    borderColor: color,
                    opacity: 0.6 + (li / 3) * 0.4,
                  },
                ]}
              />
            ))}
          </View>
        ))}
      </View>
      <Text style={[styles.diagramLabel, { color }]}>
        Vue schématique 2D
      </Text>
    </View>
  );
}

// ─── Concept Detail Card ───────────────────────────────────────────────────────

function ConceptCard({
  concept,
  isActive,
  onPress,
}: {
  concept: typeof CONCEPTS[0];
  isActive: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        cardStyle,
        styles.conceptCard,
        isActive && { borderColor: concept.color + "88" },
      ]}
    >
      <View style={styles.conceptHeader}>
        <Text style={styles.conceptEmoji}>{concept.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.conceptTitle}>{concept.title}</Text>
          {concept.connections > 0 && (
            <Text style={[styles.conceptMeta, { color: concept.color }]}>
              ~{concept.connections} connexions
            </Text>
          )}
        </View>
        <Ionicons
          name={isActive ? "chevron-up" : "chevron-down"}
          size={16}
          color={Colors.textMuted}
        />
      </View>

      {isActive && (
        <View style={styles.conceptExpanded}>
          {/* 2D visualization */}
          <NeuralNetDiagram color={concept.color} />

          {/* Layers */}
          <View style={styles.layersRow}>
            {concept.layers.map((l, i) => (
              <View key={i} style={[styles.layerChip, { borderColor: concept.color + "66" }]}>
                <Text style={[styles.layerChipText, { color: concept.color }]}>{l}</Text>
              </View>
            ))}
          </View>

          {/* Description */}
          <Text style={styles.conceptDescription}>{concept.description}</Text>

          {/* 3D availability notice */}
          <View style={styles.threeDNotice}>
            <Ionicons name="cube-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.threeDNoticeText}>
              Vue 3D interactive disponible sur iOS/Android (OpenGL requis)
            </Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Topic Concept Explainer ───────────────────────────────────────────────────

function ConceptExplainer() {
  const [activeId, setActiveId] = useState<string>("1");

  return (
    <View>
      {CONCEPTS.map((c) => (
        <ConceptCard
          key={c.id}
          concept={c}
          isActive={activeId === c.id}
          onPress={() => setActiveId(activeId === c.id ? "" : c.id)}
        />
      ))}
    </View>
  );
}

// ─── 3D Scene Placeholder ──────────────────────────────────────────────────────

function ThreeDPlaceholder() {
  return (
    <View style={styles.threeDBox}>
      <View style={styles.threeDInner}>
        {/* Animated cube representation using pure RN */}
        <View style={styles.cubeOuter}>
          <View style={[styles.cubeFace, styles.cubeFront]} />
          <View style={[styles.cubeFace, styles.cubeTop]} />
          <View style={[styles.cubeFace, styles.cubeRight]} />
        </View>
        <Text style={styles.threeDTitle}>Viewer 3D</Text>
        <Text style={styles.threeDSubtitle}>
          @react-three/fiber · GLB models
        </Text>
        <View style={styles.threeDSteps}>
          <Text style={styles.threeDStep}>① Sélectionner un concept</Text>
          <Text style={styles.threeDStep}>② Visualiser en 3D interactif</Text>
          <Text style={styles.threeDStep}>③ Faire pivoter · Zoomer</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Main Viewer Screen ────────────────────────────────────────────────────────

export default function ViewerScreen() {
  const [is3DCapable, setIs3DCapable] = useState(false);
  const [tab, setTab] = useState<"concepts" | "3d">("concepts");

  useEffect(() => {
    // Check device 3D capability
    const check = async () => {
      const isPhysical = Device.isDevice;
      const os = Platform.OS;
      setIs3DCapable(isPhysical && (os === "ios" || os === "android"));
    };
    check();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Concepts IA</Text>
        <View style={styles.tabRow}>
          <TouchableOpacity
            onPress={() => setTab("concepts")}
            style={[styles.tab, tab === "concepts" && styles.tabActive]}
          >
            <Ionicons name="book-outline" size={14} color={tab === "concepts" ? Colors.primary : Colors.textMuted} />
            <Text style={[styles.tabText, tab === "concepts" && { color: Colors.primary }]}>
              Concepts
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTab("3d")}
            style={[styles.tab, tab === "3d" && styles.tabActive]}
          >
            <Ionicons name="cube-outline" size={14} color={tab === "3d" ? Colors.accent : Colors.textMuted} />
            <Text style={[styles.tabText, tab === "3d" && { color: Colors.accent }]}>
              Vue 3D
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {tab === "concepts" ? (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={styles.subtitle}>
            Cliquez sur un concept pour le visualiser. Chaque carte s'ouvre pour révéler
            l'architecture interne et les explications clés.
          </Text>
          <ConceptExplainer />
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        <View style={styles.threeDContainer}>
          {is3DCapable && Canvas ? (
            <Suspense fallback={<ThreeDPlaceholder />}>
              {/* Real 3D scene would go here:
              <Canvas>
                <ThreeScene />
              </Canvas> */}
              <ThreeDPlaceholder />
            </Suspense>
          ) : (
            <ThreeDPlaceholder />
          )}
          <View style={styles.fallbackNote}>
            <Ionicons name="information-circle-outline" size={14} color={Colors.textMuted} />
            <Text style={styles.fallbackNoteText}>
              {is3DCapable
                ? "Viewer 3D : activez OpenGL dans les paramètres de l'app"
                : "Viewer 3D disponible sur appareil physique iOS/Android"}
            </Text>
          </View>
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
  title: {
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
  tabActive: {
    backgroundColor: Colors.bgCard,
  },
  tabText: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.sm,
    fontWeight: "600",
  },
  scroll: { padding: Spacing.lg },
  conceptCard: {
    marginBottom: Spacing.sm,
  },
  conceptHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  conceptEmoji: { fontSize: 24 },
  conceptTitle: {
    color: Colors.text,
    fontSize: Typography.sizes.md,
    fontWeight: "600",
  },
  conceptMeta: {
    fontSize: Typography.sizes.xs,
    fontFamily: Typography.mono,
  },
  conceptExpanded: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  diagramContainer: { alignItems: "center", marginBottom: Spacing.md },
  diagramRow: { flexDirection: "row", gap: Spacing.lg, alignItems: "center" },
  diagramLayer: {
    flexDirection: "column",
    gap: Spacing.xs,
    alignItems: "center",
  },
  neuron: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
  },
  diagramLabel: {
    fontSize: Typography.sizes.xs,
    marginTop: Spacing.sm,
    fontFamily: Typography.mono,
  },
  layersRow: {
    flexDirection: "row",
    gap: Spacing.xs,
    flexWrap: "wrap",
    marginBottom: Spacing.sm,
  },
  layerChip: {
    borderWidth: 1,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  layerChipText: {
    fontSize: Typography.sizes.xs,
    fontWeight: "600",
  },
  conceptDescription: {
    color: Colors.textSub,
    fontSize: Typography.sizes.sm,
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },
  threeDNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  threeDNoticeText: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
  },
  threeDContainer: { flex: 1, alignItems: "center" },
  threeDBox: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  threeDInner: { alignItems: "center" },
  cubeOuter: {
    width: 80,
    height: 80,
    position: "relative",
    marginBottom: Spacing.lg,
  },
  cubeFace: {
    position: "absolute",
    width: 60,
    height: 60,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + "15",
  },
  cubeFront: { left: 0, top: 10 },
  cubeTop: {
    left: 10,
    top: 0,
    opacity: 0.6,
  },
  cubeRight: {
    left: 20,
    top: 20,
    opacity: 0.3,
  },
  threeDTitle: {
    fontFamily: Typography.display,
    fontSize: Typography.sizes.xl,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  threeDSubtitle: {
    fontFamily: Typography.mono,
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    marginBottom: Spacing.lg,
  },
  threeDSteps: { gap: Spacing.sm, alignItems: "flex-start" },
  threeDStep: {
    color: Colors.textSub,
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.mono,
  },
  fallbackNote: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  fallbackNoteText: {
    color: Colors.textMuted,
    fontSize: Typography.sizes.xs,
    flex: 1,
  },
});
