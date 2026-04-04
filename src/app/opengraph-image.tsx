import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const logoData = await readFile(
    join(process.cwd(), "public", "logo_aelatorios.png")
  );
  const logoBase64 = `data:image/png;base64,${logoData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          position: "relative",
        }}
      >
        {/* Glow effect */}
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(200, 255, 0, 0.08)",
            filter: "blur(80px)",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
        {/* Logo */}
        <img
          src={logoBase64}
          width={300}
          height={300}
          style={{ borderRadius: 24 }}
        />
        {/* Subtitle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 24,
          }}
        >
          <div
            style={{
              width: 40,
              height: 2,
              background: "rgba(200, 255, 0, 0.4)",
            }}
          />
          <span
            style={{
              color: "#888",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Ranking Oficial
          </span>
          <div
            style={{
              width: 40,
              height: 2,
              background: "rgba(200, 255, 0, 0.4)",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
