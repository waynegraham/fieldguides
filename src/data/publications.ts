import type { ComponentType } from "react";
import YAML from "yaml";

import { getPublicationRoute, getPublicationPageRoute } from "./routes";

type MdxComponentProps = {
  components?: Record<
    string,
    ComponentType<Record<string, unknown>> | keyof HTMLElementTagNameMap
  >;
};

type PublicationIndexFile = {
  title: string;
  description: string;
  author: string;
  publisher?: string;
  copyright?: string;
  sections: Array<
    | string
    | {
        id: string;
        title?: string;
        section?: string;
      }
  >;
  image?: string;
  icon?: "archive" | "book-open" | "cpu" | "database" | "globe" | "leaf";
  color?: string;
  accent?: string;
  featuredBlurb?: string;
  publicationDate?: string;
  availableLanguages?: string;
  license?: string;
};

type SectionFrontmatter = {
  title?: string;
  section?: string;
  searchableText?: string;
};

export type Guide = {
  id: string;
  slug: string;
  route: string;
  title: string;
  author: string;
  publisher: string;
  copyright: string;
  description: string;
  image?: string;
  featuredBlurb: string;
  publicationDate?: string;
  availableLanguages?: string;
  license?: string;
};

export type GuideHeaderMetaItem = {
  icon?: "arrow-right" | "globe" | "leaf";
  label: string;
  emphasis?: boolean;
};

export type Language = {
  name: string;
  code: string;
  dir: "ltr" | "rtl";
};

export type PublicationPage = {
  id: string;
  title: string;
  section: string;
  searchableText: string;
  publicationSlug: string;
  Content: ComponentType<MdxComponentProps>;
};

export type Publication = {
  guide: Guide;
  pages: PublicationPage[];
};

type PublicationModule = {
  default: ComponentType<MdxComponentProps>;
};

type PublicationTheme = {
  icon?: PublicationIndexFile["icon"];
  color?: string;
  accent?: string;
};

const publicationIndexes = import.meta.glob("/publications/*/index.json", {
  eager: true,
  import: "default",
}) as Record<string, PublicationIndexFile>;

const publicationSectionModules = import.meta.glob("/publications/*/*.mdx", {
  eager: true,
}) as Record<string, PublicationModule>;

const publicationSectionSources = import.meta.glob("/publications/*/*.mdx", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, unknown>;

export const LANGUAGES: Language[] = [
  { name: "English", code: "en", dir: "ltr" },
  { name: "العربية", code: "ar", dir: "rtl" },
  { name: "Français", code: "fr", dir: "ltr" },
  { name: "Español", code: "es", dir: "ltr" },
];

function stripMdx(rawContent: string) {
  return rawContent
    .replace(/^---[\s\S]*?---\s*/, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\{[^}]+\}/g, " ")
    .replace(/[#>*_`[\]-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getRawSource(rawContent: unknown) {
  if (typeof rawContent === "string") {
    return rawContent;
  }

  if (
    rawContent &&
    typeof rawContent === "object" &&
    "default" in rawContent &&
    typeof rawContent.default === "string"
  ) {
    return rawContent.default;
  }

  return "";
}

function parseFrontmatter(rawContent: unknown) {
  const source = getRawSource(rawContent);
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);

  if (!match) {
    return {
      attributes: {} as SectionFrontmatter,
      body: source,
    };
  }

  return {
    attributes: (YAML.parse(match[1]) || {}) as SectionFrontmatter,
    body: source.slice(match[0].length),
  };
}

function getPublicationSlug(path: string) {
  const match = path.match(/\/publications\/([^/]+)\//);
  return match?.[1];
}

function getSectionId(path: string) {
  const match = path.match(/\/([^/]+)\.mdx$/);
  return match?.[1];
}

function getPublicationTheme(
  indexFile: PublicationIndexFile,
): PublicationTheme {
  return {
    icon: indexFile.icon,
    color: indexFile.color,
    accent: indexFile.accent,
  };
}

function getGuide(slug: string, indexFile: PublicationIndexFile): Guide {
  return {
    id: slug,
    slug,
    route: getPublicationRoute(slug),
    title: indexFile.title,
    author: indexFile.author,
    publisher:
      indexFile.publisher || "Council on Library and Information Resources",
    copyright:
      indexFile.copyright ||
      `© ${indexFile.publicationDate || "2026"} ${indexFile.publisher || "Council on Library and Information Resources"}`,
    description: indexFile.description,
    image: indexFile.image,
    featuredBlurb: indexFile.featuredBlurb || indexFile.description,
    publicationDate: indexFile.publicationDate,
    availableLanguages: indexFile.availableLanguages,
    license: indexFile.license,
  };
}

function getPublicationPages(
  slug: string,
  indexFile: PublicationIndexFile,
): PublicationPage[] {
  return indexFile.sections
    .map((sectionEntry, sectionIndex) => {
      const sectionId =
        typeof sectionEntry === "string" ? sectionEntry : sectionEntry.id;
      const modulePath = `/publications/${slug}/${sectionId}.mdx`;
      const sectionModule = publicationSectionModules[modulePath];
      const rawSource = publicationSectionSources[modulePath];

      if (!sectionModule || !rawSource) {
        return null;
      }

      const { attributes, body } = parseFrontmatter(rawSource);

      return {
        id: getSectionId(modulePath) || sectionId,
        title:
          (typeof sectionEntry === "object" && sectionEntry.title) ||
          attributes.title ||
          sectionId,
        section:
          (typeof sectionEntry === "object" && sectionEntry.section) ||
          attributes.section ||
          String(sectionIndex + 1).padStart(2, "0"),
        searchableText: attributes.searchableText || stripMdx(body),
        publicationSlug: slug,
        Content: sectionModule.default,
      } satisfies PublicationPage;
    })
    .filter((page): page is PublicationPage => Boolean(page));
}

type PublicationRecord = Publication & { theme: PublicationTheme };

function getPublicationRecord(
  indexPath: string,
  indexFile: PublicationIndexFile,
): PublicationRecord | null {
  const slug = getPublicationSlug(indexPath);

  if (!slug) {
    return null;
  }

  return {
    guide: getGuide(slug, indexFile),
    pages: getPublicationPages(slug, indexFile),
    theme: getPublicationTheme(indexFile),
  };
}

const publicationRecords = Object.entries(publicationIndexes)
  .map(([indexPath, indexFile]) => getPublicationRecord(indexPath, indexFile))
  .filter((publication): publication is PublicationRecord =>
    Boolean(publication),
  );

export const PUBLICATIONS: Publication[] = publicationRecords.map(
  ({ guide, pages }) => ({
    guide,
    pages,
  }),
);

export const GUIDES = PUBLICATIONS.map((publication) => publication.guide);

export const GUIDE_THEMES = publicationRecords.map(({ guide, theme }) => ({
  slug: guide.slug,
  ...theme,
}));

export const FEATURED_PUBLICATION = PUBLICATIONS[0] || null;

export { getPublicationPageRoute, getPublicationRoute };
