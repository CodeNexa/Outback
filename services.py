from fastapi import APIRouter

from ..models import ServiceOffering

router = APIRouter(prefix="/api/services", tags=["services"])

CATALOG = [
    ServiceOffering(id="call", name="Call support", tagline="Talk a technician through it in real time.",
                     priceFrom=15, etaLabel="Usually answered in under 5 minutes"),
    ServiceOffering(id="onsite", name="On-site visit", tagline="A technician comes to your home or office.",
                     priceFrom=79, etaLabel="Next available slot, same or next day"),
    ServiceOffering(id="hardware", name="Hardware repair", tagline="Physical faults: screens, batteries, ports, boards.",
                     priceFrom=49, etaLabel="Diagnostics within 24 hours of drop-off"),
    ServiceOffering(id="software", name="Software fix", tagline="Remote session for OS, malware, drivers, setup.",
                     priceFrom=35, etaLabel="Remote session, typically same day"),
]


@router.get("", response_model=list[ServiceOffering])
def list_services():
    # Static list for the demo. Swap for a DB table when services, prices
    # or availability need to change without a redeploy.
    return CATALOG
