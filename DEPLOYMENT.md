# Deploying for free

Two pieces, deployed separately: the Next.js frontend and the FastAPI
backend. Neither host needs a credit card for the tiers below (subject
to each provider's current terms — check before you commit).

## 1. Backend (FastAPI) — Render free web service

1. Push `backend/` to its own GitHub repo (or a subfolder of one repo —
   Render supports a "root directory" setting).
2. On Render: **New > Web Service** → connect the repo.
3. Settings:
   - Root directory: `backend`
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Environment variables (Render dashboard):
   - `ALLOWED_ORIGINS` = your Vercel frontend URL, e.g. `https://nexus-it.vercel.app`
   - `ANTHROPIC_API_KEY` = optional, only if you want real LLM triage
   - `DATABASE_URL` = leave unset to use SQLite, or point at a free
     Postgres instance (Render, Neon and Supabase all offer one)
5. Deploy. Note the resulting URL, e.g. `https://nexus-it-api.onrender.com`.

Free-tier caveat: the service sleeps after inactivity and the next
request wakes it up (10–50s cold start). The frontend already handles
this gracefully via the 6-second timeout + fallback in `lib/api.ts`, so
visitors always see a working page — a first request just may not hit
the real backend until it's awake.

Alternatives: Railway, Fly.io and Deta Space all have comparable free
tiers if Render doesn't fit.

## 2. Frontend (Next.js) — Vercel free tier

1. Push `frontend/` to GitHub.
2. On Vercel: **Add New > Project** → import the repo, root directory `frontend`.
3. Environment variable:
   - `NEXT_PUBLIC_API_BASE` = the Render URL from step 1 above
4. Deploy. Vercel gives you a `*.vercel.app` URL automatically.

## 3. Local development

```bash
# backend
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env                                 # edit if needed
uvicorn main:app --reload

# frontend, in a second terminal
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Visit `http://localhost:3000`. The frontend talks to the backend at
`http://localhost:8000`; if the backend isn't running, every feature
still works using the built-in local fallbacks.

## 4. Custom domain (optional, still free)

Both Vercel and Render support attaching a custom domain on their free
tiers — you only pay for the domain registration itself, not the hosting.
