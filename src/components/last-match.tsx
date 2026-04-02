import { MatchWithDeltas } from "@/domain/types";
import { ShareMatchButton } from "./share-match";

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

function PlayerRow({
  name,
  photoUrl,
  delta,
}: {
  name: string;
  photoUrl: string | null;
  delta: number;
}) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="flex items-center gap-2">
      {photoUrl ? (
        <img
          src={photoUrl}
          alt={name}
          className="w-7 h-7 rounded-full object-cover ring-1 ring-surface-border"
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-surface-light flex items-center justify-center text-neon font-bold text-[10px] ring-1 ring-surface-border">
          {initials}
        </div>
      )}
      <span className="text-sm font-medium truncate">{name}</span>
      <DeltaBadge delta={delta} />
    </div>
  );
}

function SetScoreBadge({
  team1Score,
  team2Score,
}: {
  team1Score: number;
  team2Score: number;
}) {
  const team1Won = team1Score > team2Score;
  return (
    <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-surface-light/60 border border-surface-border/50">
      <span
        className={`font-extrabold text-lg tabular-nums font-display ${
          team1Won ? "text-neon" : "text-muted"
        }`}
      >
        {team1Score}
      </span>
      <span className="text-muted text-xs mx-0.5">×</span>
      <span
        className={`font-extrabold text-lg tabular-nums font-display ${
          !team1Won ? "text-neon" : "text-muted"
        }`}
      >
        {team2Score}
      </span>
    </div>
  );
}

export function LastMatch({ match }: { match: MatchWithDeltas }) {
  const team1 = match.players.filter((p) => p.team === 1);
  const team2 = match.players.filter((p) => p.team === 2);

  const date = new Date(match.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <div className="card-dark-glow p-5 mb-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-extrabold uppercase text-neon font-display">
          Ultima Partida
        </h2>
        <span className="text-xs text-muted">{date}</span>
        <div className="flex-1 h-px bg-linear-to-r from-neon/20 to-transparent" />
        <ShareMatchButton match={match} />
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
        {/* Team 1 */}
        <div
          className={`flex-1 rounded-lg p-3 border ${
            match.team1Won
              ? "border-neon/30 bg-neon/[0.05]"
              : "border-surface-border bg-surface-light/30"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {match.team1Won && (
              <span className="text-xs font-bold text-neon uppercase tracking-wider">
                Vitoria
              </span>
            )}
          </div>
          <div className="space-y-1.5">
            {team1.map((p) => (
              <PlayerRow
                key={p.playerId}
                name={p.playerName}
                photoUrl={p.photoUrl}
                delta={p.delta}
              />
            ))}
          </div>
        </div>

        {/* Score - each set separated */}
        <div className="flex items-center justify-center gap-2 px-2">
          {match.sets.map((s, i) => (
            <SetScoreBadge
              key={i}
              team1Score={s.team1Score}
              team2Score={s.team2Score}
            />
          ))}
        </div>

        {/* Team 2 */}
        <div
          className={`flex-1 rounded-lg p-3 border ${
            !match.team1Won
              ? "border-neon/30 bg-neon/[0.05]"
              : "border-surface-border bg-surface-light/30"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            {!match.team1Won && (
              <span className="text-xs font-bold text-neon uppercase tracking-wider">
                Vitoria
              </span>
            )}
          </div>
          <div className="space-y-1.5">
            {team2.map((p) => (
              <PlayerRow
                key={p.playerId}
                name={p.playerName}
                photoUrl={p.photoUrl}
                delta={p.delta}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
