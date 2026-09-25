import {
  GameAnswerResult,
  GameScenario,
  OrderConfirmation,
  OrderPayload,
  ServiceKind,
  TriageResponse,
} from "./types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

/**
 * Every call below tries the real FastAPI backend first. If the backend
 * is unreachable (e.g. you're only running `npm run dev` and haven't
 * started the Python service yet, or the free-tier backend is asleep),
 * each function falls back to a local mock so the UI still demonstrates
 * the full flow. Swap `FALLBACK_MODE = false` once your backend is live
 * everywhere you deploy, if you'd rather surface real errors instead.
 */
const FALLBACK_MODE = true;

async function safeFetch<T>(path: string, init: RequestInit, fallback: () => T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init.headers || {}) },
      // Keep demo responsive: don't hang forever on a cold free-tier instance.
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error(`Request failed: ${res.status}`);
    return (await res.json()) as T;
  } catch (err) {
    if (FALLBACK_MODE) return fallback();
    throw err;
  }
}

export async function fetchTriage(description: string): Promise<TriageResponse> {
  return safeFetch<TriageResponse>(
    "/api/triage",
    { method: "POST", body: JSON.stringify({ description }) },
    () => mockTriage(description)
  );
}

export async function submitOrder(payload: OrderPayload): Promise<OrderConfirmation> {
  return safeFetch<OrderConfirmation>(
    "/api/orders",
    { method: "POST", body: JSON.stringify(payload) },
    () => ({
      orderId: `LOCAL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      service: payload.service,
      status: "received",
      etaLabel: "Confirmation pending — backend offline (demo mode)",
      discountApplied: Boolean(payload.discountCode),
    })
  );
}

export async function startGame(): Promise<GameScenario> {
  return safeFetch<GameScenario>("/api/game/start", { method: "POST" }, () => MOCK_SCENARIOS[0]);
}

export async function answerGame(
  scenarioId: string,
  optionId: string,
  score: number
): Promise<GameAnswerResult> {
  return safeFetch<GameAnswerResult>(
    "/api/game/answer",
    { method: "POST", body: JSON.stringify({ scenarioId, optionId, score }) },
    () => mockAnswer(scenarioId, optionId, score)
  );
}

/* ---------------- local fallback logic (mirrors backend/app/ai + game) ---------------- */

function mockTriage(description: string): TriageResponse {
  const text = description.toLowerCase();
  let recommendedService: ServiceKind = "call";
  let reasoning = "A quick phone diagnosis is the fastest way to narrow this down.";
  let urgency: TriageResponse["urgency"] = "low";

  if (/(won'?t turn on|smoke|burn|liquid|cracked|screen shatter|battery swell)/.test(text)) {
    recommendedService = "hardware";
    urgency = "high";
    reasoning = "This sounds like a physical fault, which needs hands-on hardware repair.";
  } else if (/(virus|malware|slow|blue screen|update|driver|software|app crash|install)/.test(text)) {
    recommendedService = "software";
    urgency = "medium";
    reasoning = "This reads as a software or configuration issue we can usually fix remotely.";
  } else if (/(network|server|office|multiple (computers|devices)|wiring|setup)/.test(text)) {
    recommendedService = "onsite";
    urgency = "medium";
    reasoning = "Multi-device or infrastructure issues are usually faster to solve in person.";
  }

  return {
    recommendedService,
    confidence: 0.74,
    reasoning,
    urgency,
    suggestedNextStep:
      recommendedService === "hardware"
        ? "Book a hardware drop-off or on-site pickup."
        : recommendedService === "onsite"
        ? "Schedule an on-site visit."
        : recommendedService === "software"
        ? "Start a remote software session."
        : "Request a call back from a technician.",
  };
}

export const MOCK_SCENARIOS: GameScenario[] = [
  {
    id: "s1",
    prompt: "A laptop won't power on at all, not even the charging light. What's the first thing you check?",
    options: [
      { id: "a", label: "Reinstall the operating system" },
      { id: "b", label: "Try a different power outlet and cable" },
      { id: "c", label: "Replace the motherboard" },
      { id: "d", label: "Run a virus scan" },
    ],
  },
  {
    id: "s2",
    prompt: "A user reports the computer is 'very slow' since yesterday. What's the fastest useful first step?",
    options: [
      { id: "a", label: "Open Task Manager / Activity Monitor to check resource usage" },
      { id: "b", label: "Buy a new computer" },
      { id: "c", label: "Reformat the hard drive" },
      { id: "d", label: "Ignore it, it'll resolve itself" },
    ],
  },
  {
    id: "s3",
    prompt: "Wi-Fi drops every few minutes across the whole office, only on this floor. Best next move?",
    options: [
      { id: "a", label: "Restart every laptop one by one" },
      { id: "b", label: "Check the floor's access point / router for overheating or firmware issues" },
      { id: "c", label: "Change everyone's desktop wallpaper" },
      { id: "d", label: "Uninstall the browser" },
    ],
  },
];

const CORRECT_ANSWERS: Record<string, string> = { s1: "b", s2: "a", s3: "b" };
const EXPLANATIONS: Record<string, string> = {
  s1: "Power issues are almost always cable, outlet or charger faults before anything internal.",
  s2: "Checking active processes tells you whether it's one runaway app, malware, or genuine hardware strain — before you do anything drastic.",
  s3: "A pattern isolated to one floor points at shared infrastructure (the access point), not individual machines.",
};

function mockAnswer(scenarioId: string, optionId: string, score: number): GameAnswerResult {
  const correct = CORRECT_ANSWERS[scenarioId] === optionId;
  const pointsAwarded = correct ? 10 : 0;
  const totalScore = score + pointsAwarded;
  const currentIndex = MOCK_SCENARIOS.findIndex((s) => s.id === scenarioId);
  const nextScenario = MOCK_SCENARIOS[currentIndex + 1] || null;

  return {
    correct,
    explanation: EXPLANATIONS[scenarioId] || "",
    pointsAwarded,
    totalScore,
    nextScenario,
    rewardCode: !nextScenario && totalScore >= 20 ? "BYTEQUEST10" : undefined,
  };
}
