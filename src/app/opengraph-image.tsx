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
          background: "#0f0d0b",
          backgroundImage: "radial-gradient(#3a3631 1.5px, transparent 1.5px)",
          backgroundSize: "18px 18px",
          color: "#f2eee6",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 24, color: "#9b9891" }}>
          <span>joan-sole.com</span>
          <span style={{ display: "flex", width: 22, height: 22, borderRadius: 22, background: "#f25f33" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 168, letterSpacing: -8, lineHeight: 1 }}>Joan Solé</span>
          <span style={{ fontSize: 34, color: "#9b9891", marginTop: 24 }}>
            Fullstack developer. Generative AI products, Barcelona.
          </span>
        </div>
      </div>
    ),
    size,
  );
}
