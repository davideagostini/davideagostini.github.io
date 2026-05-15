import { getPostData, getAllPostIds, getPostFrontmatter } from "@/lib/posts";
import { SiteHeader } from "@/app/components/SiteHeader";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostFrontmatter(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  // Bump this when you change OG image layout/styling to force social cache refresh.
  const OG_IMAGE_VERSION = "v2";
  const ogImageUrl = `/android/${slug}/opengraph-image?v=${OG_IMAGE_VERSION}`;

  return {
    title: `${post.title} | Android Engineering Notes`,
    description: post.description,
    alternates: {
      canonical: `/android/${slug}`,
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/android/${slug}`,
      publishedTime: post.date,
      modifiedTime: post.date,
      authors: ["https://davideagostini.com"],
      tags: post.tags,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${post.title} - Open Graph image`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogImageUrl],
    },
  };
}

export async function generateStaticParams() {
  const posts = getAllPostIds();
  return posts.map((post) => ({
    slug: post.params.slug,
  }));
}

export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPostData(slug);

  if (!post) {
    return <div>Post not found</div>;
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": post.title,
    "description": post.description,
    "author": {
      "@type": "Person",
      "name": "Davide Agostini",
      "url": "https://davideagostini.com"
    },
    "datePublished": post.date,
    "dateModified": post.date,
    "keywords": post.tags.join(", ")
  };

  return (
    <main className="min-h-screen px-6 py-8 md:px-10 md:py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="mx-auto max-w-[980px]">
        <SiteHeader />

        <article className="mx-auto max-w-[680px]">
          <header className="mb-12">
            <Link href="/android" className="mb-10 inline-flex items-center gap-1 text-sm font-semibold text-zinc-500 hover:text-zinc-950 hover:underline dark:text-zinc-400 dark:hover:text-zinc-50">
              <ArrowLeft className="h-4 w-4" /> Back to Android notes
            </Link>
            <p className="mb-5 font-mono text-xs font-bold uppercase tracking-widest text-android">
              Android notes
            </p>
            <h1 className="mb-4 text-3xl font-semibold leading-tight tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-4xl">
            {post.title}
            </h1>
            <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 dark:text-zinc-500">
              <time dateTime={post.date}>{post.date}</time>
              <span className="h-1 w-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></span>
              <span>By Davide Agostini</span>
            </div>
          </header>

          <div className="prose prose-zinc prose-sm max-w-none dark:prose-invert sm:prose-base" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        </article>
      </div>
    </main>
  );
}
