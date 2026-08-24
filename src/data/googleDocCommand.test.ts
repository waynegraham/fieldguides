// @vitest-environment node

import { describe, expect, it } from "vitest";

import { getExportTitle } from "../../scripts/google-doc-import.mjs";

describe("Google Doc export metadata", () => {
  it("reads the UTF-8 filename from Content-Disposition", () => {
    expect(
      getExportTitle(
        `attachment; filename="TheCLIRGuidetoFieldGuides.md"; filename*=UTF-8''The%20CLIR%20Guide%20to%20Field%20Guides.md`,
      ),
    ).toBe("The CLIR Guide to Field Guides");
  });
});
