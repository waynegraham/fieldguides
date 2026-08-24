import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DOCUMENT_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;
const NAVIGATION_PATTERN =
  /^#{0,6}\s*\[?(?:next section\s*>>|<<\s*back to beginning)\]?(?:\([^)]*\))?\s*$/i;
const IMAGE_DEFINITION_PATTERN =
  /^\[([^\]]+)\]:\s*<data:image\/([a-zA-Z0-9.+-]+);base64,([^>]+)>\s*$/gm;

export function getDocumentId(value) {
  if (DOCUMENT_ID_PATTERN.test(value)) {
    return value;
  }

  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Expected a Google Doc URL or document ID.");
  }

  if (url.hostname !== "docs.google.com") {
    throw new Error("The document URL must use docs.google.com.");
  }

  const match = url.pathname.match(/^\/document\/d\/([^/]+)/);
  if (!match || !DOCUMENT_ID_PATTERN.test(match[1])) {
    throw new Error(
      "Unable to find a valid document ID in the Google Doc URL.",
    );
  }

  return match[1];
}

export function getExportTitle(contentDisposition) {
  if (!contentDisposition) {
    return undefined;
  }

  const encodedMatch = contentDisposition.match(
    /filename\*\s*=\s*UTF-8''([^;]+)/i,
  );
  const plainMatch = contentDisposition.match(/filename\s*=\s*"([^"]+)"/i);
  const filename = encodedMatch
    ? decodeURIComponent(encodedMatch[1])
    : plainMatch?.[1];

  return filename?.replace(/\.md$/i, "").trim() || undefined;
}

export function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function cleanHeading(value) {
  return value
    .replace(/^\s*#{1,6}\s+/, "")
    .replace(/\s+#+\s*$/, "")
    .replace(/^\*\*(.*)\*\*\s*$/, "$1")
    .replace(/^__(.*)__\s*$/, "$1")
    .trim();
}

function normalizeTitle(value) {
  return cleanHeading(value).replace(/\s+/g, " ").toLocaleLowerCase();
}

function extensionForMimeSubtype(subtype) {
  switch (subtype.toLowerCase()) {
    case "jpeg":
    case "jpg":
      return "jpg";
    case "svg+xml":
      return "svg";
    default:
      return subtype.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  }
}

function removeNavigation(markdown) {
  return markdown
    .split("\n")
    .filter(
      (line) => !NAVIGATION_PATTERN.test(line.trim().replaceAll("\\", "")),
    )
    .join("\n");
}

function extractImages(markdown, warnings) {
  const images = [];
  const definitions = new Map();
  let withoutDefinitions = markdown.replace(
    IMAGE_DEFINITION_PATTERN,
    (_definition, reference, subtype, base64) => {
      const buffer = Buffer.from(base64.replace(/\s+/g, ""), "base64");
      const digest = createHash("sha256")
        .update(buffer)
        .digest("hex")
        .slice(0, 12);
      const extension = extensionForMimeSubtype(subtype);
      const filename = `image-${digest}.${extension}`;
      definitions.set(reference.toLowerCase(), filename);
      images.push({ filename, buffer });
      return "";
    },
  );

  withoutDefinitions = withoutDefinitions.replace(
    /!\[([^\]]*)\]\[([^\]]+)\]/g,
    (original, alt, reference) => {
      const filename = definitions.get(reference.toLowerCase());
      if (!filename) {
        return original;
      }
      if (!alt.trim()) {
        warnings.push(`Image ${filename} has no alt text.`);
      }
      return `![${alt.trim()}](./assets/${filename})`;
    },
  );

  return { markdown: withoutDefinitions, images };
}

