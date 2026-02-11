import Image from "next/image";
import Link from "next/link";
import { Github, Linkedin, Twitter, ArrowUpRight, Pin } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen p-6 md:p-12 lg:p-16">
      <div className="max-w-[680px] mx-auto">
        <header className="mb-16">
          <div className="mb-8 text-xs font-bold uppercase tracking-widest text-zinc-500">
            Rev. 1.0
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-8 mb-8">
            <div className="relative shrink-0">
              <Image
                src="/assets/profile.jpg"
                width={140}
                height={140}
                alt="Davide Agostini - Android Software Engineer & GEO Specialist"
                className="border-2 border-zinc-900 object-cover"
                priority
              />
              <div className="absolute -bottom-2 -right-2 w-full h-full bg-zinc-900 -z-10"></div>
            </div>

            <div className="flex-1">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tighter text-zinc-900 mb-4">
                DAVIDE<br />AGOSTINI
              </h1>
              <p className="text-md font-medium uppercase text-zinc-600 mb-6 max-w-md">
                Android Software Engineer<br />Mobile Specialist
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <SocialLink href="https://twitter.com/davideagostini" icon={<Twitter className="w-4 h-4" />} label="TWITTER" ariaLabel="Follow Davide Agostini on Twitter" />
            <SocialLink href="https://www.linkedin.com/in/davideagostini/" icon={<Linkedin className="w-4 h-4" />} label="LINKEDIN" ariaLabel="Connect with Davide Agostini on LinkedIn" />
            <SocialLink href="https://github.com/davideagostini" icon={<Github className="w-4 h-4" />} label="GITHUB" ariaLabel="View Davide Agostini's projects on GitHub" />
          </div>

          <div className="mt-8 p-4 border-2 border-zinc-900 bg-emerald-50">
            <p className="text-sm font-bold text-zinc-900 mb-2 uppercase tracking-wide">
              Daily Android Engineering Notes
            </p>
            <p className="text-sm text-zinc-700 mb-3">
              One actionable takeaway on Compose, Performance, or Security every morning at 9AM CET.
            </p>
            <div className="flex gap-3">
              <Link
                href="https://twitter.com/davideagostini"
                target="_blank"
                className="inline-flex items-center text-xs font-bold bg-zinc-900 text-white px-3 py-1.5 hover:bg-zinc-700 transition-colors uppercase"
              >
                Follow on X
              </Link>
              <Link
                href="/android"
                className="inline-flex items-center text-xs font-bold border border-zinc-900 text-zinc-900 px-3 py-1.5 hover:bg-zinc-100 transition-colors uppercase"
              >
                Read latest notes
              </Link>
            </div>
          </div>

          <p className="mt-8 text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Building in public for 1,500+ followers on X
          </p>
        </header>

        <div className="border-t-2 border-zinc-900 my-12"></div>

        <section id="about" className="mb-16">
          <h2 className="text-sm font-bold uppercase tracking-widest bg-zinc-900 text-[#F5F5F0] inline-block px-2 py-1 mb-8">
            01. About
          </h2>
          <div className="space-y-6 text-zinc-800 leading-relaxed font-normal">
            <p>
              I transform complex business requirements into high-performance,
              user-centric mobile products. With a deep focus on{" "}
              <strong className="font-bold bg-yellow-200 px-1 text-zinc-900">Kotlin</strong>,{" "}
              <strong className="font-bold bg-yellow-200 px-1 text-zinc-900">Jetpack Compose</strong>, and{" "}
              <strong className="font-bold bg-yellow-200 px-1 text-zinc-900">Clean Architecture</strong>,
              I build mobile ecosystems designed for scale and maintainability.
            </p>

            <p>
              Beyond mobile, I am currently exploring the intersection of AI and technical SEO. As the founder of <Link href="https://viametric.app" className="underline font-bold hover:bg-zinc-900 hover:text-white transition-colors">ViaMetric</Link>, I help companies optimize their visibility for the AI Search era using our <Link href="https://viametric.app/tools/ai-visibility-checker" className="underline hover:bg-zinc-900 hover:text-white transition-colors">Free AI Visibility Checker</Link>.
            </p>

            <ul className="space-y-3 list-none pl-0">
              <ListItem>
                Lead Android Engineer at <Link href="https://www.synapseslab.com/" className="underline hover:bg-zinc-900 hover:text-white transition-colors">Synapses</Link>, spearheading the BlueGPS platform.
              </ListItem>
              <ListItem>
                Freelance developer for <Link href="https://www.foodys.it/" className="underline hover:bg-zinc-900 hover:text-white transition-colors">Prestofood</Link>, Arm23, and <Link href="https://redraion.com/" className="underline hover:bg-zinc-900 hover:text-white transition-colors">Red Raion</Link>.
              </ListItem>
              <ListItem>
                Consultant for the University of Catania.
              </ListItem>
              <ListItem>
                Computer Science teacher for ~7 years before full-time mobile development.
              </ListItem>
              <ListItem>
                Graduated from University of Catania.
              </ListItem>
              <ListItem>
                Grew up in Sicily, Italy.
              </ListItem>
            </ul>
          </div>
        </section>

        <section id="expertise" className="mb-16">
          <h2 className="text-sm font-bold uppercase tracking-widest bg-zinc-900 text-[#F5F5F0] inline-block px-2 py-1 mb-8">
            02. Expertise
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <SkillBadge label="Android (Kotlin)" />
            <SkillBadge label="Jetpack Compose" />
            <SkillBadge label="Clean Architecture" />
            <SkillBadge label="AI Search (GEO)" />
            <SkillBadge label="Technical SEO" />
            <SkillBadge label="SaaS Strategy" />
          </div>
        </section>

        <section id="focus" className="mb-16">
          <h2 className="text-sm font-bold uppercase tracking-widest bg-indigo-600 text-white inline-block px-2 py-1 mb-8">
            03. Current Focus
          </h2>
          <div className="border-2 border-indigo-600 p-6 bg-indigo-50/50">
            <h3 className="text-xl font-bold text-indigo-900 mb-2">ViaMetric: The SEO for the AI Era</h3>
            <p className="text-indigo-800/80 mb-4">
              I'm building an analytics platform designed to track how ChatGPT, Perplexity, and Gemini are citing your brand. Stop being invisible to the bots that decide your brand's authority.
            </p>
            <Link 
              href="https://viametric.app?ref=davideagostini.com" 
              target="_blank"
              className="inline-flex items-center font-bold text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              Analyze your AI Visibility <ArrowUpRight className="ml-1 w-4 h-4" />
            </Link>
          </div>
        </section>

        <section id="projects" className="mb-16">
          <h2 className="text-sm font-bold uppercase tracking-widest bg-zinc-900 text-[#F5F5F0] inline-block px-2 py-1 mb-8">
            04. Projects
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <ProjectCard
              title="ViaMetric"
              desc="Understand your Traffic & Optimize for AI Search"
              href="https://viametric.app?ref=davideagostini.com"
              starred
            />
            <ProjectCard
              title="Translate AI"
              desc="Chrome extension for translating and summarizing text"
              href="https://github.com/davideagostini/translate-ai-extension"
            />
            <ProjectCard
              title="Notyze"
              desc="Note-taking backend built with Ktor and MongoDB"
              href="https://github.com/davideagostini/notyze"
            />
            <ProjectCard
              title="Tintracker"
              desc="Mobile app for tracking activities and earnings"
              href="https://github.com/davideagostini/tintracker"
            />
          </div>
        </section>

        <section id="writing" className="mb-16">
          <h2 className="text-sm font-bold uppercase tracking-widest bg-zinc-900 text-[#F5F5F0] inline-block px-2 py-1 mb-8">
            05. Featured Writing
          </h2>
          <div className="space-y-4">
            <WritingLink 
              title="What is GEO? The Definitive Guide to AI Search" 
              href="https://viametric.app/blog/what-is-geo" 
            />
            <WritingLink 
              title="The Scraper Paradox: Detecting Headless AI Bots" 
              href="https://viametric.app/blog/is-your-waf-blocking-ai" 
            />
            <WritingLink 
              title="Why Citations are the New Backlinks" 
              href="https://viametric.app/blog/aeo-vs-seo-citations" 
            />
          </div>
        </section>

        <footer className="text-xs text-zinc-500 font-mono border-t border-zinc-300 pt-8 flex justify-between uppercase">
          <div>© {new Date().getFullYear()} Davide Agostini</div>
          <div>Sicily, Italy</div>
        </footer>
      </div>
    </main>
  );
}

