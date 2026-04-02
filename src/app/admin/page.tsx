import { Suspense } from "react";
import { AdminGate } from "@/components/admin-gate";
import { AdminPanel } from "./admin-panel";
import { getPlayers, getMatchesWithDetails } from "@/lib/data";

async function AdminContent() {
  const [players, matches] = await Promise.all([
    getPlayers(),
    getMatchesWithDetails(),
  ]);
  return <AdminPanel players={players} matches={matches} />;
}

export default function AdminPage() {
  return (
    <AdminGate>
      <Suspense
        fallback={
          <div className="py-12 text-center text-muted animate-pulse">
            Carregando...
          </div>
        }
      >
        <AdminContent />
      </Suspense>
    </AdminGate>
  );
}
