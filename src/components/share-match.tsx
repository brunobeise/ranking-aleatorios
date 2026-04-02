"use client";

import { useState } from "react";
import { MatchWithDeltas } from "@/domain/types";

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawInitials(
  ctx: CanvasRenderingContext2D,
  name: string,
  x: number,
  y: number,
  size: number
) {
  ctx.fillStyle = "#1a1a1a";
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "rgba(42, 42, 42, 0.8)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.stroke();

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  ctx.font = "bold 11px 'Barlow', 'Arial', sans-serif";
  ctx.fillStyle = "#C8FF00";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials, x + size / 2, y + size / 2);
}

async function generateMatchImage(match: MatchWithDeltas): Promise<Blob> {
  const width = 600;
  const height = 340;
  const scale = 2;

  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d")!;
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = "#0a0a0a";
  ctx.fillRect(0, 0, width, height);

  // Noise dots
  ctx.fillStyle = "rgba(200, 255, 0, 0.015)";
  for (let i = 0; i < 200; i++) {
    ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
  }

  // Top neon line
  const neonGrad = ctx.createLinearGradient(0, 0, width, 0);
  neonGrad.addColorStop(0, "transparent");
  neonGrad.addColorStop(0.3, "rgba(200, 255, 0, 0.5)");
  neonGrad.addColorStop(0.7, "rgba(200, 255, 0, 0.5)");
  neonGrad.addColorStop(1, "transparent");
  ctx.fillStyle = neonGrad;
  ctx.fillRect(0, 0, width, 3);

  // Header
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";
  ctx.font = "bold 32px 'Bebas Neue', 'Arial Black', sans-serif";
  ctx.fillStyle = "#C8FF00";
  ctx.fillText("ALEATÓRIOS PADEL", width / 2, 40);

  // Date
  const date = new Date(match.createdAt).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  ctx.font = "500 13px 'Barlow', 'Arial', sans-serif";
  ctx.fillStyle = "#666";
  ctx.fillText(date, width / 2, 58);

  // Separator
  const sepGrad = ctx.createLinearGradient(80, 0, width - 80, 0);
  sepGrad.addColorStop(0, "transparent");
  sepGrad.addColorStop(0.5, "rgba(200, 255, 0, 0.3)");
  sepGrad.addColorStop(1, "transparent");
  ctx.fillStyle = sepGrad;
  ctx.fillRect(80, 68, width - 160, 1);

  const team1 = match.players.filter((p) => p.team === 1);
  const team2 = match.players.filter((p) => p.team === 2);

  // Layout: two cards side by side with VS in the middle
  const panelW = 220;
  const panelH = 115;
  const panelY = 85;
  const gap = 60; // space for VS
  const leftX = (width - panelW * 2 - gap) / 2;
  const rightX = leftX + panelW + gap;

  const winBorder = "rgba(200, 255, 0, 0.3)";
  const winBg = "rgba(200, 255, 0, 0.04)";
  const loseBorder = "rgba(42, 42, 42, 0.8)";
  const loseBg = "rgba(26, 26, 26, 0.3)";

  // Team 1 panel
  ctx.fillStyle = match.team1Won ? winBg : loseBg;
  ctx.strokeStyle = match.team1Won ? winBorder : loseBorder;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(leftX, panelY, panelW, panelH, 10);
  ctx.fill();
  ctx.stroke();

  // Team 2 panel
  ctx.fillStyle = !match.team1Won ? winBg : loseBg;
  ctx.strokeStyle = !match.team1Won ? winBorder : loseBorder;
  ctx.beginPath();
  ctx.roundRect(rightX, panelY, panelW, panelH, 10);
  ctx.fill();
  ctx.stroke();

  // VS in the middle
  ctx.font = "bold 18px 'Bebas Neue', 'Arial Black', sans-serif";
  ctx.fillStyle = "#444";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("VS", width / 2, panelY + panelH / 2);

  // Draw team players inside panels
  async function drawTeam(
    players: typeof team1,
    x: number,
    isWinner: boolean
  ) {
    let startY = panelY + 16;

    if (isWinner) {
      ctx.font = "bold 10px 'Barlow', 'Arial', sans-serif";
      ctx.fillStyle = "#C8FF00";
      ctx.textAlign = "center";
      ctx.fillText("VITÓRIA", x + panelW / 2, startY);
      startY += 14;
    } else {
      startY += 6;
    }

    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      const py = startY + i * 38;
      const avatarSize = 28;
      const avatarX = x + 14;

      // Avatar
      if (p.photoUrl) {
        try {
          const img = await loadImage(p.photoUrl);
          ctx.save();
          ctx.beginPath();
          ctx.arc(
            avatarX + avatarSize / 2,
            py + avatarSize / 2,
            avatarSize / 2,
            0,
            Math.PI * 2
          );
          ctx.clip();
          ctx.drawImage(img, avatarX, py, avatarSize, avatarSize);
          ctx.restore();
        } catch {
          drawInitials(ctx, p.playerName, avatarX, py, avatarSize);
        }
      } else {
        drawInitials(ctx, p.playerName, avatarX, py, avatarSize);
      }

      // Name
      ctx.font = "600 13px 'Barlow', 'Arial', sans-serif";
      ctx.fillStyle = "#f0f0f0";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(p.playerName, avatarX + avatarSize + 8, py + avatarSize / 2);

      // Delta
      ctx.font = "bold 11px 'Barlow', 'Arial', sans-serif";
      ctx.fillStyle = p.delta > 0 ? "#4ade80" : "#f87171";
      ctx.textAlign = "right";
      ctx.fillText(
        `${p.delta > 0 ? "+" : ""}${p.delta}`,
        x + panelW - 12,
        py + avatarSize / 2
      );
    }
  }

  await drawTeam(team1, leftX, match.team1Won);
  await drawTeam(team2, rightX, !match.team1Won);

  // Score badges below the cards, centered
  const scoreY = panelY + panelH + 25;
  const setGap = 10;
  const setBadgeW = 60;
  const totalSetsWidth =
    match.sets.length * setBadgeW + (match.sets.length - 1) * setGap;
  let setStartX = (width - totalSetsWidth) / 2;

  for (const s of match.sets) {
    const t1Won = s.team1Score > s.team2Score;

    // Badge bg
    ctx.fillStyle = "rgba(26, 26, 26, 0.6)";
    ctx.strokeStyle = "rgba(42, 42, 42, 0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(setStartX, scoreY, setBadgeW, 36, 6);
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Team 1 score
    ctx.font = "bold 20px 'Bebas Neue', 'Arial Black', sans-serif";
    ctx.fillStyle = t1Won ? "#C8FF00" : "#555";
    ctx.fillText(String(s.team1Score), setStartX + 16, scoreY + 18);

    // ×
    ctx.fillStyle = "#333";
    ctx.font = "500 11px 'Barlow', 'Arial', sans-serif";
    ctx.fillText("×", setStartX + setBadgeW / 2, scoreY + 18);

    // Team 2 score
    ctx.font = "bold 20px 'Bebas Neue', 'Arial Black', sans-serif";
    ctx.fillStyle = !t1Won ? "#C8FF00" : "#555";
    ctx.fillText(String(s.team2Score), setStartX + setBadgeW - 16, scoreY + 18);

    setStartX += setBadgeW + setGap;
  }

  // Bottom neon line
  ctx.fillStyle = neonGrad;
  ctx.fillRect(0, height - 3, width, 3);

  // Footer
  ctx.font = "500 10px 'Barlow', 'Arial', sans-serif";
  ctx.fillStyle = "#333";
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillText("Aleatórios Padel • Ranking", width / 2, height - 10);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}

export function ShareMatchButton({ match }: { match: MatchWithDeltas }) {
  const [sharing, setSharing] = useState(false);

  async function handleShare() {
    setSharing(true);
    try {
      const blob = await generateMatchImage(match);
      const file = new File([blob], "partida-aleatorios.png", {
        type: "image/png",
      });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Resultado - Aleatórios Padel",
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "partida-aleatorios.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // User cancelled
    } finally {
      setSharing(false);
    }
  }

  return (
    <button
      onClick={handleShare}
      disabled={sharing}
      className="text-muted hover:text-neon transition-colors disabled:opacity-50"
      title="Compartilhar resultado"
    >
      <svg
        className="w-5 h-5"
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
    </button>
  );
}
