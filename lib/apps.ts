export type AppLink = {
  label: string;
  href: string;
};

export type AppFaq = {
  question: string;
  answer: string;
};

export type AppInfo = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  details?: string[];
  platform: string;
  price: string;
  category: string;
  availability: string;
  icon: string;
  accent: string;
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
      "Dunio is intentionally lightweight. It focuses on clear shared numbers, low-friction daily entry, recurring payments, home-screen widgets, and a Quick Settings Tile for adding expenses faster.",
    ],
    platform: "Android",
    price: "Free",
    category: "Finance",
    availability: "Available on Android through Google Play. The app is also open source on GitHub.",
    icon: "/assets/apps/dunio.png",
    accent: "text-android",
    links: [
      { label: "Website", href: "https://dunio.app/" },
      { label: "Google Play", href: "https://play.google.com/store/apps/details?id=com.davideagostini.summ" },
      { label: "GitHub", href: "https://github.com/davideagostini/dunio" },
    ],
    highlights: [
      "Shared household workspace for couples and households",
      "Expenses, assets, liabilities, and net worth in one dashboard",
      "Simple shared budgeting without traditional budgeting complexity",
      "Recurring payments for repeat income and expenses",
      "Quick entry from the app, widgets, and Quick Settings Tile",
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
        question: "Is Dunio open source?",
        answer: "Yes. The Android app source code is available on GitHub.",
      },
      {
        question: "How does shared access work?",
        answer:
          "Each person signs in, then creates a household or joins an existing one. People in the same household share the same finance data.",
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
    availability:
      "Available for macOS from the Eye Break website. The app is also open source on GitHub.",
    icon: "/assets/apps/eye-break.png",
    accent: "text-sky-500",
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
