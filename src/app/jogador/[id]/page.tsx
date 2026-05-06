import { Suspense } from "react";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import Link from "next/link";
import { getRankingWithHistory } from "@/lib/data";
import { PlayerProfileContent } from "@/components/player-profile-content";

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

async function PlayerProfile({
  paramsPromise,
}: {
  paramsPromise: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await paramsPromise;
  const { ranking, matchHistory } = await getRankingWithHistory();

  const player = ranking.find((p) => p.id === id);
  if (!player) notFound();

  const playerMatchesCount = matchHistory.filter((m) =>
    m.players.some((p) => p.playerId === id)
  ).length;

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
            <h1 className="text-3xl font-extrabold uppercase tracking-tight text-neon font-display">
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
              {playerMatchesCount}
            </p>
          </div>
        </div>
      </div>

      <PlayerProfileContent
        player={player}
        matchHistory={matchHistory}
        allPlayers={ranking}
      />
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
