import { describe, expect, it } from "vitest";

import {
  getPublicationPageRoute,
  getPublicationRoute,
  parseFieldGuideRoute,
} from "./routes";

describe("publication routes", () => {
  it("builds publication routes", () => {
    expect(getPublicationRoute("guide-slug")).toBe("/publications/guide-slug");
    expect(getPublicationRoute("guide-slug", "/app")).toBe(
      "/app/publications/guide-slug",
    );
  });

  it("builds publication page routes", () => {
    expect(getPublicationPageRoute("guide-slug", "intro")).toBe(
      "/publications/guide-slug/sections/intro",
    );
  });

  it("parses publication page routes", () => {
    expect(
      parseFieldGuideRoute("/publications/guide-slug/sections/intro"),
    ).toEqual({
      slug: "guide-slug",
      pageId: "intro",
      isReading: true,
    });
  });

  it("parses guide shell routes", () => {
    expect(parseFieldGuideRoute("/publications/guide-slug")).toEqual({
      slug: "guide-slug",
      pageId: null,
      isReading: true,
    });
  });

  it("returns a non-reader route for unrelated paths", () => {
    expect(parseFieldGuideRoute("/styleguide")).toEqual({
      slug: null,
      pageId: null,
      isReading: false,
    });
  });
});
