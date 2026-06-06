# 🐍 EduVoice Backend — Django DRF

Pipeline IA : Audio → STT (Whisper/Groq) → LLM (Llama 3) → JSON validé → API REST

---

## ⚡ Démarrage rapide (5 minutes)

### 1. Créer l'environnement Python

```bash
cd eduvoice-backend

# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

### 2. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 3. Variables d'environnement

```bash
# Windows
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

Éditez `.env` — seule variable importante pour commencer :
```
GROQ_API_KEY=gsk_votre_clé_ici
```

> **Obtenir une clé Groq gratuite** : https://console.groq.com → API Keys → Create Key
> Sans clé : le pipeline tourne en mode fallback (données mock réalistes)

### 4. Initialiser la base de données

```bash
python manage.py migrate
python manage.py shell < scripts/seed.py
```

### 5. Lancer le serveur

```bash
python manage.py runserver 0.0.0.0:8000
```

---

## ✅ Vérification

```bash
# Health check
curl http://localhost:8000/api/health/

# Docs interactives
http://localhost:8000/api/docs/

# Test pipeline complet (mode demo sans audio réel)
curl -X POST http://localhost:8000/api/analyze/ \
  -H "Content-Type: application/json" \
  -d '{"audio_base64":"DEMO_BASE64","topic":"Le rôle de l IA","level":"lycee","duration_seconds":60}'
```

---

## 🔌 Connecter au frontend Expo

Dans `eduvoice-mobile/.env.local` :
```
# Si téléphone physique — utilisez l'IP locale de votre PC
EXPO_PUBLIC_API_URL=http://192.168.X.X:8000

# Si web/émulateur sur même machine
EXPO_PUBLIC_API_URL=http://localhost:8000
```

Trouvez votre IP locale :
```bash
# Windows
ipconfig
# Cherchez "Adresse IPv4" sous Wi-Fi

# Mac/Linux
ifconfig | grep "inet "
```

---

## 🏗️ Architecture

```
eduvoice-backend/
├── config/
│   ├── settings.py      # Django settings (SQLite par défaut)
│   └── urls.py          # Routes principales
├── apps/
│   ├── topics/          # CRUD sujets
│   ├── recordings/      # Historique enregistrements
│   └── analysis/
│       ├── pipeline.py  # ⭐ STT → LLM → Pydantic → fallback
│       └── views.py     # POST /api/analyze/
└── scripts/
    └── seed.py          # Données démo réalistes
```

---

## 🤖 Pipeline IA (`apps/analysis/pipeline.py`)

```
POST /api/analyze/ { audio_base64, topic, level, duration_seconds }
        │
        ▼
   Cache Redis ? ──── OUI ──→ Retour immédiat (<50ms)
        │ NON
        ▼
   STT Groq Whisper  ──── TIMEOUT/ERREUR ──→ Transcription simulée
        │
        ▼
   LLM Llama 3.1 8B  ──── TIMEOUT/ERREUR ──→ Fallback mock réaliste
        │
        ▼
   Pydantic validation ── JSON INVALIDE ──→ Retry prompt / Fallback
        │
        ▼
   Cache + DB + Réponse JSON
```

**Latence typique :**
- Cache hit : ~50ms
- Groq (STT + LLM) : ~2-3s
- Fallback : ~50ms

---

## 📊 Endpoints

| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/api/health/` | Status + config IA |
| GET | `/api/docs/` | Swagger UI |
| GET | `/api/topics/` | Liste sujets |
| POST | `/api/topics/` | Créer sujet |
| POST | `/api/analyze/` | ⭐ Analyser enregistrement |
| GET | `/api/recordings/` | Historique sessions |

---

## 🔑 Groq (gratuit, rapide)

Groq offre un tier gratuit généreux :
- Whisper large-v3 : STT français excellent
- Llama 3.1 8B Instant : ~800 tokens/s

Sans clé API : tout fonctionne avec le fallback mock.
