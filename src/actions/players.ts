"use server";

import { prisma } from "@/lib/prisma";
import { revalidateTag } from "next/cache";

export async function createPlayer(formData: FormData) {
  const name = formData.get("name") as string;
  const photoUrl = (formData.get("photoUrl") as string) || null;

  if (!name?.trim()) {
    throw new Error("Nome é obrigatório");
  }

  await prisma.player.create({
    data: { name: name.trim(), photoUrl },
  });

  revalidateTag("ranking", "max");
}

export async function updatePlayer(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const photoUrl = (formData.get("photoUrl") as string) || null;

  if (!name?.trim()) {
    throw new Error("Nome é obrigatório");
  }

  await prisma.player.update({
    where: { id },
    data: { name: name.trim(), photoUrl },
  });

  revalidateTag("ranking", "max");
}

export async function deletePlayer(id: string) {
  await prisma.player.delete({ where: { id } });
  revalidateTag("ranking", "max");
}
