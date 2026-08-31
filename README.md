# ExecFlow AI

**AI-powered executive productivity platform.** Turns unstructured leadership
input — voice notes and pasted text — into structured, actionable output:
transcripts, executive summaries, key points, decisions, risks, opportunities,
action items, executive briefs, and meeting notes.

Built as a single-user portfolio-quality app, architected cleanly enough to
extend to multi-user later. Runs entirely on **free infrastructure**: no paid
API keys are required for any core feature.

```
Voice Note / Text
   → Transcription (local Whisper)
   → Editable Transcript
   → AI Analysis (Groq, free tier)
   → Executive Summary / Key Points / Decisions / Action Items / Risks / Opportunities
   → Executive Brief or Meeting Notes
   → Action Tracker
```

---

## Table of contents

- [Tech stack](#tech-stack)
- [Project layout](#project-layout)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
  - [1. Get your free API keys](#1-get-your-free-api-keys)
  - [2. Configure environment variables](#2-configure-environment-variables)
  - [3. Run it](#3-run-it)
- [Verifying it works](#verifying-it-works)
- [Features by module](#features-by-module)
- [API overview](#api-overview)
- [Database schema](#database-schema)
- [Registration is invite-only](#registration-is-invite-only)
- [Known simplifications](#known-simplifications)
- [Troubleshooting](#troubleshooting)
- [Roadmap / what's not built](#roadmap--whats-not-built)

---

## Tech stack

| Layer | Technology | Cost |
|---|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, TanStack Query | Free |
| Backend | Java 17, Spring Boot 3, Spring Security, Spring Data JPA | Free |
| Database | PostgreSQL 16 | Free (self-hosted) |
| Speech-to-text | Whisper, self-hosted via `openai-whisper-asr-webservice` | Free (self-hosted) |
| AI analysis | Groq API (Llama 3.3 70B), OpenAI-compatible chat completions | Free tier |
| File storage | Local disk | Free |
| Auth | JWT (HS256), BCrypt password hashing | Free |

No Redis, Kafka, microservices, or Kubernetes — this is a modular monolith by
design (see [Known simplifications](#known-simplifications) for why, and
what that trades off).

---

## Project layout

```
execflow-backend/     Spring Boot API (Java 17, Maven)
  src/main/java/com/execflow/
    controller/         REST endpoints (thin, no business logic)
    service/            Business logic
      ai/                 AiProviderService (Groq) + TranscriptionClient (Whisper) - swappable
      storage/            StorageService (local disk) - swappable
    repository/         Spring Data JPA repositories
    entity/              JPA entities
    dto/                 Request/response/AI-contract DTOs
    mapper/              Entity <-> DTO conversion (incl. JSON (de)serialization)
    security/            JWT filter, UserDetails, JwtUtil
    config/              Security, CORS, WebClient beans
    exception/           Centralized error handling

execflow-frontend/    Next.js app (TypeScript, Tailwind, TanStack Query)
  src/
    app/                 Pages (App Router) - dashboard, inputs, transcribe,
                         analyze, actions, briefs, ai-tools, settings, auth
    components/          Reusable UI (layout shell, badges, forms, players)
    context/             AuthContext (JWT session management)
    lib/
      api/                 Typed API client functions per resource
      hooks/                React Query hooks
      types/                Shared TS types mirroring backend DTOs

docker-compose.yml    Postgres + backend + frontend + Whisper, one command
```

---

## Prerequisites

- **Docker + Docker Compose** (recommended path — everything runs in
  containers, nothing else needs installing)
- OR, for manual/local development:
  - Java 17+ and Maven
  - Node.js 20+
  - PostgreSQL 16 running locally

---

## Setup

### 1. Get your free API keys

You need exactly one external credential — **Groq**, for AI analysis. Whisper
runs entirely locally in a container, no key needed.

1. Go to **https://console.groq.com**, sign up (no credit card required),
   and create an API key.
2. That's it. Everything else (Whisper, Postgres, storage) is self-hosted
   and free by default.

### 2. Configure environment variables

Copy the example env files and fill them in:

```bash
cp execflow-backend/.env.example execflow-backend/.env
cp execflow-frontend/.env.example execflow-frontend/.env.local
```

Edit `execflow-backend/.env`:

| Variable | Required | Notes |
|---|---|---|
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | Only for manual (non-Docker) runs | Docker Compose sets these automatically |
| `JWT_SECRET` | **Yes** | Any long random string, 32+ characters. `openssl rand -hex 32` works well |
| `REGISTRATION_SECRET` | **Yes** | Your private invite code — see [Registration is invite-only](#registration-is-invite-only) |
| `GROQ_API_KEY` | **Yes** | From step 1 above |
| `GROQ_MODEL` | No | Defaults to `llama-3.3-70b-versatile` |
| `STORAGE_BASE_PATH` | No | Defaults to `./uploads`; Docker Compose overrides this to a named volume |
| `WHISPER_SERVICE_URL` | No | Defaults to `http://whisper:9000` for Docker; for manual runs point it at wherever you run Whisper |
| `WHISPER_MODEL` (compose-level, not backend) | No | Set in your shell or root `.env`, defaults to `base`. Bigger = more accurate, slower, more RAM |

`execflow-frontend/.env.local` just needs `NEXT_PUBLIC_API_BASE_URL`, which
already defaults to `http://localhost:8080/api/v1` — you shouldn't need to
change it unless you're deploying somewhere other than localhost.

### 3. Run it

**Option A — Docker Compose (recommended):**

```bash
docker compose up --build
```

This starts four containers: Postgres, the Spring Boot backend, the Next.js
frontend, and a local Whisper transcription service.

⚠️ **First run will be slow** — the Whisper container downloads its model
weights (~150MB for the default `base` model) the first time it starts.
After that, everything runs fully offline.

**Option B — manual (for active development):**

```bash
# Terminal 1: database + whisper
docker compose up postgres whisper   # or run your own local Postgres + Whisper

# Terminal 2: backend
cd execflow-backend
mvn spring-boot:run

# Terminal 3: frontend
cd execflow-frontend
npm install
npm run dev
```

---

## Verifying it works

1. **Backend health check:**
   ```bash
   curl http://localhost:8080/api/v1/health
   ```
   Should return `{"status":"UP", ...}`.

2. **Open the app:** http://localhost:3000 — you'll be redirected to
   `/login`. There's no account yet, so:

3. **Register the first account:**
   Go to `/register` and use the `REGISTRATION_SECRET` you set in your
   `.env` as the invite code.

4. **Create an input:** `/inputs/new` → paste some text → *Continue to
   Processing*. You should land back on `/inputs` and see it listed.

5. **Try a voice note (optional, tests Whisper):** `/inputs/new` → upload an
   MP3/WAV/M4A file → open it from `/inputs` → click **Transcribe Now**.
   First transcription after a fresh Whisper container start may take a
   little longer as the model warms up.

6. **Run an analysis (tests Groq):** from any input's detail page, click
   **Analyze**. You should see an executive summary, key points, decisions,
   risks, opportunities, and action items within a few seconds.

7. **Generate a document:** from the Analysis page, click **Generate Brief**
   or **Generate Notes**.

8. **Check the Action Tracker:** `/actions` should already show the action
   items extracted from your analysis, editable and status-toggleable.

If all of the above work, every module is functioning end-to-end.

---

## Features by module

| # | Module | What it does |
|---|---|---|
| 1 | Scaffolding | Backend/frontend skeleton, health check |
| 2 | Auth | JWT login/register (invite-only), BCrypt, protected routes |
| 3 | Inputs | Create/list/delete text and voice inputs |
| 4 | Storage + Recording | Upload MP3/WAV/M4A, play back in-browser |
| 5 | Transcription | Self-hosted Whisper, editable transcript |
| 6 | Analysis | Groq-powered structured extraction (summary, points, decisions, risks, opportunities, action items) |
| 7 | Action Items | Full CRUD tracker: filter, search, edit, status toggle, overdue detection |
| 8 | Documents | Generate an Executive Brief or Meeting Notes from an analysis |
| 9 | Dashboard | Real-time stats, priority actions, recent activity feed, recent inputs |
| 10 | AI Tools | Standalone workbench: Summarize / Improve / Exec-Ready / Extract Actions / Analyze / Custom Prompt on any pasted text |

Every page is responsive (mobile drawer navigation, tables collapse to
cards on small screens).

---

## API overview

All endpoints are under `/api/v1`. Except `/auth/**` and `/health`, every
endpoint requires `Authorization: Bearer <JWT>`.

```
POST   /auth/register                          (requires inviteCode)
POST   /auth/login
GET    /users/me

POST   /inputs                                  create (TEXT or VOICE)
GET    /inputs
GET    /inputs/{id}
DELETE /inputs/{id}

POST   /inputs/{id}/recording                   upload audio (multipart)
GET    /inputs/{id}/recording
GET    /inputs/{id}/recording/download

POST   /inputs/{id}/transcribe                  trigger Whisper
GET    /inputs/{id}/transcript
PUT    /inputs/{id}/transcript                  user edits

POST   /inputs/{id}/analyze                     trigger Groq analysis
GET    /inputs/{id}/analysis

GET    /actions                                 ?status=&priority=&overdue=
POST   /actions
PUT    /actions/{id}
PATCH  /actions/{id}/status
DELETE /actions/{id}

POST   /inputs/{id}/documents/brief
POST   /inputs/{id}/documents/notes
GET    /documents
GET    /documents/{id}
DELETE /documents/{id}

GET    /dashboard/summary

POST   /ai-tools/process                        {text, tool, customPrompt?}
```

---

## Database schema

```
User ──< Input ──< Recording (1:1, VOICE only)
              ├──< Transcript (1:1, VOICE only)
              ├──< Analysis (1:1) ──< ActionItem (also linkable to User directly for manual items)
              └──< Document (Brief or Notes, generated from an Analysis)
```

- `Input.status` moves `CREATED → TRANSCRIBED → ANALYZED` (TEXT inputs skip
  straight to `ANALYZED`, since there's nothing to transcribe).
- `Analysis`'s list fields (key points, decisions, risks, opportunities,
  follow-ups) are stored as JSON text and parsed at the mapper layer, rather
  than using native JSONB — keeps the schema simple, no Hibernate JSONB
  extension needed.
- `ActionItem` is a real relational table (not JSON) since it needs
  independent status changes and filtering.

---

## Registration is invite-only

There's no public sign-up. `REGISTRATION_SECRET` in your backend `.env` is
the only key that lets someone create an account — anyone registering must
supply it exactly as the `inviteCode` field, or they get a 403. Keep it
private and only share it with people you personally approve.

---

## Known simplifications

Being upfront about where "free and simple" traded off against "as capable
as possible":

- **No speaker diarization.** Free self-hosted Whisper doesn't separate
  speakers ("Speaker 1", "Speaker 2") — that needs a separate model
  (pyannote) plus meaningfully more setup and compute. Transcripts are a
  single editable block.
- **No live browser recording.** The "Record" button in New Input is
  present but disabled — `MediaRecorder` outputs webm/ogg, not
  mp3/wav/m4a, so wiring it up needs an in-browser audio encoder. Upload
  from file works fully.
- **No dedicated activity-log table.** The Dashboard's "Recent Activity"
  feed is synthesized from existing timestamps (input creation, status
  changes, document generation) rather than a proper audit log — accurate
  for what it shows, just not a full event history.
- **AI structured-output reliability.** Groq's free tier is fast and
  capable, but occasionally a field comes back slightly off-spec (e.g. a
  malformed date). Parsing is defensive — a bad field is dropped
  (`null`/default), not a failed request — but it's a real tradeoff versus
  a frontier paid model.
- **Single-user by design.** No teams, roles, or sharing yet — the schema
  (everything scoped by `userId`) is ready for it, but it isn't built.

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Backend won't start, JWT-related error | `JWT_SECRET` missing or under 32 characters (HS256 needs ≥256 bits) |
| `403` on registration | Wrong or missing `inviteCode` — must exactly match `REGISTRATION_SECRET` |
| Transcription hangs or fails | Whisper container still downloading its model (first run) — check `docker compose logs whisper` |
| Analysis returns a 502/503 | `GROQ_API_KEY` missing/invalid, or Groq is unreachable — check `docker compose logs backend` |
| Frontend can't reach backend | Check `NEXT_PUBLIC_API_BASE_URL` in `execflow-frontend/.env.local` matches where the backend is actually running |
| CORS errors in browser console | You're running the frontend on a port other than 3000 — update the allowed origin in `SecurityConfig.java` |

---

## Roadmap / what's not built

Everything in the original module plan is implemented. Natural next steps,
not yet built:

- Multi-user / team support (schema is ready; no UI/permissions layer yet)
- Live browser audio recording
- Speaker diarization
- Postman collection / automated API tests
- Deployment configs beyond local Docker Compose
