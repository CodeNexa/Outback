"use client";

import { useState } from "react";
import Link from "next/link";
import { fetchTriage } from "@/lib/api";
import { TriageResponse } from "@/lib/types";
import { SERVICES } from "@/lib/services";

const URGENCY_COLOR: Record<TriageResponse["urgency"], string> = {
  low: "text-signal",
  medium: "text-flare",
  high: "text-danger",
};

export default function AITriageWidget() {
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<TriageResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (description.trim().length < 8) {
      setError("Add a bit more detail so the triage can read it correctly.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetchTriage(description.trim());
      setResult(res);
    } catch {
      setError("Triage is unavailable right now. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  const matchedService = result
    ? SERVICES.find((s) => s.id === result.recommendedService)
    : null;

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="rounded-xl border border-line bg-panel p-6 md:p-10">
        <h2 className="font-display text-2xl font-medium text-ink">AI triage</h2>
        <p className="mt-2 max-w-lg text-sm text-dim">
          Describe what's happening in your own words. The triage reads it and
          suggests which service fits best.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="e.g. My laptop screen went black after an update and won't restart."
            className="w-full rounded-md border border-line bg-panel2 p-4 text-sm text-ink placeholder:text-dim/70 focus:border-signal"
          />
          {error && <p className="text-sm text-danger">{error}</p>}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-signal px-5 py-2.5 text-sm font-medium text-void transition hover:brightness-95 disabled:opacity-60"
            >
              {loading ? "Reading your issue…" : "Get a recommendation"}
            </button>
          </div>
        </form>

        {result && matchedService && (
          <div className="mt-8 rounded-lg border border-line bg-panel2 p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-display text-lg font-medium text-ink">
                Recommended: {matchedService.name}
              </p>
              <span className={`text-xs font-medium uppercase ${URGENCY_COLOR[result.urgency]}`}>
                {result.urgency} urgency
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-dim">{result.reasoning}</p>
            <p className="mt-3 text-xs text-dim">
              Confidence: {Math.round(result.confidence * 100)}% &middot; {result.suggestedNextStep}
            </p>
            <Link
              href={{ pathname: "/order", query: { service: matchedService.id } }}
              className="mt-5 inline-block rounded-md border border-signal px-4 py-2 text-sm font-medium text-signal transition hover:bg-signal hover:text-void"
            >
              Book {matchedService.name.toLowerCase()}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
