"use client";

import { useState } from "react";
import { PlayerForm } from "@/components/player-form";
import { MatchForm } from "@/components/match-form";
import { deletePlayer } from "@/actions/players";
import { deleteMatch } from "@/actions/matches";
import { useRouter } from "next/navigation";

interface Player {
  id: string;
  name: string;
  photoUrl: string | null;
  createdAt: Date;
}

interface MatchWithDetails {
  id: string;
  createdAt: Date;
  players: {
    id: string;
    team: number;
    player: { id: string; name: string };
  }[];
  sets: { id: string; team1Score: number; team2Score: number }[];
}

function MatchCard({
  match,
  players,
  onDelete,
  onEdited,
}: {
  match: MatchWithDetails;
  players: Player[];
  onDelete: () => void;
  onEdited: () => void;
}) {
  const [editing, setEditing] = useState(false);

  const team1Players = match.players.filter((p) => p.team === 1);
  const team2Players = match.players.filter((p) => p.team === 2);

  const date = new Date(match.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });

  if (editing) {
    return (
      <div className="border-b border-surface-border/50 p-4 animate-scale-in">
        <div className="flex items-center justify-between mb-3">
          <span
            className="text-xs font-bold uppercase text-muted tracking-wider"
            style={{ fontFamily: "var(--font-condensed)" }}
          >
            Editando partida — {date}
          </span>
          <button
            onClick={() => setEditing(false)}
            className="text-xs font-medium text-muted hover:text-foreground transition-colors uppercase tracking-wide"
          >
            Cancelar
          </button>
        </div>
        <MatchForm
          players={players.map((p) => ({ id: p.id, name: p.name }))}
          editData={{
            id: match.id,
            team1: [team1Players[0]?.player.id ?? "", team1Players[1]?.player.id ?? ""],
            team2: [team2Players[0]?.player.id ?? "", team2Players[1]?.player.id ?? ""],
            sets: match.sets.map((s) => ({
              team1Score: s.team1Score,
              team2Score: s.team2Score,
            })),
            date: new Date(match.createdAt).toISOString().split("T")[0],
          }}
          onSuccess={() => {
            setEditing(false);
            onEdited();
          }}
        />
      </div>
    );
  }

  return (
    <div className="border-b border-surface-border/50 py-3 px-4">
      <div className="flex items-center gap-2 mb-2">
        <span
          className="text-[10px] text-muted uppercase tracking-wider font-bold"
          style={{ fontFamily: "var(--font-condensed)" }}
        >
          {date}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {/* Time 1 */}
        <div className="flex-1 min-w-0">
          <div className="space-y-0.5">
            {team1Players.map((p) => (
              <div key={p.id} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-neon shrink-0" />
                <span className="text-sm truncate">{p.player.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Placares */}
        <div className="flex items-center gap-1.5 shrink-0 px-1">
          {match.sets.map((s, i) => (
            <div
              key={i}
              className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-light/60 border border-surface-border/40"
            >
              <span
                className={`text-xs font-bold tabular-nums ${s.team1Score > s.team2Score ? "text-neon" : "text-muted"}`}
              >
                {s.team1Score}
              </span>
              <span className="text-muted text-[10px]">-</span>
              <span
                className={`text-xs font-bold tabular-nums ${s.team2Score > s.team1Score ? "text-red-400" : "text-muted"}`}
              >
                {s.team2Score}
              </span>
            </div>
          ))}
        </div>

        {/* Time 2 */}
        <div className="flex-1 min-w-0">
          <div className="space-y-0.5">
            {team2Players.map((p) => (
              <div key={p.id} className="flex items-center gap-1.5 justify-end">
                <span className="text-sm truncate">{p.player.name}</span>
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ações */}
      <div className="flex gap-3 mt-2 pt-2 border-t border-surface-border/30">
        <button
          onClick={() => setEditing(true)}
          className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wide"
        >
          Editar
        </button>
        <button
          onClick={onDelete}
          className="text-xs font-medium text-red-400/70 hover:text-red-400 transition-colors uppercase tracking-wide"
        >
          Excluir
        </button>
      </div>
    </div>
  );
}

export function AdminPanel({
  players,
  matches,
}: {
  players: Player[];
  matches: MatchWithDetails[];
}) {
  const router = useRouter();
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);

  async function handleDeletePlayer(id: string) {
    if (!confirm("Tem certeza? Isso removerá o jogador e suas partidas.")) return;
    await deletePlayer(id);
    router.refresh();
  }

  async function handleDeleteMatch(id: string) {
    if (!confirm("Tem certeza que deseja excluir esta partida?")) return;
    await deleteMatch(id);
    router.refresh();
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1
          className="text-2xl font-bold uppercase tracking-wide"
          style={{ fontFamily: "var(--font-condensed)" }}
        >
          Painel Admin
        </h1>
        <div className="flex-1 h-px bg-surface-border" />
      </div>

      {/* Jogadores */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Jogadores</h2>
          <button
            onClick={() => {
              setEditingPlayer(null);
              setShowPlayerForm(true);
            }}
            className="btn-admin px-4 py-2 text-sm"
          >
            + Novo Jogador
          </button>
        </div>

        {(showPlayerForm || editingPlayer) && (
          <div className="card-dark p-6 mb-4 animate-scale-in">
            <PlayerForm
              editData={
                editingPlayer
                  ? {
                      id: editingPlayer.id,
                      name: editingPlayer.name,
                      photoUrl: editingPlayer.photoUrl,
                    }
                  : undefined
              }
              onClose={() => {
                setShowPlayerForm(false);
                setEditingPlayer(null);
              }}
            />
          </div>
        )}

        <div className="card-dark divide-y divide-surface-border overflow-hidden">
          {players.map((player) => (
            <div
              key={player.id}
              className="px-5 py-3.5 flex items-center justify-between hover:bg-surface-light/50 transition-colors"
            >
              <span className="font-medium text-sm">{player.name}</span>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setEditingPlayer(player);
                    setShowPlayerForm(false);
                  }}
                  className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wide"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDeletePlayer(player.id)}
                  className="text-xs font-medium text-red-400/70 hover:text-red-400 transition-colors uppercase tracking-wide"
                >
                  Excluir
                </button>
              </div>
            </div>
          ))}
          {players.length === 0 && (
            <p className="px-5 py-4 text-muted text-sm">
              Nenhum jogador cadastrado.
            </p>
          )}
        </div>
      </section>

      {/* Partidas */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Partidas ({matches.length})
        </h2>
        <div className="card-dark overflow-hidden">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              players={players}
              onDelete={() => handleDeleteMatch(match.id)}
              onEdited={() => router.refresh()}
            />
          ))}
          {matches.length === 0 && (
            <p className="px-5 py-4 text-muted text-sm">
              Nenhuma partida registrada.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
