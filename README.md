<<<<<<< HEAD
<<<<<<< HEAD
# 🛡️ AI LifeAssist

**Your AI-Powered Emergency & Personal Safety Assistant**

A multimodal Generative AI application that helps people in emergencies and daily health situations using Vision AI, Voice, and Large Language Models.

![AI LifeAssist](https://img.shields.io/badge/AI-LifeAssist-ff4757?style=for-the-badge&logo=shield&logoColor=white)
![Gemini](https://img.shields.io/badge/Powered%20by-Gemini%20AI-4285F4?style=for-the-badge&logo=google&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)

## ✨ Features

| Feature | Description | AI Capability |
|---------|-------------|---------------|
| 🚑 **Emergency Analyzer** | Upload injury/accident photos for first-aid guidance | Vision AI + LLM |
| 💊 **Medicine Explainer** | Photograph medicines for simple explanations | Vision AI + LLM |
| 📄 **Report Summarizer** | Upload medical reports for plain-language summaries | Vision AI + LLM |
| 🏥 **Hospital Finder** | Find nearby hospitals with maps and directions | Google Maps API |
| 🆘 **SOS Generator** | Generate emergency messages with GPS location | LLM + Geolocation |
| 🎙️ **Voice Assistant** | Hands-free voice interaction | Web Speech API |
| 🌐 **Multilingual** | Supports 7 Indian languages | Multilingual LLM |

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **Google Gemini API Key** → [Get one free](https://aistudio.google.com)
- **Google Maps API Key** → [Console](https://console.cloud.google.com)

### 1. Clone & Configure

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env and add your API keys

# Frontend
cd ../frontend
cp .env.example .env
# Edit .env and add your Google Maps API key
```

### 2. Start Backend

```bash
cd backend
pip install -r requirements.txt
python run.py
# Server starts at http://localhost:8000
# API docs at http://localhost:8000/docs
```

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
# App starts at http://localhost:5173
```

## 🎯 Demo Flow (3 minutes)

1. **30s** — Dashboard walkthrough, explain the problem
2. **45s** — Upload injury photo → AI analyzes → voice reads first-aid steps
3. **30s** — Medicine photo → AI explains in Hindi
4. **30s** — Find nearby hospitals on map
5. **30s** — Hit SOS → generates emergency message with location
6. **15s** — Show multilingual switching

## 🏗️ Tech Stack

- **Frontend**: React 18 + Vite + Vanilla CSS (Glassmorphic Dark Theme)
- **Backend**: Python FastAPI
- **AI Engine**: Google Gemini API (Multimodal)
- **Maps**: Google Maps JavaScript + Places API
- **Voice**: Web Speech API (Browser-native)
- **Icons**: Lucide React

## 📁 Project Structure

```
ai-lifeassist/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app
│   │   ├── config.py            # Environment config
│   │   ├── routers/             # API endpoints
│   │   │   ├── emergency.py
│   │   │   ├── medicine.py
│   │   │   ├── reports.py
│   │   │   ├── hospitals.py
│   │   │   └── sos.py
│   │   ├── services/            # Business logic
│   │   │   ├── gemini_service.py
│   │   │   └── maps_service.py
│   │   └── prompts/
│   │       └── system_prompts.py
│   ├── requirements.txt
│   └── run.py
│
├── frontend/
│   ├── src/
│   │   ├── pages/               # Route pages
│   │   ├── components/          # Reusable UI
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API client
│   │   ├── i18n/                # Translations
│   │   └── styles/              # Design system
│   └── package.json
│
└── README.md
```

## 🌐 Supported Languages

English 🇬🇧 | हिन्दी 🇮🇳 | தமிழ் 🇮🇳 | తెలుగు 🇮🇳 | বাংলা 🇮🇳 | ಕನ್ನಡ 🇮🇳 | മലയാളം 🇮🇳

## 📞 Emergency Numbers (India)

| Service | Number |
|---------|--------|
| Unified Emergency | 112 |
| Police | 100 |
| Ambulance | 108 |
| Fire | 101 |

---

Built with ❤️ for the AI Gen Hackathon
=======
# AI-Powered-Emergency-Personal-Safety-Assistant
>>>>>>> 1e059fc994c3712f73fac346ae6d7f0170605f14
=======
# AI-Powered-Emergency-Personal-Safety-Assistant
>>>>>>> 1e059fc994c3712f73fac346ae6d7f0170605f14
