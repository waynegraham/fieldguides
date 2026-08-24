import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import site from "../../metadata.json";
import { PUBLICATIONS } from "../data/publications";
import { parseFieldGuideRoute } from "../data/routes";

function getDescription(text: string) {
  const normalized = text.replace(/\s+/g, " ").trim();
  return normalized.length > 200
    ? `${normalized.slice(0, 197).trimEnd()}…`
    : normalized;
}

function getPageMetadata(pathname: string) {
  const { slug, pageId } = parseFieldGuideRoute(pathname);
  const publication = PUBLICATIONS.find((item) => item.guide.slug === slug);
  const page = publication?.pages.find((item) => item.id === pageId);
  const routePath =
    pathname === "/"
      ? ""
      : `${pathname.replace(/^\//, "").replace(/\/$/, "")}/`;
  const canonicalUrl = new URL(routePath, site.url).href;

  if (pathname === "/styleguide") {
    return {
      title: `Style guide — ${site.name}`,
      description: "Internal component and content style guide.",
      canonicalUrl,
      robots: "noindex, nofollow",
      type: "website",
      structuredData: null,
    };
  }

  if (!publication) {
    return {
      title: site.name,
      description: site.description,
      canonicalUrl: site.url,
      robots: "index, follow, max-image-preview:large",
      type: "website",
      structuredData: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: site.name,
        description: site.description,
        url: site.url,
        publisher: {
          "@type": "Organization",
          name: site.publisher,
          url: site.publisherUrl,
        },
      },
    };
  }

  const publicationUrl = new URL(
    `publications/${publication.guide.slug}/`,
    site.url,
  ).href;
  const bookData = {
    "@type": "Book",
    name: publication.guide.title,
    url: publicationUrl,
    author: { "@type": "Organization", name: publication.guide.author },
    publisher: {
      "@type": "Organization",
      name: publication.guide.publisher,
      url: site.publisherUrl,
    },
    datePublished: publication.guide.publicationDate,
    license: publication.guide.license,
  };

  return {
    title: page
      ? `${page.title} — ${publication.guide.title}`
      : publication.guide.title,
    description: page
      ? getDescription(page.searchableText)
      : publication.guide.description,
    canonicalUrl,
    robots: "index, follow, max-image-preview:large",
    type: "article",
    image: publication.guide.image,
    structuredData: {
      "@context": "https://schema.org",
      ...(page
        ? {
            "@type": "Chapter",
            name: page.title,
            description: getDescription(page.searchableText),
            url: canonicalUrl,
            isPartOf: bookData,
          }
        : bookData),
    },
  };
}

function setMeta(attribute: "name" | "property", key: string, value: string) {
  let element = document.head.querySelector<HTMLMetaElement>(
    `meta[${attribute}="${key}"]`,
  );

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.append(element);
  }

  element.content = value;
}

function removeMeta(attribute: "name" | "property", key: string) {
  document.head
    .querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
    ?.remove();
}

export function DocumentMetadata() {
  const { pathname } = useLocation();

  useEffect(() => {
    const metadata = getPageMetadata(pathname);
    document.title = metadata.title;
    setMeta("name", "description", metadata.description);
    setMeta("name", "robots", metadata.robots);
    setMeta("property", "og:site_name", site.name);
    setMeta("property", "og:type", metadata.type);
    setMeta("property", "og:title", metadata.title);
    setMeta("property", "og:description", metadata.description);
    setMeta("property", "og:url", metadata.canonicalUrl);
    setMeta("name", "twitter:title", metadata.title);
    setMeta("name", "twitter:description", metadata.description);
    setMeta("name", "twitter:card", metadata.image ? "summary_large_image" : "summary");

    let canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    canonical.href = metadata.canonicalUrl;

    if (metadata.image) {
      const imageUrl = new URL(metadata.image, site.url).href;
      setMeta("property", "og:image", imageUrl);
      setMeta("name", "twitter:image", imageUrl);
    } else {
      removeMeta("property", "og:image");
      removeMeta("name", "twitter:image");
    }

    let structuredData = document.head.querySelector<HTMLScriptElement>(
      "#field-guides-structured-data",
    );
    if (metadata.structuredData) {
      if (!structuredData) {
        structuredData = document.createElement("script");
        structuredData.id = "field-guides-structured-data";
        structuredData.type = "application/ld+json";
        document.head.append(structuredData);
      }
      structuredData.textContent = JSON.stringify(metadata.structuredData);
    } else {
      structuredData?.remove();
    }
  }, [pathname]);

  return null;
}
