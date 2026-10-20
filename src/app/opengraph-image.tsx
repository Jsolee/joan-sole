import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Joan Solé, fullstack developer in Barcelona";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function portrait() {
  "use cache";
  const png = await readFile(join(process.cwd(), "public/og/portrait.png"));
  return `data:image/png;base64,${png.toString("base64")}`;
}

export default async function Image() {
  const src = await portrait();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#f3f0e8",
          backgroundImage: "radial-gradient(#d9d3c6 1.5px, transparent 1.5px)",
          backgroundSize: "18px 18px",
          color: "#17150f",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 64, flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 24, color: "#6b665d" }}>
            <span style={{ display: "flex", width: 16, height: 16, borderRadius: 16, background: "#c23b1c" }} />
            joan-sole.com
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: 150, letterSpacing: -7, lineHeight: 0.9 }}>Joan</span>
            <span style={{ fontSize: 150, letterSpacing: -7, lineHeight: 0.9 }}>Solé</span>
            <span style={{ fontSize: 30, color: "#6b665d", marginTop: 36 }}>Fullstack developer</span>
            <span style={{ fontSize: 30, color: "#6b665d", marginTop: 4 }}>Generative AI products · Barcelona</span>
          </div>
        </div>
        <img src={src} width={448} height={560} alt="" style={{ position: "absolute", right: 24, bottom: 0 }} />
      </div>
    ),
    size,
  );
}
