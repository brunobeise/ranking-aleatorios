"use client";

import { useMemo, useState } from "react";
import { MatchWithDeltas, RankedPlayer } from "@/domain/types";

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

function ResultTag({ won }: { won: boolean }) {
  return (
    <span
      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
        won
          ? "bg-green-500/15 text-green-400 border border-green-500/30"
          : "bg-red-500/15 text-red-400 border border-red-500/30"
      }`}
      style={{ fontFamily: "var(--font-condensed)" }}
    >
      {won ? "Vitoria" : "Derrota"}
    </span>
  );
}

function MatchCard({
  match,
  playerId,
}: {
  match: MatchWithDeltas;
  playerId: string;
}) {
  const team1 = match.players.filter((p) => p.team === 1);
  const team2 = match.players.filter((p) => p.team === 2);

  const playerTeam = match.players.find((p) => p.playerId === playerId)?.team;
  const playerWon = playerTeam === 1 ? match.team1Won : !match.team1Won;

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
        <ResultTag won={playerWon} />
      </div>

      <div className="flex items-center gap-2">
        {/* Time 1 */}
        <div
          className={`flex-1 min-w-0 ${match.team1Won ? "" : "opacity-60"}`}
        >
          <div className="space-y-0.5">
            {team1.map((p) => (
              <div key={p.playerId} className="flex items-center gap-1">
                <span
                  className={`text-sm truncate ${
                    match.team1Won
                      ? "font-semibold text-foreground"
                      : "text-muted"
                  }`}
                >
                  {p.playerName}
                </span>
                <DeltaBadge delta={p.delta} />
              </div>
            ))}
          </div>
        </div>

        {/* Placares dos sets */}
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

        {/* Time 2 */}
        <div
          className={`flex-1 min-w-0 ${!match.team1Won ? "" : "opacity-60"}`}
        >
          <div className="space-y-0.5">
            {team2.map((p) => (
              <div
                key={p.playerId}
                className="flex items-center gap-1 justify-end"
              >
                <DeltaBadge delta={p.delta} />
                <span
                  className={`text-sm truncate ${
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
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  playerName: string;
  playerPhoto: string | null;
  wins: number;
  losses: number;
  total: number;
  legend: string;
}

function StatCard({
  title,
  playerName,
  playerPhoto,
  wins,
  losses,
  total,
  legend,
}: StatCardProps) {
  const initials = playerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
  const winPercent = total > 0 ? (wins / total) * 100 : 0;

  return (
    <div className="card-dark-glow p-4 flex flex-col gap-3">
      <span
        className="text-[11px] font-bold uppercase tracking-wider text-muted"
        style={{ fontFamily: "var(--font-condensed)" }}
      >
        {title}
      </span>
      <div className="flex items-center gap-3">
        {playerPhoto ? (
          <img
            src={playerPhoto}
            alt={playerName}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-surface-border shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center text-neon font-bold text-sm ring-2 ring-surface-border shrink-0">
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <span className="text-sm font-semibold text-foreground truncate block">
            {playerName}
          </span>
          <span className="text-xs text-muted">{total} jogos</span>
        </div>
        <div className="ml-auto text-right">
          <span className="text-lg font-bold text-neon">{winRate}%</span>
          <span className="text-[10px] text-muted block -mt-1">WR</span>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="w-full h-1.5 rounded-full bg-surface-light overflow-hidden flex">
          <div
            className="h-full rounded-full bg-neon/50"
            style={{ width: `${winPercent}%` }}
          />
          <div
            className="h-full bg-red-500/30"
            style={{ width: `${100 - winPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-muted">
          <span>{wins}V</span>
          <span>{losses}D</span>
        </div>
        <p className="text-[11px] text-muted leading-snug mt-0.5 text-center">
          {legend}
        </p>
      </div>
    </div>
  );
}

function PlayerMiniAvatar({
  name,
  photoUrl,
}: {
  name: string;
  photoUrl: string | null;
}) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className="w-12 h-12 rounded-full object-cover ring-2 ring-neon/40"
      />
    );
  }
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return (
    <div className="w-12 h-12 rounded-full bg-surface-light flex items-center justify-center text-neon font-bold text-sm ring-2 ring-neon/40">
      {initials}
    </div>
  );
}

interface DuoSummaryCardProps {
  player: RankedPlayer;
  partner: RankedPlayer;
  wins: number;
  losses: number;
  total: number;
}

function DuoSummaryCard({
  player,
  partner,
  wins,
  losses,
  total,
}: DuoSummaryCardProps) {
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
  const winPercent = total > 0 ? (wins / total) * 100 : 0;

  return (
    <div className="card-dark-glow p-4 flex flex-col gap-3">
      <span
        className="text-[11px] font-bold uppercase tracking-wider text-muted"
        style={{ fontFamily: "var(--font-condensed)" }}
      >
        A Dupla
      </span>
      <div className="flex items-center gap-3">
        <div className="flex items-center -space-x-3 shrink-0">
          <PlayerMiniAvatar name={player.name} photoUrl={player.photoUrl} />
          <PlayerMiniAvatar name={partner.name} photoUrl={partner.photoUrl} />
        </div>
        <div className="min-w-0 flex-1">
          <span className="text-sm font-semibold text-foreground truncate block">
            {player.name.split(" ")[0]} & {partner.name.split(" ")[0]}
          </span>
          <span className="text-xs text-muted">{total} jogos juntos</span>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-neon">{winRate}%</span>
          <span className="text-[10px] text-muted block -mt-1">WR</span>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <div className="w-full h-1.5 rounded-full bg-surface-light overflow-hidden flex">
          <div
            className="h-full rounded-full bg-neon/50"
            style={{ width: `${winPercent}%` }}
          />
          <div
            className="h-full bg-red-500/30"
            style={{ width: `${100 - winPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-muted">
          <span>{wins}V</span>
          <span>{losses}D</span>
        </div>
      </div>
    </div>
  );
}

function computePlayerStats(
  playerId: string,
  matches: MatchWithDeltas[],
  allPlayers: RankedPlayer[]
) {
  const playerMatches = matches.filter((m) =>
    m.players.some((p) => p.playerId === playerId)
  );

  const partnerWins = new Map<string, number>();
  const partnerTotal = new Map<string, number>();
  const opponentLosses = new Map<string, number>();
  const opponentWins = new Map<string, number>();
  const opponentTotal = new Map<string, number>();

  for (const match of playerMatches) {
    const playerData = match.players.find((p) => p.playerId === playerId)!;
    const playerTeam = playerData.team;
    const playerWon = playerTeam === 1 ? match.team1Won : !match.team1Won;

    const teammates = match.players.filter(
      (p) => p.team === playerTeam && p.playerId !== playerId
    );
    for (const t of teammates) {
      partnerTotal.set(t.playerId, (partnerTotal.get(t.playerId) || 0) + 1);
      if (playerWon) {
        partnerWins.set(t.playerId, (partnerWins.get(t.playerId) || 0) + 1);
      }
    }

    const opponents = match.players.filter((p) => p.team !== playerTeam);
    for (const o of opponents) {
      opponentTotal.set(o.playerId, (opponentTotal.get(o.playerId) || 0) + 1);
      if (playerWon) {
        opponentLosses.set(
          o.playerId,
          (opponentLosses.get(o.playerId) || 0) + 1
        );
      } else {
        opponentWins.set(o.playerId, (opponentWins.get(o.playerId) || 0) + 1);
      }
    }
  }

  const playerMap = new Map(allPlayers.map((p) => [p.id, p]));

  let bestPartner: { id: string; wins: number; total: number } | null = null;
  for (const [partnerId, wins] of partnerWins) {
    const total = partnerTotal.get(partnerId) || 0;
    if (
      !bestPartner ||
      wins > bestPartner.wins ||
      (wins === bestPartner.wins && total < bestPartner.total)
    ) {
      bestPartner = { id: partnerId, wins, total };
    }
  }

  let biggestVictim:
    | { id: string; losses: number; total: number; score: number }
    | null = null;
  for (const [oppId, losses] of opponentLosses) {
    const total = opponentTotal.get(oppId) || 0;
    if (total < 2) continue;
    const score = (losses * losses) / total;
    if (!biggestVictim || score > biggestVictim.score) {
      biggestVictim = { id: oppId, losses, total, score };
    }
  }

  let biggestNemesis:
    | { id: string; wins: number; total: number; score: number }
    | null = null;
  for (const [oppId, wins] of opponentWins) {
    const total = opponentTotal.get(oppId) || 0;
    if (total < 2) continue;
    const score = (wins * wins) / total;
    if (!biggestNemesis || score > biggestNemesis.score) {
      biggestNemesis = { id: oppId, wins, total, score };
    }
  }

  return {
    playerMatches,
    bestPartner: bestPartner
      ? {
          player: playerMap.get(bestPartner.id)!,
          wins: bestPartner.wins,
          total: bestPartner.total,
        }
      : null,
    biggestVictim: biggestVictim
      ? {
          player: playerMap.get(biggestVictim.id)!,
          losses: biggestVictim.losses,
          total: biggestVictim.total,
        }
      : null,
    biggestNemesis: biggestNemesis
      ? {
          player: playerMap.get(biggestNemesis.id)!,
          wins: biggestNemesis.wins,
          total: biggestNemesis.total,
        }
      : null,
  };
}

function computeDuoStats(
  playerId: string,
  partnerId: string,
  duoMatches: MatchWithDeltas[],
  allPlayers: RankedPlayer[]
) {
  let wins = 0;
  let losses = 0;

  // Para cada oponente: quantas vezes a dupla enfrentou, ganhou e perdeu
  const opponentStats = new Map<
    string,
    { total: number; duoWins: number; duoLosses: number }
  >();

  for (const match of duoMatches) {
    const playerData = match.players.find((p) => p.playerId === playerId)!;
    const duoTeam = playerData.team;
    const duoWon = duoTeam === 1 ? match.team1Won : !match.team1Won;

    if (duoWon) wins++;
    else losses++;

    const opponents = match.players.filter((p) => p.team !== duoTeam);
    for (const o of opponents) {
      const stat = opponentStats.get(o.playerId) || {
        total: 0,
        duoWins: 0,
        duoLosses: 0,
      };
      stat.total++;
      if (duoWon) stat.duoWins++;
      else stat.duoLosses++;
      opponentStats.set(o.playerId, stat);
    }
  }

  // Pedra no sapato da dupla: oponente que mais venceu a dupla (score ponderado, min 2)
  let nemesis:
    | { id: string; total: number; opponentWins: number; score: number }
    | null = null;
  for (const [oppId, stat] of opponentStats) {
    if (stat.total < 2) continue;
    const score = (stat.duoLosses * stat.duoLosses) / stat.total;
    if (!nemesis || score > nemesis.score) {
      nemesis = {
        id: oppId,
        total: stat.total,
        opponentWins: stat.duoLosses,
        score,
      };
    }
  }

  // Fregues da dupla: oponente que mais perdeu para a dupla (score ponderado, min 2)
  let victim:
    | { id: string; total: number; opponentLosses: number; score: number }
    | null = null;
  for (const [oppId, stat] of opponentStats) {
    if (stat.total < 2) continue;
    const score = (stat.duoWins * stat.duoWins) / stat.total;
    if (!victim || score > victim.score) {
      victim = {
        id: oppId,
        total: stat.total,
        opponentLosses: stat.duoWins,
        score,
      };
    }
  }

  const playerMap = new Map(allPlayers.map((p) => [p.id, p]));

  return {
    wins,
    losses,
    total: duoMatches.length,
    nemesis: nemesis
      ? {
          player: playerMap.get(nemesis.id)!,
          opponentWins: nemesis.opponentWins,
          total: nemesis.total,
        }
      : null,
    victim: victim
      ? {
          player: playerMap.get(victim.id)!,
          opponentLosses: victim.opponentLosses,
          total: victim.total,
        }
      : null,
  };
}

interface PlayerProfileContentProps {
  player: RankedPlayer;
  matchHistory: MatchWithDeltas[];
  allPlayers: RankedPlayer[];
}

export function PlayerProfileContent({
  player,
  matchHistory,
  allPlayers,
}: PlayerProfileContentProps) {
  const [partnerId, setPartnerId] = useState<string>("");

  const playerMatches = useMemo(
    () =>
      matchHistory.filter((m) =>
        m.players.some((p) => p.playerId === player.id)
      ),
    [matchHistory, player.id]
  );

  // Lista de parceiros (jogadores que ja jogaram no mesmo time pelo menos uma vez)
  const partners = useMemo(() => {
    const ids = new Set<string>();
    for (const match of playerMatches) {
      const data = match.players.find((p) => p.playerId === player.id)!;
      const teammates = match.players.filter(
        (p) => p.team === data.team && p.playerId !== player.id
      );
      for (const t of teammates) ids.add(t.playerId);
    }
    return Array.from(ids)
      .map((id) => allPlayers.find((p) => p.id === id))
      .filter((p): p is RankedPlayer => !!p)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [playerMatches, allPlayers, player.id]);

  const isDuoMode = partnerId !== "";

  // Partidas exibidas: filtradas para a dupla quando ha selecao
  const duoMatches = useMemo(() => {
    if (!isDuoMode) return playerMatches;
    return playerMatches.filter((m) => {
      const data = m.players.find((p) => p.playerId === player.id)!;
      return m.players.some(
        (p) => p.playerId === partnerId && p.team === data.team
      );
    });
  }, [playerMatches, partnerId, isDuoMode, player.id]);

  const playerStats = useMemo(
    () => computePlayerStats(player.id, matchHistory, allPlayers),
    [player.id, matchHistory, allPlayers]
  );

  const duoStats = useMemo(() => {
    if (!isDuoMode) return null;
    return computeDuoStats(player.id, partnerId, duoMatches, allPlayers);
  }, [player.id, partnerId, duoMatches, allPlayers, isDuoMode]);

  const partner = isDuoMode
    ? allPlayers.find((p) => p.id === partnerId) || null
    : null;

  const firstName = player.name.split(" ")[0];

  return (
    <>
      {/* Seletor de dupla */}
      {partners.length > 0 && (
        <div className="card-dark-glow p-4 mb-6">
          <label
            className="text-[11px] font-bold uppercase tracking-wider text-muted block mb-2"
            style={{ fontFamily: "var(--font-condensed)" }}
          >
            Analise de Dupla
          </label>
          <div className="flex items-center gap-2">
            <select
              value={partnerId}
              onChange={(e) => setPartnerId(e.target.value)}
              className="flex-1 bg-surface-light border border-surface-border rounded-md px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-neon/40"
            >
              <option value="">Todas as partidas (sem filtro)</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>
                  Com {p.name}
                </option>
              ))}
            </select>
            {isDuoMode && (
              <button
                type="button"
                onClick={() => setPartnerId("")}
                className="text-xs font-bold uppercase tracking-wider text-muted hover:text-neon px-3 py-2 transition-colors"
                style={{ fontFamily: "var(--font-condensed)" }}
              >
                Limpar
              </button>
            )}
          </div>
        </div>
      )}

      {/* Cards de stats */}
      {isDuoMode && duoStats && partner ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <DuoSummaryCard
            player={player}
            partner={partner}
            wins={duoStats.wins}
            losses={duoStats.losses}
            total={duoStats.total}
          />
          {duoStats.victim && (
            <StatCard
              title="Fregues da Dupla"
              playerName={duoStats.victim.player.name}
              playerPhoto={duoStats.victim.player.photoUrl}
              wins={duoStats.victim.opponentLosses}
              losses={duoStats.victim.total - duoStats.victim.opponentLosses}
              total={duoStats.victim.total}
              legend={`Em ${duoStats.victim.total} jogos contra ${duoStats.victim.player.name.split(" ")[0]}, a dupla venceu ${duoStats.victim.opponentLosses}`}
            />
          )}
          {duoStats.nemesis && (
            <StatCard
              title="Pedra no Sapato"
              playerName={duoStats.nemesis.player.name}
              playerPhoto={duoStats.nemesis.player.photoUrl}
              wins={duoStats.nemesis.total - duoStats.nemesis.opponentWins}
              losses={duoStats.nemesis.opponentWins}
              total={duoStats.nemesis.total}
              legend={`Em ${duoStats.nemesis.total} jogos contra ${duoStats.nemesis.player.name.split(" ")[0]}, a dupla perdeu ${duoStats.nemesis.opponentWins}`}
            />
          )}
        </div>
      ) : (
        (playerStats.bestPartner ||
          playerStats.biggestVictim ||
          playerStats.biggestNemesis) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {playerStats.bestPartner && (
              <StatCard
                title="Melhor Dupla"
                playerName={playerStats.bestPartner.player.name}
                playerPhoto={playerStats.bestPartner.player.photoUrl}
                wins={playerStats.bestPartner.wins}
                losses={
                  playerStats.bestPartner.total - playerStats.bestPartner.wins
                }
                total={playerStats.bestPartner.total}
                legend={`Em ${playerStats.bestPartner.total} jogos juntos, ${firstName} e ${playerStats.bestPartner.player.name.split(" ")[0]} venceram ${playerStats.bestPartner.wins}`}
              />
            )}
            {playerStats.biggestVictim && (
              <StatCard
                title="Maior Fregues"
                playerName={playerStats.biggestVictim.player.name}
                playerPhoto={playerStats.biggestVictim.player.photoUrl}
                wins={playerStats.biggestVictim.losses}
                losses={
                  playerStats.biggestVictim.total -
                  playerStats.biggestVictim.losses
                }
                total={playerStats.biggestVictim.total}
                legend={`Em ${playerStats.biggestVictim.total} jogos contra ${playerStats.biggestVictim.player.name.split(" ")[0]}, ${firstName} venceu ${playerStats.biggestVictim.losses}`}
              />
            )}
            {playerStats.biggestNemesis && (
              <StatCard
                title="Pedra no Sapato"
                playerName={playerStats.biggestNemesis.player.name}
                playerPhoto={playerStats.biggestNemesis.player.photoUrl}
                wins={
                  playerStats.biggestNemesis.total -
                  playerStats.biggestNemesis.wins
                }
                losses={playerStats.biggestNemesis.wins}
                total={playerStats.biggestNemesis.total}
                legend={`Em ${playerStats.biggestNemesis.total} jogos contra ${playerStats.biggestNemesis.player.name.split(" ")[0]}, ${firstName} perdeu ${playerStats.biggestNemesis.wins}`}
              />
            )}
          </div>
        )
      )}

      {/* Historico de partidas */}
      <div className="card-dark-glow p-6">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-xl font-extrabold uppercase tracking-tight text-neon font-display">
            {isDuoMode ? "Partidas da Dupla" : "Partidas"}
          </h2>
          <div className="flex-1 h-px bg-linear-to-r from-neon/20 to-transparent" />
          <span className="text-xs text-muted tabular-nums">
            {duoMatches.length} partida{duoMatches.length !== 1 ? "s" : ""}
          </span>
        </div>

        {duoMatches.length === 0 ? (
          <div className="text-center py-10 text-muted">
            <p className="text-sm">
              {isDuoMode
                ? "Nenhuma partida juntos ainda."
                : "Nenhuma partida registrada ainda."}
            </p>
          </div>
        ) : (
          <div>
            {duoMatches.map((match) => (
              <MatchCard key={match.id} match={match} playerId={player.id} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
