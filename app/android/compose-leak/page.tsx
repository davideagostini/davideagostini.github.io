import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compose Performance: Fix Memory Leaks with LeakCanary | Android Notes",
  description: "Jetpack Compose performance issues are often memory leaks. Learn how to detect 'remember' leaks and fix jank using LeakCanary in 5 minutes.",
  keywords: ["Jetpack Compose", "Android Performance", "Memory Leak", "LeakCanary", "Kotlin", "Jank", "Optimization"],
  openGraph: {
    title: "Compose Performance: It's Probably a Leak",
    description: "Why 'Compose is slow' is often just a lifecycle mismatch. How to use LeakCanary to find long-lived remember references.",
    type: "article",
    publishedTime: "2026-02-12",
    authors: ["Davide Agostini"],
    tags: ["Android", "Compose", "Performance"],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@davideagostini",
    title: "Compose Performance: It's Probably a Leak",
    description: "Fixing Jetpack Compose jank by hunting down memory leaks.",
  }
};

export default function ComposeLeak() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": "Compose Performance: It's Probably a Leak",
    "description": "A guide to identifying and fixing memory leaks in Jetpack Compose applications using LeakCanary.",
    "author": {
      "@type": "Person",
      "name": "Davide Agostini",
      "url": "https://davideagostini.com"
    },
    "datePublished": "2026-02-12",
    "dateModified": "2026-02-12",
    "image": "https://davideagostini.com/android/compose-leak/og.png", 
    "keywords": "Android, Jetpack Compose, Performance, Memory Leak, LeakCanary"
  };

  return (
    <main className="min-h-screen p-6 md:p-12 lg:p-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="max-w-[680px] mx-auto">
        <header className="mb-12">
          <Link href="/android" className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-900 mb-8 transition-colors">
            <ArrowLeft className="w-3 h-3 mr-1" /> Back to Notes
          </Link>
          
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tighter text-zinc-900 mb-4">
            Compose Performance: It's Probably a Leak
          </h1>
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 mb-8">
            <time dateTime="2026-02-12">Feb 12, 2026</time>
            <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
            <span>By Davide Agostini</span>
          </div>
        </header>

        <article className="prose prose-zinc prose-sm sm:prose-base max-w-none">
          <p className="lead text-lg text-zinc-700 font-medium">
            When developers say "Jetpack Compose is slow," 90% of the time they are experiencing jank caused by unnecessary recompositions or memory leaks. The other 10% is <code>LazyList</code> misuse.
          </p>

          <h2 className="text-xl font-bold mt-8 mb-4 text-zinc-900">The "Remember" Trap</h2>
          <p>
            The most common leak I see in code reviews is holding onto heavy objects inside a <code>remember</code> block that outlives the view it's attached to, or passing lambdas that capture stable references that shouldn't be stable.
          </p>

          <div className="my-6">
            <div className="bg-zinc-100 rounded-t-lg px-4 py-2 text-xs font-mono text-zinc-500 border-b border-zinc-200">Kotlin</div>
            <pre className="bg-zinc-50 p-4 rounded-b-lg overflow-x-auto text-xs text-zinc-800 border border-t-0 border-zinc-200">
              <code>{`// ❌ BAD: This lambda captures 'viewModel' and creates a new instance on every recomposition if not careful
val onClick = { viewModel.doSomething() }

// ✅ GOOD: Method references or remembered lambdas
val onClick = remember(viewModel) { { viewModel.doSomething() } }`}</code>
            </pre>
          </div>

          <h2 className="text-xl font-bold mt-8 mb-4 text-zinc-900">How to Detect Leaks with LeakCanary</h2>
          <p>
            Don't guess. Use <strong>LeakCanary</strong>. It now has excellent support for detecting Compose-specific leaks.
          </p>
          <ol className="list-decimal pl-5 space-y-2 marker:text-zinc-500">
            <li>Add <code>debugImplementation 'com.squareup.leakcanary:leakcanary-android:2.12'</code> to your <code>build.gradle</code>.</li>
            <li>Run your app and navigate back and forth between screens.</li>
            <li>If you see the little bird icon notification, you have a leak.</li>
          </ol>

          <p className="mt-4">
            In Compose, a leak often manifests as the Activity not being destroyed, or a View being kept alive by a <code>CompositionLocal</code> that wasn't cleared.
          </p>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-8">
            <h3 className="text-sm font-bold text-yellow-800 uppercase tracking-wide mb-1">Key Takeaway</h3>
            <p className="text-sm text-yellow-900 m-0">
              Before you optimize your <code>Draw</code> modifiers, check your memory. A garbage collection pause during an animation frame looks exactly like "jank."
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
