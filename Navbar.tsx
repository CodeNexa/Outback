import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-void/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2.5">
          <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
            <polygon
              points="13,1 24,7 24,19 13,25 2,19 2,7"
              fill="none"
              stroke="#4CF2C0"
              strokeWidth="1.6"
            />
            <circle cx="13" cy="13" r="3.2" fill="#7C6CF6" />
          </svg>
          <span className="font-display text-lg font-medium tracking-tight text-ink">
            Nexus IT
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-dim md:flex">
          <Link href="/services" className="transition hover:text-ink">
            Services
          </Link>
          <Link href="/game" className="transition hover:text-ink">
            Byte Quest
          </Link>
          <Link href="/order" className="transition hover:text-ink">
            Book support
          </Link>
        </nav>

        <Link
          href="/order"
          className="rounded-md bg-signal px-4 py-2 text-sm font-medium text-void transition hover:brightness-95"
        >
          Get help now
        </Link>
      </div>
    </header>
  );
}
