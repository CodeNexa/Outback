import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import Column, String, DateTime, Boolean

from .database import Base


class ServiceKind(str, Enum):
    onsite = "onsite"
    call = "call"
    hardware = "hardware"
    software = "software"


class Urgency(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


# ---------- ORM table ----------


class OrderRecord(Base):
    __tablename__ = "orders"

    id = Column(String, primary_key=True, default=lambda: f"NX-{uuid.uuid4().hex[:8].upper()}")
    service = Column(String, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    notes = Column(String, default="")
    discount_code = Column(String, nullable=True)
    discount_applied = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


# ---------- API schemas ----------


class TriageRequest(BaseModel):
    description: str = Field(min_length=8, max_length=1000)


class TriageResponse(BaseModel):
    recommendedService: ServiceKind
    confidence: float
    reasoning: str
    urgency: Urgency
    suggestedNextStep: str


class OrderPayload(BaseModel):
    service: ServiceKind
    name: str
    email: EmailStr
    notes: str = ""
    discountCode: str | None = None


class OrderConfirmation(BaseModel):
    orderId: str
    service: ServiceKind
    status: str = "received"
    etaLabel: str
    discountApplied: bool


class ServiceOffering(BaseModel):
    id: ServiceKind
    name: str
    tagline: str
    priceFrom: float
    etaLabel: str


class GameOption(BaseModel):
    id: str
    label: str


class GameScenario(BaseModel):
    id: str
    prompt: str
    options: list[GameOption]


class GameAnswerRequest(BaseModel):
    scenarioId: str
    optionId: str
    score: int = 0


class GameAnswerResult(BaseModel):
    correct: bool
    explanation: str
    pointsAwarded: int
    totalScore: int
    nextScenario: GameScenario | None
    rewardCode: str | None = None
