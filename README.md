# Nexus IT — demo

A working demo of an online IT support shop: book on-site visits, phone
support, hardware repair or software fixes; get an AI triage recommendation
before you book; and play **Byte Quest**, a 3-round troubleshooting game
that rewards a good score with a real discount code.

```
it-shop-demo/
├── frontend/     Next.js 14 + TypeScript (App Router, Tailwind CSS)
├── backend/      FastAPI (Python) — triage, orders, game logic, SQLite
├── docs/
│   ├── PSEUDOCODE.md      algorithms in plain pseudocode
│   ├── ARCHITECTURE.md    system diagram + scaling path
│   └── DEPLOYMENT.md      step-by-step free hosting (Vercel + Render)
└── README.md     you are here
```

## What's inside

- **Four services**: call support, on-site visits, hardware repair,
  software fixes — each with its own booking flow.
- **AI triage**: describe your problem in plain English, get a
  recommended service, urgency and reasoning. Runs on a free rule-based
  engine by default; add `ANTHROPIC_API_KEY` on the backend to switch on
  a real LLM call — no frontend changes needed either way.
- **Byte Quest** (the unique feature): a short, genuinely useful
  troubleshooting quiz. It teaches real first-response habits ("check
  the cable before the motherboard") and pays out a discount code for a
  good score — equal parts educational and useful.
- **A distinct visual identity**: a dark circuit/signal theme (not a
  generic SaaS card grid) built entirely in SVG + CSS, so there are no
  external image dependencies to break on a free host. See
  `frontend/components/Hero.tsx` for the animated signal panel.
- **Resilient by default**: every frontend API call has a local fallback
  that mirrors the backend's own logic, so the site still fully works if
  the free-tier backend is cold-starting or briefly down.

## Quick start

See `docs/DEPLOYMENT.md` for full instructions. Short version:

```bash
cd backend && pip install -r requirements.txt && uvicorn main:app --reload
cd frontend && npm install && npm run dev
```

Then open `http://localhost:3000`.

## Note on the visuals

The brief asked for a "futuristic" display — this demo builds that as
inline SVG/CSS (the signal panel in the hero, hexagon service icons,
the circuit-grid backdrop) rather than a static PNG, so it stays crisp
at any size, costs nothing to host, and is easy to re-theme by editing
the color tokens in `frontend/tailwind.config.ts`. If you'd rather use a
designed image asset instead, drop a PNG/SVG into `frontend/public/` and
reference it with Next's `<Image />` component in `Hero.tsx`.

## Scaling this into something real

This is a demo, not a production system — see `docs/ARCHITECTURE.md`
for exactly what to swap (SQLite → Postgres, single instance → load
balanced, rule-based triage → LLM, string-check discount codes → a real
codes table) as traffic grows.
