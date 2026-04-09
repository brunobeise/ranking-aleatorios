"use client";

import { useState } from "react";
import { MatchWithDeltas } from "@/domain/types";

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
        <span
          className="text-[10px] text-muted uppercase tracking-wider font-bold"
          style={{ fontFamily: "var(--font-condensed)" }}
        >
          {date}
        </span>
        {match.team1Won !== undefined && (
          <span
            className="text-[10px] font-bold uppercase tracking-wider text-neon/60"
            style={{ fontFamily: "var(--font-condensed)" }}
          >
            {match.team1Won ? "Time 1 venceu" : "Time 2 venceu"}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className={`flex-1 min-w-0 ${match.team1Won ? "" : "opacity-60"}`}>
          <div className="space-y-0.5">
            {team1.map((p) => (
              <div key={p.playerId} className="flex items-center gap-1">
                <span
                  className={`text-sm truncate ${
                    match.team1Won ? "font-semibold text-foreground" : "text-muted"
                  }`}
                >
                  {p.playerName}
                </span>
                <DeltaBadge delta={p.delta} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 shrink-0">
          {match.sets.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-light/60 border border-surface-border/40"
            >
              <span
                className={`text-xs font-bold tabular-nums ${
                  s.team1Score > s.team2Score ? "text-neon" : "text-muted"
                }`}
              >
                {s.team1Score}
              </span>
              <span className="text-muted text-[10px]">-</span>
              <span
                className={`text-xs font-bold tabular-nums ${
                  s.team2Score > s.team1Score ? "text-red-400" : "text-muted"
                }`}
              >
                {s.team2Score}
              </span>
            </div>
          ))}
        </div>

        <div className={`flex-1 min-w-0 ${!match.team1Won ? "" : "opacity-60"}`}>
          <div className="space-y-0.5">
            {team2.map((p) => (
              <div key={p.playerId} className="flex items-center gap-1 justify-end">
                <DeltaBadge delta={p.delta} />
                <span
                  className={`text-sm truncate ${
                    !match.team1Won ? "font-semibold text-foreground" : "text-muted"
                  }`}
                >
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

function generateCSV(matches: MatchWithDeltas[]): string {
  const header = "Data,Time 1 - Jogador 1,Time 1 - Jogador 2,Time 2 - Jogador 1,Time 2 - Jogador 2,Sets,Vencedor";
  const rows = matches.map((match) => {
    const team1 = match.players.filter((p) => p.team === 1);
    const team2 = match.players.filter((p) => p.team === 2);
    const date = new Date(match.createdAt).toLocaleDateString("pt-BR");
    const sets = match.sets
      .map((s) => `${s.team1Score}x${s.team2Score}`)
      .join(" | ");
    const winner = match.team1Won ? "Time 1" : "Time 2";

    return [
      date,
      team1[0]?.playerName ?? "",
      team1[1]?.playerName ?? "",
      team2[0]?.playerName ?? "",
      team2[1]?.playerName ?? "",
      sets,
      winner,
    ]
      .map((v) => `"${v}"`)
      .join(",");
  });

  return [header, ...rows].join("\n");
}

function downloadCSV(matches: MatchWithDeltas[]) {
  const csv = generateCSV(matches);
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `partidas-aleatorios-padel.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export function AllMatches({ matches }: { matches: MatchWithDeltas[] }) {
  const [exporting, setExporting] = useState(false);

  function handleExport() {
    setExporting(true);
    try {
      downloadCSV(matches);
    } finally {
      setTimeout(() => setExporting(false), 1000);
    }
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-10 text-muted">
        <p className="text-sm">Nenhuma partida registrada ainda.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-extrabold uppercase tracking-tight text-neon font-display">
            Todas as Partidas
          </h2>
          <span
            className="text-xs text-muted font-bold uppercase tracking-wider"
            style={{ fontFamily: "var(--font-condensed)" }}
          >
            {matches.length} jogos
          </span>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg bg-surface-light border border-surface-border text-muted hover:text-foreground hover:border-neon/30 transition-colors disabled:opacity-50"
          style={{ fontFamily: "var(--font-condensed)" }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          {exporting ? "Exportando..." : "Exportar CSV"}
        </button>
      </div>

      <div>
        {matches.map((match) => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>
    </div>
  );
}
