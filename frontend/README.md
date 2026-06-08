# TechKraft Candidate Scoring System

A full-stack internal tool for managing candidates, scoring them across categories, and generating AI-style summaries.

---

## 🚀 Setup Instructions

### 1. Clone Repo

```bash
git clone <your-repo-url>
cd project
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Backend runs at:** `[http://127.0.0.1:8000](http://127.0.0.1:8000)`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

**Frontend runs at:** `http://localhost:5173`

### 4. If you wanna use docker compose

```bash
docker compose up --build
```

---

## 🔐 Test Accounts

| Role         | Email                  | Password    |
| :----------- | :--------------------- | :---------- |
| **Admin**    | admin@techkraft.com    | admin123    |
| **Reviewer** | reviewer@techkraft.com | reviewer123 |

---

## 📌 API Examples

### Login

```bash
curl -X POST http://127.0.0.1:8000/auth/login \
-H "Content-Type: application/json" \
-d '{"email":"reviewer@techkraft.com","password":"reviewer123"}'
```

### Get Candidates

```bash
curl http://127.0.0.1:8000/candidates
```

### Add Score

```bash
curl -X POST http://127.0.0.1:8000/candidates/1/scores \
-H "Authorization: Bearer <TOKEN>" \
-H "Content-Type: application/json" \
-d '{"category":"DSA","score":5,"note":"Strong fundamentals"}'
```

### Generate Summary

```bash
curl -X POST http://127.0.0.1:8000/candidates/1/summary \
-H "Authorization: Bearer <TOKEN>"
```
