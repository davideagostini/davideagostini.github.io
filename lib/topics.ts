// The curated topics of the Android notes. A post's frontmatter `tags` lists
// slugs from here and nothing else: an unknown slug fails the build.

export type Topic = {
  slug: string;
  name: string;
  description: string;
};

export const topics: Topic[] = [
  {
    slug: "compose",
    name: "Jetpack Compose",
    description: "State, recomposition, theming and widgets in Jetpack Compose.",
  },
  {
    slug: "architecture",
    name: "Architecture",
    description: "Layers, MVVM, dependency injection, modularization and refactoring legacy apps.",
  },
  {
    slug: "performance",
    name: "Performance",
    description: "Stable lists, predictable recomposition and faster startup.",
  },
  {
    slug: "security",
    name: "Security",
    description: "Keystore, biometrics, encrypted storage and secret boundaries.",
  },
  {
    slug: "data",
    name: "Data & storage",
    description: "Room, repositories, offline-first sync and encrypted databases.",
  },
  {
    slug: "navigation",
    name: "Navigation",
    description: "Navigation Compose, type-safe routes and nested graphs.",
  },
  {
    slug: "background",
    name: "Background & async",
    description: "Coroutines, Flow and WorkManager jobs that survive the real world.",
  },
  {
    slug: "testing",
    name: "Testing",
    description: "Unit and Compose tests, and code shaped to be testable.",
  },
  {
    slug: "ai",
    name: "AI on Android",
    description: "App Functions for AI agents and on-device models.",
  },
];

export function getTopic(slug: string): Topic {
  const topic = topics.find((t) => t.slug === slug);
  if (!topic) {
    throw new Error(`Unknown topic "${slug}": add it to lib/topics.ts or fix the post's tags.`);
  }
  return topic;
}
