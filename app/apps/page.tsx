import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/app/components/SiteHeader";
import { apps } from "@/lib/apps";

export const metadata: Metadata = {
  title: "Apps | Davide Agostini",
  description: "Small apps built by Davide Agostini for Android and macOS.",
  alternates: {
    canonical: "/apps",
  },
  openGraph: {
    title: "Apps | Davide Agostini",
    description: "Small apps built by Davide Agostini for Android and macOS.",
    url: "https://davideagostini.com/apps",
    type: "website",
    siteName: "Davide Agostini",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Apps by Davide Agostini",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Apps | Davide Agostini",
    description: "Small apps built by Davide Agostini for Android and macOS.",
    creator: "@davideagostini",
    images: ["/opengraph-image"],
  },
};

export default function AppsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Apps by Davide Agostini",
    description: "A collection of Android and macOS apps built by Davide Agostini.",
    url: "https://davideagostini.com/apps",
    author: {
      "@type": "Person",
      name: "Davide Agostini",
      url: "https://davideagostini.com",
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: apps.map((app, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://davideagostini.com/apps/${app.slug}`,
        name: app.name,
        item: {
          "@type": "SoftwareApplication",
          name: app.name,
          description: app.description,
          applicationCategory: app.category,
          operatingSystem: app.platform,
          isAccessibleForFree: app.price.toLowerCase() === "free",
          url: `https://davideagostini.com/apps/${app.slug}`,
        },
      })),
    },
  };

  return (
    <main className="min-h-screen px-6 py-8 md:px-10 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-[980px]">
        <SiteHeader />

        <header className="mb-20 max-w-[720px]">
          <p className="mb-5 font-mono text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Apps
          </p>
          <h1 className="mb-6 text-5xl font-semibold leading-[1.02] tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-6xl">
            Small products, built with care.
          </h1>
          <p className="max-w-[660px] text-xl leading-8 text-zinc-700 dark:text-zinc-300">
            A compact collection of apps I build for Android, macOS, and the workflows I care
            about.
          </p>
        </header>

        <section>
          <h2 className="mb-8 font-mono text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            Available apps
          </h2>

          <div className="grid gap-x-10 gap-y-10 md:grid-cols-2">
            {apps.map((app) => (
              <Link
                key={app.slug}
                href={`/apps/${app.slug}`}
                className="group block border-t border-zinc-200 pt-5 dark:border-zinc-800"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-4">
                    <Image
                      src={app.icon}
                      width={64}
                      height={64}
                      alt={`${app.name} app icon`}
                      className="h-16 w-16 rounded-2xl object-cover"
                    />
                    <div className="min-w-0">
                      <h3 className="text-2xl font-semibold tracking-tight text-zinc-950 group-hover:underline dark:text-zinc-50">
                        {app.name}
                      </h3>
                      <p className="mt-3 flex flex-wrap gap-2">
                        <span className={`app-chip ${app.accent}`}>{app.platform}</span>
                        <span className="app-chip">{app.price}</span>
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="mt-2 h-5 w-5 shrink-0 text-zinc-400 group-hover:text-zinc-950 dark:text-zinc-600 dark:group-hover:text-zinc-50" />
                </div>
                <p className="max-w-[620px] text-base leading-7 text-zinc-600 dark:text-zinc-400">
                  {app.tagline}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
