#!/usr/bin/env node

const input = process.argv[2];

if (!input) {
  console.error("Usage: npm run check:og -- <post-slug-or-url>");
  process.exit(1);
}

const normalizeUrl = (value) => {
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  return `https://www.davideagostini.com/android/${value}`;
};

const extractMeta = (html, key, attr = "property") => {
  const regex = new RegExp(`<meta[^>]+${attr}=[\"']${key}[\"'][^>]*content=[\"']([^\"']+)[\"'][^>]*>`, "i");
  const match = html.match(regex);
  return match?.[1] ?? null;
};

const url = normalizeUrl(input);
const res = await fetch(url, { redirect: "follow" });

if (!res.ok) {
  console.error(`Failed to fetch page: ${res.status} ${res.statusText}`);
  process.exit(1);
}

const html = await res.text();

const ogImage = extractMeta(html, "og:image", "property");
const ogTitle = extractMeta(html, "og:title", "property");
const twitterImage = extractMeta(html, "twitter:image", "name");

console.log("URL:", url);
console.log("og:title:", ogTitle ?? "MISSING");
console.log("og:image:", ogImage ?? "MISSING");
console.log("twitter:image:", twitterImage ?? "MISSING");

if (!ogImage || !twitterImage) {
  console.error("\n❌ Missing required OG/Twitter image tags");
  process.exit(2);
}

let imageRes;
try {
  imageRes = await fetch(ogImage, { redirect: "follow" });
} catch (error) {
  console.error("\n❌ Could not fetch og:image:", error?.message ?? error);
  process.exit(3);
}

const contentType = imageRes.headers.get("content-type") || "unknown";
console.log("og:image status:", imageRes.status);
console.log("og:image content-type:", contentType);

if (!imageRes.ok || !contentType.startsWith("image/")) {
  console.error("\n❌ og:image URL is not valid");
  process.exit(4);
}

console.log("\n✅ OG metadata looks good");
