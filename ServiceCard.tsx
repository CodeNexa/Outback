import Link from "next/link";
import { ServiceOffering } from "@/lib/types";

const ICON_PATHS: Record<string, string> = {
  call: "M6 3h3l2 5-2.5 1.5a11 11 0 0 0 5 5L15 12l5 2v3a2 2 0 0 1-2 2C10.5 19 5 13.5 5 6a2 2 0 0 1 1-3z",
  onsite: "M4 11 12 4l8 7M6 10v9h5v-5h2v5h5v-9",
  hardware: "M4 6h16v9H4zM8 19h8M9 15v4M15 15v4",
  software: "M4 5h16v11H4zM4 16l4 4M20 16l-4 4M4 5l8 6 8-6",
};

export default function ServiceCard({ service }: { service: ServiceOffering }) {
  return (
    <div className="flex flex-col justify-between rounded-lg border border-line bg-panel p-6">
      <div>
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d={ICON_PATHS[service.id]}
            stroke="#4CF2C0"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h3 className="mt-4 font-display text-lg font-medium text-ink">{service.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-dim">{service.tagline}</p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
        <div>
          <p className="text-sm text-ink">From ${service.priceFrom}</p>
          <p className="text-xs text-dim">{service.etaLabel}</p>
        </div>
        <Link
          href={{ pathname: "/order", query: { service: service.id } }}
          className="rounded-md border border-line px-3 py-1.5 text-sm text-ink transition hover:border-signal hover:text-signal"
        >
          Book
        </Link>
      </div>
    </div>
  );
}
