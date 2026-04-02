import Link from "next/link";

export function Navbar() {
  return (
    <nav className="relative border-b border-surface-border bg-surface">
      {/* Subtle neon line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-neon/20 to-transparent" />

      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-1.5 group">
          <span
            className="text-2xl font-extrabold tracking-tight text-neon uppercase font-display"
          >
            Aleatórios
          </span>
          <span
            className="text-sm font-bold tracking-widest uppercase text-muted group-hover:text-foreground transition-colors"
            style={{ fontFamily: "var(--font-condensed)" }}
          >
            Padel
          </span>
        </Link>

        <Link
          href="/matches/new"
          className="btn-neon px-5 py-2.5 rounded-lg text-sm"
        >
          Nova Partida
        </Link>
      </div>
    </nav>
  );
}
