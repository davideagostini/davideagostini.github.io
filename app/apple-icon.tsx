import fs from "fs";
import path from "path";
import { ImageResponse } from "next/og";

// iOS ignores SVG favicons: render app/icon.svg (the one source of the "DA" mark)
// as a PNG. Square tile, because iOS rounds the corners itself.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  const svg = fs
    .readFileSync(path.join(process.cwd(), "app/icon.svg"), "utf8")
    .replace(/<path fill="#073042"[^>]*\/>/, '<rect fill="#073042" width="16" height="16"/>')
    .replace("<svg ", '<svg width="180" height="180" ');

  return new ImageResponse(
    (
      <img src={`data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`} width={180} height={180} alt="" />
    ),
    size,
  );
}
