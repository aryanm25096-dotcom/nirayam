# MediKiosk — AI Clinical History-Taking & Medical Document Digitization

A functional front-end prototype engineered for high-volume Indian hospital outpatient departments (OPDs) and AYUSH institutions, developed for the **Smart India Hackathon (SIH)**.

---

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```
The application will start at **`http://localhost:3000/`**.

### 3. Production Build
```bash
npm run build
npm run preview
```

---

## 🧭 Five-Step Clinical Flow Architecture

The user journey follows strictly the five steps specified in the SIH problem statement:

```
[1. Identify] ──> [2. Converse] ──> [3. Scan] ──> [4. Summarize & Route] ──> [5. Consult]
 (Language,        (Adaptive AI       (OCR Document     (Patient Readback      (Physician
  ABHA/ID,          Interview,         Digitization,     & Token Routing)       Workspace,
  Consent)          AYUSH, Red Flag)   Prescriptions)                          8 Sections)
```

1. **Step 1 — Identify (`/identify`)**:
   - Language Selection (English, Hindi, Regional placeholder)
   - Identification Method (Scan ABHA QR, Enter ABHA Number, Aadhaar/UHID, New Patient)
   - Identity Verification (Mock ABHA lookup with real state persistence)
   - Granular Informed Consent with Web Speech API read-aloud and mandatory clause validation

2. **Step 2 — Converse (`/converse/type` & `/converse/interview`)**:
   - Stream Choice: **General Medicine** vs. **AYUSH & Ayurveda**
   - General Medicine: Chief complaint adaptive branching (SOCRATES pain assessment)
   - AYUSH Stream: Holistic **Dashavidha Pariksha** (Prakriti, Vikriti, Sara, Samhanana, Pramana, Satmya, Sattva, Ahara Shakti, Vyayama Shakti, Vaya) + Ahara & Vihara
   - Multimodal: "Tap and Speak" Web Speech API voice input (with simulated fallback) + touch buttons
   - Dynamic real-time progress bar tracking answered vs. remaining questions
   - Real-time **Red-Flag Emergency Triage**: Detects critical symptom combinations (e.g. chest pain + difficulty breathing / sweating) and triggers an immediate high-priority triage escalation screen

3. **Step 3 — Scan (`/scan`)**:
   - Camera frame drop zone with corner alignment brackets
   - Real file upload input (`image/*`, `.pdf`) + simulated kiosk camera capture
   - Mock OCR processing pipeline extracting structured fields (doctor name, medications, dosage, lab tests, reference values)
   - Outlier detection: Lab values outside reference range flagged with icon + text label
   - Sequential multi-document upload and confirmation loop

4. **Step 4 — Summarize & Route (`/summary`)**:
   - Plain-language patient readback displaying accumulated session data
   - Modification paths ("Add/Edit Symptoms" back to Step 2, "Add Documents" back to Step 3)
   - Session confirmation and generation of OPD queue token
   - Direct transition to Step 5 (Physician screen)

5. **Step 5 — Consult (`/consult`)**:
   - Desktop clinical workspace designed for OPD physicians
   - Real session data hydration from Step 1–4 via React Context and `localStorage`
   - Exact 8-section clinical order:
     1. Chief Complaint
     2. History of Present Illness (HPI)
     3. Past Medical & Surgical History
     4. Drug & Allergy History
     5. Family History
     6. Personal History
     7. Review of Systems
     8. Prior Investigations Summary (chronological documents with abnormal lab alerts)
   - Inline "Edit" affordance on every section
   - Persistent label: `"AI-generated draft — physician verification required"`
   - Persistent Red-Flag banner (if triggered during Step 2) until doctor clicks "Acknowledge"
   - "Confirm Reviewed History" countersignature to complete session

---

## 🔌 Mock Services & Real API Integration Points

All mock functions are isolated in [`src/mocks/mockServices.js`](src/mocks/mockServices.js) and [`src/utils/speechApi.js`](src/utils/speechApi.js) with simulated network delays (500ms–1500ms) and clear `// MOCK` annotations:

