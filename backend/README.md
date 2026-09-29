# ARAV AI – Backend

FastAPI backend for the ARAV AI Multilingual Cooperative Governance & Legal Assistance Chatbot.

## Local Development

### 1. Create virtual environment
```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure environment
Copy `.env.example` to `.env` and fill in your values:
```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` – Neon PostgreSQL connection string
- `GEMINI_API_KEY` – Google AI Studio API key
- `GEMINI_MODEL` – Gemini model name (e.g., `gemini-2.0-flash`)
- `JWT_SECRET` – Random secret key for JWT signing

### 4. Start server
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs: http://localhost:8000/docs

## Database

Tables are automatically created on startup via SQLAlchemy `create_all`.
Knowledge base seed data is inserted on first startup.

## Deployment on Render

1. Create a new **Web Service** on Render
2. Set the **Build Command**: `pip install -r requirements.txt`
3. Set the **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Add all environment variables from `.env.example`
5. Use Neon for PostgreSQL (add `sslmode=require` to DATABASE_URL)

## Voice Configuration

- Set `STT_PROVIDER=google` and `STT_API_KEY=<your-google-api-key>` to enable speech-to-text
- Set `TTS_PROVIDER=google` and `TTS_API_KEY=<your-google-api-key>` to enable text-to-speech
- Without configuration, the app falls back to Expo Speech (on-device TTS) and keyboard input

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Service health check |
| POST | /auth/register | User registration |
| POST | /auth/login | User login |
| GET | /users/me | Get current user |
| PATCH | /users/me | Update profile |
| POST | /chat | Send chat message |
| GET | /chat/history | List conversations |
| GET | /chat/conversations/{id} | Get conversation |
| DELETE | /chat/conversations/{id} | Delete conversation |
| POST | /voice/transcribe | Speech to text |
| POST | /voice/synthesize | Text to speech |
| GET | /schemes | List schemes |
| GET | /schemes/{id} | Get scheme |
| GET | /societies | List societies |
| GET | /societies/{id} | Get society |
| POST | /applications | Submit application |
| GET | /applications | List applications |
| GET | /applications/{id} | Get application |
| GET | /documents | List document requests |
| POST | /documents/requests | Request document |
| POST | /grievances | Submit grievance |
| GET | /grievances | List grievances |
| GET | /grievances/{id} | Get grievance |
| GET | /notifications | List notifications |
| PATCH | /notifications/{id}/read | Mark as read |
