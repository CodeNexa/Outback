# Architecture

```
┌─────────────────────┐      HTTPS/JSON       ┌──────────────────────┐
│   Next.js frontend   │  ───────────────────▶ │   FastAPI backend     │
│   (TypeScript, app   │  ◀─────────────────── │   (Python)            │
│   router)             │                       │                       │
│                       │                       │  /api/services        │
│  - Landing + hero     │                       │  /api/triage           │
│  - Service catalog    │                       │  /api/orders           │
│  - AI triage widget   │                       │  /api/game/start        │
│  - Byte Quest game    │                       │  /api/game/answer        │
│  - Booking form       │                       │                          │
└───────────┬───────────┘                       └───────────┬──────────────┘
            │ falls back to local mock                       │
            │ logic if backend is                            ▼
            │ unreachable/slow                    ┌──────────────────────┐
            ▼                                      │  SQLite (demo) /      │
   (nothing further needed                         │  Postgres (production)│
    for the frontend to work)                      │  - orders table        │
                                                     └──────────────────────┘
                                                                │
                                                                ▼
                                                     ┌──────────────────────┐
                                                     │ Optional: Claude API   │
                                                     │ for LLM-backed triage  │
                                                     │ (ANTHROPIC_API_KEY)    │
                                                     └──────────────────────┘
```

## Why this split

- **Next.js frontend** owns everything the user sees: routing, forms,
  the game UI, the "futuristic" circuit-panel visuals. It's a static/SSR
  app that deploys trivially to any free static/edge host.
- **FastAPI backend** owns business logic and state: triage decisions,
  order records, game scoring. Keeping this in Python makes it easy to
  swap in real ML/AI tooling (scikit-learn, spaCy, an LLM SDK) later
  without touching the frontend.
- **The contract between them is a small, typed JSON API.** `frontend/lib/types.ts`
  and `backend/app/models.py` intentionally mirror each other field-for-field.

## Scaling this up

| Concern | Demo setup | Scale-up path |
|---|---|---|
| Frontend hosting | Vercel free tier | Vercel Pro / any edge host — no code change |
| Backend hosting | Render/Railway free tier (1 instance) | Add instances behind a load balancer — the API is stateless per-request |
| Database | SQLite file | Managed Postgres (Neon, Supabase, RDS) — swap `DATABASE_URL` only |
| AI triage | Rule-based keyword engine (free) | Add `ANTHROPIC_API_KEY` to enable the real LLM path, already wired in |
| Discount codes | String-prefix check | A `codes` table with expiry + redemption tracking |
| Auth | None (demo) | Add a users table + session/JWT layer in FastAPI |
| Rate limiting | None (demo) | `slowapi` or a reverse-proxy rule on `/api/triage` |

## Why the backend is safe to scale horizontally

- No in-memory session state: the game passes score in the request body;
  the backend doesn't remember anything between calls except what's in
  the database.
- Every write (orders) goes straight to the DB, so any instance can
  serve any request — no sticky sessions required.
