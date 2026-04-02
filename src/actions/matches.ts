"use server";

import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

interface MatchInput {
  team1: [string, string];
  team2: [string, string];
  sets: { team1Score: number; team2Score: number }[];
  date?: string;
}

function validateMatch(data: MatchInput) {
  const allPlayers = [...data.team1, ...data.team2];
  if (new Set(allPlayers).size !== 4) {
    throw new Error("Partida deve ter 4 jogadores diferentes");
  }
  if (data.sets.length < 1) {
    throw new Error("Pelo menos 1 set é necessário");
  }
  for (const set of data.sets) {
    const max = Math.max(set.team1Score, set.team2Score);
    const min = Math.min(set.team1Score, set.team2Score);
    if (max < 6 || max > 7 || min < 0 || min > 5) {
      throw new Error(
        `Placar inválido: ${set.team1Score}x${set.team2Score}. Sets devem ser de 6x0 a 7x5`
      );
    }
    if (max === 7 && min < 5) {
      throw new Error(
        `Placar inválido: ${set.team1Score}x${set.team2Score}. Se um time faz 7, o outro deve ter pelo menos 5`
      );
    }
  }
}

export async function createMatch(data: MatchInput) {
  validateMatch(data);

  const matchDate = data.date ? new Date(data.date) : new Date();

  await prisma.match.create({
    data: {
      createdAt: matchDate,
      players: {
        create: [
          { playerId: data.team1[0], team: 1 },
          { playerId: data.team1[1], team: 1 },
          { playerId: data.team2[0], team: 2 },
          { playerId: data.team2[1], team: 2 },
        ],
      },
      sets: {
        create: data.sets.map((s) => ({
          team1Score: s.team1Score,
          team2Score: s.team2Score,
        })),
      },
    },
  });

  revalidateTag("ranking", "max");
  redirect("/");
}

export async function updateMatch(id: string, data: MatchInput) {
  validateMatch(data);

  const matchDate = data.date ? new Date(data.date) : undefined;

  await prisma.$transaction([
    prisma.matchPlayer.deleteMany({ where: { matchId: id } }),
    prisma.set.deleteMany({ where: { matchId: id } }),
    prisma.match.update({
      where: { id },
      data: {
        ...(matchDate && { createdAt: matchDate }),
        players: {
          create: [
            { playerId: data.team1[0], team: 1 },
            { playerId: data.team1[1], team: 1 },
            { playerId: data.team2[0], team: 2 },
            { playerId: data.team2[1], team: 2 },
          ],
        },
        sets: {
          create: data.sets.map((s) => ({
            team1Score: s.team1Score,
            team2Score: s.team2Score,
          })),
        },
      },
    }),
  ]);

  revalidateTag("ranking", "max");
  redirect("/");
}

export async function deleteMatch(id: string) {
  await prisma.match.delete({ where: { id } });
  revalidateTag("ranking", "max");
}
