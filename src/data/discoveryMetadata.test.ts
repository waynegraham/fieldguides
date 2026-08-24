// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
  createPageMetadata,
  renderMetadata,
} from "../../scripts/generate-discovery.mjs";

const site = {
  name: "CLIR Field Guides",
  description: "Open-access guidance.",
  url: "https://example.org/fieldguides/",
  publisher: "CLIR",
  publisherUrl: "https://www.clir.org/",
};

const publication = {
  slug: "test-guide",
  title: "Test Guide",
  description: "A useful guide.",
  author: "CLIR",
  publisher: "CLIR",
  publicationDate: "August 2026",
  license: "CC BY-NC-SA 4.0",
  language: { name: "English", code: "en", dir: "ltr" },
  translations: [],
};

describe("discovery metadata", () => {
  it("builds canonical chapter metadata under the configured site URL", () => {
    const metadata = createPageMetadata({
      site,
      publication,
      section: {
        id: "introduction",
        title: "Introduction",
        description: "Start here.",
      },
    });

    expect(metadata.title).toBe("Introduction — Test Guide");
    expect(metadata.canonicalUrl).toBe(
      "https://example.org/fieldguides/publications/test-guide/sections/introduction/",
    );
    expect(metadata.structuredData["@type"]).toBe("Chapter");
    expect(metadata.structuredData).toMatchObject({
      isPartOf: { inLanguage: "en" },
    });
  });

  it("escapes metadata rendered into HTML", () => {
    const metadata = createPageMetadata({ site });
    metadata.title = 'Field Guides <Archive> & "Libraries"';

    const html = renderMetadata(metadata, site.name);

    expect(html).toContain(
      "Field Guides &lt;Archive&gt; &amp; &quot;Libraries&quot;",
    );
    expect(html).toContain('rel="canonical"');
    expect(html).toContain('property="og:title"');
    expect(html).toContain('type="application/ld+json"');
  });
});
