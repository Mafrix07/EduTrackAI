/**
 * Charts.tsx — Graphiques 100% SVG, zéro module natif
 * Compatible Expo Go, Android, iOS, Web
 */
import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, {
  Line,
  Polyline,
  Circle,
  Rect,
  Text as SvgText,
  G,
  Defs,
  LinearGradient,
  Stop,
} from "react-native-svg";
import { Colors, Typography, Spacing } from "../../lib/theme";

const { width: SW } = Dimensions.get("window");
const CHART_W = SW - Spacing.lg * 2 - Spacing.md * 2;
const CHART_H = 160;
const PAD = { top: 16, right: 12, bottom: 32, left: 36 };
const INNER_W = CHART_W - PAD.left - PAD.right;
const INNER_H = CHART_H - PAD.top - PAD.bottom;

// ─── Line Chart ────────────────────────────────────────────────────────────────

interface LineChartProps {
  data: number[];
  labels: string[];
  color?: string;
  suffix?: string;
}

export function LineChart({ data, labels, color = Colors.primary, suffix = "" }: LineChartProps) {
  if (data.length < 2) return null;

  const min = Math.max(0, Math.min(...data) - 5);
  const max = Math.max(...data) + 5;
  const range = max - min || 1;

  const points = data.map((v, i) => ({
    x: PAD.left + (i / (data.length - 1)) * INNER_W,
    y: PAD.top + INNER_H - ((v - min) / range) * INNER_H,
    v,
  }));

  const polyPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Y axis ticks
  const yTicks = [0, 0.5, 1].map((t) => ({
    y: PAD.top + INNER_H - t * INNER_H,
    label: Math.round(min + t * range) + suffix,
  }));

  return (
    <Svg width={CHART_W} height={CHART_H}>
      <Defs>
        <LinearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.25" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>

      {/* Grid lines */}
      {yTicks.map((t, i) => (
        <G key={i}>
          <Line
            x1={PAD.left} y1={t.y}
            x2={PAD.left + INNER_W} y2={t.y}
            stroke={Colors.border} strokeWidth="1"
          />
          <SvgText
            x={PAD.left - 6} y={t.y + 4}
            fontSize="9" fill={Colors.textMuted}
            textAnchor="end"
          >
            {t.label}
          </SvgText>
        </G>
      ))}

      {/* Area fill */}
      <Polyline
        points={[
          `${points[0].x},${PAD.top + INNER_H}`,
          ...points.map((p) => `${p.x},${p.y}`),
          `${points[points.length - 1].x},${PAD.top + INNER_H}`,
        ].join(" ")}
        fill="url(#lineGrad)"
        stroke="none"
      />

      {/* Line */}
      <Polyline
        points={polyPoints}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dots + values */}
      {points.map((p, i) => (
        <G key={i}>
          <Circle cx={p.x} cy={p.y} r="4" fill={color} />
          <Circle cx={p.x} cy={p.y} r="2" fill={Colors.bgCard} />
          <SvgText
            x={p.x} y={p.y - 10}
            fontSize="9" fill={color}
            textAnchor="middle" fontWeight="600"
          >
            {p.v}{suffix}
          </SvgText>
        </G>
      ))}

      {/* X labels */}
      {points.map((p, i) => (
        <SvgText
          key={i}
          x={p.x} y={CHART_H - 6}
          fontSize="9" fill={Colors.textMuted}
          textAnchor="middle"
        >
          {labels[i]}
        </SvgText>
      ))}
    </Svg>
  );
}

// ─── Bar Chart ─────────────────────────────────────────────────────────────────

interface BarChartProps {
  data: number[];
  labels: string[];
  color?: string;
}

export function BarChart({ data, labels, color = Colors.danger }: BarChartProps) {
  if (!data.length) return null;

  const max = Math.max(...data, 1);
  const barW = Math.min(28, (INNER_W / data.length) * 0.55);
  const gap = INNER_W / data.length;

  return (
    <Svg width={CHART_W} height={CHART_H}>
      {/* Grid line at max */}
      <Line
        x1={PAD.left} y1={PAD.top}
        x2={PAD.left + INNER_W} y2={PAD.top}
        stroke={Colors.border} strokeWidth="1"
      />
      <Line
        x1={PAD.left} y1={PAD.top + INNER_H}
        x2={PAD.left + INNER_W} y2={PAD.top + INNER_H}
        stroke={Colors.border} strokeWidth="1"
      />

      {data.map((v, i) => {
        const barH = (v / max) * INNER_H;
        const x = PAD.left + gap * i + gap / 2 - barW / 2;
        const y = PAD.top + INNER_H - barH;
        return (
          <G key={i}>
            <Rect
              x={x} y={y}
              width={barW} height={Math.max(barH, 2)}
              rx="4"
              fill={color}
              fillOpacity={0.85}
            />
            {/* Value on top */}
            <SvgText
              x={x + barW / 2} y={y - 4}
              fontSize="10" fill={color}
              textAnchor="middle" fontWeight="700"
            >
              {v}
            </SvgText>
            {/* X label */}
            <SvgText
              x={x + barW / 2} y={CHART_H - 6}
              fontSize="9" fill={Colors.textMuted}
              textAnchor="middle"
            >
              {labels[i]}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

// ─── Mini Spark Line (for stat tiles) ─────────────────────────────────────────

export function SparkLine({ data, color = Colors.primary }: { data: number[]; color?: string }) {
  if (data.length < 2) return null;
  const W = 60; const H = 24;
  const min = Math.min(...data);
  const max = Math.max(...data) || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * W},${H - ((v - min) / (max - min || 1)) * H}`)
    .join(" ");
  return (
    <Svg width={W} height={H}>
      <Polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}
