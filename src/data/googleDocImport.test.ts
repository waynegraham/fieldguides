// @vitest-environment node

import { describe, expect, it } from "vitest";

import {
  convertGoogleMarkdown,
  getDocumentId,
  slugify,
} from "../../scripts/google-doc-import.mjs";

describe("Google Doc import", () => {
  it("extracts a document ID from a URL with tabs and headings", () => {
    expect(
      getDocumentId(
        "https://docs.google.com/document/d/abc_123-Z/edit?tab=t.example#heading=h.one",
      ),
    ).toBe("abc_123-Z");
  });

  it("creates safe slugs", () => {
    expect(slugify("Copyright, Privacy & Ethics")).toBe(
      "copyright-privacy-and-ethics",
    );
  });

  it("deduplicates headings, removes navigation, and extracts images", () => {
    const source = `# **Example Guide**

# **Introduction**

[Next section \\>\\>]()

# **Introduction**

Hello **world**.

![][image1]

# Next steps

Do the work.

[image1]: <data:image/png;base64,aGVsbG8=>`;

    const result = convertGoogleMarkdown(source, {
      author: "Test Author",
      publicationDate: "August 2026",
    });

    expect(result.slug).toBe("example-guide");
    expect(result.sections.map((section) => section.id)).toEqual([
      "introduction",
      "next-steps",
    ]);
    expect(result.sections[0].body).toContain("Hello **world**.");
    expect(result.sections[0].body).not.toContain("Next section");
    expect(result.sections[0].body).toContain("![](./assets/image-");
    expect(result.images).toHaveLength(1);
    expect(result.manifest.language).toEqual({
      name: "English",
      code: "en",
      dir: "ltr",
    });
    expect(result.manifest.translations).toEqual([]);
    expect(result.warnings).toContainEqual(
      expect.stringContaining("no alt text"),
    );
  });

  it("uses an external document title and keeps the first heading as a section", () => {
    const result = convertGoogleMarkdown(
      "# Overview\n\n# Overview\n\nGuide introduction.\n\n# Resources\n\nLinks.",
      { title: "The CLIR Guide to Field Guides" },
    );

    expect(result.manifest.title).toBe("The CLIR Guide to Field Guides");
    expect(result.slug).toBe("the-clir-guide-to-field-guides");
    expect(result.sections.map((section) => section.id)).toEqual([
      "overview",
      "resources",
    ]);
    expect(result.sections[0].body).toContain("Guide introduction.");
  });
});
