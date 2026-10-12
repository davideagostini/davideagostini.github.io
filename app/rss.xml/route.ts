import { getSortedPostsData } from "@/lib/posts";
import { site } from "@/lib/site";
import { getTopic } from "@/lib/topics";

// Built once at build time: the feed changes only when a post is added.
export const dynamic = "force-static";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const posts = getSortedPostsData();
  const feedUrl = `${site.url}/rss.xml`;

  const items = posts
    .map((post) => {
      const url = `${site.url}/android/${post.id}`;
      const categories = post.tags
        .map((tag) => `      <category>${escapeXml(getTopic(tag).name)}</category>`)
        .join("\n");
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description>${escapeXml(post.description)}</description>
${categories}
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Android Engineering Notes | ${escapeXml(site.name)}</title>
    <link>${site.url}/android</link>
    <description>Technical notes on Jetpack Compose, Android architecture, performance and security by ${escapeXml(site.name)}.</description>
    <language>en</language>
    <lastBuildDate>${posts.length ? new Date(posts[0].date).toUTCString() : new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