| Service | File Location | Current Implementation | Production Plug-in Endpoint |
|---|---|---|---|
| **Text-to-Speech (TTS)** | [`src/utils/speechApi.js`](src/utils/speechApi.js) & [`tts-service/`](tts-service/) | **AI4Bharat IndicF5** (11 Indian languages) via `/api/tts` with Web Speech fallback | Real IndicF5 GPU server / Bhashini TTS / Google TTS |
| **Speech-to-Text (STT)** | [`src/utils/speechApi.js`](src/utils/speechApi.js) | Native `window.webkitSpeechRecognition` with fallback to `mockSTT()` | Google Cloud Speech-to-Text / Bhashini API (Indian regional languages) |
| **Document OCR** | [`src/mocks/mockServices.js`](src/mocks/mockServices.js) | `mockOCR(file)` with delay + canned structured prescriptions & CBC labs | Google Cloud Vision / Azure Document Intelligence / Custom fine-tuned Donut/PaddleOCR model |
| **AI Clinical Summarizer** | [`src/mocks/mockServices.js`](src/mocks/mockServices.js) | `mockAISummary(answers)` structured mapping | LLM API (Gemini 1.5 Pro / GPT-4o / Med-PaLM) with clinical prompt templates |
| **ABDM / ABHA Verification** | [`src/mocks/mockServices.js`](src/mocks/mockServices.js) | `mockABHALookup(id)` | National Health Authority (NHA) ABDM Gateway M1/M2 APIs |

---

## 🗣️ IndicF5 Indian-Language Text-to-Speech (TTS)

MediKiosk integrates **AI4Bharat IndicF5** as the primary screen-reading narration engine for accessibility across 11 scheduled Indian languages:

- **11 Supported Languages**: Hindi (`hi`), Marathi (`mr`), Bengali (`bn`), Tamil (`ta`), Telugu (`te`), Gujarati (`gu`), Kannada (`kn`), Malayalam (`ml`), Punjabi (`pa`), Odia (`or`), Assamese (`as`).
- **English (`en`) Fallback**: Explicitly falls back to browser `window.speechSynthesis` (or mocked audio) since IndicF5 is specialized for Indian languages.
- **Screen Entry Auto-Narration**: Starting immediately upon selecting a language in Step 1, every screen automatically announces its visible instructions in the patient's language without requiring a button press.
- **Speaking Status & Accessibility**:
  - Displays a visible "Speaking in [Language]..." waveform banner.
  - Screen readers are alerted via `aria-live="polite"`.
  - Manual "Hear Again" repeat button and Mute controls are accessible from both the banner and the floating accessibility toolset.
- **In-Memory Caching**: Repeated common phrases are cached in memory in the Python service to eliminate redundant inference latency.
- **Resilient Offline Fallback**: If the Python service is stopped, unreachable, or times out, the frontend automatically falls back to browser SpeechSynthesis so the kiosk never goes silent.

### Running the IndicF5 Python Service
```bash
cd tts-service
uvicorn main:app --host 0.0.0.0 --port 8001
```

---

## 🎨 Design System & Constraints

- **Zero-Blue Palette**:
  - Primary: Deep Emerald / Forest Green (`#1F6E4C`, `#0A3D2A`)
  - AYUSH Accent: Muted Terracotta (`#B5623A`)
  - Warning: Amber (`#B8800E`)
  - Critical/Red-Flag: Red (`#B52525`) — used **ONLY** for red-flag emergency states
  - Background: Warm off-white (`#FAF8F5`)
  - Text: Dark charcoal (`#2D2A26`), never pure black
- **Zero Emoji**: 100% vector outlined icons via `lucide-react`.
- **Status Accessibility**: Never convey status or priority by color alone — every alert and badge combines **Color + Outlined Icon + Text Label**.
- **Scalable Rem Typography**: Base sizing in `rem`, with kiosk-oriented screens styled at 24px+ (`1.5rem`) for elderly and rural accessibility.

---

## ♿ Accessibility Suite (WCAG AAA)

Persistent floating accessibility panel visible on every page:
- **Text Scaling**: `A-` / `A+` controls dynamically scaling root font size from 75% up to 200%.
- **High Contrast Theme**: One-click swap to pure high-contrast black/white theme with enhanced border thickness.
- **Reduce Motion**: Disables all transitions and animations for motion-sensitive users.
- **Semantic HTML & Focus Outlines**: Real `<button>`, `<label>`, `<input>`, `<article>`, `<main>` with high-visibility 3px outline on `:focus-visible`.
- **ARIA Live Regions**: `aria-live="polite"` and `aria-live="assertive"` announcing voice listening status, OCR completion, and red-flag alerts to screen readers.
# niramay
