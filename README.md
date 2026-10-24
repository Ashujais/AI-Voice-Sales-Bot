# AI Voice Sales Bot — Sankar Group Intern Assignment

A production-ready, interactive AI Voice Sales Bot built to pitch and sell SaaS products through live natural voice conversations, real-time transcription, audio call recording with consent, automated AI summarization, and sales status classification.

🌐 **Live Public Website Link**: **[https://headed-eng-silly-institutional.trycloudflare.com](https://headed-eng-silly-institutional.trycloudflare.com)**

![AI Voice Sales Bot](https://img.shields.io/badge/Status-Completed-success?style=for-the-badge)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React%2018%20+%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white)

---

## 🎯 Assignment Objective & Core Requirements

As specified in the **Sankar Group Intern Assignment**:
> *"Create a working AI voice bot that can sell any SaaS product through an interactive voice conversation."*

| # | Requirement | Implementation in this Project | Status |
|---|---|---|:---:|
| **1** | **Voice Conversation** | Full-duplex conversational voice bot that greets, qualifies, answers customer questions, handles common objections, pitches pricing, and drives conversion. | ✅ **Complete** |
| **2** | **Language Support** | First-class multilingual support for **English**, **Hindi (हिंदी)**, and **Telugu (తెలుగు)** with native voice synthesis and recognition. | ✅ **Complete** |
| **3** | **Live Chat Screen** | Real-time synchronized chat display showing bot messages, customer speech, and a **live interim speech bubble** that transcribes words as you speak. | ✅ **Complete** |
| **4** | **Call Controls** | Start Call, End Call, Mute/Unmute microphone, live duration counter (`MM:SS`), dynamic status badges (`Ready`, `Connecting`, `Listening`, `AI Thinking`, `AI Speaking`, `Call Ended`), and real-time audio wave visualizer. | ✅ **Complete** |
| **5** | **Call Recording with Consent** | Mandatory Recording Consent modal before call starts. Browser `MediaRecorder` captures customer audio into `.webm` / `.wav`, saves to backend disk and SQLite, and provides an integrated audio player with playback, scrub, and download. | ✅ **Complete** |
| **6** | **AI Summary** | Automatically generates a structured summary with 4 key quadrants: **Executive Summary**, **Customer Requirements**, **Objections Raised & Handled**, and **Recommended Next Steps**. | ✅ **Complete** |
| **7** | **Sales Status Classification** | Automatically classifies call outcome into the exact 6 statuses: <br>• `Converted`<br>• `Interested`<br>• `Follow-up Required`<br>• `Not Interested`<br>• `Demo Requested`<br>• `No Response` | ✅ **Complete** |
| **8** | **Call History** | Dedicated Call History panel displaying past conversations, audio playback, verbatim transcript inspection, AI summaries, and filter pills by sales status. | ✅ **Complete** |

---

## 🏗️ Architecture & Technology Stack

```
f:\Sankar_AIAgent\
├── backend\
│   ├── main.py              # FastAPI server, REST API, audio streaming & static mounting
│   ├── database.py          # SQLite database schema, CRUD operations, seed data
│   ├── sales_engine.py      # Sales conversation intelligence, multilingual prompts, objection handling
│   ├── summarizer.py        # Post-call analysis, requirements/objections extraction & status classifier
│   ├── llm_client.py        # LLM integration (OpenRouter/Gemini/OpenAI) with local NLP fallback
│   ├── sales_bot.db         # Persistent SQLite database
│   └── recordings\          # Storage directory for recorded audio files (.webm / .wav)
├── client\
│   ├── src\
│   │   ├── components\
│   │   │   ├── CallControls.jsx      # Start/End call, timer, mute, status badges
│   │   │   ├── LiveChat.jsx          # Synchronized chat stream & live interim speech bubble
│   │   │   ├── VoiceVisualizer.jsx   # HTML5 Canvas real-time audio waveform visualizer
│   │   │   ├── ConsentModal.jsx      # Legal compliance recording consent modal
│   │   │   ├── PostCallSummary.jsx   # AI summary, audio playback, status badge
│   │   │   ├── CallHistory.jsx       # Historical calls, recordings, transcripts & filters
│   │   │   ├── ProductConfig.jsx     # SaaS products knowledge base & picker
│   │   │   └── Header.jsx            # Brand navigation, language selector & active pitch pill
│   │   ├── services\
│   │   │   ├── api.js                # Backend REST API client
│   │   │   ├── speechService.js      # Web Speech API recognition & speech synthesis
│   │   │   └── audioRecorder.js      # MediaRecorder & Web Audio API AnalyserNode
│   │   ├── App.jsx                   # Central state machine & voice orchestrator
│   │   └── index.css                 # Tailwind CSS & custom styling
│   ├── package.json
│   └── vite.config.js
├── start.bat                # 1-Click Windows Batch launcher
├── start.ps1                # 1-Click PowerShell launcher
├── DEMO_SCRIPT.md           # Step-by-step script for recording submission video
└── README.md                # Comprehensive documentation
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.10+** (FastAPI, Uvicorn, SQLite)
- **Node.js 18+** (for frontend build)
- Google Chrome, Microsoft Edge, Brave, or Safari (recommended for Web Speech API support)

### Option 1: 1-Click Launch (Windows)
Double-click `start.bat` or run in PowerShell:
```powershell
.\start.ps1
```
Open your browser at **`http://localhost:8000`**.

### Option 2: Manual Start

1. **Build Frontend Assets (if modifying client code):**
```bash
cd client
npm install
npm run build
cd ..
```

2. **Start Backend Server:**
```bash
python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
```

3. **Open App:**
Navigate to `http://localhost:8000`.

---

## 💡 How It Works

### 1. Pre-Configured SaaS Products
The bot is equipped with battlecards, pricing, and objection counters for 3 SaaS products:
- **FlowPulse AI CRM**: Autonomous AI pipeline acceleration, lead scoring, and CRM auto-entry.
- **CloudShield Security**: Cloud cybersecurity and automated SOC2 / ISO compliance.
- **DataSprint AI**: Conversational business intelligence and plain-English to SQL dashboards.

### 2. Conversational Voice Engine
1. Customer clicks **"Start Voice Call"**.
2. An explicit **Recording & Privacy Consent modal** appears. Once accepted, audio recording and speech recognition initialize.
3. The AI sales representative introduces itself via natural voice synthesis (TTS) and displays greeting text in real time.
4. As the customer speaks into the microphone, a **live interim speech bubble** transcribes words in real time.
5. The **Sales Engine** analyzes customer intent, addresses objections (pricing, competitors like Salesforce, lack of time), presents pricing tiers, and drives towards demo scheduling or trial conversion.
6. The interactive **HTML5 canvas visualizer** animates real-time sound waves for voice activity.

### 3. Post-Call Intelligence & Classification
When **"End Call"** is clicked:
1. Microphone stream is saved into a playable audio recording file (`.webm`).
2. The AI summarizer evaluates the verbatim transcript and generates:
   - **Executive Summary**
   - **Customer Requirements** (e.g. multi-seat team, CRM sync, time-saving automation)
   - **Objections Raised** (e.g. competitor incumbent, pricing concerns, setup friction)
   - **Recommended Next Steps** (e.g. send onboarding link, calendar invite, follow-up date)
3. Assigns one of the required 6 **Sales Statuses**:
   - `Converted`: Customer agreed to purchase, start trial, or subscribe.
   - `Demo Requested`: Customer agreed to schedule a live product demo.
   - `Interested`: Customer explored features, pricing, or team fit.
   - `Follow-up Required`: Customer requested a callback or email overview.
   - `Not Interested`: Customer explicitly declined.
   - `No Response`: No customer audio detected during the call.
4. All data is persisted into the **SQLite database** and instantly accessible in the **Call History** tab.

---

## 🎥 Video Submission Script

See [DEMO_SCRIPT.md](file:///f:/Sankar_AIAgent/DEMO_SCRIPT.md) for a complete, timing-annotated script designed to help you record the **video explanation** requested in the assignment submission!
