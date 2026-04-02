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

function MatchRow({ match }: { match: MatchWithDeltas }) {
  const team1 = match.players.filter((p) => p.team === 1);
  const team2 = match.players.filter((p) => p.team === 2);

  const setsDisplay = match.sets
    .map((s) => `${s.team1Score}-${s.team2Score}`)
    .join(" / ");

  const date = new Date(match.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  return (
    <tr className="border-b border-surface-border/50 hover:bg-surface-light/50 transition-colors">
      <td className="py-3 pr-3 text-xs text-muted whitespace-nowrap">{date}</td>
      <td className="py-3 pr-3">
        <div className="space-y-0.5">
          {team1.map((p) => (
            <div key={p.playerId} className="flex items-center gap-1.5">
              <span
                className={`text-sm ${
                  match.team1Won ? "font-semibold text-foreground" : "text-muted"
                }`}
              >
                {p.playerName}
              </span>
              <DeltaBadge delta={p.delta} />
            </div>
          ))}
        </div>
      </td>
      <td className="py-3 px-3 text-center">
        <span
          className="text-sm font-bold tabular-nums text-foreground"
          style={{ fontFamily: "var(--font-condensed)" }}
        >
          {setsDisplay}
        </span>
      </td>
      <td className="py-3 pl-3">
        <div className="space-y-0.5">
          {team2.map((p) => (
            <div
              key={p.playerId}
              className="flex items-center gap-1.5 justify-end"
            >
              <DeltaBadge delta={p.delta} />
              <span
                className={`text-sm ${
                  !match.team1Won
                    ? "font-semibold text-foreground"
                    : "text-muted"
                }`}
              >
                {p.playerName}
              </span>
            </div>
          ))}
        </div>
      </td>
    </tr>
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
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr
              className="border-b border-surface-border text-xs uppercase tracking-wider text-muted"
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              <th className="pb-2 pr-3 text-left">Data</th>
              <th className="pb-2 pr-3 text-left">Time 1</th>
              <th className="pb-2 px-3 text-center">Placar</th>
              <th className="pb-2 pl-3 text-right">Time 2</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((match) => (
              <MatchRow key={match.id} match={match} />
            ))}
          </tbody>
        </table>
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
