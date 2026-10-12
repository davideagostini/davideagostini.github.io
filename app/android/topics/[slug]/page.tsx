import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/app/components/SiteHeader";
import { SiteFooter } from "@/app/components/SiteFooter";
import { NoteCard, TopicNav } from "@/app/components/Notes";
import { getPostsByTopic, getTopicsWithCounts } from "@/lib/posts";
import { topics } from "@/lib/topics";
import { site } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return getTopicsWithCounts().map((topic) => ({ slug: topic.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const topic = topics.find((t) => t.slug === slug);
  if (!topic) return { title: "Topic Not Found" };

  const title = `${topic.name} | Android Engineering Notes`;
  return {
    title,
    description: topic.description,
    alternates: {
      canonical: `/android/topics/${slug}`,
    },
    openGraph: {
      title,
      description: topic.description,
      url: `${site.url}/android/topics/${slug}`,
      type: "website",
      siteName: site.name,
      images: [{ url: "/android/opengraph-image", width: 1200, height: 630, alt: "Android Engineering Notes" }],
    },
  };
}

export default async function TopicPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const topic = topics.find((t) => t.slug === slug);
  if (!topic) notFound();

  const posts = getPostsByTopic(slug);

  return (
    <main className="min-h-screen px-6 py-8 md:px-10 md:py-12">
      <div className="mx-auto max-w-[980px]">
        <SiteHeader />

        <header className="mb-12 max-w-[720px]">
          <p className="mb-5 font-mono text-xs font-bold uppercase tracking-widest text-android">
            Android notes · Topic
          </p>
          <h1 className="mb-6 text-5xl font-semibold leading-[1.02] tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-6xl">
            {topic.name}
          </h1>
          <p className="max-w-[660px] text-xl leading-8 text-zinc-700 dark:text-zinc-300">{topic.description}</p>
        </header>

        <TopicNav active={slug} />

        <div className="grid gap-x-10 gap-y-10 md:grid-cols-2">
          {posts.map((post) => (
            <NoteCard
              key={post.id}
              href={`/android/${post.id}`}
              date={post.date}
              title={post.title}
              tags={post.tags}
              desc={post.description}
            />
          ))}
        </div>

        <SiteFooter />
      </div>
    </main>
  );
}
