import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// The brand mark is the navy disc from the nav logo (.nav-logo-dot), not a
// letterform: "DeFi" set at 11px in a 32px box is an unreadable smudge at tab
// size, and a solid disc stays legible down to 16px.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#FFFAFA",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#000080" }} />
      </div>
    ),
    { ...size }
  );
}
