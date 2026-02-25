import { getPostData, getAllPostIds, getPostFrontmatter } from "@/lib/posts";
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
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: `/android/${slug}`,
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
            {post.title}
          </h1>
          <div className="flex items-center gap-4 text-xs font-mono text-zinc-400 mb-8">
            <time dateTime={post.date}>{post.date}</time>
            <span className="w-1 h-1 bg-zinc-300 rounded-full"></span>
            <span>By Davide Agostini</span>
          </div>
        </header>

        <article className="prose prose-zinc prose-sm sm:prose-base max-w-none" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
      </div>
    </main>
  );
}
