import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/app/components/SiteHeader";
import { SiteFooter } from "@/app/components/SiteFooter";
import { apps } from "@/lib/apps";
import { ArrowUpRight } from "lucide-react";
import { education, experience, skills, type Role } from "@/lib/about";
import { site } from "@/lib/site";

const title = `About | ${site.name}`;
const description = `${site.name}, ${site.role} at Synapses: career, skills, teaching and the apps I build on the side.`;

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    type: "profile",
    title,
    description,
    url: `${site.url}/about`,
    siteName: site.name,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: `${site.name} - ${site.role}` }],
  },
};

export default function About() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: `${site.url}/about`,
    mainEntity: {
      "@type": "Person",
      name: site.name,
      url: site.url,
      jobTitle: site.role,
      worksFor: { "@type": "Organization", name: "Synapses" },
      homeLocation: site.location,
      knowsAbout: site.knowsAbout,
      alumniOf: { "@type": "CollegeOrUniversity", name: "University of Catania" },
      sameAs: Object.values(site.profiles),
    },
  };

  return (
    <main className="min-h-screen px-6 py-8 md:px-10 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mx-auto max-w-[980px]">
        <SiteHeader />

        <header className="mb-24 grid gap-10 md:grid-cols-[1fr_180px] md:items-start">
          <div className="max-w-[720px]">
            <p className="mb-5 font-mono text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              {site.role} · {site.location}
            </p>
            <h1 className="mb-6 text-5xl font-semibold leading-[1.02] tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-6xl">
              About me
            </h1>
            <div className="space-y-5 text-xl leading-8 text-zinc-700 dark:text-zinc-300">
              <p>
                I&apos;m {site.name}. I&apos;ve been building Android apps since 2013, and since 2017 I&apos;ve been
                working at Synapses on{" "}
                <Link href="https://bluegps.it" className="font-semibold text-zinc-950 hover:underline dark:text-zinc-50">
                  BlueGPS
                </Link>
                , a real-time location platform used in factories, hospitals and offices.
              </p>
              <p>
                On the side I design, build and publish my own apps:{" "}
                {apps.map((app, index) => (
                  <span key={app.slug}>
                    <Link href={`/apps/${app.slug}`} className="font-semibold text-zinc-950 hover:underline dark:text-zinc-50">
                      {app.name}
                    </Link>
                    {index < apps.length - 2 ? ", " : index === apps.length - 2 ? " and " : "."}
                  </span>
                ))}
              </p>
              <p>
                Years of teaching Computer Science still shape how I write my{" "}
                <Link href="/android" className="font-semibold text-zinc-950 hover:underline dark:text-zinc-50">
                  Android notes
                </Link>
                : the way I would explain things to a teammate.
              </p>
            </div>
          </div>

          <Image
            src="/assets/profile.jpg"
            width={180}
            height={220}
            alt={site.name}
            className="h-44 w-36 rounded-2xl object-cover object-[center_26%] grayscale md:justify-self-end"
            priority
          />
        </header>

        <Section title="Experience">
          <RoleList roles={experience} />
          <Link
            href={site.profiles.linkedin}
            target="_blank"
            className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-zinc-950 hover:underline dark:text-zinc-50"
          >
            Full history on LinkedIn <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Section>

        <Section title="Education">
          <RoleList roles={education} />
        </Section>

        <Section title="Skills">
          <div className="grid gap-x-10 gap-y-10 md:grid-cols-2">
            {skills.map((skill) => (
              <div key={skill.group} className="border-t border-zinc-200 pt-5 dark:border-zinc-800">
                <h3 className="mb-4 text-xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">{skill.group}</h3>
                <ul className="flex flex-wrap gap-2">
                  {skill.items.map((item) => (
                    <li key={item} className="app-chip">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Interests">
          <div className="max-w-[720px] space-y-5 text-base leading-7 text-zinc-700 dark:text-zinc-300">
            <p>
              Outside Android, I spend time exploring AI products, personal finance tools, and sport, especially
              football.
            </p>
          </div>
        </Section>

        <Section title="Get in touch">
          <p className="max-w-[720px] text-base leading-7 text-zinc-700 dark:text-zinc-300">
            For work, a question about an app or a note, the quickest way to reach me is a message on{" "}
            <Link href={site.profiles.linkedin} target="_blank" className="font-bold text-zinc-950 hover:underline dark:text-zinc-50">
              LinkedIn
            </Link>
            .
          </p>
        </Section>

        <SiteFooter />
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-24">
      <h2 className="mb-8 font-mono text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">{title}</h2>
      {children}
    </section>
  );
}

function RoleList({ roles }: { roles: Role[] }) {
  return (
    <ol>
      {roles.map((role) => (
        <li
          key={`${role.title}-${role.period}`}
          className="grid gap-1 border-t border-zinc-200 py-5 dark:border-zinc-800 md:grid-cols-[160px_1fr] md:gap-10"
        >
          <span className="font-mono text-xs leading-7 text-zinc-400 dark:text-zinc-500">{role.period}</span>
          <div>
            <p className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              {role.title}{" "}
              <span className="font-normal text-zinc-500 dark:text-zinc-400">
                ·{" "}
                {role.href ? (
                  <Link href={role.href} target="_blank" className="hover:text-zinc-950 hover:underline dark:hover:text-zinc-50">
                    {role.org}
                  </Link>
                ) : (
                  role.org
                )}
              </span>
            </p>
            {role.summary && <p className="mt-2 text-base leading-7 text-zinc-600 dark:text-zinc-400">{role.summary}</p>}
            {role.points && (
              <ul className="mt-3 list-disc space-y-2 pl-5 text-base leading-7 text-zinc-600 marker:text-zinc-300 dark:text-zinc-400 dark:marker:text-zinc-700">
                {role.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
