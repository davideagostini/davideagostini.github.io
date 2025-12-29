import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
    jobTitle: "Software Engineer",
    worksFor: {
      "@type": "Organization",
      name: "Synapses",
    },
    image: "https://davideagostini.com/assets/profile.jpg",
    description:
      "Software Engineer living in Italy. Specializing in Android and Flutter development.",
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
        className={`${inter.className} antialiased slate-50 dark:slate-950`}
      >
        {children}
      </body>
    </html>
  );
}
