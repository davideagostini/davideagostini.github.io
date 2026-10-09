export type AppLink = {
  label: string;
  href: string;
};

export type AppFaq = {
  question: string;
  answer: string;
};

export type AppScreenshot = {
  src: string;
  alt: string;
};

export type AppStatus = "available" | "coming-soon";

export type AppInfo = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  details?: string[];
  platform: string;
  price: string;
  category: string;
  status: AppStatus;
  availability: string;
  icon: string;
  /** Brand color of the app, used for chips and highlights. */
  accent: string;
  screenshots: AppScreenshot[];
  links: AppLink[];
  highlights: string[];
  faq: AppFaq[];
};

export const apps: AppInfo[] = [
  {
    slug: "dunio",
    name: "Dunio",
    tagline: "Shared household finance without the clutter.",
    description:
      "Dunio brings shared expenses, net worth, recurring payments, widgets, and quick entry into one calm Android workspace for couples and households.",
    details: [
      "The app is built around one shared household: each person signs in, creates or joins a household, and keeps expenses, assets, transactions, and dashboard data aligned in the same workspace.",
      "Dunio is intentionally lightweight. It focuses on clear shared numbers, low-friction daily entry, recurring payments, home-screen widgets, a Quick Settings Tile, and a Wear OS companion for adding expenses from the wrist.",
    ],
    platform: "Android",
    price: "Free",
    category: "Finance",
    status: "available",
    availability:
      "Available on Android through Google Play, in 11 languages.",
    icon: "/assets/apps/dunio-icon.png",
    accent: "#b08a2e",
    screenshots: [
      { src: "/assets/apps/dunio/home.webp", alt: "Dunio net worth overview" },
      { src: "/assets/apps/dunio/statistics.webp", alt: "Dunio spending statistics" },
      { src: "/assets/apps/dunio/quick-entry.webp", alt: "Dunio quick entry" },
      { src: "/assets/apps/dunio/widget.webp", alt: "Dunio home screen widgets" },
    ],
    links: [
      { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.davideagostini.summ" },
      { label: "Website", href: "https://dunio.app/" },
    ],
    highlights: [
      "Shared household workspace for couples and households",
      "Expenses, assets, liabilities, and net worth in one dashboard",
      "Simple shared budgeting without traditional budgeting complexity",
      "Recurring payments for repeat income and expenses",
      "Quick entry from the app, widgets, and Quick Settings Tile",
      "Wear OS companion for adding expenses from the watch",
      "Available in 11 languages",
    ],
    faq: [
      {
        question: "Is Dunio free?",
        answer: "Yes. Dunio is free to use.",
      },
      {
        question: "Who is Dunio for?",
        answer:
          "Dunio is designed for couples and households that want one shared place for expenses, assets, liabilities, recurring payments, and net worth.",
      },
      {
        question: "How does shared access work?",
        answer:
          "Each person signs in, then creates a household or joins an existing one. People in the same household share the same finance data.",
      },
      {
        question: "Does Dunio work on Wear OS?",
        answer:
          "Yes. A Wear OS companion lets you add an expense from the watch; it syncs through the phone app.",
      },
    ],
  },
  {
    slug: "tuttodi",
    name: "Tuttodì",
    tagline: "One day, one note.",
    description:
      "Tuttodì is a local-first daily notes app for Android. It opens on today, ready for the first line, and earlier days sit behind it like a deck of cards. Bullets, photos, voice notes, and links, all on your phone.",
    details: [
      "Each day is one note: bulleted and numbered lists, nesting, and autosave as you type. Only the days you wrote in come back, so there are no empty pages to scroll past.",
      "Everything stays on the phone: no account, no cloud, no ads, no AI. Share a link, text, or image from any app and it lands at the end of today. Export everything to one .zip, or set a weekly backup to a folder you pick.",
    ],
    platform: "Android",
    price: "Free + Pro",
    category: "Productivity",
    status: "coming-soon",
    availability:
      "Coming soon to Google Play, for Android 8.0 or later, in 11 languages. Free to use; Tuttodì Pro is an optional one-time purchase, no subscription.",
    icon: "/assets/apps/tuttodi.png",
    accent: "#e8b84a",
    screenshots: [
      { src: "/assets/apps/tuttodi/deck.webp", alt: "Tuttodì opens on today, earlier days behind it" },
      { src: "/assets/apps/tuttodi/bullets.webp", alt: "Tuttodì bulleted daily note" },
      { src: "/assets/apps/tuttodi/media.webp", alt: "Tuttodì photos and voice notes" },
      { src: "/assets/apps/tuttodi/widget.webp", alt: "Tuttodì home screen widget" },
    ],
    links: [{ label: "Website", href: "https://tuttodi.app/" }],
    highlights: [
      "Opens on today; earlier days sit behind like a deck of cards",
      "Bulleted and numbered lists with nesting, saved as you type",
      "Photos, voice notes with no time limit, and readable links",
      "Share from any app straight into today",
      "Full-text search and jump to any date",
      "Local-first: no account, no cloud, no ads, no AI",
      "Export to one .zip and weekly backup to a folder you pick",
    ],
    faq: [
      {
        question: "Where are my notes stored?",
        answer:
          "On your phone only: a local database plus a folder for photos and audio. The developer never sees them.",
      },
      {
        question: "Do I need an account?",
        answer: "No. Install it and start writing.",
      },
      {
        question: "Is Tuttodì free?",
        answer:
          "Yes. Writing, photos, audio, search, and backups are free. Tuttodì Pro, a one-time purchase on Google Play, adds the fingerprint lock, the widget, and the evening reminder. No subscription.",
      },
      {
        question: "When is it available?",
        answer: "Tuttodì is coming soon to Google Play. The website at tuttodi.app will link to it at launch.",
      },
    ],
  },
  {
    slug: "eye-break",
    name: "Eye Break",
    tagline: "Rest your eyes. Keep your rhythm.",
    description:
      "Eye Break is a native macOS menu-bar app that reminds you to rest your eyes, stand up, and take screen breaks based on active computer time.",
    details: [
      "The app stays in the menu bar and shows calm full-screen break overlays across connected displays, with skip and snooze controls when a reminder lands at the wrong moment.",
      "Timers advance only while the Mac appears active, so stepping away from the computer does not quietly drain the schedule. Daily stats stay local on your Mac.",
    ],
    platform: "macOS",
    price: "Free",
    category: "Health",
    status: "available",
    availability:
      "Available for macOS from the Eye Break website. The app is also open source on GitHub.",
    icon: "/assets/apps/eye-break.png",
    accent: "#0ea5e9",
    screenshots: [],
    links: [
      { label: "Website", href: "https://davideagostini.github.io/eye-break/" },
      { label: "Download", href: "https://github.com/davideagostini/eye-break/releases/latest" },
      { label: "GitHub", href: "https://github.com/davideagostini/eye-break" },
    ],
    highlights: [
      "Native macOS menu bar app",
      "Short eye breaks and longer stand breaks",
      "Full-screen overlay across connected displays",
      "Skip, snooze, and temporary pause controls",
      "Configurable intervals, durations, and launch at login",
      "Active computer time tracking with local daily stats",
    ],
    faq: [
      {
        question: "Is Eye Break free?",
        answer: "Yes. Eye Break is free to use.",
      },
      {
        question: "What does Eye Break do?",
        answer:
          "Eye Break reminds you to take short eye breaks and longer stand breaks while working on macOS.",
      },
      {
        question: "Does Eye Break count idle time?",
        answer:
          "No. Timers advance based on active computer time, so time away from the Mac does not quietly drain the break schedule.",
      },
      {
        question: "Where are the stats stored?",
        answer: "Daily stats are local to your Mac.",
      },
      {
        question: "Is Eye Break open source?",
        answer: "Yes. The source code is available on GitHub.",
      },
    ],
  },
];

export function getAppBySlug(slug: string) {
  return apps.find((app) => app.slug === slug);
}
