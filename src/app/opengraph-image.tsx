import { ImageResponse } from "next/og";

export const alt = "Joan Solé, fullstack developer in Barcelona";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "#f3f0e8",
          backgroundImage: "radial-gradient(#d9d3c6 1.5px, transparent 1.5px)",
          backgroundSize: "18px 18px",
          color: "#17150f",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#6b665d" }}>
          <span>joan-sole.com</span>
          <span style={{ display: "flex", width: 22, height: 22, borderRadius: 22, background: "#c23b1c" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 168, letterSpacing: -8, lineHeight: 1 }}>Joan Solé</span>
          <span style={{ fontSize: 34, color: "#6b665d", marginTop: 24 }}>
            Fullstack developer. Generative AI products, Barcelona.
          </span>
        </div>
      </div>
    ),
    size,
  );
}