function SocialLink({ href, icon, label, ariaLabel }: { href: string; icon: React.ReactNode; label: string; ariaLabel: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      aria-label={ariaLabel}
      className="flex items-center gap-2 px-4 py-2 border border-zinc-900 bg-white hover:bg-zinc-900 hover:text-white transition-all text-xs font-bold uppercase"
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="text-zinc-400 mt-1">::</span>
      <span>{children}</span>
    </li>
  );
}

function ProjectCard({ title, desc, href, starred = false }: { title: string; desc: string; href: string; starred?: boolean }) {
  return (
    <Link
      href={href}
      target="_blank"
      className="group block border-2 border-zinc-900 p-5 bg-white hover:-translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] transition-all"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          {starred && <Pin className="w-4 h-4 text-orange-500 fill-orange-500" />}
          <h3 className="font-bold text-lg bg-zinc-100 px-1 group-hover:bg-zinc-900 group-hover:text-white transition-colors inline-block">
            {title}
          </h3>
        </div>
        <ArrowUpRight className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
      </div>
      <p className="text-zinc-600 text-sm">{desc}</p>
    </Link>
  );
}

function SkillBadge({ label }: { label: string }) {
  return (
    <div className="px-3 py-2 border border-zinc-200 bg-zinc-50 text-xs font-bold text-zinc-600 uppercase tracking-tight text-center hover:border-zinc-900 transition-colors">
      {label}
    </div>
  );
}

function WritingLink({ title, href }: { title: string; href: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      className="flex items-center justify-between group p-4 border border-zinc-200 hover:border-zinc-900 transition-colors bg-white shadow-sm"
    >
      <span className="text-sm font-bold text-zinc-800 group-hover:text-zinc-900 underline decoration-zinc-200 group-hover:decoration-zinc-900 transition-all">
        {title}
      </span>
      <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
    </Link>
  );
}
