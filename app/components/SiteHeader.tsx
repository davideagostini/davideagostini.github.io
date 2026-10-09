import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { site } from "@/lib/site";

type SiteHeaderProps = {
  showHero?: boolean;
};

export function SiteHeader({ showHero = false }: SiteHeaderProps) {
  return (
    <>
      <nav className="mb-20 flex items-center justify-between gap-6 text-sm">
        <Link href="/" className="font-semibold text-zinc-950 hover:underline dark:text-zinc-50">
          davideagostini.com
        </Link>
        <div className="flex flex-wrap justify-end gap-x-5 gap-y-2 font-medium text-zinc-500 dark:text-zinc-400">
          <Link href="/apps" className="font-semibold text-zinc-950 hover:underline dark:text-zinc-50">
            Apps
          </Link>
          <Link href="/android" className="inline-flex items-center gap-1 font-semibold text-android hover:underline">
            Android notes <ArrowRight className="h-4 w-4" />
          </Link>
          <SocialLink href={site.profiles.github} label="GitHub" />
          <SocialLink href={site.profiles.linkedin} label="LinkedIn" />
          <SocialLink href={site.profiles.twitter} label="X" />
        </div>
      </nav>

      {showHero && (
        <header className="mb-24 grid gap-10 md:grid-cols-[1fr_180px] md:items-start">
          <div>
            <p className="mb-5 font-mono text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              {site.role} · {site.location}
            </p>
            <h1 className="mb-6 max-w-[720px] text-5xl font-semibold leading-[1.02] tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-7xl">
              I build Android apps, <span className="text-zinc-400 dark:text-zinc-500">and ship my own.</span>
            </h1>
            <p className="max-w-[640px] text-xl leading-8 text-zinc-700 dark:text-zinc-300">
              I&apos;m {site.name}. By day I work on Android with Kotlin, Jetpack Compose and Kotlin
              Multiplatform. On the side I design, build and publish small, calm apps: Dunio,
              Tuttodì and Eye Break.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm font-semibold">
              <Link
                href="/apps"
                className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-5 py-2.5 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                See the apps <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/android"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-300 px-5 py-2.5 text-zinc-950 hover:border-zinc-950 dark:border-zinc-700 dark:text-zinc-50 dark:hover:border-zinc-50"
              >
                Read the Android notes
              </Link>
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
      )}
    </>
  );
}

function SocialLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} target="_blank" className="hover:text-zinc-950 hover:underline dark:hover:text-zinc-50">
      {label}
    </Link>
  );
}
