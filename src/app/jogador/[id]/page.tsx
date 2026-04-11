import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { getRankingWithHistory } from "@/lib/data";
import { MatchWithDeltas, RankedPlayer } from "@/domain/types";

function PlayerAvatar({
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
        className="w-20 h-20 rounded-full object-cover ring-2 ring-neon/40"
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
    <div className="w-20 h-20 rounded-full bg-surface-light flex items-center justify-center text-neon font-bold text-2xl ring-2 ring-neon/40">
      {initials}
    </div>
  );
}

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
  const playerWon =
    playerTeam === 1 ? match.team1Won : !match.team1Won;

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

function StatCard({ title, playerName, playerPhoto, wins, losses, total, legend }: StatCardProps) {
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
        <p className="text-[11px] text-muted leading-snug mt-0.5 text-center">{legend}</p>
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

  // Melhor dupla: quem mais venceu jogando junto
  const partnerWins = new Map<string, number>();
  const partnerTotal = new Map<string, number>();

  // Maior fregues: quem mais perdeu CONTRA este jogador
  const opponentLosses = new Map<string, number>();

  // Maior algoz: quem mais venceu CONTRA este jogador
  const opponentWins = new Map<string, number>();

  // Total de confrontos por oponente
  const opponentTotal = new Map<string, number>();

  for (const match of playerMatches) {
    const playerData = match.players.find((p) => p.playerId === playerId)!;
    const playerTeam = playerData.team;
    const playerWon = playerTeam === 1 ? match.team1Won : !match.team1Won;

    // Parceiro (mesmo time)
    const teammates = match.players.filter(
      (p) => p.team === playerTeam && p.playerId !== playerId
    );
    for (const t of teammates) {
      partnerTotal.set(t.playerId, (partnerTotal.get(t.playerId) || 0) + 1);
      if (playerWon) {
        partnerWins.set(t.playerId, (partnerWins.get(t.playerId) || 0) + 1);
      }
    }

    // Adversarios (time oposto)
    const opponents = match.players.filter((p) => p.team !== playerTeam);
    for (const o of opponents) {
      opponentTotal.set(o.playerId, (opponentTotal.get(o.playerId) || 0) + 1);
      if (playerWon) {
        opponentLosses.set(
          o.playerId,
          (opponentLosses.get(o.playerId) || 0) + 1
        );
      } else {
        opponentWins.set(
          o.playerId,
          (opponentWins.get(o.playerId) || 0) + 1
        );
      }
    }
  }

  const playerMap = new Map(allPlayers.map((p) => [p.id, p]));

  // Melhor dupla: maior numero de vitorias juntos (desempate por taxa)
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

  // Maior fregues: score ponderado (derrotas² / total), minimo 2 confrontos
  let biggestVictim: { id: string; losses: number; total: number; score: number } | null = null;
  for (const [oppId, losses] of opponentLosses) {
    const total = opponentTotal.get(oppId) || 0;
    if (total < 2) continue;
    const score = (losses * losses) / total;
    if (!biggestVictim || score > biggestVictim.score) {
      biggestVictim = { id: oppId, losses, total, score };
    }
  }

  // Maior algoz: score ponderado (vitorias² / total), minimo 2 confrontos
  let biggestNemesis: { id: string; wins: number; total: number; score: number } | null = null;
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
      ? { player: playerMap.get(bestPartner.id)!, wins: bestPartner.wins, total: bestPartner.total }
      : null,
    biggestVictim: biggestVictim
      ? { player: playerMap.get(biggestVictim.id)!, losses: biggestVictim.losses, total: biggestVictim.total }
      : null,
    biggestNemesis: biggestNemesis
      ? { player: playerMap.get(biggestNemesis.id)!, wins: biggestNemesis.wins, total: biggestNemesis.total }
      : null,
  };
}

