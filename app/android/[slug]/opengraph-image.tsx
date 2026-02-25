import { ImageResponse } from "next/og";
import { getPostFrontmatter } from "@/lib/posts";

export const alt = "Android Engineering Notes";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostFrontmatter(slug);

  const title = post?.title ?? "Android Engineering Notes";
  const date = post?.date ?? "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#030712",
          color: "#f8fafc",
          fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
          borderRadius: 28,
          border: "2px solid #111827",
          padding: "56px 64px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              maxWidth: "86%",
              fontSize: 72,
              lineHeight: 1.05,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {title}
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ fontSize: 40, color: "#9ca3af", fontWeight: 600 }}>{date}</div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#e5e7eb",
                  padding: "12px 18px",
                  fontSize: 38,
                  fontWeight: 500,
                  maxWidth: 760,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {title}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 40,
                color: "#9ca3af",
                fontWeight: 600,
              }}
            >
              davideagostini.com
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
