import { cacheLife, cacheTag } from "next/cache";
import { getRankingWithHistory } from "@/lib/data";
import { TopThree, RankingTable } from "@/components/ranking-table";
import { SharePodiumButton } from "@/components/share-ranking";
import { LastMatch } from "@/components/last-match";
import { MatchHistory } from "@/components/match-history";

export default async function HomePage() {
  "use cache";
  cacheLife("minutes");
  cacheTag("ranking");

  const { ranking, matchHistory } = await getRankingWithHistory();
  const lastMatch = matchHistory[0] ?? null;

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <h1
          className="text-4xl font-extrabold uppercase tracking-tight text-neon font-display"
        >
          Ranking
        </h1>
        <div className="flex-1 h-px bg-linear-to-r from-neon/30 via-neon/15 to-neon/30" />
        <img
          src="/logo_aelatorios.png"
          alt="Aleatorios Padel"
          className="w-14 h-14 rounded-lg object-cover"
        />
      </div>

      <TopThree players={ranking} />
      <SharePodiumButton players={ranking} />

      <div className="card-dark-glow p-6 mb-8">
        <RankingTable players={ranking} />
      </div>

      {lastMatch && <LastMatch match={lastMatch} />}

      <div className="card-dark-glow p-6">
        <div className="flex items-center gap-3 mb-5">
          <h2
            className="text-xl font-extrabold uppercase tracking-tight text-neon font-display"
            >
            Historico de Partidas
          </h2>
          <div className="flex-1 h-px bg-linear-to-r from-neon/20 to-transparent" />
        </div>
        <MatchHistory matches={matchHistory} />
      </div>
    </div>
  );
}
