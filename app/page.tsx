import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/app/components/SiteHeader";
import { getSortedPostsData } from "@/lib/posts";

const projects = [
  {
    title: "Dunio",
    desc: "Shared household finance for couples and households: expenses, net worth, recurring payments, widgets, and a calm Android workspace.",
    href: "https://dunio.app",
    tag: "Android",
  },
  {
    title: "Android Build Analyzer",
    desc: "Gradle plugin for Android build hygiene: exposed API keys, APK composition, security checks, unused resources, dependency versions, and CI reports.",
    href: "https://github.com/davideagostini/android-build-analyzer",
    tag: "Gradle Plugin",
  },
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
    <main className="min-h-screen px-6 py-8 md:px-10 md:py-12">
      <div className="mx-auto max-w-[980px]">
        <SiteHeader showHero />

        <Section title="Selected Work">
          <div className="grid gap-x-10 gap-y-10 md:grid-cols-2">
            {projects.map((project) => (
              <ProjectLink key={project.title} {...project} />
            ))}
          </div>
        </Section>

        <div className="mb-24 grid gap-14 lg:grid-cols-[1fr_1fr]">
          <Section title="Writing">
            <div className="space-y-6">
              <p className="text-base leading-7 text-zinc-700 dark:text-zinc-300">
                Deep dives into Jetpack Compose internals, memory leaks, and Android security
                patterns.
              </p>

              <div className="space-y-5">
                {latestPosts.map((post) => (
                  <WritingLink
                    key={post.id}
                    title={post.title}
                    href={`/android/${post.id}`}
                    date={post.date}
                  />
                ))}
                {latestPosts.length === 0 && (
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">No notes published yet.</p>
                )}
              </div>

              <Link href="/android" className="inline-flex items-center gap-1 text-sm font-semibold text-zinc-950 hover:underline dark:text-zinc-50">
                View all notes <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Section>

          <Section title="About">
            <div className="space-y-10">
              <div className="space-y-5 text-base leading-7 text-zinc-700 dark:text-zinc-300">
                <p>
                  I am also the creator of{" "}
                  <Link href="https://viametric.app" className="font-bold text-zinc-950 hover:underline dark:text-zinc-50">
                    ViaMetric
                  </Link>
                  , a research project exploring how AI Search engines (like Perplexity and Gemini)
                  perceive content. This &quot;failure&quot; taught me more about LLMs and retrieval
                  systems than any success could have.
                </p>

                <ul className="space-y-3">
                  <li>
                    Lead Android Engineer at{" "}
                    <Link href="https://www.synapseslab.com/" className="font-bold text-zinc-950 hover:underline dark:text-zinc-50">
                      Synapses
                    </Link>
                    , architecting the BlueGPS indoor navigation platform.
                  </li>
                  <li>
                    Freelance developer for{" "}
                    <Link href="https://www.foodys.it/" className="font-bold text-zinc-950 hover:underline dark:text-zinc-50">
                      Prestofood
                    </Link>
                    , Arm23, and{" "}
                    <Link href="https://redraion.com/" className="font-bold text-zinc-950 hover:underline dark:text-zinc-50">
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

              <div>
                <h3 className="mb-4 font-mono text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                  Interests
                </h3>
                <p className="text-base leading-7 text-zinc-700 dark:text-zinc-300">
                  Outside Android, I spend time exploring AI products, personal finance tools, and
                  sport, especially football.
                </p>
              </div>
            </div>
          </Section>
        </div>

        <footer className="border-t border-zinc-200 pt-8 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          © {new Date().getFullYear()} Davide Agostini · Sicily, Italy
        </footer>
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
    <Link href={href} target="_blank" className="group block border-t border-zinc-200 pt-5 dark:border-zinc-800">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-2xl font-semibold tracking-tight text-zinc-950 group-hover:underline dark:text-zinc-50">{title}</h3>
          <p className={tag.toLowerCase().includes("android") ? "mt-2 font-mono text-xs font-bold uppercase tracking-widest text-android" : "mt-2 font-mono text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500"}>{tag}</p>
        </div>
        <ArrowUpRight className="h-5 w-5 shrink-0 text-zinc-400 group-hover:text-zinc-950 dark:text-zinc-600 dark:group-hover:text-zinc-50" />
      </div>
      <p className="max-w-[620px] text-base leading-7 text-zinc-600 dark:text-zinc-400">{desc}</p>
    </Link>
  );
}

function WritingLink({ title, href, date }: { title: string; href: string; date?: string }) {
  return (
    <Link href={href} className="group block">
      <span className="block text-base font-semibold leading-6 text-zinc-950 group-hover:underline dark:text-zinc-50">{title}</span>
      {date && <span className="mt-1 block font-mono text-xs text-zinc-400 dark:text-zinc-500">{date}</span>}
    </Link>
  );
}