async function PlayerProfile({ paramsPromise }: { paramsPromise: Promise<{ id: string }> }) {
  await connection();
  const { id } = await paramsPromise;
  const { ranking, matchHistory } = await getRankingWithHistory();

  const player = ranking.find((p) => p.id === id);
  if (!player) notFound();

  const { playerMatches, bestPartner, biggestVictim, biggestNemesis } =
    computePlayerStats(id, matchHistory, ranking);

  const position = ranking.findIndex((p) => p.id === id) + 1;

  return (
    <>
      {/* Header com voltar */}
      <div className="mb-6">
        <Link
          href="/"
          className="text-xs font-bold uppercase tracking-wider text-muted hover:text-neon transition-colors"
          style={{ fontFamily: "var(--font-condensed)" }}
        >
          &larr; Voltar ao Ranking
        </Link>
      </div>

      {/* Perfil do jogador */}
      <div className="card-dark-glow p-6 mb-6 animate-fade-in">
        <div className="flex items-center gap-5">
          <PlayerAvatar name={player.name} photoUrl={player.photoUrl} />
          <div className="min-w-0 flex-1">
            <h1
              className="text-3xl font-extrabold uppercase tracking-tight text-neon font-display"
            >
              {player.name}
            </h1>
            <p
              className="text-sm text-muted mt-0.5"
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              {position}° no ranking
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-6">
          <div className="text-center">
            <p
              className="text-[11px] font-bold uppercase tracking-wider text-muted"
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              Pontos
            </p>
            <p className="text-2xl font-extrabold text-neon tabular-nums font-display mt-1">
              {player.rating}
            </p>
          </div>
          <div className="text-center">
            <p
              className="text-[11px] font-bold uppercase tracking-wider text-muted"
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              Vitorias
            </p>
            <p className="text-2xl font-extrabold text-green-400 tabular-nums font-display mt-1">
              {player.wins}
            </p>
          </div>
          <div className="text-center">
            <p
              className="text-[11px] font-bold uppercase tracking-wider text-muted"
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              Derrotas
            </p>
            <p className="text-2xl font-extrabold text-red-400 tabular-nums font-display mt-1">
              {player.losses}
            </p>
          </div>
          <div className="text-center">
            <p
              className="text-[11px] font-bold uppercase tracking-wider text-muted"
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              Partidas
            </p>
            <p className="text-2xl font-extrabold text-foreground tabular-nums font-display mt-1">
              {playerMatches.length}
            </p>
          </div>
        </div>
      </div>

      {/* Cards de stats */}
      {(bestPartner || biggestVictim || biggestNemesis) && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {bestPartner && (
            <StatCard
              title="Melhor Dupla"
              playerName={bestPartner.player.name}
              playerPhoto={bestPartner.player.photoUrl}
              wins={bestPartner.wins}
              losses={bestPartner.total - bestPartner.wins}
              total={bestPartner.total}
              legend={`Em ${bestPartner.total} jogos juntos, ${player.name.split(" ")[0]} e ${bestPartner.player.name.split(" ")[0]} venceram ${bestPartner.wins}`}
            />
          )}
          {biggestVictim && (
            <StatCard
              title="Maior Freguês"
              playerName={biggestVictim.player.name}
              playerPhoto={biggestVictim.player.photoUrl}
              wins={biggestVictim.losses}
              losses={biggestVictim.total - biggestVictim.losses}
              total={biggestVictim.total}
              legend={`Em ${biggestVictim.total} jogos contra ${biggestVictim.player.name.split(" ")[0]}, ${player.name.split(" ")[0]} venceu ${biggestVictim.losses}`}
            />
          )}
          {biggestNemesis && (
            <StatCard
              title="Pedra no Sapato"
              playerName={biggestNemesis.player.name}
              playerPhoto={biggestNemesis.player.photoUrl}
              wins={biggestNemesis.total - biggestNemesis.wins}
              losses={biggestNemesis.wins}
              total={biggestNemesis.total}
              legend={`Em ${biggestNemesis.total} jogos contra ${biggestNemesis.player.name.split(" ")[0]}, ${player.name.split(" ")[0]} perdeu ${biggestNemesis.wins}`}
            />
          )}
        </div>
      )}

      {/* Historico de partidas */}
      <div className="card-dark-glow p-6">
        <div className="flex items-center gap-3 mb-5">
          <h2
            className="text-xl font-extrabold uppercase tracking-tight text-neon font-display"
          >
            Partidas
          </h2>
          <div className="flex-1 h-px bg-linear-to-r from-neon/20 to-transparent" />
          <span className="text-xs text-muted tabular-nums">
            {playerMatches.length} partida{playerMatches.length !== 1 ? "s" : ""}
          </span>
        </div>

        {playerMatches.length === 0 ? (
          <div className="text-center py-10 text-muted">
            <p className="text-sm">Nenhuma partida registrada ainda.</p>
          </div>
        ) : (
          <div>
            {playerMatches.map((match) => (
              <MatchCard key={match.id} match={match} playerId={id} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default function PlayerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div>
      <Suspense
        fallback={
          <div className="text-center py-16 text-muted">
            <p className="text-sm">Carregando perfil...</p>
          </div>
        }
      >
        <PlayerProfile paramsPromise={params} />
      </Suspense>
    </div>
  );
}
