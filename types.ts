export type ServiceKind = "onsite" | "call" | "hardware" | "software";

export interface ServiceOffering {
  id: ServiceKind;
  name: string;
  tagline: string;
  priceFrom: number;
  etaLabel: string;
}

export interface TriageRequest {
  description: string;
}

export interface TriageResponse {
  recommendedService: ServiceKind;
  confidence: number; // 0-1
  reasoning: string;
  urgency: "low" | "medium" | "high";
  suggestedNextStep: string;
}

export interface OrderPayload {
  service: ServiceKind;
  name: string;
  email: string;
  notes: string;
  discountCode?: string;
}

export interface OrderConfirmation {
  orderId: string;
  service: ServiceKind;
  status: "received";
  etaLabel: string;
  discountApplied: boolean;
}

export interface GameScenario {
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
}

export interface GameAnswerResult {
  correct: boolean;
  explanation: string;
  pointsAwarded: number;
  totalScore: number;
  nextScenario: GameScenario | null;
  rewardCode?: string;
}
