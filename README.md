<div align="center">

# 🧭 DataPilot

### AI-Powered Data Analytics Platform

[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://supabase.com)
[![LangChain](https://img.shields.io/badge/LangChain-Agent-1C3C3C?style=for-the-badge&logo=chainlink&logoColor=white)](https://langchain.com)
[![Groq](https://img.shields.io/badge/Groq-Llama_3-F55036?style=for-the-badge&logo=meta&logoColor=white)](https://groq.com)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=for-the-badge&logo=render&logoColor=black)](https://render.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

**Upload a CSV. Ask a question. Get instant AI insights.**

[🚀 Live Demo](#live-demo) · [📖 Docs](#setup--installation) · [🗺️ Roadmap](#roadmap)

[ADD HERO SCREENSHOT OR GIF HERE]

</div>

---

## 📋 Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Key Engineering Challenges & Solutions](#key-engineering-challenges--solutions)
- [Setup & Installation](#setup--installation)
  - [Prerequisites](#prerequisites)
  - [Backend](#backend-setup)
  - [Frontend](#frontend-setup)
  - [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)
- [Tech Decisions & Learnings](#tech-decisions--learnings)
- [Contact](#contact)
- [License](#license)

---

## Overview

**DataPilot** is a full-stack AI analytics platform that lets anyone — regardless of SQL or data science background — extract meaningful insights from structured data in seconds. Upload a CSV or Excel file, and DataPilot automatically profiles your columns, flags data quality issues, generates business insights using a Llama 3-powered AI agent, and lets you query your data in plain English.

The project is end-to-end: a FastAPI backend with a custom AI agent layer, a PostgreSQL database via Supabase, JWT-secured authentication, cloud file storage, and a React frontend with interactive Plotly dashboards — all deployed and running in production.

---

## Live Demo

| Surface | Link |
|---|---|
| 🌐 Frontend | [ADD FRONTEND URL] |
| ⚙️ Backend API (Swagger) | [ADD BACKEND API URL]/docs |

> **Note:** The backend runs on Render's free tier. Cold starts may take ~30 seconds if the service has been idle. A self-ping mechanism (via UptimeRobot) is in place to minimize this.

---

## Features

### ✅ Core Features

| Feature | Description |
|---|---|
| 📂 **AI-Powered Data Upload** | Upload CSV or Excel files. Get automatic column profiling, null/duplicate detection, a data quality summary, and 4–5 AI-generated business insights — all in one step. |
| 💬 **Natural Language → SQL** | Ask data questions in plain English. A custom AI agent generates and executes the SQL query against your dataset and returns structured results. |
| 📊 **Interactive Dashboards** | Auto-generated Plotly charts tailored to the uploaded dataset. No chart configuration required. |
| 🗣️ **Chat-Based Data Exploration** | Conversational interface for iterative data analysis. Follow-up questions maintain context across the session. |
| 🗂️ **Session & History Management** | All past uploads, queries, and results are persisted and retrievable from the user's history panel. |
| 🔐 **Secure Authentication** | Supabase Auth with JWT verification via JWKS endpoint. Supports both authenticated and guest access flows. |

### 🔜 Upcoming Features

> See [Roadmap](#roadmap) for details.

- Live database connections (MySQL, PostgreSQL, SQL Server)
- Automated data preprocessing & cleaning pipeline
- RAG-based document + data querying

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| TailwindCSS | Utility-first styling |
| Plotly.js | Interactive data visualizations |
| Vite | Build tool & dev server |

### Backend
| Technology | Purpose |
|---|---|
| FastAPI (Python) | REST API framework |
| SQLAlchemy ORM | Database access layer |
| PostgreSQL (Supabase) | Primary relational database |
| Supabase Storage | Cloud file storage for uploads |
| Supabase Auth | User authentication & JWT issuance |

### AI / Agent Layer
| Technology | Purpose |
|---|---|
| LangChain | Agent orchestration framework |
| `SimpleDataAgent` (custom) | Lightweight custom agent replacing standard ReAct agent |
| Groq API | LLM inference (fast, low-latency) |
| Llama 3.3 70B Versatile | Primary model for complex reasoning |
| Llama 3.1 8B Instant | Fallback model under rate-limit conditions |

### Infrastructure & Deployment
| Technology | Purpose |
|---|---|
| Render (free tier) | Backend hosting |
| Vercel | Frontend hosting |
| UptimeRobot + self-ping | Keep Render service warm |
| GitHub | Version control |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT                               │
│         React + TailwindCSS + Plotly (Vercel)               │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / REST
┌──────────────────────────▼──────────────────────────────────┐
│                     FastAPI BACKEND                         │
│                      (Render)                               │
│                                                             │
│  ┌─────────────┐   ┌─────────────┐   ┌──────────────────┐  │
│  │  Auth Layer │   │ File Router │   │  Query Router    │  │
│  │ (JWKS/JWT)  │   │             │   │  (NL → SQL)      │  │
│  └─────────────┘   └──────┬──────┘   └────────┬─────────┘  │
│                           │                   │             │
│                    ┌──────▼──────────────────▼──────┐      │
│                    │       SimpleDataAgent           │      │
│                    │  (LangChain + Groq Llama 3)     │      │
│                    │  Dynamic model switching:        │      │
│                    │  70B → 8B under rate limits      │      │
│                    └──────────────┬─────────────────┘      │
└───────────────────────────────────┼────────────────────────┘
                                    │
           ┌────────────────────────┼───────────────────┐
           │                        │                   │
  ┌────────▼────────┐    ┌──────────▼──────┐  ┌────────▼──────┐
  │  PostgreSQL DB  │    │ Supabase Storage │  │ Supabase Auth │
  │  (Supabase)     │    │ (File uploads)   │  │  (JWT / JWKS) │
  └─────────────────┘    └─────────────────┘  └───────────────┘
```

> [ADD ARCHITECTURE DIAGRAM IMAGE HERE]

---

## Key Engineering Challenges & Solutions

These are real problems encountered and solved during development — not textbook exercises.

| # | Problem | Solution |
|---|---|---|
| **1** | 🗂️ **Ephemeral disk on Render** — Uploaded files were silently deleted on every service restart, causing broken sessions with no clear error. | Migrated all file storage from local disk to **Supabase Storage**. Files are now uploaded directly to cloud storage and referenced by URL, surviving restarts entirely. |
| **2** | 🤖 **ReAct agent reliability** — The standard LangChain `ReAct` agent frequently failed with smaller/faster LLMs due to output-parsing errors and rate-limit mid-chain interruptions. | Replaced with a custom **`SimpleDataAgent`** — a minimal, deterministic agent with explicit tool dispatch, no complex chain-of-thought parsing, and graceful fallback. More robust, easier to debug. |
| **3** | ⚡ **Groq API rate limits** — The 70B model regularly hit token-per-minute limits under concurrent use, returning hard errors. | Implemented **dynamic model switching**: the agent defaults to `llama-3.3-70b-versatile` and automatically falls back to `llama-3.1-8b-instant` when a rate-limit error is detected. |
| **4** | 🔑 **Supabase project sprawl** — Originally used two separate Supabase projects (one for auth, one for DB), causing JWT key mismatches that required hours of debugging. | Consolidated everything into a **single Supabase project**. Lesson internalized: minimize cross-project credential dependencies at the infrastructure planning stage. |
| **5** | 🐍 **Python version mismatch in production** — `pandas` crashed silently on the Python version Render chose by default, working fine locally. | **Pinned the Python runtime version** explicitly in the Render config (`python-3.11.x`), eliminating the environment mismatch. |
| **6** | 🔀 **Feature branch risk management** — A complete data preprocessing pipeline was built and tested but introduced instability risks to the live deployment. | Made a deliberate decision to **revert the feature to a clean branch** rather than ship it, preserving the implementation for a controlled future release. Design kept documented. |

---

## Setup & Installation

### Prerequisites

- Python 3.11+
- Node.js 18+
- A [Supabase](https://supabase.com) project (single project for auth + DB + storage)
- A [Groq API](https://console.groq.com) key

---

### Backend Setup

```bash
# Clone the repository
git clone https://github.com/[YOUR_GITHUB_USERNAME]/DataPilot.git
cd DataPilot/backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Copy and configure environment variables
cp .env.example .env
# Edit .env with your credentials (see Environment Variables section)

# Start the development server
uvicorn main:app --reload --port 8000
```

The API will be available at `http://localhost:8000` and Swagger docs at `http://localhost:8000/docs`.

---

### Frontend Setup

```bash
cd DataPilot/frontend

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase and backend URL

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

---

### Environment Variables

#### Backend (`.env`)

```env
# Supabase
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret

# Database
DATABASE_URL=postgresql://postgres:[password]@[host]:5432/postgres

# AI / LLM
GROQ_API_KEY=your_groq_api_key

# App Config
ENVIRONMENT=development
ALLOWED_ORIGINS=http://localhost:5173
```

#### Frontend (`.env.local`)

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:8000
```

> ⚠️ Never commit `.env` files. All secrets should be injected via environment variables in your deployment platform (Render / Vercel dashboard).

---

## Project Structure

```
DataPilot/
├── backend/
│   ├── main.py                  # FastAPI app entrypoint
│   ├── requirements.txt
│   ├── .env.example
│   ├── routers/
│   │   ├── auth.py              # Auth endpoints (JWT verification)
│   │   ├── upload.py            # File upload & Supabase Storage integration
│   │   ├── query.py             # Natural language → SQL endpoint
│   │   └── history.py           # Session & query history
│   ├── agents/
│   │   └── simple_data_agent.py # Custom LangChain agent with dynamic model switching
│   ├── models/
│   │   └── schemas.py           # SQLAlchemy models + Pydantic schemas
│   ├── services/
│   │   ├── file_service.py      # File parsing (CSV/Excel) + profiling
│   │   ├── insight_service.py   # AI insight generation
│   │   └── supabase_client.py   # Supabase SDK wrapper
│   └── utils/
│       └── auth_utils.py        # JWKS-based JWT verification helpers
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── components/
│       │   ├── Dashboard/       # Chart + visualization components
│       │   ├── Chat/            # Conversational query interface
│       │   ├── Upload/          # File upload flow
│       │   └── Auth/            # Login / signup / guest flow
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Analyze.jsx
│       │   └── History.jsx
│       ├── hooks/               # Custom React hooks
│       ├── services/            # API client functions
│       └── store/               # Global state (context / zustand)
│
└── README.md
```

---

## Roadmap

| Status | Feature |
|---|---|
| ✅ Done | CSV / Excel upload with AI profiling and insight generation |
| ✅ Done | Natural language → SQL querying via custom agent |
| ✅ Done | Interactive Plotly dashboards |
| ✅ Done | Chat-based data exploration |
| ✅ Done | Session and query history persistence |
| ✅ Done | Supabase JWT authentication + guest mode |
| ✅ Done | Supabase Storage for reliable file persistence |
| ✅ Done | Dynamic LLM model switching (70B ↔ 8B) |
| 🔜 Planned | **Live database connections** — connect MySQL, PostgreSQL, or SQL Server directly |
| 🔜 Planned | **Automated data preprocessing pipeline** — null imputation, outlier detection, type coercion |
| 🔜 Planned | **RAG-based tooling** — query across documents and structured data simultaneously |
| 🔜 Planned | **Shareable dashboards** — generate public links to analysis results |
| 🔜 Planned | **Scheduled reports** — run queries on a schedule and email results |

---

## Tech Decisions & Learnings

This section documents deliberate design choices and honest post-mortems — questions that often come up in technical interviews.

<details>
<summary><strong>Why a custom agent instead of LangChain's built-in ReAct agent?</strong></summary>

The standard `ReAct` agent expects a very specific output format from the LLM at each reasoning step. With smaller or faster models — necessary here for staying within Groq rate-limit headroom — that format was frequently violated, causing mid-chain crashes. Rather than wrapping the agent in increasingly complex retry and repair logic, a purpose-built `SimpleDataAgent` with explicit tool dispatch was implemented. It handles exactly the tools DataPilot needs, with no excess overhead. This also made the agent significantly easier to test and debug.

</details>

<details>
<summary><strong>Why Supabase over a standalone PostgreSQL + S3 setup?</strong></summary>

For a solo project targeting rapid production deployment, Supabase provides auth, storage, and Postgres in one dashboard with a generous free tier. The one lesson learned: don't split auth and database across two separate Supabase projects. The JWT keys are project-scoped, and using two projects introduced key-mismatch bugs that were painful to diagnose. Keep everything in one project from the start.

</details>

<details>
<summary><strong>Why Render for the backend?</strong></summary>

Render's free tier was sufficient for a portfolio deployment. The major caveat — **ephemeral disk** — was a real production bug: files saved to disk disappeared on every restart. Migrating to Supabase Storage resolved this completely. If this were a production SaaS product, a persistent-disk plan or dedicated object storage would be the correct choice from day one.

</details>

<details>
<summary><strong>What would you do differently?</strong></summary>

- **Start with a single Supabase project.** The cost of consolidating two projects mid-development was high.
- **Design the storage layer first.** The ephemeral disk bug could have been anticipated; cloud storage should have been the default from the first commit.
- **Pin runtime versions immediately.** The Python version mismatch on Render is a known gotcha. Add a `runtime.txt` or equivalent at project initialization, not after a production bug.
- **Scope the MVP tighter.** The data preprocessing pipeline was built to near-completion before being reverted. Future approach: ship a minimal working slice first, then expand with feature flags.

</details>

---

## Contact

| | |
|---|---|
| 👤 **GitHub** | [ADD GITHUB PROFILE LINK] |
| 💼 **LinkedIn** | [ADD LINKEDIN PROFILE LINK] |
| 📧 **Email** | [ADD EMAIL] |

---

## License

This project is licensed under the [MIT License](LICENSE).

```
MIT License — free to use, modify, and distribute with attribution.
```

---

<div align="center">

Built with care, deployed with lessons learned.

⭐ If you found this project interesting, consider giving it a star!

</div>
