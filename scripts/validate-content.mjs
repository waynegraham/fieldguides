import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import YAML from "yaml";

const rootDir = process.cwd();
const publicationsDir = path.join(rootDir, "publications");
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

function validateSectionEntry(
  publicationDir,
  entry,
  indexPath,
  seenIds,
  position,
) {
  const sectionId = typeof entry === "string" ? entry : entry.id;

  if (!isNonEmptyString(sectionId)) {
    fail(
      `${path.relative(rootDir, indexPath)} has a section at position ${position + 1} with no valid id`,
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
}

function validatePublication(publicationDirName) {
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

    validateSectionEntry(publicationDir, entry, indexPath, seenIds, index);
  });
}

function main() {
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
    validatePublication(publicationDir);
  }

  console.log(
    `Validated ${publicationDirs.length} publication(s) successfully.`,
  );
}

main();
