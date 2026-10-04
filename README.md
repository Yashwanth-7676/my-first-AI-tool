# Yash AI — Full-Stack AI SaaS Platform

An enterprise-ready AI SaaS foundation built on the **Anti-Gravity** architecture: lightweight, high-performance, and modular.

---

## 🛠️ Tech Stack

* **Frontend**: Next.js 14+ (App Router), Tailwind CSS, shadcn/ui
* **Backend**: FastAPI (Python 3.11+), Async SQLAlchemy, Pydantic v2
* **Storage & Vectors**: PostgreSQL 16 + `pgvector`
* **Cache & Message Broker**: Redis 7
* **Orchestration**: LangChain Core / Streaming Engine

---

## 🚀 Quickstart

### 1. Start Infrastructure (Postgres + pgvector + Redis)
Ensure Docker is installed and running:
```bash
docker-compose up -d
```

### 2. Configure Backend
```bash
cd backend
copy .env.example .env
# Edit .env with your OPENAI_API_KEY if testing live generation
```

### 3. Install Backend Dependencies
```bash
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
# source venv/bin/activate

pip install -r requirements.txt
```

### 4. Run Development Server
```bash
uvicorn app.main:app --reload --port 8000
```
Visit API Documentation: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 📡 API Endpoints

* `GET /health` — Check server health and status.
* `POST /api/v1/chat/stream` — Real-time token streaming chat with semantic pgvector RAG retrieval.
