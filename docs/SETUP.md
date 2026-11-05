# Bill Nexa – Setup & Installation Guide

This document describes how to set up, configure, and run **Bill Nexa – AI-Powered Document Processing & Claims Automation Platform**.

---

## 1. System Requirements

- **Operating System:** Windows 10/11, macOS, or Linux
- **Python:** 3.10+ (tested and verified on Python 3.13)
- **Node.js:** 18+ (tested on Node v24)
- **Package Manager:** npm

---

## 2. Directory Structure

```text
BILLNEXA/
├── backend/
│   ├── app/
│   │   ├── api/             # REST API routers (auth, folders, documents, assignments, ai, tags, claims)
│   │   ├── core/            # App configuration & settings
│   │   ├── models/          # Relational database models (SQLAlchemy)
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   ├── services/        # PDF processing, AI extraction, and tagging services
│   │   ├── utils/           # Database seeding and sample PDF generation
│   │   └── main.py          # FastAPI application entrypoint
│   └── tests/
│       └── test_e2e_workflow.py # Automated end-to-end 11-step test suite
├── frontend/
│   ├── src/
│   │   ├── components/      # Common UI components, Header, ConfidenceBadge, Modals
│   │   ├── contexts/        # AuthContext with demo account switcher
│   │   ├── pages/           # Admin and Employee views (IntakeBillsWorkspace, etc.)
│   │   └── App.tsx          # Client-side routing and protected paths
│   ├── dist/                # Production-ready built bundle
│   └── package.json
├── sample-data/
│   ├── folders/             # Pre-sorted patient folders for Admin upload
│   └── pdfs/                # Multi-page synthetic medical claim PDFs
├── storage/
│   ├── original-documents/  # Uploaded source PDFs
│   ├── tagged-documents/    # Generated split tagged PDFs (AOB.pdf, Bills.pdf, etc.)
│   └── billnexa.db          # Local persistence database
├── supabase/
│   ├── migrations/          # Supabase SQL migrations (schema and RLS policies)
│   └── seed/                # Supabase demo seed SQL script
└── docs/
    ├── README.md
    ├── SETUP.md
    └── DEMO_GUIDE.md
```

---

## 3. Quick Start (Single Server Mode)

Bill Nexa is configured to serve both the backend API and the compiled React frontend from a single FastAPI server on `http://127.0.0.1:8000`.

### Step 1: Initialize Database & Sample Data

```bash
# Generate sample multi-page medical PDFs
python backend/app/utils/generate_sample_pdfs.py

# Initialize and seed database
python backend/app/utils/seed_db.py
```

### Step 2: Build Frontend (Already Built)

```bash
cd frontend
npm run build
cd ..
```

### Step 3: Start Application Server

```bash
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000
```

Open your browser at: **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

---

## 4. Development Mode (Hot-Reload)

To run in live development mode:

**Terminal 1 (Backend API on port 8000):**
```bash
python -m uvicorn backend.app.main:app --reload --port 8000
```

**Terminal 2 (Vite Frontend with hot-reload on port 3000):**
```bash
cd frontend
npm run dev
```

Open your browser at: **[http://localhost:3000](http://localhost:3000)**

---

## 5. Supabase Integration (Optional Remote Database)

By default, Bill Nexa runs out of the box with SQLite storage in `storage/billnexa.db`.
To connect to a live Supabase project:

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Run the SQL files in `supabase/migrations/` in the Supabase SQL Editor:
   - `01_initial_schema.sql`
   - `02_rls_policies.sql`
3. Run `supabase/seed/03_seed_data.sql` to insert master tables and demo users.
4. Set environment variables in `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres
   SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
   SUPABASE_KEY=[YOUR-ANON-KEY]
   SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY]
   ```

---

## 6. AI Engine Configuration

Bill Nexa includes a realistic demo document intelligence mode that extracts printed text, simulated handwriting, ICD/CPT codes, and confidence scores.

To connect an external vision LLM:
```env
AI_PROVIDER=gemini # or openai
AI_API_KEY=your_api_key_here
AI_MODEL_NAME=gemini-1.5-pro
```

If no external key is provided, the application runs seamlessly in verified Demo Mode.

