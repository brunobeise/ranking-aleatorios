import { prisma } from "./prisma";
import { MatchData } from "@/domain/types";
import { computeRanking, computeRankingWithHistory } from "@/domain/rating-engine";

export async function getPlayers() {
  return prisma.player.findMany({ orderBy: { name: "asc" } });
}

export async function getAllMatchesData(): Promise<MatchData[]> {
  const matches = await prisma.match.findMany({
    include: {
      players: true,
      sets: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return matches.map((m) => ({
    id: m.id,
    createdAt: m.createdAt,
    team1: m.players.filter((p) => p.team === 1).map((p) => p.playerId),
    team2: m.players.filter((p) => p.team === 2).map((p) => p.playerId),
    sets: m.sets.map((s) => ({
      team1Score: s.team1Score,
      team2Score: s.team2Score,
    })),
  }));
}

export async function getRanking() {
  const [players, matches] = await Promise.all([
    getPlayers(),
    getAllMatchesData(),
  ]);

  return computeRanking(
    players.map((p) => ({ id: p.id, name: p.name, photoUrl: p.photoUrl })),
    matches
  );
}

export async function getRankingWithHistory() {
  const [players, matches] = await Promise.all([
    getPlayers(),
    getAllMatchesData(),
  ]);

  return computeRankingWithHistory(
    players.map((p) => ({ id: p.id, name: p.name, photoUrl: p.photoUrl })),
    matches
  );
}

export async function getMatchesWithDetails() {
  return prisma.match.findMany({
    include: {
      players: {
        include: { player: true },
      },
      sets: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMatchById(id: string) {
  return prisma.match.findUnique({
    where: { id },
    include: {
      players: {
        include: { player: true },
      },
      sets: true,
    },
  });
}
