import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type SiteHeaderProps = {
  eyebrow?: string;
  title?: string;
  description?: string;
  showHero?: boolean;
};

const defaultDescription =
  "Senior Android Developer • Kotlin & Kotlin Multiplatform • Modern UIs with Compose Multiplatform.";

export function SiteHeader({
  eyebrow,
  title = "Davide Agostini",
  description = defaultDescription,
  showHero = false,
}: SiteHeaderProps) {
  return (
    <>
      <nav className="mb-20 flex items-center justify-between gap-6 text-sm">
        <Link href="/" className="font-semibold text-zinc-950 hover:underline dark:text-zinc-50">
          davideagostini.com
        </Link>
        <div className="flex flex-wrap justify-end gap-x-5 gap-y-2 font-medium text-zinc-500 dark:text-zinc-400">
          <SocialLink href="https://twitter.com/davideagostini" label="Twitter" />
          <SocialLink href="https://www.linkedin.com/in/davideagostini/" label="LinkedIn" />
          <SocialLink href="https://github.com/davideagostini" label="GitHub" />
          <Link href="/android" className="inline-flex items-center gap-1 font-semibold text-android hover:underline">
            Android <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </nav>

      {showHero && (
      <header className="mb-24 grid gap-10 md:grid-cols-[1fr_180px] md:items-start">
        <div>
          {eyebrow && (
            <p className="mb-5 font-mono text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              {eyebrow}
            </p>
          )}
          <h1 className="mb-6 max-w-[720px] text-5xl font-semibold leading-[1.02] tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-6xl">
            {title}
          </h1>
          <p className="max-w-[660px] text-xl leading-8 text-zinc-700 dark:text-zinc-300">
            {description}
          </p>
        </div>

        <Image
          src="/assets/profile.jpg"
          width={180}
          height={220}
          alt="Davide Agostini"
          className="h-44 w-36 rounded-md object-cover object-[center_26%] grayscale md:justify-self-end"
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
