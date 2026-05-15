import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://davideagostini.com"),
  title: "Davide Agostini | Senior Android Developer",
  description:
    "Senior Android Developer focused on Kotlin, Kotlin Multiplatform, and modern UIs with Compose Multiplatform.",
  alternates: {
    canonical: "/",
  },
  keywords: [
    "Davide Agostini",
    "Android Engineer",
    "Mobile Security",
    "StrongBox",
    "TEE",
    "Jetpack Compose",
    "Performance Optimization",
    "Kotlin",
    "System Design",
    "Offline-First",
    "Italy",
  ],
  authors: [{ name: "Davide Agostini", url: "https://davideagostini.com" }],
  creator: "Davide Agostini",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://davideagostini.com",
    title: "Davide Agostini | Senior Android Developer",
    description:
      "Senior Android Developer focused on Kotlin, Kotlin Multiplatform, and modern UIs with Compose Multiplatform.",
    siteName: "Davide Agostini",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Davide Agostini - Senior Android Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Davide Agostini | Senior Android Developer",
    description:
      "Senior Android Developer focused on Kotlin, Kotlin Multiplatform, and Compose Multiplatform.",
    creator: "@davideagostini",
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
      name: "Davide Agostini",
      url: "https://davideagostini.com",
      sameAs: [
        "https://twitter.com/davideagostini",
        "https://www.linkedin.com/in/davideagostini/",
        "https://github.com/davideagostini",
        "https://davideagostini.medium.com/",
      ],
      jobTitle: "Senior Android Developer",
      worksFor: [
        {
          "@type": "Organization",
          name: "Synapses",
        },
      ],
      knowsAbout: [
        "Android Security",
        "StrongBox Keymaster",
        "Trusted Execution Environment (TEE)",
        "Jetpack Compose Internals",
        "Kotlin Multiplatform",
        "Compose Multiplatform",
        "System Design",
        "AI Search Visibility",
        "Personal Finance Tools",
        "Football"
      ],
      image: "https://davideagostini.com/assets/profile.jpg",
      description:
        "Senior Android Developer focused on Kotlin, Kotlin Multiplatform, and modern UIs with Compose Multiplatform.",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Davide Agostini",
      "url": "https://davideagostini.com",
      "description": "Portfolio and Android engineering notes by Davide Agostini, Senior Android Developer.",
      "publisher": {
        "@type": "Person",
        "name": "Davide Agostini"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Selected work by Davide Agostini",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "url": "https://dunio.app",
          "name": "Dunio"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "url": "https://github.com/davideagostini/android-build-analyzer",
          "name": "Android Build Analyzer"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "url": "https://viametric.app",
          "name": "ViaMetric"
        }
      ]
    }
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
