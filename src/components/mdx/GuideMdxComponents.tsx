import type { ComponentType, ReactNode } from "react";
import { ArrowRight, Globe, Leaf } from "lucide-react";

import type { GuideHeaderMetaItem } from "../../data/publications";

export type MdxComponentsMap = Record<
  string,
  ComponentType<Record<string, unknown>>
>;

type GuideHeaderProps = {
  eyebrow: string;
  title: string;
  metadata?: GuideHeaderMetaItem[];
};

type GuideCardProps = {
  title: string;
  children: ReactNode;
};

function HeaderIcon({ icon }: { icon: GuideHeaderMetaItem["icon"] }) {
  switch (icon) {
    case "arrow-right":
      return <ArrowRight className="w-4 h-4" />;
    case "globe":
      return <Globe className="w-4 h-4" />;
    case "leaf":
      return <Leaf className="w-4 h-4" />;
    default:
      return null;
  }
}

export function GuideHeader({
  eyebrow,
  title,
  metadata = [],
}: GuideHeaderProps) {
  return (
    <header className="mb-16 not-prose">
      <span className="text-clir font-bold text-xs uppercase tracking-[0.4em] mb-4 block">
        {eyebrow}
      </span>
      <h1 className="serif mb-8 text-5xl leading-tight text-[var(--ink-primary)] md:text-6xl">
        {title}
      </h1>
      {metadata.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 border-y border-stone-200 py-6 text-sm text-[var(--ink-secondary)] dark:border-stone-800">
          {metadata.map((item, index) => (
            <div
              key={`${item.label}-${index}`}
              className="flex items-center gap-4"
            >
              <div className="flex items-center gap-2">
                <HeaderIcon icon={item.icon} />
                <span
                  className={
                    item.emphasis
                      ? "font-medium text-[var(--ink-primary)]"
                      : undefined
                  }
                >
                  {item.label}
                </span>
              </div>
              {index < metadata.length - 1 && (
                <div className="h-4 w-px bg-stone-200 dark:bg-stone-800" />
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}

export function GuidePullQuote({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-12 rounded-r-2xl border-l-4 border-clir bg-clir/5 p-8 serif text-xl italic text-stone-800 dark:bg-clir/10 dark:text-stone-100">
      {children}
    </div>
  );
}

export function GuideCardGrid({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose my-10 grid grid-cols-1 gap-6 md:grid-cols-2">
      {children}
    </div>
  );
}

export function GuideCard({ title, children }: GuideCardProps) {
  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        backgroundColor: "var(--reader-card-bg)",
        borderColor: "var(--reader-card-border)",
      }}
    >
      <h4
        className="mb-2 font-bold"
        style={{ color: "var(--reader-card-title)" }}
      >
        {title}
      </h4>
      <div className="text-sm" style={{ color: "var(--reader-card-body)" }}>
        {children}
      </div>
    </div>
  );
}
