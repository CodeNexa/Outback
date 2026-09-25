from fastapi import APIRouter

from ..game.logic import evaluate, first_scenario
from ..models import GameAnswerRequest, GameAnswerResult, GameScenario

router = APIRouter(prefix="/api/game", tags=["game"])


@router.post("/start", response_model=GameScenario)
def start():
    return first_scenario()


@router.post("/answer", response_model=GameAnswerResult)
def answer(payload: GameAnswerRequest):
    return evaluate(payload.scenarioId, payload.optionId, payload.score)
