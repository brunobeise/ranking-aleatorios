import { cacheLife, cacheTag } from "next/cache";
import { getRankingWithHistory } from "@/lib/data";
import { AllMatches } from "@/components/all-matches";

export default async function PartidasPage() {
  "use cache";
  cacheLife("minutes");
  cacheTag("ranking");

  const { matchHistory } = await getRankingWithHistory();

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-4xl font-extrabold uppercase tracking-tight text-neon font-display">
          Partidas
        </h1>
        <div className="flex-1 h-px bg-linear-to-r from-neon/30 via-neon/15 to-neon/30" />
      </div>

      <div className="card-dark-glow p-6">
        <AllMatches matches={matchHistory} />
      </div>
    </div>
  );
}