function splitSections(markdown, warnings, preferredTitle) {
  const lines = markdown.split("\n");
  const headingIndexes = [];

  lines.forEach((line, index) => {
    if (/^#\s+\S/.test(line)) {
      headingIndexes.push(index);
    }
  });

  if (headingIndexes.length === 0) {
    throw new Error("The Markdown export has no level-one headings.");
  }

  const firstHeadingTitle = cleanHeading(lines[headingIndexes[0]]);
  const documentTitle = preferredTitle || firstHeadingTitle;
  const sections = [];
  const firstSectionPosition =
    preferredTitle &&
    normalizeTitle(firstHeadingTitle) !== normalizeTitle(preferredTitle)
      ? 0
      : 1;

  for (
    let position = firstSectionPosition;
    position < headingIndexes.length;
    position += 1
  ) {
    const start = headingIndexes[position];
    const end = headingIndexes[position + 1] ?? lines.length;
    const title = cleanHeading(lines[start]);
    const body = lines
      .slice(start + 1, end)
      .join("\n")
      .trim();
    const previous = sections.at(-1);

    if (previous && normalizeTitle(previous.title) === normalizeTitle(title)) {
      previous.body = [previous.body, body].filter(Boolean).join("\n\n");
      warnings.push(`Merged duplicate section heading “${title}”.`);
      continue;
    }

    sections.push({ title, body });
  }

  if (sections.length === 0) {
    throw new Error("The Markdown export has a title but no section headings.");
  }

  const seenIds = new Map();
  return {
    documentTitle,
    sections: sections.map((section, index) => {
      const baseId = slugify(section.title) || `section-${index + 1}`;
      const count = (seenIds.get(baseId) ?? 0) + 1;
      seenIds.set(baseId, count);
      const id = count === 1 ? baseId : `${baseId}-${count}`;
      if (count > 1) {
        warnings.push(
          `Generated unique ID “${id}” for repeated title “${section.title}”.`,
        );
      }
      return { ...section, id, section: String(index + 1).padStart(2, "0") };
    }),
  };
}

function countMarkdownTables(markdown) {
  return (markdown.match(/^\|.*\|\s*$/gm) ?? []).length;
}

export function convertGoogleMarkdown(source, options = {}) {
  const warnings = [];
  const normalized = source.replace(/\r\n?/g, "\n").trim();
  const withoutNavigation = removeNavigation(normalized);
  const { markdown, images } = extractImages(withoutNavigation, warnings);
  const { documentTitle, sections } = splitSections(
    markdown,
    warnings,
    options.title,
  );
  const tableRows = countMarkdownTables(markdown);

  if (tableRows > 0) {
    warnings.push(
      `Found ${tableRows} Markdown table row${tableRows === 1 ? "" : "s"}; verify data, callout, and layout tables manually.`,
    );
  }

  const title = documentTitle;
  const slug = options.slug || slugify(title);
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(
      "The publication slug must contain lowercase letters, numbers, and hyphens.",
    );
  }

  const manifest = {
    title,
    description:
      options.description ||
      `A field guide imported from Google Docs: ${title}`,
    author: options.author || "CLIR",
    publisher:
      options.publisher || "Council on Library and Information Resources",
    copyright:
      options.copyright ||
      `© ${new Date().getFullYear()} Council on Library and Information Resources`,
    publicationDate:
      options.publicationDate ||
      new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date()),
    license: options.license || "Published under CC BY-NC-SA 4.0",
    language: {
      name: "English",
      code: "en",
      dir: "ltr",
    },
    translations: [],
    sections: sections.map(({ id, title: sectionTitle, section }) => ({
      id,
      title: sectionTitle,
      section,
    })),
  };

  return { slug, manifest, sections, images, warnings };
}

export async function writePublication(
  result,
  rootDir,
  { force = false } = {},
) {
  const publicationDir = path.resolve(rootDir, "publications", result.slug);
  const publicationsRoot = path.resolve(rootDir, "publications");
  if (!publicationDir.startsWith(`${publicationsRoot}${path.sep}`)) {
    throw new Error("Refusing to write outside the publications directory.");
  }

  try {
    await readFile(path.join(publicationDir, "index.json"), "utf8");
    if (!force) {
      throw new Error(
        `Publication “${result.slug}” already exists. Use --force to replace generated files.`,
      );
    }
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error;
    }
  }

  await mkdir(path.join(publicationDir, "assets"), { recursive: true });
  await writeFile(
    path.join(publicationDir, "index.json"),
    `${JSON.stringify(result.manifest, null, 2)}\n`,
  );

  await Promise.all([
    ...result.sections.map((section) =>
      writeFile(
        path.join(publicationDir, `${section.id}.mdx`),
        `${section.body.trim()}\n`,
      ),
    ),
    ...result.images.map((image) =>
      writeFile(
        path.join(publicationDir, "assets", image.filename),
        image.buffer,
      ),
    ),
  ]);

  return publicationDir;
}
