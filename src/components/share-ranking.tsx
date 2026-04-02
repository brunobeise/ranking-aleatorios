"use client";

import { useState } from "react";

interface RankedPlayer {
  id: string;
  name: string;
  photoUrl: string | null;
  rating: number;
  wins: number;
  losses: number;
  streak: number;
}

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function generatePodiumImage(
  players: RankedPlayer[]
): Promise<Blob> {
  const top = players.slice(0, 3);
  const width = 600;
  const height = 500;
  const scale = 2;

  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, width, height);

  // Subtle scatter dots
  ctx.fillStyle = "rgba(200, 255, 0, 0.015)";
  for (let i = 0; i < 300; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    ctx.fillRect(x, y, 2, 2);
  }

  // Top neon line
  const topGrad = ctx.createLinearGradient(0, 0, width, 0);
  topGrad.addColorStop(0, "transparent");
  topGrad.addColorStop(0.3, "rgba(200, 255, 0, 0.5)");
  topGrad.addColorStop(0.7, "rgba(200, 255, 0, 0.5)");
  topGrad.addColorStop(1, "transparent");
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, 0, width, 3);

  // Title: ALEATÓRIOS PADEL
  ctx.textAlign = "center";
  ctx.font = "bold 42px 'Bebas Neue', 'Arial Black', sans-serif";
  ctx.fillStyle = "#C8FF00";
  ctx.fillText("ALEATÓRIOS", width / 2, 50);

  ctx.font = "bold 16px 'Barlow Condensed', 'Arial', sans-serif";
  ctx.fillStyle = "#666";
  ctx.fillText("PADEL  •  RANKING", width / 2, 70);

  // Separator
  const sepGrad = ctx.createLinearGradient(100, 0, width - 100, 0);
  sepGrad.addColorStop(0, "transparent");
  sepGrad.addColorStop(0.5, "rgba(200, 255, 0, 0.3)");
  sepGrad.addColorStop(1, "transparent");
  ctx.fillStyle = sepGrad;
  ctx.fillRect(100, 82, width - 200, 1);

  // Podium layout: [2nd, 1st, 3rd]
  const order = [1, 0, 2];
  const podiumHeights = [110, 145, 85];
  const podiumColors = [
    { top: "rgba(161,161,170,0.25)", bot: "rgba(161,161,170,0.08)", border: "rgba(161,161,170,0.3)", text: "#a1a1aa" },
    { top: "rgba(200,255,0,0.25)", bot: "rgba(200,255,0,0.05)", border: "rgba(200,255,0,0.4)", text: "#C8FF00" },
    { top: "rgba(180,83,9,0.25)", bot: "rgba(180,83,9,0.08)", border: "rgba(180,83,9,0.3)", text: "#d97706" },
  ];
  const posLabels = ["2°", "1°", "3°"];
  const avatarSize = 56;
  const podiumBaseY = height - 60;
  const colWidth = width / 3;

  // Load photos
  const photos: (HTMLImageElement | null)[] = [];
  for (const idx of order) {
    const p = top[idx];
    if (p?.photoUrl) {
      try {
        photos.push(await loadImage(p.photoUrl));
      } catch {
        photos.push(null);
      }
    } else {
      photos.push(null);
    }
  }

  for (let i = 0; i < order.length; i++) {
    const idx = order[i];
    const player = top[idx];
    if (!player) continue;

    const cx = colWidth * i + colWidth / 2;
    const ph = podiumHeights[i];
    const podiumTop = podiumBaseY - ph;
    const colors = podiumColors[i];

    // Podium block
    const pGrad = ctx.createLinearGradient(0, podiumTop, 0, podiumBaseY);
    pGrad.addColorStop(0, colors.top);
    pGrad.addColorStop(1, colors.bot);
    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.roundRect(cx - 55, podiumTop, 110, ph, [8, 8, 0, 0]);
    ctx.fill();

    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(cx - 55, podiumTop, 110, ph, [8, 8, 0, 0]);
    ctx.stroke();

    // Position label on podium
    ctx.font = "bold 32px 'Bebas Neue', 'Arial Black', sans-serif";
    ctx.fillStyle = colors.text;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(posLabels[i], cx, podiumTop + ph / 2);

    // Avatar above podium
    const avatarY = podiumTop - avatarSize - 60;
    const photo = photos[i];

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
    ctx.closePath();

    if (photo) {
      ctx.clip();
      ctx.drawImage(
        photo,
        cx - avatarSize / 2,
        avatarY,
        avatarSize,
        avatarSize
      );
    } else {
      ctx.fillStyle = "#1a1a1a";
      ctx.fill();
      ctx.font = "bold 20px 'Barlow', 'Arial', sans-serif";
      ctx.fillStyle = "#C8FF00";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const initials = player.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
      ctx.fillText(initials, cx, avatarY + avatarSize / 2);
    }
    ctx.restore();

    // Ring around avatar
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, avatarY + avatarSize / 2, avatarSize / 2 + 2, 0, Math.PI * 2);
    ctx.stroke();

    // Crown for 1st
    if (idx === 0) {
      ctx.font = "22px serif";
      ctx.textAlign = "center";
      ctx.fillText("👑", cx, avatarY - 10);
    }

    // Name
    ctx.font = "bold 15px 'Barlow', 'Arial', sans-serif";
    ctx.fillStyle = "#f0f0f0";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(player.name, cx, avatarY + avatarSize + 6);

    // Rating
    ctx.font = "bold 14px 'Barlow Condensed', 'Arial', sans-serif";
    ctx.fillStyle = "#C8FF00";
    ctx.fillText(`${player.rating} pts`, cx, avatarY + avatarSize + 24);

    // W/L
    ctx.font = "500 11px 'Barlow', 'Arial', sans-serif";
    ctx.fillStyle = "#888";
    ctx.fillText(`${player.wins}V / ${player.losses}D`, cx, avatarY + avatarSize + 42);
  }

  // Footer line
  ctx.fillStyle = topGrad;
  ctx.fillRect(0, height - 3, width, 3);

  // Date
  ctx.font = "500 11px 'Barlow', 'Arial', sans-serif";
  ctx.fillStyle = "#333";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  const today = new Date().toLocaleDateString("pt-BR");
  ctx.fillText(`Atualizado em ${today}`, width / 2, height - 10);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}

export function SharePodiumButton({ players }: { players: RankedPlayer[] }) {
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    if (players.length < 3) return;
    setSharing(true);
    try {
      const blob = await generatePodiumImage(players);
      const file = new File([blob], "ranking-aleatorios.png", {
        type: "image/png",
      });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Ranking Aleatórios Padel",
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "ranking-aleatorios.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // User cancelled share
    } finally {
      setSharing(false);
    }
  }

  if (players.length < 3) return null;

  return (
    <div className="flex justify-center mb-6">
      <button
        onClick={handleShare}
        disabled={sharing}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-surface-border hover:border-neon/30 text-muted hover:text-neon transition-all text-sm disabled:opacity-50"
        title="Compartilhar pódio"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        {sharing ? "Gerando..." : "Compartilhar Pódio"}
      </button>
    </div>
  );
}
