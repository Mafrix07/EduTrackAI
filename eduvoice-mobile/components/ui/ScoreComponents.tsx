import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  ViewStyle,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Colors, Typography, Spacing, Radius } from "../../lib/theme";
import { scoreToColor } from "../../lib/api";

// ─── Circular Score Gauge ──────────────────────────────────────────────────────

interface ScoreGaugeProps {
  value: number;
  max?: number;
  size?: number;
  label: string;
  unit?: string;
  style?: ViewStyle;
}

export function ScoreGauge({
  value,
  max = 100,
  size = 90,
  label,
  unit = "",
  style,
}: ScoreGaugeProps) {
  const animValue = useRef(new Animated.Value(0)).current;
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const color = scoreToColor(value, max);

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: value / max,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const progress = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.gaugeContainer, style]}>
      <Svg width={size} height={size}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress (static approximation for RN) */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={circumference * (1 - value / max)}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={[styles.gaugeCenter, { width: size, height: size }]}>
        <Text style={[styles.gaugeValue, { color }]}>
          {Math.round(value)}
          <Text style={styles.gaugeUnit}>{unit}</Text>
        </Text>
      </View>
      <Text style={styles.gaugeLabel} numberOfLines={2}>
        {label}
      </Text>
    </View>
  );
}

// ─── Filler Word Badge ─────────────────────────────────────────────────────────

interface FillerBadgeProps {
  word: string;
  count: number;
}

export function FillerBadge({ word, count }: FillerBadgeProps) {
  const severity = count >= 5 ? Colors.danger : count >= 2 ? Colors.warning : Colors.textMuted;
  return (
    <View style={[styles.badge, { borderColor: severity }]}>
      <Text style={[styles.badgeWord, { color: severity }]}>«{word}»</Text>
      <View style={[styles.badgeCount, { backgroundColor: severity }]}>
        <Text style={styles.badgeCountText}>×{count}</Text>
      </View>
    </View>
  );
}

// ─── Skeleton Loader ───────────────────────────────────────────────────────────

export function SkeletonBlock({
  width = "100%",
  height = 16,
  style,
}: {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
}) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 0.7,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          backgroundColor: Colors.bgElevated,
          borderRadius: Radius.sm,
          opacity: anim,
        },
        style,
      ]}
    />
  );
}

export function AnalysisSkeleton() {
  return (
    <View style={styles.skeletonWrapper}>
      <View style={styles.skeletonRow}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.skeletonGauge}>
            <SkeletonBlock width={80} height={80} style={{ borderRadius: 40 }} />
            <SkeletonBlock width={60} height={12} style={{ marginTop: 8 }} />
          </View>
        ))}
      </View>
      <SkeletonBlock height={14} style={{ marginTop: 20 }} />
      <SkeletonBlock width="80%" height={14} style={{ marginTop: 8 }} />
      <SkeletonBlock width="60%" height={14} style={{ marginTop: 8 }} />
    </View>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  gaugeContainer: {
    alignItems: "center",
    position: "relative",
  },
  gaugeCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  gaugeValue: {
    fontSize: Typography.sizes.md,
    fontFamily: Typography.mono,
    fontWeight: "700",
  },
  gaugeUnit: {
    fontSize: Typography.sizes.xs,
    color: Colors.textMuted,
  },
  gaugeLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSub,
    marginTop: Spacing.xs,
    textAlign: "center",
    maxWidth: 80,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingVertical: 3,
    paddingLeft: Spacing.sm,
    paddingRight: 3,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  badgeWord: {
    fontSize: Typography.sizes.sm,
    fontFamily: Typography.display,
    fontStyle: "italic",
  },
  badgeCount: {
    borderRadius: Radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: Spacing.xs,
  },
  badgeCountText: {
    color: "#fff",
    fontSize: Typography.sizes.xs,
    fontWeight: "700",
  },
  skeletonWrapper: {
    padding: Spacing.md,
  },
  skeletonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  skeletonGauge: {
    alignItems: "center",
  },
});
