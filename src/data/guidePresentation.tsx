import type { ReactNode } from "react";
import { Archive, BookOpen, Cpu, Database, Globe, Leaf } from "lucide-react";

import type { Guide } from "./publications";
import { GUIDE_THEMES } from "./publications";

export type GuideCard = Guide & {
  icon: ReactNode;
  color: string;
  accent: string;
};

const iconMap = {
  archive: <Archive className="w-6 h-6" />,
  "book-open": <BookOpen className="w-6 h-6" />,
  cpu: <Cpu className="w-6 h-6" />,
  database: <Database className="w-6 h-6" />,
  globe: <Globe className="w-6 h-6" />,
  leaf: <Leaf className="w-6 h-6" />,
} as const;

const fallbackCards = [
  {
    color: "bg-clir/5",
    accent: "text-clir",
    icon: <Leaf className="w-6 h-6" />,
  },
  {
    color: "bg-blue-50",
    accent: "text-blue-700",
    icon: <Cpu className="w-6 h-6" />,
  },
  {
    color: "bg-amber-50",
    accent: "text-amber-700",
    icon: <Database className="w-6 h-6" />,
  },
  {
    color: "bg-stone-50",
    accent: "text-stone-700",
    icon: <Archive className="w-6 h-6" />,
  },
] as const;

export function decorateGuide(guide: Guide, index: number): GuideCard {
  const theme = GUIDE_THEMES.find((entry) => entry.slug === guide.slug);
  const fallbackCard = fallbackCards[index % fallbackCards.length];

  return {
    ...guide,
    icon:
      theme?.icon && iconMap[theme.icon]
        ? iconMap[theme.icon]
        : fallbackCard.icon,
    color: theme?.color || fallbackCard.color,
    accent: theme?.accent || fallbackCard.accent,
  };
}
