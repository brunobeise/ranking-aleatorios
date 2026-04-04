"use client";

import { useState } from "react";
import { MatchWithDeltas } from "@/domain/types";

const PAGE_SIZE = 5;

function DeltaBadge({ delta }: { delta: number }) {
  const isPositive = delta > 0;
  return (
    <span
      className={`text-xs font-bold tabular-nums ${
        isPositive ? "text-green-400" : "text-red-400"
      }`}
    >
      {isPositive ? "+" : ""}
      {delta}
    </span>
  );
}

function MatchCard({ match }: { match: MatchWithDeltas }) {
  const team1 = match.players.filter((p) => p.team === 1);
  const team2 = match.players.filter((p) => p.team === 2);

  const date = new Date(match.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  return (
    <div className="border-b border-surface-border/50 py-3 px-1">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-[10px] text-muted uppercase tracking-wider font-bold" style={{ fontFamily: "var(--font-condensed)" }}>{date}</span>
        {match.team1Won !== undefined && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-neon/60" style={{ fontFamily: "var(--font-condensed)" }}>
            {match.team1Won ? "Time 1 venceu" : "Time 2 venceu"}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Time 1 */}
        <div className={`flex-1 min-w-0 ${match.team1Won ? "" : "opacity-60"}`}>
          <div className="space-y-0.5">
            {team1.map((p) => (
              <div key={p.playerId} className="flex items-center gap-1">
                <span className={`text-sm truncate ${match.team1Won ? "font-semibold text-foreground" : "text-muted"}`}>
                  {p.playerName}
                </span>
                <DeltaBadge delta={p.delta} />
              </div>
            ))}
          </div>
        </div>

        {/* Placares dos sets - vertical */}
        <div className="flex flex-col items-center gap-1 shrink-0">
          {match.sets.map((s, i) => (
            <div key={i} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-light/60 border border-surface-border/40">
              <span className={`text-xs font-bold tabular-nums ${s.team1Score > s.team2Score ? "text-neon" : "text-muted"}`}>
                {s.team1Score}
              </span>
              <span className="text-muted text-[10px]">-</span>
              <span className={`text-xs font-bold tabular-nums ${s.team2Score > s.team1Score ? "text-red-400" : "text-muted"}`}>
                {s.team2Score}
              </span>
            </div>
          ))}
        </div>

        {/* Time 2 */}
        <div className={`flex-1 min-w-0 ${!match.team1Won ? "" : "opacity-60"}`}>
          <div className="space-y-0.5">
            {team2.map((p) => (
              <div key={p.playerId} className="flex items-center gap-1 justify-end">
                <DeltaBadge delta={p.delta} />
                <span className={`text-sm truncate ${!match.team1Won ? "font-semibold text-foreground" : "text-muted"}`}>
                  {p.playerName}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MatchHistory({ matches }: { matches: MatchWithDeltas[] }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(matches.length / PAGE_SIZE);
  const paginated = matches.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (matches.length === 0) {
    return (
      <div className="text-center py-10 text-muted">
        <p className="text-sm">Nenhuma partida registrada ainda.</p>
      </div>
    );
  }

  return (
    <div>
      <div>
        {paginated.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4 pt-4 border-t border-surface-border/50">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md bg-surface-light border border-surface-border text-muted hover:text-foreground hover:border-neon/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ fontFamily: "var(--font-condensed)" }}
          >
            Anterior
          </button>
          <span className="text-xs text-muted tabular-nums">
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md bg-surface-light border border-surface-border text-muted hover:text-foreground hover:border-neon/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ fontFamily: "var(--font-condensed)" }}
          >
            Proximo
          </button>
        </div>
      )}
    </div>
  );
}
