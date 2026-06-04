// EduVoice Design System
// Aesthetic: Dark academia × futurism — deep navy, electric accents, sharp geometry

export const Colors = {
  // Backgrounds
  bg: "#0A0E1A",
  bgCard: "#111827",
  bgElevated: "#1A2235",
  bgMuted: "#0F172A",

  // Brand
  primary: "#6366F1",      // indigo
  primaryLight: "#818CF8",
  accent: "#06B6D4",       // cyan
  accentWarm: "#F472B6",   // pink — for alerts / highlights

  // Semantic
  success: "#10B981",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",

  // Text
  text: "#F1F5F9",
  textMuted: "#64748B",
  textSub: "#94A3B8",

  // Borders
  border: "#1E293B",
  borderLight: "#334155",

  // Recording states
  recording: "#EF4444",
  recordingPulse: "#FCA5A5",
} as const;

export const Typography = {
  // Display — titles, scores
  display: "Georgia",       // Serif dignity = academic
  // Body — readable prose
  body: "System",
  // Mono — metrics, data
  mono: "Courier New",

  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    "2xl": 30,
    "3xl": 40,
    hero: 56,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const Shadow = {
  card: {
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  glow: {
    shadowColor: "#06B6D4",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
} as const;

// Shared card style
export const cardStyle = {
  backgroundColor: Colors.bgCard,
  borderRadius: Radius.lg,
  borderWidth: 1,
  borderColor: Colors.border,
  padding: Spacing.md,
} as const;
