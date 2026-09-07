import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Same navy disc as app/icon.tsx, scaled. iOS masks this to a rounded rect, so
// the snow field carries the corners.
export default function AppleIcon() {
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
        <div style={{ width: 112, height: 112, borderRadius: "50%", background: "#000080" }} />
      </div>
    ),
    { ...size }
  );
}
