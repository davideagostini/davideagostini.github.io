// Career facts for /about. Source: the LinkedIn profile (2026-10). One fact, one place:
// the current role lives in lib/site.ts.
import { site } from "./site";

export type Role = {
  title: string;
  org: string;
  href?: string;
  period: string;
  summary?: string;
  points?: string[];
};

// Newest start date first. Kept short on purpose: the full history lives on LinkedIn.
export const experience: Role[] = [
  {
    title: site.role,
    org: "Synapses",
    href: "https://www.synapseslab.com/",
    period: "2017 – present",
    summary: "Sole Android engineer on BlueGPS, owning the app and its Android SDK: 20+ versions released.",
    points: [
      "One codebase that ships BlueGPS to 40+ client variants, each with its own branding and configuration.",
      "Secure sign-in with a full OAuth2 + PKCE flow and Encrypted DataStore for credentials.",
      "Offline map downloads with WorkManager and a periodic background sync, and a home that opens instantly from cache.",
      "Legacy code moved to MVVM + Clean Architecture, and a Jetpack Compose design system used by every app in the group, with design tokens shared with iOS.",
      "New features built with Claude Code, plan first: a project CLAUDE.md, custom commands wired to Jira and GitHub, a Compose skill and the official Android skills.",
      "Since 2020, also Flutter web dashboards for internal use at large international companies.",
    ],
  },
  { title: "Software Engineer", org: "PrestoFood", href: "https://www.foodys.it/", period: "2016 – 2017" },
  { title: "IT Consultant", org: "University of Catania", period: "2015 – 2016" },
  { title: "Android Engineer", org: "Red Raion", href: "https://redraion.com/", period: "2015 – 2016" },
  { title: "Computer Science Teacher", org: "Fratelli delle Scuole Cristiane", period: "2011 – 2018" },
  { title: "Freelance Android & web developer", org: "Independent", period: "2006 – 2015" },
];

export const education: Role[] = [
  {
    title: "Master's degree, Computer Science",
    org: "University of Catania",
    period: "2006 – 2010",
    summary: "Thesis: CMA-ES to infer the parameters of gene regulatory network models.",
  },
  {
    title: "Bachelor's degree, Computer Science",
    org: "University of Catania",
    period: "2001 – 2006",
    summary: "Thesis: a Sudoku-like game built with artificial intelligence techniques.",
  },
];

// Only what the experience points above do not already name.
export const skills: { group: string; items: string[] }[] = [
  {
    group: "Android",
    items: ["Kotlin", "Jetpack Compose", "Coroutines & Flow", "Room", "Hilt", "Wear OS", "Glance widgets"],
  },
  {
    group: "Architecture & quality",
    items: ["Modularization", "Offline-first", "Testing", "Baseline Profiles", "Gradle"],
  },
  {
    group: "Platform & security",
    items: ["Keystore & biometrics", "Bluetooth / BLE", "Location & RTLS", "Firebase"],
  },
  {
    group: "Design systems & AI",
    items: ["Design systems", "AI-assisted development", "On-device AI", "App Functions"],
  },
  {
    group: "Beyond Android",
    items: ["Swift & macOS", "Ktor"],
  },
];
