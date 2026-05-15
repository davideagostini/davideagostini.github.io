import { ImageResponse } from "next/og";

export const alt = "Davide Agostini - Senior Android Developer";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          color: "#09090b",
          padding: "72px",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", color: "#3ddc84", fontSize: 28, fontWeight: 700 }}>
          davideagostini.com
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", fontSize: 84, fontWeight: 800, letterSpacing: "-0.04em" }}>
            Davide Agostini
          </div>
          <div style={{ display: "flex", maxWidth: 900, fontSize: 34, lineHeight: 1.35, color: "#3f3f46" }}>
            Senior Android Developer • Kotlin & Kotlin Multiplatform • Modern UIs with Compose Multiplatform.
          </div>
        </div>
      </div>
    ),
    size
  );
}
