import { ServiceOffering } from "./types";

export const SERVICES: ServiceOffering[] = [
  {
    id: "call",
    name: "Call support",
    tagline: "Talk a technician through it in real time.",
    priceFrom: 15,
    etaLabel: "Usually answered in under 5 minutes",
  },
  {
    id: "onsite",
    name: "On-site visit",
    tagline: "A technician comes to your home or office.",
    priceFrom: 79,
    etaLabel: "Next available slot, same or next day",
  },
  {
    id: "hardware",
    name: "Hardware repair",
    tagline: "Physical faults: screens, batteries, ports, boards.",
    priceFrom: 49,
    etaLabel: "Diagnostics within 24 hours of drop-off",
  },
  {
    id: "software",
    name: "Software fix",
    tagline: "Remote session for OS, malware, drivers, setup.",
    priceFrom: 35,
    etaLabel: "Remote session, typically same day",
  },
];
