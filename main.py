"""
Nexus IT backend -- FastAPI service for the Next.js frontend.

Run locally:
    pip install -r requirements.txt
    uvicorn main:app --reload

Endpoints:
    GET  /api/health
    GET  /api/services
    POST /api/triage
    POST /api/orders
    POST /api/game/start
    POST /api/game/answer

See docs/DEPLOYMENT.md for free-hosting instructions and
docs/PSEUDOCODE.md for the algorithms behind triage and Byte Quest.
"""

import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from app.database import Base, engine  # noqa: E402
from app.routers import game, orders, services, triage  # noqa: E402

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Nexus IT API", version="1.0.0")

allowed_origins = [
    o.strip() for o in os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",") if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(services.router)
app.include_router(triage.router)
app.include_router(orders.router)
app.include_router(game.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
