import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import YAML from "yaml";

const rootDir = process.cwd();
const publicationsDir = path.join(rootDir, "publications");
const isProduction = process.argv.includes("--production");
const placeholderPatterns = [
  { label: "TODO marker", pattern: /\bTODO\b/i },
  { label: "TBD marker", pattern: /\bTBD\b/i },
  { label: "FIXME marker", pattern: /\bFIXME\b/i },
  { label: "placeholder text", pattern: /\bplaceholder\b/i },
  { label: "sample person name", pattern: /\brandom person\b/i },
  {
    label: "sample media description",
    pattern: /\bexample (?:graphic|image|text)\b/i,
  },
  {
    label: "template instruction",
    pattern: /\[(?:insert|add|describe)\b[^\]]*\]/i,
  },
  { label: "lorem ipsum text", pattern: /\blorem ipsum\b/i },
];
const markdownLinkPattern = /!?\[[^\]]*\]\(([^)\s]+)(?:\s+["'][^"']*["'])?\)/g;
const allowedIcons = new Set([
  "archive",
  "book-open",
  "cpu",
  "database",
  "globe",
  "leaf",
]);

function fail(message) {
  throw new Error(message);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function parseJsonFile(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(
      `${path.relative(rootDir, filePath)} is not valid JSON: ${String(error)}`,
    );
  }
}

function parseFrontmatter(filePath) {
  const source = readFileSync(filePath, "utf8");
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);

  if (!match) {
    return {};
  }

  try {
    return YAML.parse(match[1]) || {};
  } catch (error) {
    fail(
      `${path.relative(rootDir, filePath)} has invalid YAML frontmatter: ${String(error)}`,
    );
  }
}

function assertStringField(value, label, filePath) {
  if (!isNonEmptyString(value)) {
    fail(
      `${path.relative(rootDir, filePath)} is missing required field "${label}"`,
    );
  }
}

function assertOptionalStringField(value, label, filePath) {
  if (value !== undefined && !isNonEmptyString(value)) {
    fail(
      `${path.relative(rootDir, filePath)} field "${label}" must be a non-empty string`,
    );
  }
}

export function getProductionContentIssues(source) {
  return placeholderPatterns
    .filter(({ pattern }) => pattern.test(source))
    .map(({ label }) => label);
}

function validateProductionText(source, filePath) {
  const issues = getProductionContentIssues(source);

  if (issues.length > 0) {
    fail(
      `${path.relative(rootDir, filePath)} is not production-ready: ${issues.join(", ")}`,
    );
  }
}

