// @vitest-environment jsdom

import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Guide, PublicationPage } from "../data/publications";
import { ReaderView } from "./ReaderView";

const guide: Guide = {
  id: "test-guide",
  slug: "test-guide",
  route: "/publications/test-guide",
  title: "Test Guide",
  author: "CLIR",
  publisher: "CLIR",
  copyright: "© CLIR",
  description: "A test guide.",
  featuredBlurb: "A test guide.",
  language: { name: "English", code: "en", dir: "ltr" },
  translations: [],
};

const pages: PublicationPage[] = [
  {
    id: "introduction",
    title: "Introduction",
    section: "01",
    searchableText: "Introduction text",
    publicationSlug: "test-guide",
    loadContent: async () => ({ default: () => <p>Introduction text</p> }),
    Content: () => <p>Introduction text</p>,
  },
  {
    id: "next-section",
    title: "Next section",
    section: "02",
    searchableText: "Next section text",
    publicationSlug: "test-guide",
    loadContent: async () => ({ default: () => <p>Next section text</p> }),
    Content: () => <p>Next section text</p>,
  },
];

describe("ReaderView mobile contents", () => {
  const containers: HTMLDivElement[] = [];

  afterEach(() => {
    containers.splice(0).forEach((container) => container.remove());
  });

  it("opens the contents drawer and closes it after section selection", async () => {
    const container = document.createElement("div");
    containers.push(container);
    document.body.append(container);
    const root = createRoot(container);
    const onSelectPage = vi.fn();
    const onClose = vi.fn();

    await act(async () => {
      root.render(
        <ReaderView
          isOpen
          isSidebarOpen
          guide={guide}
          currentPage={pages[0]}
          currentPageId={pages[0].id}
          pages={pages}
          readerClasses=""
          onClose={onClose}
          onToggleSidebar={vi.fn()}
          onOpenCitation={vi.fn()}
        onOpenSettings={vi.fn()}
        onPrint={vi.fn()}
          onSelectPage={onSelectPage}
        />,
      );
    });

    const contentsButton = container.querySelector<HTMLButtonElement>(
      'button[aria-controls="mobile-reader-contents"]',
    );
    expect(contentsButton?.getAttribute("aria-expanded")).toBe("false");

    await act(async () => contentsButton?.click());

    expect(contentsButton?.getAttribute("aria-expanded")).toBe("true");
    const nextSectionButton = Array.from(
      container.querySelectorAll<HTMLButtonElement>(
        "#mobile-reader-contents nav button",
      ),
    ).find((button) => button.textContent?.includes("Next section"));

    await act(async () => nextSectionButton?.click());

    expect(onSelectPage).toHaveBeenCalledWith("next-section");
    expect(contentsButton?.getAttribute("aria-expanded")).toBe("false");

    await act(async () => contentsButton?.click());
    await act(async () =>
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })),
    );

    expect(contentsButton?.getAttribute("aria-expanded")).toBe("false");
    expect(onClose).not.toHaveBeenCalled();

    await act(async () => root.unmount());
  });

  it("shows only translation editions defined by the publication", async () => {
    const container = document.createElement("div");
    containers.push(container);
    document.body.append(container);
    const root = createRoot(container);
    const translatedGuide: Guide = {
      ...guide,
      translations: [
        {
          language: { name: "Français", code: "fr", dir: "ltr" },
          slug: "guide-francais",
        },
      ],
    };

    await act(async () => {
      root.render(
        <MemoryRouter>
          <ReaderView
            isOpen
            isSidebarOpen
            guide={translatedGuide}
            currentPage={pages[0]}
            currentPageId={pages[0].id}
            pages={pages}
            readerClasses=""
            onClose={vi.fn()}
            onToggleSidebar={vi.fn()}
            onOpenCitation={vi.fn()}
          onOpenSettings={vi.fn()}
          onPrint={vi.fn()}
            onSelectPage={vi.fn()}
          />
        </MemoryRouter>,
      );
    });

    const translationLink =
      container.querySelector<HTMLAnchorElement>('a[hreflang="fr"]');
    expect(translationLink?.textContent).toContain("Français");
    expect(translationLink?.getAttribute("href")).toBe(
      "/publications/guide-francais",
    );

    await act(async () => root.unmount());
  });
});
