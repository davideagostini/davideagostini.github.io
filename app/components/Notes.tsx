import Link from "next/link";
import { getTopicsWithCounts } from "@/lib/posts";
import { getTopic } from "@/lib/topics";

type NoteCardProps = {
  title: string;
  date: string;
  tags: string[];
  desc: string;
  href: string;
};

export function NoteCard({ title, date, tags, desc, href }: NoteCardProps) {
  return (
    <Link href={href} className="group block border-t border-zinc-200 pt-5 dark:border-zinc-800">
      <div className="mb-4">
        <h3 className="text-2xl font-semibold leading-tight tracking-tight text-zinc-950 group-hover:underline dark:text-zinc-50">
          {title}
        </h3>
        <time dateTime={date} className="mt-2 block font-mono text-xs text-zinc-400 dark:text-zinc-500">
          {date}
        </time>
      </div>

      {/* Plain text, not links: the whole card is already a link. */}
      <div className="mb-4 flex flex-wrap gap-x-3 gap-y-2">
        {tags.map((tag) => (
          <span key={tag} className="font-mono text-xs font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
            {getTopic(tag).name}
          </span>
        ))}
      </div>

      <p className="text-base leading-7 text-zinc-600 dark:text-zinc-400">{desc}</p>
    </Link>
  );
}

// Topic filter row shared by /android and /android/topics/[slug].
export function TopicNav({ active }: { active?: string }) {
  const topics = getTopicsWithCounts();

  return (
    <nav aria-label="Topics" className="mb-16 flex flex-wrap items-center gap-2 text-sm font-semibold">
      <TopicPill href="/android" label="All" active={!active} />
      {topics.map((topic) => (
        <TopicPill
          key={topic.slug}
          href={`/android/topics/${topic.slug}`}
          label={topic.name}
          count={topic.count}
          active={topic.slug === active}
        />
      ))}
    </nav>
  );
}

function TopicPill({ href, label, count, active }: { href: string; label: string; count?: number; active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "rounded-full bg-zinc-950 px-4 py-1.5 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-950"
          : "rounded-full border border-zinc-300 px-4 py-1.5 text-zinc-700 hover:border-zinc-950 hover:text-zinc-950 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-50 dark:hover:text-zinc-50"
      }
    >
      {label}
      {count !== undefined && <span className="ml-1.5 font-mono text-xs opacity-60">{count}</span>}
    </Link>
  );
}
