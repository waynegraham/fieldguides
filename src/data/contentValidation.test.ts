// @vitest-environment node

import { describe, expect, it } from "vitest";

import { getProductionContentIssues } from "../../scripts/validate-content.mjs";

describe("production content validation", () => {
  it.each(["TODO", "TBD", "FIXME", "Lorem ipsum", "[Insert title]"])(
    "detects the placeholder %s",
    (placeholder) => {
      expect(
        getProductionContentIssues(`Publishable text. ${placeholder}`),
      ).not.toEqual([]);
    },
  );

  it("accepts ordinary editorial content", () => {
    expect(
      getProductionContentIssues(
        "Use structured headings, descriptive links, and meaningful image alternatives.",
      ),
    ).toEqual([]);
  });
});
