
import Image from "next/image";
import Link from "next/link";
import { Github, Linkedin, Twitter, ArrowRight, Pin } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-zinc-100 dark:selection:bg-zinc-800">
      <div className="max-w-2xl mx-auto px-3 py-12 sm:py-16">
        <header className="mb-16 flex flex-col sm:flex-row items-start sm:items-center gap-8">
          <Image
            src="/assets/profile.jpg"
            width={88}
            height={88}
            alt="Davide Agostini"
            className="rounded-full ring-2 ring-zinc-100 dark:ring-zinc-800 object-cover"
            priority
          />
          <div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl text-zinc-900 dark:text-white">
              Davide Agostini
            </h1>
            <p className="mt-3 text-base font-medium text-zinc-600 dark:text-zinc-400">
              Software Engineer / Mobile Specialist
            </p>
            <div className="mt-5 flex gap-5">
              <Link
                href="https://twitter.com/davideagostini"
                target="_blank"
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </Link>
              <Link
                href="https://www.linkedin.com/in/davideagostini/"
                target="_blank"
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link
                href="https://github.com/davideagostini"
                target="_blank"
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </header>

        <section id="about" className="mb-12">
          <h2 className="text-xl font-semibold mb-8 text-zinc-900 dark:text-zinc-100">
            Some things about me
          </h2>
          <article className="prose prose-zinc dark:prose-invert leading-normal space-y-4 text-zinc-600 dark:text-zinc-400 text-justify hyphens-auto">
            <p>
              I transform complex business requirements into high-performance, user-centric mobile products. With a deep focus on{" "}
              <strong className="font-semibold text-zinc-900 dark:text-zinc-100">Kotlin</strong>,{" "}
              <strong className="font-semibold text-zinc-900 dark:text-zinc-100">Jetpack Compose</strong>, and{" "}
              <strong className="font-semibold text-zinc-900 dark:text-zinc-100">Clean Architecture</strong>, I build mobile ecosystems designed for scale and maintainability.
            </p>


            <ul className="list-disc pl-5 space-y-1">
              <li>
                Lead Android Engineer at{" "}
                <Link
                  href="https://www.synapseslab.com/"
                  target="_blank"
                  className="font-medium text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-300 underline decoration-zinc-400/50 hover:decoration-zinc-500 transition-colors"
                >
                  Synapses
                </Link>
                , spearheading the <strong className="font-semibold text-zinc-900 dark:text-zinc-100">BlueGPS</strong> platform (RTLS)
              </li>
              <li>
                Freelance developer for startups like{" "}
                <Link
                  href="https://www.foodys.it/"
                  target="_blank"
                  className="font-medium text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-300 underline decoration-zinc-400/50 hover:decoration-zinc-500 transition-colors"
                >
                  Prestofood
                </Link>
                , Arm23, and{" "}
                <Link
                  href="https://redraion.com/"
                  target="_blank"
                  className="font-medium text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-300 underline decoration-zinc-400/50 hover:decoration-zinc-500 transition-colors"
                >
                  Red Raion
                </Link>
              </li>
              <li>
                Consultant for the{" "}
                <Link
                  href="https://www.unict.it/"
                  target="_blank"
                  className="font-medium text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-300 underline decoration-zinc-400/50 hover:decoration-zinc-500 transition-colors"
                >
                  University of Catania
                </Link>
              </li>
              <li>
                Computer Science teacher for ~7 years before full-time mobile development
              </li>
              <li>Graduated from University of Catania</li>
              <li>Grew up in Sicily, Italy</li>
            </ul>
          </article>
        </section>

        <section id="projects" className="mb-12">
          <h2 className="text-xl font-semibold mb-8 text-zinc-900 dark:text-zinc-100">
            things i&apos;m working on // things i&apos;ve built
          </h2>
          <div className="flex flex-col gap-4">
            <Link
              href="https://github.com/davideagostini/translate-ai-extension"
              className="group flex flex-wrap items-baseline gap-2 text-sm text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
            >
              <Pin className="w-3.5 h-3.5 fill-red-500 text-red-500" />
              <span className="font-medium">Translate AI</span>
              <span className="text-zinc-500 dark:text-zinc-500 font-normal">
                (Chrome extension for translating and summarizing selected text with Gemini AI)
              </span>
              <ArrowRight className="w-3.5 h-3.5 opacity-50 -ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="https://github.com/davideagostini/notyze"
              className="group flex flex-wrap items-baseline gap-2 text-sm text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
            >
              <Pin className="w-3.5 h-3.5 fill-red-500 text-red-500" />
              <span className="font-medium">Notyze</span>
              <span className="text-zinc-500 dark:text-zinc-500 font-normal">
                (Note-taking backend built with Ktor and MongoDB)
              </span>
              <ArrowRight className="w-3.5 h-3.5 opacity-50 -ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="https://github.com/davideagostini/tintracker"
              className="group flex flex-wrap items-baseline gap-2 text-sm text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
            >
              <Pin className="w-3.5 h-3.5 fill-red-500 text-red-500" />
              <span className="font-medium">Tintracker</span>
              <span className="text-zinc-500 dark:text-zinc-500 font-normal">
                (Mobile app for tracking activities and calculating earnings)
              </span>
              <ArrowRight className="w-3.5 h-3.5 opacity-50 -ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
