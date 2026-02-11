import Image from "next/image";
import Link from "next/link";
import { Github, Linkedin, Twitter, ArrowUpRight, Pin, ArrowRight } from "lucide-react";
import { getSortedPostsData } from "@/lib/posts";

export default function Home() {
  const latestPosts = getSortedPostsData().slice(0, 3);

  const faqs = [
    {
      question: "What is your primary focus?",
      answer: "I specialize in advanced Android engineering, focusing on Security (StrongBox, TEE), Performance optimization, and offline-first architectures."
    },
    {
      question: "Are you still working on ViaMetric?",
      answer: "Yes, but it is now a research project. I use it to experiment with AI Search algorithms (GEO) and understand how LLMs perceive content, but my professional focus remains on mobile engineering."
    },
    {
      question: "Do you offer consulting?",
      answer: "I am currently open to consulting roles specifically for Android Security audits and high-performance Compose refactoring."
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <main className="min-h-screen p-6 md:p-12 lg:p-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="max-w-[680px] mx-auto">
        <header className="mb-16">
          <div className="mb-8 text-xs font-bold uppercase tracking-widest text-zinc-500">
            Rev. 2.0 // Android Focus
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-8 mb-8">
            <div className="relative shrink-0">
              <Image
                src="/assets/profile.jpg"
                width={140}
                height={140}
                alt="Davide Agostini - Android Security & Performance Engineer"
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
                Android Security & Performance<br />Engineer
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <SocialLink href="https://twitter.com/davideagostini" icon={<Twitter className="w-4 h-4" />} label="TWITTER" ariaLabel="Follow Davide Agostini on Twitter" />
            <SocialLink href="https://www.linkedin.com/in/davideagostini/" icon={<Linkedin className="w-4 h-4" />} label="LINKEDIN" ariaLabel="Connect with Davide Agostini on LinkedIn" />
            <SocialLink href="https://github.com/davideagostini" icon={<Github className="w-4 h-4" />} label="GITHUB" ariaLabel="View Davide Agostini's projects on GitHub" />
          </div>

          <div className="mt-8 p-4 border-2 border-zinc-900 bg-emerald-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Github className="w-32 h-32" />
            </div>
            <p className="text-sm font-bold text-zinc-900 mb-2 uppercase tracking-wide relative z-10">
              Daily Engineering Notes
            </p>
            <p className="text-sm text-zinc-700 mb-3 relative z-10 max-w-sm">
              Deep dives into Jetpack Compose internals, memory leaks, and Android security patterns.
            </p>
            <div className="flex gap-3 relative z-10">
              <Link
                href="/android"
                className="inline-flex items-center text-xs font-bold bg-zinc-900 text-white px-4 py-2 hover:bg-zinc-700 transition-colors uppercase shadow-sm"
              >
                Read Notes <ArrowRight className="ml-1 w-3 h-3" />
              </Link>
            </div>
          </div>
        </header>

        <div className="border-t-2 border-zinc-900 my-12"></div>

        <section id="about" className="mb-16">
          <h2 className="text-sm font-bold uppercase tracking-widest bg-zinc-900 text-[#F5F5F0] inline-block px-2 py-1 mb-8">
            01. About
          </h2>
          <div className="space-y-6 text-zinc-800 leading-relaxed font-normal">
            <p>
              I build high-performance mobile ecosystems. My expertise lies in <strong className="font-bold bg-yellow-200 px-1 text-zinc-900">System Design</strong>, <strong className="font-bold bg-yellow-200 px-1 text-zinc-900">Security (StrongBox/TEE)</strong>, and large-scale <strong className="font-bold bg-yellow-200 px-1 text-zinc-900">Compose</strong> architectures.
            </p>

            <p>
              I am also the creator of <Link href="https://viametric.app" className="underline hover:bg-zinc-900 hover:text-white transition-colors">ViaMetric</Link>, a research project exploring how AI Search engines (like Perplexity and Gemini) perceive content. This "failure" taught me more about LLMs and retrieval systems than any success could have.
            </p>

            <ul className="space-y-3 list-none pl-0">
              <ListItem>
                Lead Android Engineer at <Link href="https://www.synapseslab.com/" className="underline hover:bg-zinc-900 hover:text-white transition-colors">Synapses</Link>, architecting the BlueGPS indoor navigation platform.
              </ListItem>
              <ListItem>
                Open Source contributor focusing on secure storage and biometric authentication wrappers.
              </ListItem>
              <ListItem>
                Computer Science educator for 7+ years, which drives my passion for writing detailed engineering notes.
              </ListItem>
            </ul>
          </div>
        </section>

        <section id="expertise" className="mb-16">
          <h2 className="text-sm font-bold uppercase tracking-widest bg-zinc-900 text-[#F5F5F0] inline-block px-2 py-1 mb-8">
            02. Expertise
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <SkillBadge label="Android Security" />
            <SkillBadge label="Jetpack Compose" />
            <SkillBadge label="Kotlin Multiplatform" />
            <SkillBadge label="Offline-First" />
            <SkillBadge label="System Design" />
            <SkillBadge label="AI/LLM Integration" />
          </div>
        </section>

        <section id="latest-notes" className="mb-16">
          <h2 className="text-sm font-bold uppercase tracking-widest bg-zinc-900 text-[#F5F5F0] inline-block px-2 py-1 mb-8">
            03. Latest Engineering Notes
          </h2>
          <div className="space-y-4">
            {latestPosts.map((post) => (
              <WritingLink
                key={post.id}
                title={post.title}
                href={`/android/${post.id}`}
                date={post.date}
              />
            ))}
            {latestPosts.length === 0 && <p className="text-zinc-500 italic">No notes published yet.</p>}
            
            <div className="mt-4">
              <Link href="/android" className="text-xs font-bold uppercase underline decoration-zinc-300 hover:decoration-zinc-900 hover:text-zinc-900 text-zinc-500 transition-all">
                View all notes →
              </Link>
            </div>
          </div>
        </section>

        <section id="projects" className="mb-16">
          <h2 className="text-sm font-bold uppercase tracking-widest bg-zinc-900 text-[#F5F5F0] inline-block px-2 py-1 mb-8">
            04. Projects & Experiments
          </h2>

          <div className="grid grid-cols-1 gap-4">
             <ProjectCard
              title="ViaMetric"
              desc="AI Search Visibility Analytics. My playground for understanding how LLMs index and retrieve web content."
              href="https://viametric.app?ref=davideagostini.com"
              tag="Research"
            />
            <ProjectCard
              title="Notyze"
              desc="Secure note-taking backend built with Ktor and MongoDB. Demonstrates clean architecture on the server-side."
              href="https://github.com/davideagostini/notyze"
              tag="Ktor"
            />
            <ProjectCard
              title="Translate AI"
              desc="Chrome extension for translating and summarizing text using on-device AI models."
              href="https://github.com/davideagostini/translate-ai-extension"
              tag="AI"
            />
            <ProjectCard
              title="Tintracker"
              desc="Mobile app for tracking activities and earnings. Built with Clean Architecture and Jetpack Compose."
              href="https://github.com/davideagostini/tintracker"
              tag="Android"
            />
          </div>
        </section>

        <section id="faq" className="mb-16">
           <h2 className="text-sm font-bold uppercase tracking-widest bg-zinc-900 text-[#F5F5F0] inline-block px-2 py-1 mb-8">
            05. FAQ
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="group">
                <h3 className="font-bold text-zinc-900 mb-2 group-hover:text-emerald-700 transition-colors">
                  {faq.question}
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
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

function ProjectCard({ title, desc, href, tag }: { title: string; desc: string; href: string; tag?: string }) {
  return (
    <Link
      href={href}
      target="_blank"
      className="group block border-2 border-zinc-900 p-5 bg-white hover:-translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_rgba(24,24,27,1)] transition-all"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-lg bg-zinc-100 px-1 group-hover:bg-zinc-900 group-hover:text-white transition-colors inline-block">
            {title}
          </h3>
          {tag && (
            <span className="text-[10px] font-bold uppercase border border-zinc-200 px-1.5 py-0.5 text-zinc-500">
              {tag}
            </span>
          )}
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

function WritingLink({ title, href, date }: { title: string; href: string; date?: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between group p-4 border border-zinc-200 hover:border-zinc-900 transition-colors bg-white shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <span className="text-sm font-bold text-zinc-800 group-hover:text-zinc-900 underline decoration-zinc-200 group-hover:decoration-zinc-900 transition-all">
          {title}
        </span>
        {date && <span className="text-xs text-zinc-400 font-mono">{date}</span>}
      </div>
      <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
    </Link>
  );
}
