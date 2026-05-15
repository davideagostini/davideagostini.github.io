import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { getSortedPostsData } from "@/lib/posts";

const projects = [
  {
    title: "ViaMetric",
    desc: "AI Search Visibility Analytics. My playground for understanding how LLMs index and retrieve web content.",
    href: "https://viametric.app?ref=davideagostini.com",
    tag: "Research",
  },
  {
    title: "Notyze",
    desc: "Secure note-taking backend built with Ktor and MongoDB. Demonstrates clean architecture on the server-side.",
    href: "https://github.com/davideagostini/notyze",
    tag: "Ktor",
  },
  {
    title: "Translate AI",
    desc: "Chrome extension for translating and summarizing text using on-device AI models.",
    href: "https://github.com/davideagostini/translate-ai-extension",
    tag: "AI",
  },
  {
    title: "Tintracker",
    desc: "Mobile app for tracking activities and earnings. Built with Clean Architecture and Jetpack Compose.",
    href: "https://github.com/davideagostini/tintracker",
    tag: "Android",
  },
];

export default function Home() {
  const latestPosts = getSortedPostsData().slice(0, 3);

  return (
    <main className="min-h-screen px-6 py-10 md:px-12 md:py-16">
      <div className="mx-auto max-w-[760px]">
        <header className="mb-16 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-[540px]">
            <p className="mb-5 text-xs font-bold uppercase tracking-widest text-zinc-500">
              Android Security & Performance Engineer
            </p>
            <h1 className="mb-5 text-4xl font-bold tracking-tight text-zinc-950 sm:text-5xl">
              Davide Agostini
            </h1>
            <p className="text-base leading-7 text-zinc-700">
              I build high-performance mobile ecosystems. My expertise lies in{" "}
              <strong className="font-bold text-zinc-950">System Design</strong>,{" "}
              <strong className="font-bold text-zinc-950">Security (StrongBox/TEE)</strong>, and
              large-scale <strong className="font-bold text-zinc-950">Compose</strong>{" "}
              architectures.
            </p>
          </div>

          <Image
            src="/assets/profile.jpg"
            width={104}
            height={104}
            alt="Davide Agostini"
            className="h-24 w-24 object-cover grayscale sm:h-[104px] sm:w-[104px]"
            priority
          />
        </header>

        <nav className="mb-16 flex flex-wrap gap-x-5 gap-y-3 text-sm font-bold text-zinc-700">
          <SocialLink href="https://twitter.com/davideagostini" label="Twitter" />
          <SocialLink href="https://www.linkedin.com/in/davideagostini/" label="LinkedIn" />
          <SocialLink href="https://github.com/davideagostini" label="GitHub" />
          <Link href="/android" className="inline-flex items-center gap-1 text-zinc-950 hover:underline">
            Android notes <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>

        <Section title="Work">
          <div className="divide-y divide-zinc-200 border-y border-zinc-200">
            {projects.map((project) => (
              <ProjectLink key={project.title} {...project} />
            ))}
          </div>
        </Section>

        <Section title="Writing">
          <div className="space-y-4">
            <p className="leading-7 text-zinc-700">
              Deep dives into Jetpack Compose internals, memory leaks, and Android security
              patterns.
            </p>

            <div className="divide-y divide-zinc-200 border-y border-zinc-200">
              {latestPosts.map((post) => (
                <WritingLink
                  key={post.id}
                  title={post.title}
                  href={`/android/${post.id}`}
                  date={post.date}
                />
              ))}
              {latestPosts.length === 0 && (
                <p className="py-4 text-sm text-zinc-500">No notes published yet.</p>
              )}
            </div>

            <Link href="/android" className="inline-flex items-center gap-1 text-sm font-bold text-zinc-950 hover:underline">
              View all notes <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Section>

        <Section title="About">
          <div className="space-y-5 leading-7 text-zinc-700">
            <p>
              I am also the creator of{" "}
              <Link href="https://viametric.app" className="font-bold text-zinc-950 hover:underline">
                ViaMetric
              </Link>
              , a research project exploring how AI Search engines (like Perplexity and Gemini)
              perceive content. This &quot;failure&quot; taught me more about LLMs and retrieval
              systems than any success could have.
            </p>

            <ul className="space-y-3">
              <li>
                Lead Android Engineer at{" "}
                <Link href="https://www.synapseslab.com/" className="font-bold text-zinc-950 hover:underline">
                  Synapses
                </Link>
                , architecting the BlueGPS indoor navigation platform.
              </li>
              <li>
                Freelance developer for{" "}
                <Link href="https://www.foodys.it/" className="font-bold text-zinc-950 hover:underline">
                  Prestofood
                </Link>
                , Arm23, and{" "}
                <Link href="https://redraion.com/" className="font-bold text-zinc-950 hover:underline">
                  Red Raion
                </Link>
                .
              </li>
              <li>
                Computer Science educator for 7+ years, which drives my passion for writing
                detailed engineering notes.
              </li>
            </ul>
          </div>
        </Section>

        <footer className="border-t border-zinc-200 pt-8 text-xs uppercase tracking-widest text-zinc-500">
          © {new Date().getFullYear()} Davide Agostini · Sicily, Italy
        </footer>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-16">
      <h2 className="mb-6 text-xs font-bold uppercase tracking-widest text-zinc-500">{title}</h2>
      {children}
    </section>
  );
}

function SocialLink({
  href,
  label,
}: {
  href: string;
  label: string;
}) {
  return (
    <Link href={href} target="_blank" className="hover:text-zinc-950 hover:underline">
      {label}
    </Link>
  );
}

function ProjectLink({
  title,
  desc,
  href,
  tag,
}: {
  title: string;
  desc: string;
  href: string;
  tag: string;
}) {
  return (
    <Link href={href} target="_blank" className="group block py-5">
      <div className="mb-2 flex items-baseline justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-lg font-bold text-zinc-950 group-hover:underline">{title}</h3>
          <p className="mt-1 text-xs font-bold uppercase tracking-widest text-zinc-400">{tag}</p>
        </div>
        <ArrowUpRight className="h-5 w-5 shrink-0 text-zinc-400 group-hover:text-zinc-950" />
      </div>
      <p className="max-w-[620px] text-sm leading-6 text-zinc-600">{desc}</p>
    </Link>
  );
}

function WritingLink({ title, href, date }: { title: string; href: string; date?: string }) {
  return (
    <Link href={href} className="group flex items-baseline justify-between gap-4 py-4">
      <span className="text-sm font-bold leading-6 text-zinc-950 group-hover:underline">{title}</span>
      {date && <span className="shrink-0 text-xs text-zinc-400">{date}</span>}
    </Link>
  );
}
