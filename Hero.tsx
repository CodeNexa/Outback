import Link from "next/link";

export default function Hero() {
  return (
    <section className="trace-grid relative overflow-hidden border-b border-line/60 bg-circuit-fade">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-[1.1fr_0.9fr] md:py-28">
        <div className="flex flex-col justify-center">
          <h1 className="font-display text-4xl font-medium leading-[1.1] text-ink md:text-5xl">
            Tell us what's broken.
            <br />
            We'll route it to the right fix.
          </h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-dim">
            Describe the problem and an AI triage reads it in seconds, pointing
            you to a call, an on-site visit, or a hardware or software repair —
            before you book anything.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/order"
              className="rounded-md bg-signal px-5 py-3 text-sm font-medium text-void transition hover:brightness-95"
            >
              Run AI triage
            </Link>
            <Link
              href="/services"
              className="rounded-md border border-line px-5 py-3 text-sm font-medium text-ink transition hover:border-dim"
            >
              Browse services
            </Link>
          </div>
        </div>

        <SignalPanel />
      </div>
    </section>
  );
}

function SignalPanel() {
  const nodes = [
    { x: 60, y: 40, label: "Call" },
    { x: 220, y: 30, label: "On-site" },
    { x: 250, y: 160, label: "Hardware" },
    { x: 70, y: 175, label: "Software" },
  ];
  const hub = { x: 155, y: 105 };

  return (
    <div className="relative flex items-center justify-center rounded-xl border border-line bg-panel/60 p-6">
      <svg viewBox="0 0 300 210" className="h-auto w-full max-w-sm" aria-hidden="true">
        {nodes.map((n, i) => (
          <line
            key={i}
            x1={hub.x}
            y1={hub.y}
            x2={n.x}
            y2={n.y}
            stroke="#2A3448"
            strokeWidth="1.4"
          />
        ))}
        {nodes.map((n, i) => (
          <line
            key={`pulse-${i}`}
            x1={hub.x}
            y1={hub.y}
            x2={n.x}
            y2={n.y}
            stroke="#4CF2C0"
            strokeWidth="1.4"
            strokeDasharray="6 220"
            className="animate-[dash_3.2s_linear_infinite]"
            style={{ animationDelay: `${i * 0.5}s` }}
          />
        ))}
        <circle cx={hub.x} cy={hub.y} r="10" fill="#7C6CF6" />
        <circle cx={hub.x} cy={hub.y} r="16" fill="none" stroke="#7C6CF6" strokeOpacity="0.35" />
        {nodes.map((n, i) => (
          <g key={`node-${i}`}>
            <circle cx={n.x} cy={n.y} r="5" fill="#0A0E17" stroke="#4CF2C0" strokeWidth="1.6" />
            <text
              x={n.x}
              y={n.y - 12}
              textAnchor="middle"
              fill="#8B96AC"
              fontSize="10"
              fontFamily="var(--font-body)"
            >
              {n.label}
            </text>
          </g>
        ))}
      </svg>
      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -226; }
        }
      `}</style>
    </div>
  );
}
