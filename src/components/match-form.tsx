"use client";

import { useState } from "react";
import { createMatch, updateMatch } from "@/actions/matches";

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
  editData?: {
    id: string;
    team1: [string, string];
    team2: [string, string];
    sets: SetScore[];
    date: string;
  };
}

export function MatchForm({ players, editData }: MatchFormProps) {
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

  function availablePlayers(current: string) {
    return players.filter((p) => p.id === current || !selectedIds.includes(p.id));
  }

  function updateSet(index: number, field: keyof SetScore, value: number) {
    setSets((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar partida");
    } finally {
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
            className="flex items-center gap-3 animate-scale-in"
          >
            <span
              className="text-xs text-muted font-bold uppercase w-14"
              style={{ fontFamily: "var(--font-condensed)" }}
            >
              Set {i + 1}
            </span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={7}
                value={set.team1Score}
                onChange={(e) =>
                  updateSet(i, "team1Score", parseInt(e.target.value) || 0)
                }
                className="input-dark w-16 text-center tabular-nums font-bold text-neon"
                required
              />
              <span className="text-muted font-bold text-lg">×</span>
              <input
                type="number"
                min={0}
                max={7}
                value={set.team2Score}
                onChange={(e) =>
                  updateSet(i, "team2Score", parseInt(e.target.value) || 0)
                }
                className="input-dark w-16 text-center tabular-nums font-bold text-red-400"
                required
              />
            </div>
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
        ))}
      </div>

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
