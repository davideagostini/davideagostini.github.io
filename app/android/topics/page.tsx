import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/app/components/SiteHeader";
import { SiteFooter } from "@/app/components/SiteFooter";
import { getTopicsWithCounts } from "@/lib/posts";
import { site } from "@/lib/site";

const title = `Topics | Android Engineering Notes`;
const description = "Android engineering notes grouped by topic: Compose, architecture, performance, security and more.";

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/android/topics",
  },
  openGraph: {
    title,
    description,
    url: `${site.url}/android/topics`,
    type: "website",
    siteName: site.name,
    images: [{ url: "/android/opengraph-image", width: 1200, height: 630, alt: "Android Engineering Notes" }],
  },
};

export default function Topics() {
  const topics = getTopicsWithCounts();

  return (
    <main className="min-h-screen px-6 py-8 md:px-10 md:py-12">
      <div className="mx-auto max-w-[980px]">
        <SiteHeader />

        <header className="mb-16 max-w-[720px]">
          <p className="mb-5 font-mono text-xs font-bold uppercase tracking-widest text-android">
            Android notes
          </p>
          <h1 className="mb-6 text-5xl font-semibold leading-[1.02] tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-6xl">
            Topics
          </h1>
          <p className="max-w-[660px] text-xl leading-8 text-zinc-700 dark:text-zinc-300">
            Every note, grouped by what it is about.
          </p>
        </header>

        <div className="grid gap-x-10 gap-y-10 md:grid-cols-2">
          {topics.map((topic) => (
            <Link
              key={topic.slug}
              href={`/android/topics/${topic.slug}`}
              className="group block border-t border-zinc-200 pt-5 dark:border-zinc-800"
            >
              <div className="mb-3 flex items-baseline justify-between gap-4">
                <h2 className="text-2xl font-semibold tracking-tight text-zinc-950 group-hover:underline dark:text-zinc-50">
                  {topic.name}
                </h2>
                <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
                  {topic.count} {topic.count === 1 ? "note" : "notes"}
                </span>
              </div>
              <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">{topic.description}</p>
            </Link>
          ))}
        </div>

        <Link
          href="/android"
          className="mt-16 inline-flex items-center gap-1 text-sm font-semibold text-zinc-950 hover:underline dark:text-zinc-50"
        >
          All notes <ArrowRight className="h-4 w-4" />
        </Link>

        <SiteFooter />
      </div>
    </main>
  );
}
