import type { Metadata } from "next";
import { AppShowcase } from "@/app/components/AppShowcase";
import { SiteHeader } from "@/app/components/SiteHeader";
import { apps } from "@/lib/apps";

export const metadata: Metadata = {
  title: "Apps | Davide Agostini",
  description: "Apps built and published by Davide Agostini: Dunio for shared household finance, Tuttodì for daily notes, and Eye Break for screen breaks on macOS.",
  alternates: {
    canonical: "/apps",
  },
  openGraph: {
    title: "Apps | Davide Agostini",
    description: "Apps built and published by Davide Agostini: Dunio for shared household finance, Tuttodì for daily notes, and Eye Break for screen breaks on macOS.",
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
    description: "Apps built and published by Davide Agostini: Dunio for shared household finance, Tuttodì for daily notes, and Eye Break for screen breaks on macOS.",
    creator: "@davideagostini",
    images: ["/opengraph-image"],
  },
};

export default function AppsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Apps by Davide Agostini",
    description: "Apps built and published by Davide Agostini for Android, Wear OS and macOS.",
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
            Apps I design, build and publish myself, for Android, Wear OS and macOS. Free to use,
            calm by design, and private by default.
          </p>
        </header>

        <section className="mb-24">
          <h2 className="mb-8 font-mono text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            All apps
          </h2>

          <div className="space-y-6">
            {apps.map((app) => (
              <AppShowcase key={app.slug} app={app} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
