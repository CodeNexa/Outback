"""
Triage engine: takes a free-text description of an IT problem and
returns a recommended service, urgency and reasoning.

Two modes:
  1. LLM mode -- if ANTHROPIC_API_KEY is set, calls the Claude API with a
     constrained prompt and parses a strict JSON response.
  2. Rule-based fallback -- always available, zero cost, used when no key
     is configured or the API call fails. This is what runs on a bare
     free-tier deploy with no keys added, so the demo always works.

See docs/PSEUDOCODE.md for the algorithm in plain pseudocode.
"""

import json
import os
import re

import httpx

from ..models import ServiceKind, Urgency

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "").strip()
ANTHROPIC_MODEL = os.getenv("ANTHROPIC_MODEL", "claude-sonnet-4-6")

SYSTEM_PROMPT = """You are an IT support triage assistant. Read the user's
description of a problem and respond with ONLY a JSON object, no prose,
no markdown fences, matching exactly this shape:

{
  "recommendedService": "onsite" | "call" | "hardware" | "software",
  "confidence": <float 0.0-1.0>,
  "reasoning": "<one sentence, plain language>",
  "urgency": "low" | "medium" | "high",
  "suggestedNextStep": "<one short sentence, imperative>"
}

Guidance:
- "hardware": physical damage, won't power on, liquid damage, cracked
  screens, swollen batteries, broken ports.
- "software": OS errors, malware, driver issues, slow performance,
  crashes, installs/updates.
- "onsite": multi-device or office/network/infrastructure problems, or
  anything that clearly needs hands-on access to several machines.
- "call": anything simple enough to talk through, or when you are unsure.
"""


async def run_triage(description: str) -> dict:
    if ANTHROPIC_API_KEY:
        try:
            return await _llm_triage(description)
        except Exception:
            # Any failure (network, bad JSON, rate limit) -> fall back.
            pass
    return _rule_based_triage(description)


async def _llm_triage(description: str) -> dict:
    async with httpx.AsyncClient(timeout=10) as client:
        resp = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": ANTHROPIC_MODEL,
                "max_tokens": 300,
                "system": SYSTEM_PROMPT,
                "messages": [{"role": "user", "content": description}],
            },
        )
        resp.raise_for_status()
        data = resp.json()
        text = "".join(
            block.get("text", "") for block in data.get("content", []) if block.get("type") == "text"
        )
        cleaned = re.sub(r"```json|```", "", text).strip()
        parsed = json.loads(cleaned)

        # Validate against the enums; a malformed field falls back to rules.
        ServiceKind(parsed["recommendedService"])
        Urgency(parsed["urgency"])
        return parsed


def _rule_based_triage(description: str) -> dict:
    text = description.lower()

    hardware_terms = ["won't turn on", "wont turn on", "smoke", "burn", "liquid",
                       "cracked", "shatter", "battery swell", "no power", "broken screen"]
    software_terms = ["virus", "malware", "slow", "blue screen", "update", "driver",
                       "crash", "install", "freeze", "error message"]
    onsite_terms = ["network", "server", "office", "multiple computers", "multiple devices",
                     "wiring", "setup", "printer"]

    if any(t in text for t in hardware_terms):
        service, urgency, reasoning = (
            ServiceKind.hardware,
            Urgency.high,
            "This sounds like a physical fault, which needs hands-on hardware repair.",
        )
    elif any(t in text for t in onsite_terms):
        service, urgency, reasoning = (
            ServiceKind.onsite,
            Urgency.medium,
            "Multi-device or infrastructure issues are usually faster to solve in person.",
        )
    elif any(t in text for t in software_terms):
        service, urgency, reasoning = (
            ServiceKind.software,
            Urgency.medium,
            "This reads as a software or configuration issue we can usually fix remotely.",
        )
    else:
        service, urgency, reasoning = (
            ServiceKind.call,
            Urgency.low,
            "A quick phone diagnosis is the fastest way to narrow this down.",
        )

    next_steps = {
        ServiceKind.hardware: "Book a hardware drop-off or on-site pickup.",
        ServiceKind.onsite: "Schedule an on-site visit.",
        ServiceKind.software: "Start a remote software session.",
        ServiceKind.call: "Request a call back from a technician.",
    }

    return {
        "recommendedService": service.value,
        "confidence": 0.7,
        "reasoning": reasoning,
        "urgency": urgency.value,
        "suggestedNextStep": next_steps[service],
    }
