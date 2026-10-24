# Video Explanation & Demo Walkthrough Script

Use this timing-annotated script to record your **video explanation submission** (typically 2 to 3 minutes).

---

## ⏱️ Video Breakdown (Total: ~2.5 Minutes)

| Timestamp | Section | Key Talking Points |
|---|---|---|
| **0:00 - 0:25** | **Introduction & Objective** | State your name, introduction to the Sankar Group intern assignment, and overview of the AI Voice Sales Bot. |
| **0:25 - 0:50** | **Call Initiation & Recording Consent** | Highlight SaaS product selection (FlowPulse AI CRM), language choice, and the mandatory **Recording Consent Modal** (Requirement 5). |
| **0:50 - 1:35** | **Live Voice Interaction & Real-time Chat** | Start call, showcase the bot speaking, voice waveform visualizer, and demonstrate **real-time live speech transcription** as you speak. Ask about pricing and objections. |
| **1:35 - 2:05** | **Post-Call Summary & Status Classification** | End call, demonstrate the **Audio Player** playing back the recorded voice, show the assigned **Sales Status** (`Demo Requested` or `Converted`), and review the 4 summary quadrants. |
| **2:05 - 2:30** | **Call History & Conclusion** | Switch to the **Call History** tab, filter by status, replay past recordings, inspect full transcripts, and conclude. |

---

## 🎙️ Spoken Script

### [0:00 - 0:25] Introduction
> *"Hello everyone! In this video, I am presenting my submission for the Sankar Group Intern Assignment: Building an AI Voice Sales Bot.*
>
> *The objective of this assignment is to create a fully interactive AI sales bot that can sell a SaaS product through natural voice conversations, transcribe speech in real time, record the audio with consent, and automatically generate an AI summary with a sales status classification."*

### [0:25 - 0:50] Architecture & Consent
> *"Here on the screen is the application. At the top, we have a SaaS Product Selector with pre-configured products like FlowPulse AI CRM, CloudShield Security, and DataSprint AI, complete with pricing and objection battlecards.*
>
> *We also have a language selector supporting English, Hindi, and Telugu.*
>
> *When I click 'Start Voice Call', the system displays an explicit Recording and Privacy Consent notice in compliance with Requirement 5. Once I accept, the call initializes."*

### [0:50 - 1:35] Live Voice Interaction
*(Click 'Accept Consent & Start Call')*
> **Bot:** *"Hi there! This is Alex from FlowPulse AI CRM. How are you currently managing your inbound leads and follow-ups?"*
>
> *(Point out the bot's speech synthesis and the audio wave visualizer)*
>
> *(Speak into microphone):* *"Hi Alex, we have a team of 10 sales reps and our follow-ups take too long. Can you tell me your pricing and how it compares to Salesforce?"*
>
> *(Show the real-time interim speech bubble updating live on the screen)*
>
> **Bot:** *(Responds addressing pricing, Salesforce comparison, and value proposition)*
>
> *(Speak into microphone):* *"That sounds really helpful. Can we book a 15-minute live demo for tomorrow at 2 PM?"*
>
> **Bot:** *(Confirms the demo reservation)*

### [1:35 - 2:05] Post-Call Intelligence & Audio Playback
*(Click 'End Call')*
> *"Now I click 'End Call'. Notice what happens immediately:*
>
> 1. *The voice recording was saved locally. I can click 'Play Recording' right here to listen back to the entire conversation, or download it.*
> 2. *The AI intelligence engine evaluated the dialogue and automatically assigned the status **'Demo Requested'** with 95% confidence.*
> 3. *It generated a 4-part summary: an Executive Summary, Customer Requirements (10 reps, Salesforce sync), Objections Handled, and recommended Next Steps."*

### [2:05 - 2:30] Call History & Wrap-Up
*(Click 'Call History' tab)*
> *"Finally, navigating to the 'Call History' tab, all previous calls are stored in SQLite with their audio recordings, verbatim transcripts, and final statuses. We can filter calls by status—such as Converted, Demo Requested, or Interested—and review full transcripts.*
>
> *The stack is powered by FastAPI and SQLite on the backend, with React, Vite, Tailwind CSS, and Web Speech API on the frontend.*
>
> *Thank you very much for your time and consideration!"*
