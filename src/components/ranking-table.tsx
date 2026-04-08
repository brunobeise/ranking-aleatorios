import Link from "next/link";
import { RankedPlayer } from "@/domain/types";

function getMedalEmoji(position: number) {
  if (position === 0) return "🥇";
  if (position === 1) return "🥈";
  if (position === 2) return "🥉";
  return null;
}

function PlayerAvatar({
  name,
  photoUrl,
  size = "md",
}: {
  name: string;
  photoUrl: string | null;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-16 h-16 text-lg",
  };

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-surface-border`}
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
    <div
      className={`${sizeClasses[size]} rounded-full bg-surface-light flex items-center justify-center text-neon font-bold ring-2 ring-surface-border`}
    >
      {initials}
    </div>
  );
}

export function TopThree({ players }: { players: RankedPlayer[] }) {
  const top = players.slice(0, 3);
  if (top.length === 0) return null;

  const order = [1, 0, 2]; // 2nd, 1st, 3rd for podium layout
  const heights = ["h-24", "h-32", "h-20"];
  const podiumColors = [
    "from-slate-300/20 to-slate-400/5 border-slate-400/30",
    "from-yellow-500/30 to-amber-500/10 border-yellow-500/40",
    "from-orange-800/25 to-orange-900/10 border-orange-700/30",
  ];
  const posLabels = ["2°", "1°", "3°"];
  const posTextColors = ["text-slate-300", "text-yellow-400", "text-orange-500"];
  const ringColors = [
    "ring-slate-400/50",
    "ring-yellow-500/60",
    "ring-orange-600/50",
  ];

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-6 mb-10 animate-fade-in">
      {order.map((idx, i) => {
        const player = top[idx];
        if (!player) return null;
        return (
          <Link
            key={player.id}
            href={`/jogador/${player.id}`}
            className="flex flex-col items-center animate-slide-up group"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className={`relative ${idx === 0 ? "mb-1" : ""}`}>
              <div className={`rounded-full ring-2 ${ringColors[i]}`}>
                <PlayerAvatar
                  name={player.name}
                  photoUrl={player.photoUrl}
                  size="lg"
                />
              </div>
              {idx === 0 && (
                <div className="absolute -top-2 -right-2 text-xl">👑</div>
              )}
            </div>
            <p
              className="font-bold mt-2 text-sm text-foreground truncate] text-center group-hover:text-neon transition-colors"
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              {player.name}
            </p>
            <p className={`text-xs tabular-nums ${idx === 0 ? "text-yellow-400 font-semibold" : "text-muted"}`}>{player.rating} pts</p>
            <div
              className={`${heights[i]} w-20 sm:w-24 mt-2 rounded-t-lg bg-linear-to-t ${podiumColors[i]} border border-b-0 flex flex-col items-center justify-center`}
            >
              <span
                className={`text-2xl font-extrabold ${posTextColors[i]} font-display`}
              >
                {posLabels[i]}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export function RankingTable({ players }: { players: RankedPlayer[] }) {
  if (players.length === 0) {
    return (
      <div className="text-center py-16 text-muted">
        <p className="text-lg">Nenhum jogador cadastrado ainda.</p>
        <p className="text-sm mt-1 text-muted/70">
          Adicione jogadores para começar!
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr
            className="border-b border-surface-border text-left text-xs uppercase tracking-wider text-muted"
            style={{ fontFamily: "var(--font-condensed)" }}
          >
            <th className="pb-3 pr-2 w-10">#</th>
            <th className="pb-3 pr-2">Jogador</th>
            <th className="pb-3 pr-2 text-right">Pts</th>
            <th className="pb-3 text-center">V/D</th>
          </tr>
        </thead>
        <tbody>
          {players.map((player, i) => (
            <tr
              key={player.id}
              className={`border-b border-surface-border/50 transition-colors hover:bg-surface-light/50 animate-slide-up ${
                i === 0
                  ? "bg-yellow-500/5"
                  : i === 1
                    ? "bg-slate-300/3"
                    : i === 2
                      ? "bg-orange-600/3"
                      : ""
              }`}
              style={{
                animationDelay: `${i * 0.03}s`,
                opacity: 0,
                animationFillMode: "forwards",
              }}
            >
              <td className="py-3.5 pr-2">
                {getMedalEmoji(i) ? (
                  <span className="text-base">{getMedalEmoji(i)}</span>
                ) : (
                  <span className="text-muted font-medium text-sm">
                    {i + 1}
                  </span>
                )}
              </td>
              <td className="py-3.5 pr-2">
                <Link href={`/jogador/${player.id}`} className="flex items-center gap-2.5 group">
                  <PlayerAvatar
                    name={player.name}
                    photoUrl={player.photoUrl}
                  />
                  <div className="min-w-0">
                    <span className="font-semibold text-sm block truncate group-hover:text-neon transition-colors">
                      {player.name}
                    </span>
                    {player.streak >= 2 && (
                      <span className="text-[11px] text-neon/70">
                        {"🔥".repeat(Math.min(player.streak, 5))}
                      </span>
                    )}
                  </div>
                </Link>
              </td>
              <td className="py-3.5 pr-2 text-right">
                <span
                  className="font-bold tabular-nums text-neon"
                  style={{ fontFamily: "var(--font-condensed)" }}
                >
                  {player.rating}
                </span>
              </td>
              <td className="py-3.5 text-center">
                <span className="text-green-400 tabular-nums font-medium text-sm">{player.wins}</span>
                <span className="text-muted mx-0.5">/</span>
                <span className="text-red-400 tabular-nums font-medium text-sm">{player.losses}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
