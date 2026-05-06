"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createMatch, updateMatch } from "@/actions/matches";
import { previewMatchDeltas } from "@/domain/rating-engine";
import { MatchPlayerDelta, PlayerState } from "@/domain/types";

interface Player {
  id: string;
  name: string;
}

interface SetScore {
  team1Score: number;
  team2Score: number;
}

interface MatchFormProps {
  players: Player[];
  playerStates?: PlayerState[];
  editData?: {
    id: string;
    team1: [string, string];
    team2: [string, string];
    sets: SetScore[];
    date: string;
  };
  onSuccess?: () => void;
}

export function MatchForm({
  players,
  playerStates,
  editData,
  onSuccess,
}: MatchFormProps) {
  const router = useRouter();
  const [team1, setTeam1] = useState<[string, string]>(
    editData?.team1 || ["", ""]
  );
  const [team2, setTeam2] = useState<[string, string]>(
    editData?.team2 || ["", ""]
  );
  const [sets, setSets] = useState<SetScore[]>(
    editData?.sets || [{ team1Score: 0, team2Score: 0 }]
  );
  const [date, setDate] = useState(
    editData?.date || new Date().toISOString().split("T")[0]
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedIds = [...team1, ...team2].filter(Boolean);

  const previewDeltas = useMemo<MatchPlayerDelta[] | null>(() => {
    if (editData || !playerStates) return null;
    if (!team1[0] || !team1[1] || !team2[0] || !team2[1]) return null;
    if (new Set([...team1, ...team2]).size !== 4) return null;
    const validSets = sets.filter(
      (s) =>
        s.team1Score !== s.team2Score &&
        s.team1Score >= 0 &&
        s.team2Score >= 0 &&
        s.team1Score <= 10 &&
        s.team2Score <= 10
    );
    if (validSets.length === 0) return null;
    if (validSets.length % 2 === 0) {
      let t1Sets = 0;
      let t2Sets = 0;
      let t1Games = 0;
      let t2Games = 0;
      for (const s of validSets) {
        if (s.team1Score > s.team2Score) t1Sets++;
        else t2Sets++;
        t1Games += s.team1Score;
        t2Games += s.team2Score;
      }
      if (t1Sets === t2Sets && t1Games === t2Games) return null;
    }
    try {
      return previewMatchDeltas(playerStates, {
        id: "preview",
        createdAt: new Date(date + "T12:00:00"),
        team1,
        team2,
        sets: validSets,
      });
    } catch {
      return null;
    }
  }, [team1, team2, sets, date, playerStates, editData]);

  function availablePlayers(current: string) {
    return players.filter((p) => p.id === current || !selectedIds.includes(p.id));
  }

  function updateSet(index: number, field: keyof SetScore, value: number) {
    const clamped = Math.max(0, Math.min(10, value));
    setSets((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: clamped } : s))
    );
  }

  function ScoreInput({
    value,
    onChange,
    colorClass,
  }: {
    value: number;
    onChange: (v: number) => void;
    colorClass: string;
  }) {
    return (
      <div className="flex flex-col items-center gap-1.5 w-full">
        <button
          type="button"
          onClick={() => onChange(Math.min(10, value + 1))}
          className="w-full h-9 flex items-center justify-center rounded-lg bg-surface-light border border-surface-border text-muted hover:text-foreground hover:border-neon/30 active:bg-surface transition-colors text-lg font-bold leading-none"
        >
          +
        </button>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onFocus={(e) => e.target.select()}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "");
            if (val === "") {
              onChange(0);
              return;
            }
            const num = parseInt(val, 10);
            if (num >= 0 && num <= 10) {
              onChange(num);
            }
          }}
          className={`input-dark w-full text-center tabular-nums font-bold text-2xl py-3 ${colorClass}`}
          required
        />
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-full h-9 flex items-center justify-center rounded-lg bg-surface-light border border-surface-border text-muted hover:text-foreground hover:border-neon/30 active:bg-surface transition-colors text-lg font-bold leading-none"
        >
          −
        </button>
      </div>
    );
  }

  function addSet() {
    setSets((prev) => [...prev, { team1Score: 0, team2Score: 0 }]);
  }

  function removeSet(index: number) {
    if (sets.length <= 1) return;
    setSets((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = { team1, team2, sets, date };
      if (editData) {
        await updateMatch(editData.id, data);
      } else {
        await createMatch(data);
      }
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar partida");
      setLoading(false);
    }
  }

  function PlayerSelect({
    value,
    onChange,
    current,
  }: {
    value: string;
    onChange: (v: string) => void;
    current: string;
  }) {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select-dark w-full"
        required
      >
        <option value="">Selecione...</option>
        {availablePlayers(current).map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label
          className="block text-xs font-bold uppercase tracking-wider text-muted mb-2"
          style={{ fontFamily: "var(--font-condensed)" }}
        >
          Data
        </label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-dark"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Time 1 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-neon" />
            <h3
              className="font-bold text-neon uppercase tracking-wide"
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              Time 1
            </h3>
          </div>
          <div className="pl-5 space-y-2 border-l-2 border-neon/20">
            <PlayerSelect
              value={team1[0]}
              current={team1[0]}
              onChange={(v) => setTeam1([v, team1[1]])}
            />
            <PlayerSelect
              value={team1[1]}
              current={team1[1]}
              onChange={(v) => setTeam1([team1[0], v])}
            />
          </div>
        </div>

        {/* Time 2 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <h3
              className="font-bold text-red-400 uppercase tracking-wide"
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              Time 2
            </h3>
          </div>
          <div className="pl-5 space-y-2 border-l-2 border-red-500/20">
            <PlayerSelect
              value={team2[0]}
              current={team2[0]}
              onChange={(v) => setTeam2([v, team2[1]])}
            />
            <PlayerSelect
              value={team2[1]}
              current={team2[1]}
              onChange={(v) => setTeam2([team2[0], v])}
            />
          </div>
        </div>
      </div>

      {/* Sets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3
            className="font-bold uppercase tracking-wide text-foreground"
            style={{ fontFamily: "var(--font-condensed)" }}
          >
            Sets
          </h3>
          <button
            type="button"
            onClick={addSet}
            className="text-sm text-neon hover:text-neon-dim font-bold uppercase tracking-wide transition-colors"
            style={{ fontFamily: "var(--font-condensed)" }}
          >
            + Adicionar set
          </button>
        </div>

        {sets.map((set, i) => (
          <div
            key={i}
            className="animate-scale-in rounded-lg border border-surface-border/50 bg-surface-light/30 p-3"
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className="text-xs text-muted font-bold uppercase"
                style={{ fontFamily: "var(--font-condensed)" }}
              >
                Set {i + 1}
              </span>
              {sets.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeSet(i)}
                  className="text-red-500/60 hover:text-red-400 text-xs font-bold uppercase tracking-wide transition-colors"
                >
                  Remover
                </button>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2 h-2 rounded-full bg-neon" />
                  <span
                    className="text-[10px] font-bold uppercase text-neon/70 tracking-wider"
                    style={{ fontFamily: "var(--font-condensed)" }}
                  >
                    Time 1
                  </span>
                </div>
                <ScoreInput
                  value={set.team1Score}
                  onChange={(v) => updateSet(i, "team1Score", v)}
                  colorClass="text-neon border-neon/20"
                />
              </div>
              <span className="text-muted font-bold text-xl mt-5">×</span>
              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="flex items-center gap-1.5 mb-1">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span
                    className="text-[10px] font-bold uppercase text-red-400/70 tracking-wider"
                    style={{ fontFamily: "var(--font-condensed)" }}
                  >
                    Time 2
                  </span>
                </div>
                <ScoreInput
                  value={set.team2Score}
                  onChange={(v) => updateSet(i, "team2Score", v)}
                  colorClass="text-red-400 border-red-500/20"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {previewDeltas && (
        <div className="rounded-lg border border-neon/20 bg-neon/5 p-4 animate-scale-in">
          <h3
            className="font-bold uppercase tracking-wide text-neon mb-3 text-sm"
            style={{ fontFamily: "var(--font-condensed)" }}
          >
            Prévia de Pontos
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              {previewDeltas
                .filter((d) => d.team === 1)
                .map((d) => (
                  <div
                    key={d.playerId}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-foreground truncate">
                      {d.playerName}
                    </span>
                    <span
                      className={`font-bold tabular-nums ${
                        d.delta >= 0 ? "text-neon" : "text-red-400"
                      }`}
                    >
                      {d.delta >= 0 ? `+${d.delta}` : d.delta}
                    </span>
                  </div>
                ))}
            </div>
            <div className="space-y-1.5">
              {previewDeltas
                .filter((d) => d.team === 2)
                .map((d) => (
                  <div
                    key={d.playerId}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-foreground truncate">
                      {d.playerName}
                    </span>
                    <span
                      className={`font-bold tabular-nums ${
                        d.delta >= 0 ? "text-neon" : "text-red-400"
                      }`}
                    >
                      {d.delta >= 0 ? `+${d.delta}` : d.delta}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn-neon w-full py-3.5 rounded-lg text-base tracking-wider"
      >
        {loading
          ? "Salvando..."
          : editData
          ? "Atualizar Partida"
          : "Registrar Partida"}
      </button>
    </form>
  );
}
