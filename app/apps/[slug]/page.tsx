import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/app/components/SiteHeader";
import { apps, getAppBySlug } from "@/lib/apps";

type AppDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return apps.map((app) => ({
    slug: app.slug,
  }));
}

export async function generateMetadata({ params }: AppDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const app = getAppBySlug(slug);

  if (!app) {
    return {};
  }

  return {
    title: `${app.name} | Davide Agostini`,
    description: app.description,
    alternates: {
      canonical: `/apps/${app.slug}`,
    },
    openGraph: {
      title: `${app.name} | Davide Agostini`,
      description: app.description,
      url: `https://davideagostini.com/apps/${app.slug}`,
      type: "website",
      siteName: "Davide Agostini",
      images: [
        {
          url: app.icon,
          width: 512,
          height: 512,
          alt: `${app.name} app icon`,
        },
      ],
    },
    twitter: {
      card: "summary",
      title: `${app.name} | Davide Agostini`,
      description: app.description,
      creator: "@davideagostini",
      images: [app.icon],
    },
  };
}

export default async function AppDetailPage({ params }: AppDetailPageProps) {
  const { slug } = await params;
  const app = getAppBySlug(slug);

  if (!app) {
    notFound();
  }

  const pageUrl = `https://davideagostini.com/apps/${app.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Apps",
          item: "https://davideagostini.com/apps",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: app.name,
          item: pageUrl,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: app.name,
      headline: app.tagline,
      description: app.description,
      applicationCategory: app.category,
      operatingSystem: app.platform,
      isAccessibleForFree: app.price.toLowerCase() === "free",
      featureList: app.highlights,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
      },
      author: {
        "@type": "Person",
        name: "Davide Agostini",
        url: "https://davideagostini.com",
      },
      url: pageUrl,
      image: `https://davideagostini.com${app.icon}`,
      sameAs: app.links.map((link) => link.href),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: app.faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ];

  return (
    <main className="min-h-screen px-6 py-8 md:px-10 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="mx-auto max-w-[980px]">
        <SiteHeader />

        <Link
          href="/apps"
          className="mb-12 inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-950 hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Apps
        </Link>

        <article>
          <header className="mb-20 grid gap-10 md:grid-cols-[160px_1fr] md:items-start">
            <Image
              src={app.icon}
              width={160}
              height={160}
              alt={`${app.name} app icon`}
              className="h-32 w-32 rounded-[2rem] object-cover md:h-40 md:w-40"
              priority
            />

            <div>
              <p className="mb-5 flex flex-wrap gap-2">
                <span className={`app-chip ${app.accent}`}>{app.platform}</span>
                <span className="app-chip">{app.price}</span>
                <span className="app-chip">{app.category}</span>
              </p>
              <h1 className="mb-5 text-5xl font-semibold leading-[1.02] tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-6xl">
                {app.name}
              </h1>
              <p className="max-w-[660px] text-xl leading-8 text-zinc-700 dark:text-zinc-300">
                {app.tagline}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {app.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    className="inline-flex items-center gap-2 border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-950 hover:border-zinc-950 dark:border-zinc-800 dark:text-zinc-50 dark:hover:border-zinc-50"
                  >
                    {link.label}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>
          </header>

          <div className="grid gap-14 md:grid-cols-[1.2fr_0.8fr]">
            <section className="space-y-14">
              <div>
                <h2 className="mb-6 font-mono text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  About
                </h2>
                <p className="text-lg leading-8 text-zinc-700 dark:text-zinc-300">
                  {app.description}
                </p>
                {app.details && (
                  <div className="mt-6 space-y-5 text-base leading-7 text-zinc-600 dark:text-zinc-400">
                    {app.details.map((detail) => (
                      <p key={detail}>{detail}</p>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h2 className="mb-6 font-mono text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  Availability
                </h2>
                <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">
                  {app.availability}
                </p>
              </div>
            </section>

            <section className="space-y-14">
              <div>
                <h2 className="mb-6 font-mono text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  Highlights
                </h2>
                <ul className="space-y-4">
                  {app.highlights.map((highlight) => (
                    <li
                      key={highlight}
                      className="border-t border-zinc-200 pt-4 text-base leading-7 text-zinc-600 dark:border-zinc-800 dark:text-zinc-400"
                    >
                      {highlight}
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="mb-6 font-mono text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  FAQ
                </h2>
                <div className="space-y-5">
                  {app.faq.map((item) => (
                    <div key={item.question} className="border-t border-zinc-200 pt-4 dark:border-zinc-800">
                      <h3 className="text-base font-semibold text-zinc-950 dark:text-zinc-50">
                        {item.question}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                        {item.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </article>
      </div>
    </main>
  );
}
