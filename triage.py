from fastapi import APIRouter

from ..ai.triage_engine import run_triage
from ..models import TriageRequest, TriageResponse

router = APIRouter(prefix="/api/triage", tags=["triage"])


@router.post("", response_model=TriageResponse)
async def triage(payload: TriageRequest):
    result = await run_triage(payload.description)
    return TriageResponse(**result)
