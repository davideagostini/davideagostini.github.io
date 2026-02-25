import { ImageResponse } from "next/og";
import { getPostFrontmatter } from "@/lib/posts";

export const alt = "Android Engineering Notes";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

async function loadJetBrainsMono(weight: 400 | 600 | 700) {
  const cssUrl = `https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@${weight}&display=swap`;
  const css = await (await fetch(cssUrl)).text();
  const match = css.match(/src: url\(([^)]+)\) format\('(opentype|truetype|woff2)'\)/);

  if (!match) {
    throw new Error("Failed to load JetBrains Mono font");
  }

  const fontFileUrl = match[1];
  return fetch(fontFileUrl).then((res) => res.arrayBuffer());
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostFrontmatter(slug);

  const title = post?.title ?? "Android Engineering Notes";
  const date = post?.date ?? "";

  const [jbMono400, jbMono700] = await Promise.all([
    loadJetBrainsMono(400),
    loadJetBrainsMono(700),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#0e0e0e",
          color: "#ffffff",
          fontFamily: "JetBrains Mono",
          border: "2px solid #1f1f1f",
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
              fontSize: 62,
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
            <div style={{ display: "flex", fontSize: 22, color: "#ffffff", fontWeight: 400 }}>
              {date}
            </div>

            <div
              style={{
                display: "flex",
                fontSize: 22,
                color: "#ffffff",
                fontWeight: 400,
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
      fonts: [
        {
          name: "JetBrains Mono",
          data: jbMono400,
          weight: 400,
          style: "normal",
        },
        {
          name: "JetBrains Mono",
          data: jbMono700,
          weight: 700,
          style: "normal",
        },
      ],
    }
  );
}
