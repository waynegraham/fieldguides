import {
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = process.cwd();
const distDir = path.join(rootDir, "dist");
const publicationsDir = path.join(rootDir, "publications");
const metadataStart = "<!-- field-guides:metadata:start -->";
const metadataEnd = "<!-- field-guides:metadata:end -->";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function escapeXml(value) {
  return escapeHtml(value).replaceAll("'", "&apos;");
}

function safeJson(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

function normalizeSiteUrl(value) {
  const url = new URL(value);
  url.pathname = `${url.pathname.replace(/\/+$/, "")}/`;
  return url.href;
}

function getSectionEntry(entry) {
  return typeof entry === "string"
    ? { id: entry, title: entry }
    : { id: entry.id, title: entry.title || entry.id };
}

function getSectionDescription(source, fallback) {
  const text = source
    .replace(/^---\n[\s\S]*?\n---\n?/, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`{}-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    return fallback;
  }

  return text.length > 200 ? `${text.slice(0, 197).trimEnd()}…` : text;
}

export function createPageMetadata({ site, publication, section }) {
  const siteUrl = normalizeSiteUrl(site.url);

  if (!publication) {
    return {
      title: site.name,
      description: site.description,
      canonicalUrl: siteUrl,
      type: "website",
      image: site.image ? new URL(site.image, siteUrl).href : undefined,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: site.name,
        description: site.description,
        url: siteUrl,
        publisher: {
          "@type": "Organization",
          name: site.publisher,
          url: site.publisherUrl,
        },
      },
    };
  }

  const publicationPath = `publications/${publication.slug}/`;
  const pagePath = section
    ? `${publicationPath}sections/${section.id}/`
    : publicationPath;
  const canonicalUrl = new URL(pagePath, siteUrl).href;
  const publicationUrl = new URL(publicationPath, siteUrl).href;
  const title = section
    ? `${section.title} — ${publication.title}`
    : publication.title;
  const description = section?.description || publication.description;
  const image = publication.image
    ? new URL(publication.image, siteUrl).href
    : site.image
      ? new URL(site.image, siteUrl).href
      : undefined;
  const bookData = {
    "@type": "Book",
    name: publication.title,
    url: publicationUrl,
    author: { "@type": "Organization", name: publication.author },
    publisher: {
      "@type": "Organization",
      name: publication.publisher,
      url: site.publisherUrl,
    },
    datePublished: publication.publicationDate,
    license: publication.license,
  };

  return {
    title,
    description,
    canonicalUrl,
    type: "article",
    image,
    structuredData: {
      "@context": "https://schema.org",
      ...(section
        ? {
            "@type": "Chapter",
            name: section.title,
            description,
            url: canonicalUrl,
            isPartOf: bookData,
          }
        : bookData),
    },
  };
}

export function renderMetadata(metadata, siteName) {
  const imageTags = metadata.image
    ? `\n<meta property="og:image" content="${escapeHtml(metadata.image)}" />\n<meta name="twitter:image" content="${escapeHtml(metadata.image)}" />`
    : "";
  const twitterCard = metadata.image ? "summary_large_image" : "summary";

  return `${metadataStart}
<title>${escapeHtml(metadata.title)}</title>
<meta name="description" content="${escapeHtml(metadata.description)}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<link rel="canonical" href="${escapeHtml(metadata.canonicalUrl)}" />
<meta property="og:site_name" content="${escapeHtml(siteName)}" />
<meta property="og:type" content="${metadata.type}" />
<meta property="og:title" content="${escapeHtml(metadata.title)}" />
<meta property="og:description" content="${escapeHtml(metadata.description)}" />
<meta property="og:url" content="${escapeHtml(metadata.canonicalUrl)}" />
<meta name="twitter:card" content="${twitterCard}" />
<meta name="twitter:title" content="${escapeHtml(metadata.title)}" />
<meta name="twitter:description" content="${escapeHtml(metadata.description)}" />${imageTags}
<script id="field-guides-structured-data" type="application/ld+json">${safeJson(metadata.structuredData)}</script>
${metadataEnd}`;
}

function injectMetadata(template, metadata, siteName) {
  const blockPattern = new RegExp(`${metadataStart}[\\s\\S]*?${metadataEnd}`);
  const metadataBlock = renderMetadata(metadata, siteName);

  if (!blockPattern.test(template)) {
    throw new Error("index.html is missing the Field Guides metadata markers");
  }

  return template.replace(blockPattern, metadataBlock);
}

function writeRoute(routePath, template, metadata, siteName) {
  const routeDir = path.join(distDir, routePath);
  mkdirSync(routeDir, { recursive: true });
  writeFileSync(
    path.join(routeDir, "index.html"),
    injectMetadata(template, metadata, siteName),
  );
}

export function generateDiscoveryFiles() {
  const site = JSON.parse(readFileSync(path.join(rootDir, "metadata.json")));
  const template = readFileSync(path.join(distDir, "index.html"), "utf8");
  const urls = [normalizeSiteUrl(site.url)];
  const homeMetadata = createPageMetadata({ site });
  writeFileSync(
    path.join(distDir, "index.html"),
    injectMetadata(template, homeMetadata, site.name),
  );

  for (const directoryName of readdirSync(publicationsDir)) {
    const publicationDir = path.join(publicationsDir, directoryName);
    const indexPath = path.join(publicationDir, "index.json");
    let index;

    try {
      index = JSON.parse(readFileSync(indexPath, "utf8"));
    } catch {
      continue;
    }

    const publication = { ...index, slug: directoryName };
    const publicationMetadata = createPageMetadata({ site, publication });
    writeRoute(
      `publications/${directoryName}`,
      template,
      publicationMetadata,
      site.name,
    );
    urls.push(publicationMetadata.canonicalUrl);

    for (const entry of index.sections) {
      const section = getSectionEntry(entry);
      const source = readFileSync(
        path.join(publicationDir, `${section.id}.mdx`),
        "utf8",
      );
      section.description = getSectionDescription(source, index.description);
      const sectionMetadata = createPageMetadata({
        site,
        publication,
        section,
      });
      writeRoute(
        `publications/${directoryName}/sections/${section.id}`,
        template,
        sectionMetadata,
        site.name,
      );
      urls.push(sectionMetadata.canonicalUrl);
    }
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`)
    .join("\n")}\n</urlset>\n`;
  writeFileSync(path.join(distDir, "sitemap.xml"), sitemap);
  writeFileSync(
    path.join(distDir, "robots.txt"),
    `User-agent: *\nAllow: /\nSitemap: ${new URL("sitemap.xml", site.url).href}\n`,
  );

  console.log(`Generated discovery metadata for ${urls.length} route(s).`);
}

const isDirectRun = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (isDirectRun) {
  generateDiscoveryFiles();
}