function validateProductionLinks(source, filePath) {
  for (const match of source.matchAll(markdownLinkPattern)) {
    const target = match[1];

    if (
      target.startsWith("#") ||
      target.startsWith("mailto:") ||
      target.startsWith("tel:")
    ) {
      continue;
    }

    if (/^https?:\/\//i.test(target)) {
      let url;

      try {
        url = new URL(target);
      } catch {
        fail(
          `${path.relative(rootDir, filePath)} contains malformed URL "${target}"`,
        );
      }

      if (url.protocol !== "https:") {
        fail(
          `${path.relative(rootDir, filePath)} contains insecure external URL "${target}"`,
        );
      }
      continue;
    }

    const localTarget = decodeURIComponent(target.split(/[?#]/, 1)[0]);
    const resolvedTarget = path.resolve(path.dirname(filePath), localTarget);

    if (!resolvedTarget.startsWith(`${path.dirname(filePath)}${path.sep}`)) {
      fail(
        `${path.relative(rootDir, filePath)} contains local link outside its publication directory: "${target}"`,
      );
    }

    if (!existsSync(resolvedTarget)) {
      fail(
        `${path.relative(rootDir, filePath)} references missing local file "${target}"`,
      );
    }
  }
}

function validateSectionEntry(
  publicationDir,
  entry,
  indexPath,
  seenIds,
  position,
  production,
) {
  const sectionId = typeof entry === "string" ? entry : entry.id;

  if (!isNonEmptyString(sectionId)) {
    fail(
      `${path.relative(rootDir, indexPath)} has a section at position ${position + 1} with no valid id`,
    );
  }

  if (production && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(sectionId)) {
    fail(
      `${path.relative(rootDir, indexPath)} section id "${sectionId}" must be a lowercase URL-safe slug`,
    );
  }

  if (seenIds.has(sectionId)) {
    fail(
      `${path.relative(rootDir, indexPath)} defines duplicate section id "${sectionId}"`,
    );
  }
  seenIds.add(sectionId);

  const sectionPath = path.join(publicationDir, `${sectionId}.mdx`);
  let stats;

  try {
    stats = statSync(sectionPath);
  } catch {
    fail(
      `${path.relative(rootDir, indexPath)} references missing section file ${path.relative(rootDir, sectionPath)}`,
    );
  }

  if (!stats.isFile()) {
    fail(`${path.relative(rootDir, sectionPath)} exists but is not a file`);
  }

  const frontmatter = parseFrontmatter(sectionPath);
  const sectionSource = readFileSync(sectionPath, "utf8");
  const resolvedTitle = typeof entry === "object" ? entry.title : undefined;
  const resolvedSection = typeof entry === "object" ? entry.section : undefined;

  if (
    !isNonEmptyString(resolvedTitle) &&
    !isNonEmptyString(frontmatter.title)
  ) {
    fail(
      `${path.relative(rootDir, sectionPath)} is missing section title metadata in index.json or frontmatter`,
    );
  }

  if (
    !isNonEmptyString(resolvedSection) &&
    !isNonEmptyString(frontmatter.section)
  ) {
    fail(
      `${path.relative(rootDir, sectionPath)} is missing section number metadata in index.json or frontmatter`,
    );
  }

  if (
    frontmatter.searchableText !== undefined &&
    !isNonEmptyString(frontmatter.searchableText)
  ) {
    fail(
      `${path.relative(rootDir, sectionPath)} frontmatter "searchableText" must be a non-empty string`,
    );
  }

  if (production) {
    const body = sectionSource.replace(/^---\n[\s\S]*?\n---\n?/, "").trim();

    if (body.length < 80) {
      fail(
        `${path.relative(rootDir, sectionPath)} is too short to publish (${body.length} characters)`,
      );
    }

    validateProductionText(sectionSource, sectionPath);
    validateProductionLinks(sectionSource, sectionPath);
  }
}

function validatePublication(publicationDirName, production) {
  const publicationDir = path.join(publicationsDir, publicationDirName);
  const indexPath = path.join(publicationDir, "index.json");
  const indexFile = parseJsonFile(indexPath);

  assertStringField(indexFile.title, "title", indexPath);
  assertStringField(indexFile.description, "description", indexPath);
  assertStringField(indexFile.author, "author", indexPath);
  assertStringField(indexFile.publisher, "publisher", indexPath);
  assertStringField(indexFile.copyright, "copyright", indexPath);
  assertStringField(indexFile.publicationDate, "publicationDate", indexPath);
  assertStringField(indexFile.license, "license", indexPath);
  assertOptionalStringField(indexFile.image, "image", indexPath);
  assertOptionalStringField(
    indexFile.featuredBlurb,
    "featuredBlurb",
    indexPath,
  );
  assertOptionalStringField(
    indexFile.availableLanguages,
    "availableLanguages",
    indexPath,
  );
  assertOptionalStringField(indexFile.color, "color", indexPath);
  assertOptionalStringField(indexFile.accent, "accent", indexPath);

  if (production) {
    validateProductionText(JSON.stringify(indexFile), indexPath);

    if (Number.isNaN(Date.parse(indexFile.publicationDate))) {
      fail(
        `${path.relative(rootDir, indexPath)} field "publicationDate" must be a valid date`,
      );
    }
  }

  if (
    indexFile.icon !== undefined &&
    !allowedIcons.has(String(indexFile.icon))
  ) {
    fail(
      `${path.relative(rootDir, indexPath)} field "icon" must be one of: ${Array.from(allowedIcons).join(", ")}`,
    );
  }

  if (!Array.isArray(indexFile.sections) || indexFile.sections.length === 0) {
    fail(
      `${path.relative(rootDir, indexPath)} must define a non-empty "sections" array`,
    );
  }

  const seenIds = new Set();
  indexFile.sections.forEach((entry, index) => {
    if (
      typeof entry !== "string" &&
      (typeof entry !== "object" || entry === null)
    ) {
      fail(
        `${path.relative(rootDir, indexPath)} has an invalid section entry at position ${index + 1}`,
      );
    }

    validateSectionEntry(
      publicationDir,
      entry,
      indexPath,
      seenIds,
      index,
      production,
    );
  });

  if (production) {
    const unreferencedSections = readdirSync(publicationDir)
      .filter((fileName) => fileName.endsWith(".mdx"))
      .map((fileName) => path.basename(fileName, ".mdx"))
      .filter((sectionId) => !seenIds.has(sectionId));

    if (unreferencedSections.length > 0) {
      fail(
        `${path.relative(rootDir, indexPath)} does not reference section file(s): ${unreferencedSections.join(", ")}`,
      );
    }
  }
}

export function validateContent({ production = false } = {}) {
  let publicationDirs;

  try {
    publicationDirs = readdirSync(publicationsDir).filter((entry) =>
      statSync(path.join(publicationsDir, entry)).isDirectory(),
    );
  } catch (error) {
    fail(`Unable to read publications directory: ${String(error)}`);
  }

  if (publicationDirs.length === 0) {
    fail("No publication directories found under publications/");
  }

  for (const publicationDir of publicationDirs) {
    validatePublication(publicationDir, production);
  }

  console.log(
    `${production ? "Production-validated" : "Validated"} ${publicationDirs.length} publication(s) successfully.`,
  );
}

const isDirectRun = process.argv[1]
  ? path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
  : false;

if (isDirectRun) {
  validateContent({ production: isProduction });
}
