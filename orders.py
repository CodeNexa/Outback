from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import OrderConfirmation, OrderPayload, OrderRecord

router = APIRouter(prefix="/api/orders", tags=["orders"])

ETA_LABELS = {
    "call": "Usually answered in under 5 minutes",
    "onsite": "Confirmed slot within 24 hours",
    "hardware": "Diagnostics within 24 hours of drop-off",
    "software": "Remote session, typically same day",
}

# Any code is treated as valid in this demo. In production, validate
# against a codes table (with expiry / redemption tracking) instead.
VALID_DISCOUNT_PREFIXES = ("BYTEQUEST",)


@router.post("", response_model=OrderConfirmation)
def create_order(payload: OrderPayload, db: Session = Depends(get_db)):
    discount_applied = bool(
        payload.discountCode and payload.discountCode.upper().startswith(VALID_DISCOUNT_PREFIXES)
    )

    record = OrderRecord(
        service=payload.service.value,
        name=payload.name,
        email=payload.email,
        notes=payload.notes,
        discount_code=payload.discountCode,
        discount_applied=discount_applied,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    return OrderConfirmation(
        orderId=record.id,
        service=payload.service,
        status="received",
        etaLabel=ETA_LABELS[payload.service.value],
        discountApplied=discount_applied,
    )
