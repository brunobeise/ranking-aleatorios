import { Suspense } from "react";
import { getPlayers } from "@/lib/data";
import { MatchForm } from "@/components/match-form";

async function MatchFormLoader() {
  const players = await getPlayers();
  return (
    <MatchForm players={players.map((p) => ({ id: p.id, name: p.name }))} />
  );
}

export default function NewMatchPage() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-8">
        <h1
          className="text-4xl font-extrabold uppercase tracking-tight text-neon font-display"
        >
          Nova Partida
        </h1>
        <div className="flex-1 h-px bg-linear-to-r from-neon/30 to-transparent" />
      </div>

      <div className="card-dark-glow p-6 sm:p-8">
        <Suspense
          fallback={
            <div className="py-12 text-center text-muted animate-pulse">
              Carregando jogadores...
            </div>
          }
        >
          <MatchFormLoader />
        </Suspense>
      </div>
    </div>
  );
}
