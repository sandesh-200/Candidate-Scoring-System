# TechKraft Candidate Scoring System

A full-stack internal tool for HR teams to manage job candidates, score them across evaluation categories, and generate AI-style summaries. Built with FastAPI (backend) and React + Vite (frontend), containerized with Docker.

---

## Table of Contents

- [Setup Instructions](#-setup-instructions)
- [Seeding the Database](#-seeding-the-database)
- [Test Accounts](#-test-accounts)
- [API Examples](#-api-examples)
- [System Design](#-system-design)
- [Architecture Decision Records](#-architecture-decision-records-adr)
- [Debugging Issue & Fix](#-debugging-issue--fix)
- [Learning Reflection](#-learning-reflection)
- [System Features](#-system-features)
- [Submission Checklist](#-submission-checklist)
- [Notes](#-notes)

---

## 🚀 Setup Instructions

> [!WARNING]
> ### 🔑 Required Environment Configuration
> This system uses **Google Gemini** as its summary generator LLM.
> To run the AI features, you **MUST** create a `.env` file in the `backend/` directory and add your Gemini API Key:
> ```env
> GEMINI_API_KEY=your_gemini_api_key_here
> ```
> *Without this key, clicking "Generate Summary" will return an error.*

### Option A — Run Locally (Manual)

**1. Clone the repository**

```bash
git clone <your-repo-url>
cd techkraft-assignment
```

**2. Backend**

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend runs at → `http://127.0.0.1:8000`  
Interactive API docs → `http://127.0.0.1:8000/docs`

**3. Frontend**

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at → `http://localhost:5173`

---

### Option B — Docker (Recommended)

```bash
docker compose up --build
```

This starts both the backend and frontend together. No additional configuration needed.

| Service  | URL                      |
|----------|--------------------------|
| Backend  | http://localhost:8000    |
| Frontend | http://localhost:5173    |
| API Docs | http://localhost:8000/docs |

---

## 🌱 Seeding the Database

The project ships with a seed script that creates two user accounts (admin + reviewer) and four sample candidates so you can test everything right away without manually entering data.

**Run the seed script from the `backend/` directory:**

```bash
cd backend
python -m app.seed
```

You should see:

```
Database seeded successfully
```

> **What gets created:**
> - `admin@techkraft.com` — full admin access
> - `reviewer@techkraft.com` — reviewer access (own scores only)
> - 4 sample candidates: Alice, Bob, Charlie, Diana — each with different roles and statuses

> **Safe to re-run:** The seed script checks for existing records before inserting, so running it multiple times won't create duplicates.

---

## 🔐 Test Accounts

| Role     | Email                      | Password     |
|----------|----------------------------|--------------|
| Admin    | admin@techkraft.com        | admin123     |
| Reviewer | reviewer@techkraft.com     | reviewer123  |

**Role differences:**
- **Admin** — sees all candidates, all scores, internal notes, and can delete candidates
- **Reviewer** — sees candidates but only their own submitted scores; internal notes are hidden

---

## 📌 API Examples

### Login

```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"reviewer@techkraft.com","password":"reviewer123"}'
```

Copy the `access_token` from the response and use it in the requests below as `<TOKEN>`.

---

### Register a new user (Admin only)

```bash
curl -X POST http://127.0.0.1:8000/auth/register \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"email":"newreviewer@techkraft.com","password":"pass123","role":"reviewer"}'
```

---

### List candidates (with optional filters)

```bash
# All candidates
curl http://127.0.0.1:8000/candidates

# Filter by status
curl "http://127.0.0.1:8000/candidates?status=new"

# Filter by role and paginate
curl "http://127.0.0.1:8000/candidates?role_applied=Frontend+Engineer&page=1&page_size=5"

# Search by keyword
curl "http://127.0.0.1:8000/candidates?keyword=Alice"
```

---

### Get a single candidate

```bash
curl http://127.0.0.1:8000/candidates/1 \
  -H "Authorization: Bearer <TOKEN>"
```

---

### Add a score

```bash
curl -X POST http://127.0.0.1:8000/candidates/1/scores \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"category":"DSA","score":5,"note":"Strong fundamentals"}'
```

Score must be between 1 and 5.

---

### Generate AI summary

```bash
curl -X POST http://127.0.0.1:8000/candidates/1/summary \
  -H "Authorization: Bearer <TOKEN>"
```

This calls the Gemini API (Google AI Studio key) and stores a richer, structured summary in `candidate.ai_summary`.

**Required env (in `backend/.env`):**
- `GEMINI_API_KEY=...`


---

### Soft delete a candidate (Admin only)

```bash
curl -X DELETE http://127.0.0.1:8000/candidates/1 \
  -H "Authorization: Bearer <TOKEN>"
```

This sets `deleted_at` on the record — the candidate is archived, not permanently removed.

---

### Stream score updates in real-time (SSE)

```bash
curl -N http://127.0.0.1:8000/candidates/1/stream
```

Establishes a persistent Server-Sent Events (SSE) connection to stream new score updates for candidate `1` to all connected clients in real-time.

---

## 🏗 System Design

```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend                       │
│         (Vite · React Router · Axios)                   │
│  Login → Candidate List → Candidate Detail → Scores     │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP + JWT Bearer Token
┌─────────────────────▼───────────────────────────────────┐
│                   FastAPI Backend                        │
│                                                         │
│   /auth          — login, register                      │
│   /candidates    — CRUD, search, filter, paginate       │
│   /candidates/:id/scores   — score submission           │
│   /candidates/:id/summary  — AI summary (Gemini)        │
│   /candidates/:id/stream   — Real-time score stream (SSE)│
│                                                         │
│   Auth Layer: OAuth2PasswordBearer + JWT                │
│   Role Guard: admin / reviewer                          │
└─────────────────────┬───────────────────────────────────┘
                      │ SQLAlchemy ORM
┌─────────────────────▼───────────────────────────────────┐
│                   SQLite Database                        │
│   Tables: users, candidates, scores                     │
│   Soft delete via `deleted_at` column                   │
└─────────────────────────────────────────────────────────┘
```

**Key design principles:**
- Business logic lives in a dedicated `services/` layer, not in the routers
- Filtering and pagination are pushed down to the database layer (not Python)
- Role-based rules are enforced server-side — the frontend never decides access
- Soft delete keeps the audit trail intact while hiding records from normal queries

---

## 🧠 Architecture Decision Records (ADR)

### ADR 1 — SQLAlchemy ORM with SQLite

**Background:** I needed a database that was easy to set up locally and worked well inside Docker without requiring a separate database container.

**Decision:** Use SQLite as the database engine, accessed through SQLAlchemy ORM.

**Why this made sense:**
- Zero external dependencies — the database is just a file (`app.db`)
- SQLAlchemy lets us swap to PostgreSQL later by changing a single connection string
- ORM models are cleaner and less error-prone than raw SQL strings

**Trade-offs to be aware of:**
- SQLite doesn't handle high write concurrency well — it would need to be replaced with PostgreSQL before going to production
- No connection pooling out of the box for multi-threaded workloads

---

### ADR 2 — JWT Authentication with Role-Based Access

**Background:** The system has two types of users (admin and reviewer) with meaningfully different permissions. I needed a way to enforce this without storing session state on the server.

**Decision:** Use JWT tokens issued at login, with the user's role embedded in the payload. Protected routes decode the token and check the role before proceeding.

**Why this made sense:**
- Stateless — no session store needed, works naturally with Docker and horizontal scaling
- Role is checked on every request, not cached on the client

**Trade-offs to be aware of:**
- Tokens can't be individually revoked before they expire — a logged-out user could still use their token until it times out. A token blocklist or short expiry would fix this in production.

---

### ADR 3 — Service Layer for Search and Filtering

**Background:** The assignment provided this pattern as a starting point for candidate search:

```python
all_candidates = db.execute("SELECT * FROM candidates").fetchall()
filtered = [c for c in all_candidates if c["status"] == status]
```

This works fine for a handful of records but becomes a serious problem at scale.

**Decision:** Move all filtering, searching, and pagination into a dedicated `services/candidate_service.py` module that builds SQLAlchemy queries with proper `WHERE` clauses, `LIMIT`, and `OFFSET`.

**Why this made sense:**
- The database does the filtering — only matching rows ever leave the DB
- Pagination is correct regardless of concurrent writes
- The router stays thin and readable

**Trade-offs to be aware of:**
- The query building logic is slightly more complex than a simple list comprehension, but it's the only correct approach for real data volumes.

---

## 🐞 Debugging Issue & Fix

### The Problem

The assignment included this code as an example of candidate search:

```python
# ❌ Problematic code
all_candidates = db.execute("SELECT * FROM candidates").fetchall()
filtered = [c for c in all_candidates if c["status"] == status]
offset = (page - 1) * page_size
return filtered[offset : offset + page_size]
```

I spotted three real problems with this approach:

**1. It loads the entire table into memory.**  
Even if there are 100,000 candidates and you only want 5, this code fetches all 100,000 first. With a growing database, this will eventually crash the server or cause very slow response times.

**2. Pagination breaks under concurrent usage.**  
Because filtering happens in Python after fetching everything, the "page 2" you get depends on the order Python returns results — which is not guaranteed to be stable. Two users paginating at the same time might see overlapping or missing records.

**3. It bypasses the ORM entirely.**  
Using a raw `db.execute("SELECT *")` string loses all the benefits of SQLAlchemy — type safety, lazy loading relationships, and the ability to compose queries.

### The Fix

We pushed all of this down to the database:

```python
# ✅ Fixed approach (services/candidate_service.py)
def search_candidates(db, status, role_applied, skill, keyword, offset, limit):
    query = db.query(Candidate).filter(Candidate.deleted_at.is_(None))

    if status:
        query = query.filter(Candidate.status == status)
    if role_applied:
        query = query.filter(Candidate.role_applied.ilike(f"%{role_applied}%"))
    if skill:
        query = query.filter(Candidate.skills.ilike(f"%{skill}%"))
    if keyword:
        query = query.filter(
            or_(Candidate.name.ilike(f"%{keyword}%"),
                Candidate.email.ilike(f"%{keyword}%"))
        )

    return query.offset(offset).limit(limit).all()
```

**Result:** The database only returns the rows that match — filtering, pagination, and soft-delete exclusion all happen in a single SQL query.

---

## 📚 Learning Reflection

I had worked with basic REST APIs before this project, but building the role-based access layer from scratch was new territory for me. Understanding how the JWT payload flows from login → token → protected route → role check gave me a much clearer mental model of how stateless auth actually works in practice.

The debugging exercise around in-memory filtering was also genuinely eye-opening. It's easy to write `[x for x in all_records if x.status == "new"]` and not think about what happens when `all_records` contains a million rows. Seeing the problem written out explicitly made me think much more carefully about where computation should live — in the application layer or at the database level.

If I had more time to extend this project, I'd look at:

- **Redis caching** for the candidate list — results could be cached per filter combination and invalidated on write
- **Background tasks** for the AI summary — run LLM generation in the background (FastAPI `BackgroundTasks` / Celery) to avoid blocking requests
- **Token refresh flow** to handle the JWT revocation limitation cleanly
- **PostgreSQL** as a drop-in replacement once the data volume grows

---

## ⚙️ System Features

| Feature | Details |
|---|---|
| JWT Authentication | Login returns a signed token; all protected routes validate it |
| Role-Based Access Control | Admin sees everything; Reviewer sees only their own scores |
| Candidate Filtering | Filter by status, role, skill, or keyword via query params |
| Pagination | DB-level `LIMIT`/`OFFSET` with `page` and `page_size` params |
| Score Submission | Reviewers submit scores (1–5) per category with optional notes |
| Real-time Updates | Streams score updates via SSE (`/stream`) to connected details page in real time |
| AI Summary Generator | Gemini-generated summary (stored on the candidate record) |
| Soft Delete | Candidates are archived (`deleted_at` set), not permanently removed |
| React Dashboard | Login, candidate list, filters, pagination, detail view, score form |

---

## ✅ Submission Checklist

### Backend
- [x] Registration and login endpoints work
- [x] JWT issued on login, validated on protected routes
- [x] Role guard enforced (`admin` vs `reviewer`)
- [x] Candidate list with filtering and pagination
- [x] Candidate detail with role-filtered scores
- [x] Score submission (1–5 validation enforced)
- [x] AI summary generator (Gemini, stored to DB)
- [x] Real-time score streaming via Server-Sent Events (SSE)
- [x] Soft delete via `deleted_at`
- [x] Service layer handles all search/filter logic
- [x] Seed script creates users and sample candidates

### Frontend
- [x] Login page with JWT storage
- [x] Candidate list page loads from API
- [x] Filters (status, role, skill, keyword) work
- [x] Pagination (next/prev) works
- [x] Candidate detail page loads scores and notes
- [x] Real-time SSE listener updates scores instantly
- [x] Add Score form submits and refreshes
- [x] Generate Summary button with loading state
- [x] API functions properly exported from `candidateApi.js`

### DevOps
- [x] `docker-compose.yml` starts both services
- [x] `.env.example` committed (no real secrets)
- [x] `.env` excluded via `.dockerignore` / `.gitignore`
- [x] No credentials hardcoded in source files

---

## 🚨 Notes

- **Soft delete** — deleted candidates have a `deleted_at` timestamp. They are excluded from all list and detail queries but remain in the database for audit purposes.
- **Internal notes** — only visible to admin users. The API strips this field before returning data to reviewers.
- **Score visibility** — reviewers can only see scores they personally submitted. Admins see all scores.
- **AI summary** — uses the Gemini API (Google AI Studio key) to generate a structured summary and stores it in `candidates.ai_summary`. Configure via `AI_SUMMARY_PROVIDER`, `GEMINI_API_KEY`, and `GEMINI_MODEL` in `backend/.env`.
- **SQLite in Docker** — the database file (`app.db`) lives inside the container. If you want data to survive container restarts, mount it as a volume in `docker-compose.yml`.

---

## 📤 Final Push

```bash
git init
git add .
git commit -m "final submission: TechKraft Candidate Scoring System"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```
