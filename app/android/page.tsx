import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";
import { SiteHeader } from "@/app/components/SiteHeader";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Android Engineering Notes | Davide Agostini",
  description: "Daily insights on Jetpack Compose, Android Performance, and Security by Davide Agostini.",
  alternates: {
    canonical: "/android",
  },
  openGraph: {
    title: "Android Engineering Notes | Davide Agostini",
    description: "Short, actionable technical notes on building production-grade Android apps. Focus: Compose, Performance, Security.",
    url: "https://davideagostini.com/android",
    type: "website",
    siteName: "Davide Agostini",
    images: [{
      url: "/android/opengraph-image",
      width: 1200,
      height: 630,
      alt: "Android Engineering Notes"
    }]
  },
  twitter: {
    card: "summary_large_image",
    title: "Android Engineering Notes | Davide Agostini",
    description: "Daily insights on Jetpack Compose, Android Performance, and Security.",
    creator: "@davideagostini",
    images: ["/android/opengraph-image"]
  }
};

export default function AndroidNotes() {
  const posts = getSortedPostsData();
  
  // Create JSON-LD for CollectionPage
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Android Engineering Notes",
    "description": "A collection of technical notes on Android development, security, and performance.",
    "url": "https://davideagostini.com/android",
    "author": {
      "@type": "Person",
      "name": "Davide Agostini",
      "url": "https://davideagostini.com"
    },
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": posts.map((post, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://davideagostini.com/android/${post.id}`,
        "name": post.title
      }))
    }
  };

  return (
    <main className="min-h-screen px-6 py-8 md:px-10 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="mx-auto max-w-[980px]">
        <SiteHeader />

        <header className="mb-24 max-w-[720px]">
          <p className="mb-5 font-mono text-xs font-bold uppercase tracking-widest text-android">
            Android notes
          </p>
          
          <h1 className="mb-6 text-5xl font-semibold leading-[1.02] tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-6xl">
            Android Engineering Notes
          </h1>
          <p className="max-w-[660px] text-xl leading-8 text-zinc-700 dark:text-zinc-300">
            Short, actionable technical notes on building production-grade Android apps. Focus:
            Compose, Performance, and Security.
          </p>
        </header>

        <section>
          <h2 className="mb-8 font-mono text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Latest notes
          </h2>

          <div className="grid gap-x-10 gap-y-10 md:grid-cols-2">
            {posts.map((post) => (
              <NoteCard
                key={post.id}
                href={`/android/${post.id}`}
                date={post.date}
                title={post.title}
                tags={post.tags}
                desc={post.description}
              />
            ))}
            {posts.length === 0 && <p className="text-zinc-500 text-sm dark:text-zinc-400">No notes found.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}

function NoteCard({ title, date, tags, desc, href }: { title: string; date: string; tags: string[]; desc: string; href: string }) {
  return (
    <Link href={href} className="group block border-t border-zinc-200 pt-5 dark:border-zinc-800">
      <div className="mb-4">
        <h3 className="text-2xl font-semibold leading-tight tracking-tight text-zinc-950 group-hover:underline dark:text-zinc-50">
          {title}
        </h3>
        <time dateTime={date} className="mt-2 block font-mono text-xs text-zinc-400 dark:text-zinc-500">
          {date}
        </time>
      </div>
      
      <div className="mb-4 flex flex-wrap gap-2">
        {tags.map(tag => (
          <span key={tag} className={tag.toLowerCase().includes("android") ? "font-mono text-xs font-bold uppercase tracking-widest text-android" : "font-mono text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500"}>
            {tag}
          </span>
        ))}
      </div>
      
      <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
        {desc}
      </p>
    </Link>
  );
}
