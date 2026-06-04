# 📱 EduVoice AI — Frontend Mobile (Expo)

Coach vocal IA pour oraux & soutenances. Application mobile React Native / Expo.

---

## 🚀 Quick Start (< 5 minutes)

```bash
# 1. Cloner le repo
git clone https://github.com/your-org/eduvoice-ai
cd eduvoice-mobile

# 2. Installer les dépendances
npm install

# 3. Variables d'environnement
cp .env.example .env.local
# Éditez .env.local avec votre URL backend

# 4. Lancer en dev
npx expo start

# → Scannez le QR avec Expo Go (iOS/Android)
# → Ou pressez 'w' pour le web (fonctionnalités micro limitées)
```

---

## 🏗️ Architecture

```
eduvoice-mobile/
├── app/                       # Expo Router (file-based navigation)
│   ├── _layout.tsx            # Root layout + QueryClient + Tab Nav
│   ├── index.tsx              # Tab 1 : Planning & sujets
│   ├── vocal.tsx              # Tab 2 : Enregistrement vocal + analyse IA
│   ├── dashboard.tsx          # Tab 3 : Dashboard progression + courbes
│   └── viewer.tsx             # Tab 4 : Viewer 3D concepts
│
├── components/
│   ├── ui/
│   │   └── ScoreComponents.tsx  # ScoreGauge, FillerBadge, Skeleton
│   ├── audio/
│   │   └── VocalScreen.tsx    # Enregistrement + résultats IA
│   ├── dashboard/
│   │   └── DashboardScreen.tsx # Graphiques, stats, sessions
│   └── viewer3d/
│       └── ViewerScreen.tsx   # Concepts IA + fallback 2D (+ 3D réel)
│
├── hooks/
│   └── useAudioRecorder.ts    # Hook : recording → STT → analyse IA
│
├── store/
│   └── index.ts               # Zustand : Topics, Recording, Progress, Demo
│
├── lib/
│   ├── api.ts                 # Client API + fallback mock + helpers
│   └── theme.ts               # Design tokens (couleurs, typo, spacing)
│
└── types/
    └── index.ts               # Types TypeScript domaine complet
```

---

## 🎮 Mode Demo (Sans backend / Sans micro)

**3 taps rapides sur "EduVoice"** dans l'écran Vocal → badge DEMO apparaît.

En mode demo :
- Aucune permission micro requise
- Simule 1.2s de latence → injecte `MOCK_ANALYSIS`
- Données graphiques pré-remplies (5 sessions réalistes)
- Idéal pour la démo compétition

---

## 🔌 Connection au Backend

```bash
# .env.local
EXPO_PUBLIC_API_URL=http://192.168.1.X:8000  # IP locale pour device physique
# ou
EXPO_PUBLIC_API_URL=https://your-backend.railway.app
```

**Endpoint attendu** : `POST /api/analyze/`
```json
// Request
{
  "audio_base64": "...",
  "topic": "Le rôle de l'IA dans l'éducation",
  "level": "lycee",
  "duration_seconds": 62
}

// Response (JSON)
{
  "content_accuracy": 78,
  "structure_score": 7,
  "avg_pace_wpm": 126,
  "filler_count": 6,
  "missing_concepts": ["biais algorithmique"],
  "advice": ["Conseil 1", "Conseil 2"],
  "next_exercise": "...",
  "confidence": 0.87
}
```

**Timeout** : 2.5s → fallback automatique vers mock réaliste.

---

## 📦 Stack Technique

| Couche | Technologie |
|--------|-------------|
| Framework | React Native 0.74 + Expo 51 |
| Navigation | Expo Router (file-based) |
| State | Zustand 4 |
| Data fetching | TanStack Query 5 |
| Audio | expo-av |
| Charts | react-native-chart-kit / victory-native |
| 3D | @react-three/fiber (avec fallback 2D) |
| UI | react-native-paper + @expo/vector-icons |
| Storage | AsyncStorage (cache progress local) |
| Types | TypeScript strict |

---

## 🎯 Fonctionnalités POC

### ✅ Implémenté
- [x] Enregistrement audio natif (expo-av)
- [x] Chronomètre temps réel + limite MAX 3min
- [x] Upload audio en base64 vers backend Django
- [x] Affichage résultats IA : précision, débit, structure, tics
- [x] Graphiques progression (7 jours) : LineChart + BarChart
- [x] Dashboard stats : streak, totaux, sessions récentes
- [x] Viewer concepts 3D/2D avec fallback device
- [x] Mode Demo (3 taps) → inject mock sans micro ni API
- [x] Fallback API timeout → mock réaliste (<120ms)
- [x] State persisté localement (AsyncStorage)
- [x] Design system cohérent (dark academia × futuriste)

### 🔜 V1 / Post-POC
- [ ] Intégration @react-three/fiber GLB models (3D réel)
- [ ] TTS conseils IA ("Écouter le conseil")
- [ ] Export rapport PDF (expo-print)
- [ ] Chat tuteur IA socratique
- [ ] Auth JWT + sync backend progression
- [ ] Push notifications rappels
- [ ] Classe / export enseignant

---

## 🧪 Tests

```bash
npm test                    # Jest + jest-expo
npm test -- --coverage      # Coverage report
```

Tests à implémenter :
- `useAudioRecorder` : mock expo-av, test états status
- `api.ts` : test fallback timeout
- `store/index.ts` : test addEntry, computeStats
- `ScoreComponents` : snapshot tests

---

## ⚠️ Limites Connues (POC)

| Limitation | Impact | Mitigation |
|-----------|--------|-----------|
| Micro web limité | Fonctionnel sur device uniquement | Demo mode sur web |
| 3D désactivé (placeholder) | Viewer 2D à la place | Import réactif `@react-three/fiber/native` |
| STT simulé en demo | Précision non réelle | Backend Whisper en prod |
| Pas d'auth JWT | 1 utilisateur local | Zustand + AsyncStorage suffisant pour POC |
| Charts web incompatibles | Victory/ChartKit = RN only | Fallback données textuelles web |

---

## 🎬 Scénario Démo (3 minutes)

1. **[0:00]** Ouvrir app → onglet Planning → 2 sujets visibles → sélectionner "IA dans l'éducation"
2. **[0:30]** Onglet Vocal → sujet affiché dans banner → presser ● REC → parler 45s
3. **[1:30]** Presser STOP → skeleton loader 1.8s → résultats : gauges, tics, conseils
4. **[2:15]** Onglet Stats → graphiques progression 5 jours → streak 🔥
5. **[2:45]** Onglet 3D → concept "Réseau de neurones" → expand → schéma interactif
6. **[3:00]** Retour Planning → CTA → "EduVoice aligne fond et forme dans un seul flux."

---

*EduVoice AI POC — Compétition EdTech*
