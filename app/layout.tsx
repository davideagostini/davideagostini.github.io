import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://davideagostini.com"),
  title: "Davide Agostini - Software Engineer",
  description:
    "Davide Agostini - Software Engineer living in Italy, specializing in Mobile Development (Android/Kotlin, Flutter/Dart).",
  keywords: [
    "Davide Agostini",
    "Software Engineer",
    "Mobile Developer",
    "Android",
    "Kotlin",
    "Flutter",
    "Dart",
    "Italy",
  ],
  authors: [{ name: "Davide Agostini", url: "https://davideagostini.com" }],
  creator: "Davide Agostini",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://davideagostini.com",
    title: "Davide Agostini - Software Engineer",
    description:
      "Davide Agostini - Software Engineer living in Italy, specializing in Mobile Development.",
    siteName: "Davide Agostini",
    images: [
      {
        url: "/assets/profile.jpg",
        width: 800,
        height: 800,
        alt: "Davide Agostini",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Davide Agostini - Software Engineer",
    description:
      "Software Engineer living in Italy, specializing in Mobile Development.",
    creator: "@davideagostini",
    images: ["/assets/profile.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
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
    jobTitle: "Android Engineer & Founder",
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
      "Mobile Development",
      "Android",
      "Kotlin",
      "Generative Engine Optimization",
      "AI Search Analytics"
    ],
    image: "https://davideagostini.com/assets/profile.jpg",
    description:
      "Lead Android Engineer and founder of ViaMetric. Specialist in Mobile ecosystems and Generative Engine Optimization (GEO).",
  };

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
