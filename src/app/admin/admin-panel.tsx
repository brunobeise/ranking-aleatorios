"use client";

import { useState } from "react";
import { PlayerForm } from "@/components/player-form";
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
          Partidas
        </h2>
        <div className="card-dark divide-y divide-surface-border overflow-hidden">
          {matches.map((match) => {
            const team1 = match.players
              .filter((p) => p.team === 1)
              .map((p) => p.player.name);
            const team2 = match.players
              .filter((p) => p.team === 2)
              .map((p) => p.player.name);
            const setsStr = match.sets
              .map((s) => `${s.team1Score}×${s.team2Score}`)
              .join(", ");

            return (
              <div
                key={match.id}
                className="px-5 py-4 flex items-center justify-between hover:bg-surface-light/50 transition-colors"
              >
                <div>
                  <p className="font-medium text-sm">
                    <span className="text-blue-400">
                      {team1.join(" & ")}
                    </span>
                    <span className="text-muted mx-2 text-xs">vs</span>
                    <span className="text-red-400">
                      {team2.join(" & ")}
                    </span>
                  </p>
                  <p className="text-xs text-muted mt-1">
                    {new Date(match.createdAt).toLocaleDateString("pt-BR")} —{" "}
                    <span className="text-foreground/60">{setsStr}</span>
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteMatch(match.id)}
                  className="text-xs font-medium text-red-400/70 hover:text-red-400 transition-colors uppercase tracking-wide"
                >
                  Excluir
                </button>
              </div>
            );
          })}
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
