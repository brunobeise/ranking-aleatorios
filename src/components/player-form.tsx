"use client";

import { useState } from "react";
import { createPlayer, updatePlayer } from "@/actions/players";
import { useRouter } from "next/navigation";

interface PlayerFormProps {
  editData?: {
    id: string;
    name: string;
    photoUrl: string | null;
  };
  onClose?: () => void;
}

export function PlayerForm({ editData, onClose }: PlayerFormProps) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      if (editData) {
        await updatePlayer(editData.id, formData);
      } else {
        await createPlayer(formData);
      }
      router.refresh();
      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
          Nome
        </label>
        <input
          name="name"
          defaultValue={editData?.name}
          className="input-admin w-full"
          placeholder="Nome do jogador"
          required
        />
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wide text-muted mb-1.5">
          URL da Foto (opcional)
        </label>
        <input
          name="photoUrl"
          defaultValue={editData?.photoUrl || ""}
          className="input-admin w-full"
          placeholder="https://..."
        />
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="btn-admin flex-1 py-2.5 text-sm uppercase tracking-wide font-semibold disabled:opacity-50"
        >
          {loading ? "Salvando..." : editData ? "Atualizar" : "Adicionar"}
        </button>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg border border-surface-border text-muted hover:text-foreground hover:bg-surface-light transition-colors text-sm"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
