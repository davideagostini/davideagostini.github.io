import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.davideagostini.com"),
  title: "Davide Agostini | Android Security & Performance Engineer",
  description:
    "Senior Android Engineer specializing in Security (StrongBox/TEE), Performance Optimization, and Jetpack Compose Architecture. Founder of ViaMetric.",
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
    title: "Davide Agostini | Android Security & Performance Engineer",
    description:
      "Senior Android Engineer specializing in Security (StrongBox/TEE), Performance Optimization, and Jetpack Compose Architecture.",
    siteName: "Davide Agostini",
    images: [
      {
        url: "/assets/profile.jpg",
        width: 800,
        height: 800,
        alt: "Davide Agostini - Android Security Engineer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Davide Agostini | Android Security & Performance Engineer",
    description:
      "Senior Android Engineer specializing in Security (StrongBox/TEE), Performance Optimization, and Jetpack Compose.",
    creator: "@davideagostini",
    images: ["/assets/profile.jpg"],
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
      jobTitle: "Senior Android Engineer",
      worksFor: [
        {
          "@type": "Organization",
          name: "Synapses",
        },
        {
          "@type": "Organization",
          name: "ViaMetric",
          url: "https://viametric.app"
        }
      ],
      knowsAbout: [
        "Android Security",
        "StrongBox Keymaster",
        "Trusted Execution Environment (TEE)",
        "Jetpack Compose Internals",
        "Kotlin Multiplatform",
        "System Design",
        "AI Search Visibility"
      ],
      image: "https://davideagostini.com/assets/profile.jpg",
      description:
        "Senior Android Engineer specializing in Security (StrongBox/TEE), Performance Optimization, and Jetpack Compose Architecture.",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Davide Agostini",
      "url": "https://davideagostini.com",
      "description": "Engineering notes and portfolio of Davide Agostini, Android Security & Performance Specialist.",
      "publisher": {
        "@type": "Person",
        "name": "Davide Agostini"
      }
    }
  ];

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          defer
          src="https://geo-tracker-ochre.vercel.app/events.js"
          data-website-id="davideagostini"
        ></script>
      </head>
      <body
        className={`${jetbrainsMono.variable} font-mono antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
