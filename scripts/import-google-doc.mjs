#!/usr/bin/env node

import process from "node:process";

import {
  convertGoogleMarkdown,
  getDocumentId,
  getExportTitle,
  writePublication,
} from "./google-doc-import.mjs";

function usage() {
  return `Usage:
  pnpm import:google-doc -- <google-doc-url-or-id> [options]

Options:
  --write                    Write files (default is a dry run)
  --force                    Replace files for an existing publication
  --slug <slug>              Override the publication slug
  --title <title>            Override the publication title
  --description <text>       Set the publication description
  --author <name>            Set the author (default: CLIR)
  --publisher <name>         Set the publisher
  --publication-date <text>  Set the displayed publication date
  --copyright <text>         Set the copyright notice
  --license <text>           Set the license notice
  --source <path>            Read a local Markdown export instead of downloading
  --help                     Show this help
`;
}

function parseArgs(argv) {
  const options = { write: false, force: false };
  const positional = [];
  const valueOptions = new Map([
    ["--slug", "slug"],
    ["--title", "title"],
    ["--description", "description"],
    ["--author", "author"],
    ["--publisher", "publisher"],
    ["--publication-date", "publicationDate"],
    ["--copyright", "copyright"],
    ["--license", "license"],
    ["--source", "source"],
  ]);

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--") {
      continue;
    }
    if (argument === "--write" || argument === "--force") {
      options[argument.slice(2)] = true;
      continue;
    }
    if (argument === "--help" || argument === "-h") {
      options.help = true;
      continue;
    }
    const key = valueOptions.get(argument);
    if (key) {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error(`${argument} requires a value.`);
      }
      options[key] = value;
      index += 1;
      continue;
    }
    if (argument.startsWith("--")) {
      throw new Error(`Unknown option: ${argument}`);
    }
    positional.push(argument);
  }

  return { options, positional };
}

async function readSource(documentId, localSource) {
  if (localSource) {
    const { readFile } = await import("node:fs/promises");
    return { markdown: await readFile(localSource, "utf8") };
  }

  const exportUrl = `https://docs.google.com/document/d/${documentId}/export?format=md`;
  const headers = {};
  if (process.env.GOOGLE_ACCESS_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GOOGLE_ACCESS_TOKEN}`;
  }
  const response = await fetch(exportUrl, { headers, redirect: "follow" });
  if (!response.ok) {
    throw new Error(
      `Google Docs export failed with ${response.status} ${response.statusText}. ` +
        "Make the document readable by the importer or set GOOGLE_ACCESS_TOKEN.",
    );
  }
  return {
    markdown: await response.text(),
    title: getExportTitle(response.headers.get("content-disposition")),
  };
}

function printReport(result, documentId, willWrite) {
  console.log(`${willWrite ? "Import" : "Dry run"}: ${result.manifest.title}`);
  console.log(`Document: ${documentId}`);
  console.log(`Target: publications/${result.slug}/`);
  console.log(`Sections: ${result.sections.length}`);
  for (const section of result.sections) {
    console.log(`  ${section.section}  ${section.id}.mdx  ${section.title}`);
  }
  console.log(`Images: ${result.images.length}`);
  if (result.warnings.length > 0) {
    console.log(`Warnings: ${result.warnings.length}`);
    for (const warning of result.warnings) {
      console.log(`  - ${warning}`);
    }
  }
}

async function main() {
  const { options, positional } = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }
  if (positional.length !== 1) {
    throw new Error(`Provide one Google Doc URL or document ID.\n\n${usage()}`);
  }

  const documentId = getDocumentId(positional[0]);
  const source = await readSource(documentId, options.source);
  const result = convertGoogleMarkdown(source.markdown, {
    ...options,
    title: options.title || source.title,
  });
  printReport(result, documentId, options.write);

  if (!options.write) {
    console.log("\nNo files written. Add --write to create the publication.");
    return;
  }

  const publicationDir = await writePublication(result, process.cwd(), {
    force: options.force,
  });
  console.log(`\nWrote ${publicationDir}`);
  console.log(
    "Run pnpm run format && pnpm run validate:content && pnpm run build.",
  );
}

main().catch((error) => {
  console.error(`import:google-doc: ${error.message}`);
  process.exitCode = 1;
});
