import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ArrowRight } from "lucide-react";
import type { AppInfo } from "@/lib/apps";

export function accentStyle(app: AppInfo) {
  return { "--accent": app.accent } as CSSProperties;
}

export function AppChips({ app, withCategory = false }: { app: AppInfo; withCategory?: boolean }) {
  return (
    <p className="flex flex-wrap gap-2">
      <span className="app-chip app-chip--accent">{app.platform}</span>
      <span className="app-chip">{app.price}</span>
      {withCategory && <span className="app-chip">{app.category}</span>}
      {app.status === "coming-soon" && <span className="app-chip app-chip--soon">Coming soon</span>}
    </p>
  );
}

export function AppShowcase({ app }: { app: AppInfo }) {
  const shots = app.screenshots.slice(0, 2);

  return (
    <Link
      href={`/apps/${app.slug}`}
      style={accentStyle(app)}
      className="app-card group grid overflow-hidden rounded-3xl md:grid-cols-[1fr_300px]"
    >
      <div className="flex flex-col p-6 sm:p-8">
        <div className="mb-6 flex items-center gap-4">
          <Image
            src={app.icon}
            width={64}
            height={64}
            alt={`${app.name} app icon`}
            className="h-16 w-16 rounded-2xl object-cover"
          />
          <div className="min-w-0">
            <h3 className="text-3xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
              {app.name}
            </h3>
            <div className="mt-2">
              <AppChips app={app} />
            </div>
          </div>
        </div>

        <p className="mb-3 text-xl font-medium leading-7 text-zinc-950 dark:text-zinc-50">
          {app.tagline}
        </p>
        <p className="max-w-[520px] text-base leading-7 text-zinc-600 dark:text-zinc-400">
          {app.description}
        </p>

        <span className="mt-8 inline-flex items-center gap-1 text-sm font-semibold text-zinc-950 group-hover:underline dark:text-zinc-50">
          {app.status === "coming-soon" ? "Take a look" : `More about ${app.name}`}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>

      {shots.length > 0 ? (
        <div className="relative hidden h-full min-h-[300px] md:block" aria-hidden>
          {shots.map((shot, index) => (
            <Image
              key={shot.src}
              src={shot.src}
              width={540}
              height={960}
              alt=""
              className={`app-shot absolute w-[150px] ${
                index === 0 ? "left-6 top-10 z-10" : "left-[136px] top-20 opacity-90"
              }`}
            />
          ))}
        </div>
      ) : (
        <div className="hidden items-center justify-center p-8 md:flex" aria-hidden>
          <Image
            src={app.icon}
            width={160}
            height={160}
            alt=""
            className="h-40 w-40 rotate-[-4deg] object-contain drop-shadow-xl"
          />
        </div>
      )}
    </Link>
  );
}
