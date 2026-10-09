import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { apps } from "@/lib/apps";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

const title = `${site.name} | ${site.role}`;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title,
  description: site.description,
  alternates: {
    canonical: "/",
  },
  keywords: site.keywords,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: site.url,
    title,
    description: site.description,
    siteName: site.name,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: `${site.name} - ${site.role}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: site.description,
    creator: site.twitterHandle,
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: site.name,
      url: site.url,
      sameAs: Object.values(site.profiles),
      jobTitle: site.role,
      worksFor: [
        {
          "@type": "Organization",
          name: "Synapses",
        },
      ],
      knowsAbout: site.knowsAbout,
      image: `${site.url}/assets/profile.jpg`,
      description: site.description,
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: site.name,
      url: site.url,
      description: `Apps and Android engineering notes by ${site.name}, ${site.role}.`,
      publisher: {
        "@type": "Person",
        name: site.name,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: `Apps by ${site.name}`,
      itemListElement: apps.map((app, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${site.url}/apps/${app.slug}`,
        name: app.name,
      })),
    },
  ];

  return (
    <html lang="en">
      <head>
        <link rel="alternate" type="text/markdown" href="/llms.txt" title="LLMs.txt" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
