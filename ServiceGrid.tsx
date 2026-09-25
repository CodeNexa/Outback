import { SERVICES } from "@/lib/services";
import ServiceCard from "./ServiceCard";

export default function ServiceGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <h2 className="font-display text-2xl font-medium text-ink">Four ways to get unstuck</h2>
      <p className="mt-2 max-w-lg text-sm text-dim">
        Pick one directly, or let the AI triage on the home page point you to
        the right one.
      </p>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {SERVICES.map((s) => (
          <ServiceCard key={s.id} service={s} />
        ))}
      </div>
    </section>
  );
}
