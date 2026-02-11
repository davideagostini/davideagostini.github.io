import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Twitter } from "lucide-react";

export const metadata = {
  title: "Android Engineering Notes | Davide Agostini",
  description: "Daily insights on Jetpack Compose, Android Performance, and Security.",
};

export default function AndroidNotes() {
  return (
    <main className="min-h-screen p-6 md:p-12 lg:p-16">
      <div className="max-w-[680px] mx-auto">
        <header className="mb-12">
          <Link href="/" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 mb-8 transition-colors">
            <ArrowLeft className="w-3 h-3 mr-1" /> Back home
          </Link>
          
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tighter text-zinc-900 mb-4">
            ANDROID<br />ENGINEERING NOTES
          </h1>
          <p className="text-zinc-600 max-w-md mb-6">
            Short, actionable technical notes on building production-grade Android apps. 
            Focus: <span className="font-bold bg-yellow-200 px-1">Compose</span>, <span className="font-bold bg-yellow-200 px-1">Performance</span>, <span className="font-bold bg-yellow-200 px-1">Security</span>.
          </p>

          <a 
            href="https://twitter.com/davideagostini" 
            target="_blank"
            className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-700 transition-all text-xs font-bold uppercase"
          >
            <Twitter className="w-4 h-4" />
            <span>Get these daily on X</span>
          </a>
        </header>

        <div className="border-t-2 border-zinc-900 my-12"></div>

        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-bold uppercase tracking-widest bg-zinc-900 text-[#F5F5F0] inline-block px-2 py-1">
              Latest Notes
            </h2>
          </div>

          <div className="space-y-6">
            <NoteCard 
              href="/android/compose-leak"
              date="Feb 12, 2026"
              title="Compose Performance: It's Probably a Leak"
              tags={["Compose", "Performance"]}
              desc="Why 'Compose is slow' is often just a lifecycle mismatch. How to use LeakCanary to find long-lived remember references."
            />
            {/* Future notes will be added here */}
          </div>
        </section>
      </div>
    </main>
  );
}

function NoteCard({ title, date, tags, desc, href }: { title: string; date: string; tags: string[]; desc: string; href: string }) {
  return (
    <Link href={href} className="group block border border-zinc-200 p-5 bg-white hover:border-zinc-900 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-2 gap-2">
        <h3 className="font-bold text-lg text-zinc-900 group-hover:underline decoration-2 underline-offset-2">
          {title}
        </h3>
        <span className="text-xs font-mono text-zinc-400 shrink-0">{date}</span>
      </div>
      
      <div className="flex gap-2 mb-3">
        {tags.map(tag => (
          <span key={tag} className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 border border-zinc-200 px-1.5 py-0.5">
            {tag}
          </span>
        ))}
      </div>
      
      <p className="text-zinc-600 text-sm leading-relaxed">
        {desc}
      </p>
    </Link>
  );
}
