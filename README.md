# ARAV AI — Smart Cooperative & Agricultural Assistant

ARAV AI is an intelligent mobile assistant designed to empower farmers, members, and administrators of Primary Agricultural Credit Societies (PACS) and cooperative societies.

## Key Features

- **Voice Assistant**: Multimodal Speech-to-Text (STT) and voice dictation powered by Google Gemini, enabling voice-driven queries, damage note dictation, and audio guideline readouts.
- **AI Advisory & Chat**: Conversational AI guidance for cooperative queries, government schemes, and legal/regulatory questions.
- **PACS & Society Discovery**: Comprehensive directory to discover cooperative societies, services, and membership criteria.
- **Membership Services**: Online registration guidance, required documents checklist, and digital application workflow.
- **KCC & Agricultural Loans**: Loan scheme guidance, 4% interest subvention assistance, and an interactive EMI calculator.
- **PMFBY Crop Insurance**: 72-hour crop damage assessment reporting, geo-tagged photo evidence support, and claim tracking.
- **Grievance Redressal**: Submission and internal tracking for member disputes and complaints with links to official CPGRAMS portals.

---

## Architecture

- **Backend**: FastAPI (Python), SQLAlchemy, Neon Serverless PostgreSQL, Google GenAI SDK (Gemini 3.5 Flash Lite).
- **Mobile**: React Native / Expo, Expo Router, TypeScript, Expo Audio / Speech, TanStack React Query.

---

## Getting Started

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# Linux/Mac:
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
# Configure your DATABASE_URL and GEMINI_API_KEY in .env

python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 2. Mobile App Setup
```bash
cd mobile
npm install
npx expo start
```
