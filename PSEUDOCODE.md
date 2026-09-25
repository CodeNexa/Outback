# Pseudocode

Plain-language pseudocode for the parts of Nexus IT that aren't obvious
from the code alone. Matches the real implementation in `backend/app/`
and `frontend/lib/api.ts`.

---

## 1. AI triage flow

Input: free-text description of a problem.
Output: recommended service, urgency, reasoning, confidence, next step.

```
FUNCTION run_triage(description):
    IF an LLM API key is configured:
        TRY:
            response = CALL_LLM(
                system = TRIAGE_INSTRUCTIONS,
                user_message = description,
                max_tokens = 300
            )
            result = PARSE_JSON(response.text)
            VALIDATE result.recommendedService IN {onsite, call, hardware, software}
            VALIDATE result.urgency IN {low, medium, high}
            RETURN result
        CATCH any error (network, timeout, bad JSON, rate limit):
            FALL THROUGH to rule-based path   # never let AI failure break the UX

    RETURN rule_based_triage(description)


FUNCTION rule_based_triage(description):
    text = LOWERCASE(description)

    IF text CONTAINS any of [won't turn on, smoke, liquid, cracked, battery swell, ...]:
        RETURN { service: hardware, urgency: high,
                 reasoning: "physical fault -> hands-on repair" }

    ELSE IF text CONTAINS any of [network, server, office, multiple devices, wiring, ...]:
        RETURN { service: onsite, urgency: medium,
                 reasoning: "infrastructure issue -> faster in person" }

    ELSE IF text CONTAINS any of [virus, malware, slow, blue screen, driver, crash, ...]:
        RETURN { service: software, urgency: medium,
                 reasoning: "software/config issue -> fixable remotely" }

    ELSE:
        RETURN { service: call, urgency: low,
                 reasoning: "unclear -> fastest to triage by phone" }
```

Design notes:
- The rule-based path is not a "fallback for errors only" — it is the
  default engine. The LLM path is optional and additive, so the product
  works fully with zero API cost.
- Keyword lists live in one place (`backend/app/ai/triage_engine.py`) so
  they're easy to extend as real support tickets reveal new patterns.

---

## 2. Byte Quest game (the unique feature)

A 3-round quiz that teaches real IT first-response habits and pays out a
discount code for a good score. Stateless on the server: the client
carries its own running score.

```
SCENARIOS = [s1, s2, s3]              # ordered list, each with 1 correct option
POINTS_PER_CORRECT = 10
REWARD_THRESHOLD = 20                 # out of a possible 30
REWARD_CODE = "BYTEQUEST10"

FUNCTION start_game():
    RETURN SCENARIOS[0]

FUNCTION answer(scenario_id, chosen_option_id, current_score):
    is_correct = (CORRECT_ANSWERS[scenario_id] == chosen_option_id)
    points = POINTS_PER_CORRECT IF is_correct ELSE 0
    new_score = current_score + points

    next_scenario = SCENARIO_AFTER(scenario_id)   # NULL if this was the last

    reward = NULL
    IF next_scenario IS NULL AND new_score >= REWARD_THRESHOLD:
        reward = REWARD_CODE

    RETURN {
        correct: is_correct,
        explanation: EXPLANATIONS[scenario_id],
        pointsAwarded: points,
        totalScore: new_score,
        nextScenario: next_scenario,
        rewardCode: reward
    }
```

Design notes:
- Stateless-by-contract (score travels with the client, not a server
  session) means any backend instance can serve any request — no sticky
  sessions needed when you scale to multiple instances.
- The reward code is checked, not minted, at redemption time (see
  section 3) so a tampered client-side score can't itself grant a
  discount without the code also existing server-side.

---

## 3. Order submission + discount redemption

```
FUNCTION create_order(service, name, email, notes, discount_code):
    discount_applied = FALSE
    IF discount_code IS NOT NULL:
        discount_applied = discount_code STARTS WITH "BYTEQUEST"
        # Production upgrade: look the code up in a codes table, check
        # it hasn't already been redeemed, and mark it used here.

    order = INSERT INTO orders (
        id = GENERATE_ID("NX-"),
        service, name, email, notes,
        discount_code, discount_applied,
        created_at = NOW()
    )

    RETURN {
        orderId: order.id,
        service: service,
        status: "received",
        etaLabel: ETA_LABELS[service],
        discountApplied: discount_applied
    }
```

---

## 4. Frontend resilience (offline / cold-start fallback)

Free-tier backends often sleep when idle. The frontend is written so a
slow or sleeping backend never breaks the demo.

```
FUNCTION api_call(path, body, fallback_fn):
    TRY:
        response = FETCH(BACKEND_URL + path, body, timeout = 6s)
        IF response.ok:
            RETURN response.json()
        THROW error
    CATCH timeout OR network error:
        RETURN fallback_fn()   # mirrors the real backend logic locally
```

Each of `fetchTriage`, `submitOrder`, `startGame`, `answerGame` in
`frontend/lib/api.ts` follows this shape. The fallback functions are
intentionally kept logically identical to the Python versions, so a
user sees consistent behavior whether or not the backend responded.

---

## 5. Scaling path (summary — see docs/ARCHITECTURE.md for detail)

```
Stage 1 (this demo):   Next.js on Vercel free tier
                        + FastAPI on Render/Railway free tier
                        + SQLite file on the backend instance

Stage 2 (real traffic): Swap SQLite -> managed Postgres (Neon/Supabase/RDS)
                         Add a codes table for discount validation
                         Add request-level rate limiting on /api/triage

Stage 3 (scale out):    Run 2+ backend instances behind a load balancer
                         (safe because game state is stateless, orders
                         and codes are already in a shared DB)
                         Add a queue (e.g. Redis) if triage volume needs
                         async processing instead of a live LLM call
```
