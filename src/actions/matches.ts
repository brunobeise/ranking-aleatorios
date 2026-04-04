"use server";

import { prisma } from "@/lib/prisma";
import { updateTag } from "next/cache";

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
    if (set.team1Score < 0 || set.team1Score > 10 || set.team2Score < 0 || set.team2Score > 10) {
      throw new Error(
        `Placar inválido: ${set.team1Score}x${set.team2Score}. Valores devem ser entre 0 e 10`
      );
    }
    if (set.team1Score === set.team2Score) {
      throw new Error(
        `Placar inválido: ${set.team1Score}x${set.team2Score}. O set não pode terminar empatado`
      );
    }
  }

  // Verificar empate quando número de sets for par
  if (data.sets.length % 2 === 0) {
    let team1Sets = 0;
    let team2Sets = 0;
    let team1Games = 0;
    let team2Games = 0;
    for (const set of data.sets) {
      if (set.team1Score > set.team2Score) team1Sets++;
      else team2Sets++;
      team1Games += set.team1Score;
      team2Games += set.team2Score;
    }
    if (team1Sets === team2Sets && team1Games === team2Games) {
      throw new Error(
        "Partida empatada! Com número par de sets e saldo de games igual, não é possível determinar o vencedor"
      );
    }
  }
}

export async function createMatch(data: MatchInput) {
  validateMatch(data);

  const matchDate = data.date ? new Date(data.date + "T12:00:00") : new Date();

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

  updateTag("ranking");
}

export async function updateMatch(id: string, data: MatchInput) {
  validateMatch(data);

  const matchDate = data.date ? new Date(data.date + "T12:00:00") : undefined;

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

  updateTag("ranking");
}

export async function deleteMatch(id: string) {
  await prisma.match.delete({ where: { id } });
  updateTag("ranking");
}
