# Bill Nexa – Supabase Setup & Configuration Guide

This guide provides the complete, step-by-step instructions for connecting your live Supabase project to **Bill Nexa – AI-Powered Document Processing & Claims Automation System**.

---

## 1. Overview of Supabase Architecture

Bill Nexa integrates with Supabase across three core layers:
1. **Supabase PostgreSQL**: Scalable relational storage with Row Level Security (RLS) enforcing strict tenant & employee assignment isolation.
2. **Supabase Storage**: S3-compatible cloud object storage for incoming multi-page PDFs and split tagged documents (`original-documents`, `tagged-documents`).
3. **Supabase Authentication**: Secure user management with JWT sessions, role management (`admin` / `employee`), and automated profile synchronization.

---

## 2. Quick Setup in 4 Steps

### Step 1: Create a Free Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New Project**.
3. Name your project (e.g., `bill-nexa-production`), set a strong database password, and select your closest region.
4. Wait 1-2 minutes for the database to provision.

---

### Step 2: Copy Project Credentials
In your Supabase project dashboard:
1. Navigate to **Project Settings** (gear icon at the bottom left) -> **API**.
2. Copy the **Project URL** (e.g., `https://xyzcompany.supabase.co`).
3. Copy the **anon / public** API key.
4. (Optional for account provisioning script) Copy the **service_role / secret** API key.

---

### Step 3: Configure Environment Variables
Open the environment files in your Bill Nexa project and paste your keys:

#### In `frontend/.env`:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-publishable-key
```

#### In the root `.env`:
```env
ENV=development
APP_NAME="Bill Nexa"
JWT_SECRET="bill-nexa-enterprise-secret-key-2026"

DATABASE_URL="sqlite:///storage/billnexa.db"

# Supabase Configuration
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-publishable-key"
SUPABASE_URL="https://your-project-id.supabase.co"
SUPABASE_KEY="your-anon-publishable-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-secret-key"

# AI Provider (demo | gemini | openai)
AI_PROVIDER="demo"
AI_API_KEY=""
AI_MODEL_NAME="gemini-1.5-pro"
```

---

### Step 4: Run the Database Setup Script
1. In the Supabase Dashboard, click on **SQL Editor** in the left sidebar.
2. Click **New Query**.
3. Open the file `supabase/setup_complete_billnexa.sql` from this workspace and copy its entire content.
4. Paste it into the Supabase SQL Editor and click **Run**.

This script will automatically create:
- **`employees` table**: User profiles synced with Supabase Auth.
- **`documents` table**: Uploaded document records, page counts, and storage paths.
- **`document_assignments` table**: Assignment tracking for Monesh & Chetan.
- **`claims` table**: Comprehensive claims database with JSONB fields for Patient, Address, Contact, Insurance, Insured, ICD, and CPT records.
- **`document_page_tags` table**: Document tags (`NF-2`, `AOB`, `Bills`, `Medical Report`, etc.) and page ranges.
- **`activity_logs` table**: Real-time audit trail of all actions.
- **Row Level Security (RLS)**: Enforces that employees only view documents and claims assigned to them.
- **Storage Buckets**: `original-documents` and `tagged-documents` with public read policies.
- **Auth Trigger**: `on_auth_user_created` trigger that automatically provisions an employee record whenever a user is created.

---

## 3. Demo Accounts & Provisioning

Bill Nexa uses three accounts:

| Role | Name | Email | Password |
|---|---|---|---|
| **Admin** | System Administrator | `admin@gmail.com` | `Admin@123` |
| **Employee 1** | Monesh Pondhe | `Monesh@gmail.com` | `Monesh@123` |
| **Employee 2** | Chetan Patil | `Chetan@gmail.com` | `Chetan@123` |

### Automatic Provisioning Script
Once you have pasted `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env`, run:
```bash
python -m backend.app.utils.provision_supabase_accounts
```
This script calls the Supabase Auth Admin API to create all three users and link their roles.

### Alternative Manual Creation in Supabase Dashboard
1. Go to **Authentication** -> **Users** -> **Add user** -> **Create user**.
2. Create:
   - `admin@gmail.com` / `Admin@123`
   - `Monesh@gmail.com` / `Monesh@123`
   - `Chetan@gmail.com` / `Chetan@123`
3. Toggle "Auto Confirm User".
4. The database trigger will automatically populate their employee records.

---

## 4. Dual-Mode Operation (Graceful Fallback)

If Supabase credentials are not configured or are temporarily unreachable:
- Bill Nexa **seamlessly runs in Local Demonstration Mode**.
- The application will **never crash** or show a blank screen.
- All features (Folder Dump, Document Assignment, PDF Viewer, AI Extraction, Tagging, Claim Submission, Search) work out-of-the-box using the built-in local backend and SQLite database.
- A status badge in the header shows **"Local Mode"** or **"Supabase Live"** so you always know the current state.

