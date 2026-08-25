import { lazy, Suspense, useEffect, useState } from "react";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";

import { DocumentMetadata } from "./components/DocumentMetadata";
import { Navigation } from "./components/Navigation";
import { GuideHeader } from "./components/mdx/GuideMdxComponents";
import { guideMdxComponents } from "./components/mdx/mdxComponentMap";
import {
  FEATURED_PUBLICATION,
  GUIDES,
  INTERFACE_LANGUAGE,
  PUBLICATIONS,
} from "./data/publications";
import { decorateGuide } from "./data/guidePresentation";
import {
  getPublicationPageRoute,
  getPublicationRoute,
  parseFieldGuideRoute,
} from "./data/routes";

type ThemeOption = "light" | "dark" | "system";
type ReaderFontSize = "small" | "medium" | "large";
type ReaderLineHeight = "tight" | "normal" | "relaxed";

const StyleguidePage = lazy(() =>
  import("./components/StyleguidePage").then(({ StyleguidePage }) => ({
    default: StyleguidePage,
  })),
);
const CitationModal = lazy(() =>
  import("./components/CitationModal").then(({ CitationModal }) => ({
    default: CitationModal,
  })),
);
const LandingPage = lazy(() =>
  import("./components/LandingPage").then(({ LandingPage }) => ({
    default: LandingPage,
  })),
);
const ReaderView = lazy(() =>
  import("./components/ReaderView").then(({ ReaderView }) => ({
    default: ReaderView,
  })),
);
const SearchOverlay = lazy(() =>
  import("./components/SearchOverlay").then(({ SearchOverlay }) => ({
    default: SearchOverlay,
  })),
);
const SettingsModal = lazy(() =>
  import("./components/SettingsModal").then(({ SettingsModal }) => ({
    default: SettingsModal,
  })),
);

function CreativeCommonsBadge() {
  return (
    <svg
      className="print-copyright__license-image"
      viewBox="0 0 260 88"
      role="img"
      aria-label="Creative Commons Attribution-NonCommercial-ShareAlike"
    >
      <rect
        x="1.5"
        y="1.5"
        width="257"
        height="85"
        rx="5"
        fill="#fff"
        stroke="#000"
        strokeWidth="3"
      />
      <rect y="57" width="260" height="31" fill="#000" />
      <g fill="#fff" stroke="#000" strokeWidth="4">
        <circle cx="40" cy="38" r="28" />
        <circle cx="101" cy="38" r="28" />
        <circle cx="162" cy="38" r="28" />
        <circle cx="223" cy="38" r="28" />
      </g>
      <g
        fill="#000"
        fontFamily="Arial, sans-serif"
        fontWeight="700"
        textAnchor="middle"
      >
        <text x="40" y="48" fontSize="27">
          CC
        </text>
        <circle cx="101" cy="27" r="6" />
        <path d="M93 36h16v21H93zM86 38h30v7H86z" />
        <text x="162" y="48" fontSize="31">
          $
        </text>
        <path d="M145 19l34 38" fill="none" stroke="#000" strokeWidth="5" />
        <path
          d="M232 27a15 15 0 1 0 2 18"
          fill="none"
          stroke="#000"
          strokeWidth="5"
        />
        <path d="M232 18v15h-15" fill="none" stroke="#000" strokeWidth="5" />
      </g>
      <g
        fill="#fff"
        fontFamily="Arial, sans-serif"
        fontSize="15"
        fontWeight="700"
        textAnchor="middle"
      >
        <text x="101" y="79">
          BY
        </text>
        <text x="162" y="79">
          NC
        </text>
        <text x="223" y="79">
          SA
        </text>
      </g>
    </svg>
  );
}

function getPrintCopyright(
  publicationDate: string | undefined,
  copyright: string,
) {
  const publicationYear = publicationDate?.match(/\b\d{4}\b/)?.[0];
  const copyrightOwner = copyright
    .replace(/^©\s*/, "")
    .replace(/^\d{4}\s+/, "")
    .trim();

  return `Copyright © ${publicationYear ? `${publicationYear} ` : ""}${copyrightOwner}`;
}

type AppRouteContext = {
  isReading: boolean;
  selectedPublication: (typeof PUBLICATIONS)[number];
  currentPage: (typeof PUBLICATIONS)[number]["pages"][number];
  pages: (typeof PUBLICATIONS)[number]["pages"];
  readerClasses: string;
  isSidebarOpen: boolean;
  openPublication: (slug: string) => void;
  openReaderPage: (publicationSlug: string, pageId: string) => void;
  closeReader: () => void;
  toggleSidebar: () => void;
  openCitation: () => void;
  openSettings: () => void;
  preparePrint: () => void;
};

function getReaderClasses(
  readerFontSize: ReaderFontSize,
  readerLineHeight: ReaderLineHeight,
) {
  const fontClasses: Record<ReaderFontSize, string> = {
    small: "reader-size-small",
    medium: "reader-size-medium",
    large: "reader-size-large",
  };
  const lineClasses: Record<ReaderLineHeight, string> = {
    tight: "reader-leading-tight",
    normal: "reader-leading-normal",
    relaxed: "reader-leading-relaxed",
  };

  return `${fontClasses[readerFontSize]} ${lineClasses[readerLineHeight]}`;
}

function useFieldGuideRoute() {
  return parseFieldGuideRoute(useLocation().pathname);
}

function FieldGuidesLayout() {
  const navigate = useNavigate();
  const { slug, pageId, isReading } = useFieldGuideRoute();
  const selectedPublication =
    PUBLICATIONS.find((publication) => publication.guide.slug === slug) ||
    FEATURED_PUBLICATION;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCiteOpen, setIsCiteOpen] = useState(false);
  const [citeFormat, setCiteFormat] = useState("Chicago");
  const [copied, setCopied] = useState(false);
  const [theme, setTheme] = useState<ThemeOption>("system");
  const [readerFontSize, setReaderFontSize] =
    useState<ReaderFontSize>("medium");
  const [readerLineHeight, setReaderLineHeight] =
    useState<ReaderLineHeight>("normal");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPrintReady, setIsPrintReady] = useState(false);

  const pages = selectedPublication?.pages || [];
  const currentPage = pages.find((page) => page.id === pageId) || pages[0];

  const filteredGuides = GUIDES.filter(
    (guide) =>
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.author?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredPages = PUBLICATIONS.flatMap((publication) =>
    publication.pages.filter(
      (page) =>
        page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        page.searchableText.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  );

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const openPublication = (nextSlug: string) => {
    const publication = PUBLICATIONS.find(
      (item) => item.guide.slug === nextSlug,
    );

    if (!publication) {
      return;
    }

    navigate(getPublicationPageRoute(nextSlug, publication.pages[0]?.id || ""));
    closeSearch();
  };

  const openReaderPage = (publicationSlug: string, nextPageId: string) => {
    const publication = PUBLICATIONS.find(
      (item) => item.guide.slug === publicationSlug,
    );

    if (!publication) {
      return;
    }

    navigate(getPublicationPageRoute(publicationSlug, nextPageId));
    closeSearch();
  };

  const closeReader = () => navigate("/");

  const generateCitation = (format: string) => {
    const author = selectedPublication?.guide.author || "CLIR";
    const title = selectedPublication?.guide.title || "Field Guide";
    const year =
      selectedPublication?.guide.publicationDate?.slice(0, 4) || "2026";
    const publisher =
      selectedPublication?.guide.publisher ||
      "Council on Library and Information Resources";
    const url = window.location.href;
    const today = new Date().toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    switch (format) {
      case "MLA":
        return `${author}. "${title}." Field Guides, ${publisher}, ${year}, ${url}.`;
      case "Harvard":
        return `${author} (${year}). ${title}. [online] Field Guides. ${publisher}. Available at: ${url} [Accessed ${today}].`;
      case "Vancouver":
        return `${author}. ${title}. Field Guides [Internet]. ${publisher}; ${year} [cited ${today}]. Available from: ${url}.`;
      case "Chicago":
      default:
        return `${author}. "${title}." Field Guides. ${publisher}, ${year}. ${url}.`;
    }
  };

  const handleCopyCitation = () => {
    navigator.clipboard.writeText(generateCitation(citeFormat));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const applyTheme = () => {
      if (theme === "dark" || (theme === "system" && mediaQuery.matches)) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    applyTheme();
    mediaQuery.addEventListener("change", applyTheme);

    return () => mediaQuery.removeEventListener("change", applyTheme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isReading ? "hidden" : "unset";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isReading]);

  useEffect(() => {
    if (!isPrintReady) {
      return;
    }

    const printFrame = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => window.print());
    });
    const resetPrintLayout = () => setIsPrintReady(false);

    window.addEventListener("afterprint", resetPrintLayout, { once: true });

    return () => {
      window.cancelAnimationFrame(printFrame);
      window.removeEventListener("afterprint", resetPrintLayout);
    };
  }, [isPrintReady]);

  if (!selectedPublication || !currentPage) {
    return <Navigate to="/" replace />;
  }

  const context: AppRouteContext = {
    isReading,
    selectedPublication,
    currentPage,
    pages,
    readerClasses: getReaderClasses(readerFontSize, readerLineHeight),
    isSidebarOpen,
    openPublication,
    openReaderPage,
    closeReader,
    toggleSidebar: () => setIsSidebarOpen((open) => !open),
    openCitation: () => setIsCiteOpen(true),
    openSettings: () => setIsSettingsOpen(true),
    preparePrint: () => {
      void Promise.all(pages.map((page) => page.loadContent())).then(() =>
        setIsPrintReady(true),
      );
    },
  };

  return (
    <div className="min-h-screen selection:bg-clir/20 selection:text-clir">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[400] focus:rounded-full focus:bg-stone-950 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      <Navigation
        scrolled={scrolled}
        isMenuOpen={isMenuOpen}
        interfaceLanguage={INTERFACE_LANGUAGE}
        onToggleMenu={() => setIsMenuOpen((open) => !open)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onCloseMenu={() => setIsMenuOpen(false)}
      />

      {isSearchOpen && (
        <Suspense fallback={null}>
          <SearchOverlay
            isOpen
            searchQuery={searchQuery}
            filteredGuides={filteredGuides}
            filteredPages={filteredPages}
            onClose={closeSearch}
            onSearchChange={setSearchQuery}
            onOpenGuide={openPublication}
            onOpenPage={openReaderPage}
          />
        </Suspense>
      )}

      <main id="main-content" tabIndex={-1}>
        <Outlet context={context} />
      </main>

      {isCiteOpen && (
        <Suspense fallback={null}>
          <CitationModal
            isOpen
            citeFormat={citeFormat}
            copied={copied}
            citation={generateCitation(citeFormat)}
            onClose={() => setIsCiteOpen(false)}
            onSelectFormat={setCiteFormat}
            onCopy={handleCopyCitation}
          />
        </Suspense>
      )}

      {isSettingsOpen && (
        <Suspense fallback={null}>
          <SettingsModal
            isOpen
            theme={theme}
            readerFontSize={readerFontSize}
            readerLineHeight={readerLineHeight}
            onClose={() => setIsSettingsOpen(false)}
            onThemeChange={setTheme}
            onFontSizeChange={setReaderFontSize}
            onLineHeightChange={setReaderLineHeight}
          />
        </Suspense>
      )}

      {isReading && isPrintReady && (
        <div id="print-container" className="hidden">
          <section className="print-cover" aria-label="Publication cover">
            <div className="print-cover__mark" aria-hidden="true">
              <span>CLIR</span>
              <span>Field Guides</span>
            </div>

            <div className="print-cover__title-block">
              <p className="print-cover__series">A CLIR Publication</p>
              <h1>{selectedPublication.guide.title}</h1>
              <p className="print-cover__author">
                {selectedPublication.guide.author}
              </p>
            </div>

            <footer className="print-cover__footer">
              <p>{selectedPublication.guide.publisher}</p>
              {selectedPublication.guide.publicationDate ? (
                <p>{selectedPublication.guide.publicationDate}</p>
              ) : null}
            </footer>
          </section>

          <section
            className="print-copyright"
            aria-label="Copyright and publication information"
          >
            <div className="print-copyright__content">
              <p className="print-copyright__notice">
                {getPrintCopyright(
                  selectedPublication.guide.publicationDate,
                  selectedPublication.guide.copyright,
                )}
              </p>

              {selectedPublication.guide.license ? (
                <div className="print-copyright__license">
                  <CreativeCommonsBadge />
                  <p>
                    This work is licensed under a Creative Commons
                    <br />
                    Attribution-NonCommercial-ShareAlike 4.0 International
                    License.
                  </p>
                </div>
              ) : null}

              <div className="print-copyright__publisher">
                <p className="print-copyright__label">Published by</p>
                <p>{selectedPublication.guide.publisher}</p>
              </div>
            </div>
          </section>

          {pages.map((page) => (
            <div
              key={page.id}
              className="print-page p-12"
              lang={selectedPublication.guide.language.code}
              dir={selectedPublication.guide.language.dir}
            >
              <GuideHeader
                eyebrow={`Section ${page.section}`}
                title={page.title}
                metadata={[
                  ...(selectedPublication.guide.publicationDate
                    ? [{ label: selectedPublication.guide.publicationDate }]
                    : []),
                  {
                    label: `By ${selectedPublication.guide.author}`,
                    emphasis: true,
                  },
                ]}
              />
              <div className="guide-markdown">
                <Suspense fallback={null}>
                  <page.Content components={guideMdxComponents} />
                </Suspense>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function useAppRouteContext() {
  return useOutletContext<AppRouteContext>();
}

function LandingRoute() {
  const { openPublication } = useAppRouteContext();

  return (
    <Suspense fallback={null}>
      <LandingPage
        guides={GUIDES.map((guide, index) => decorateGuide(guide, index))}
        onReadGuide={openPublication}
      />
    </Suspense>
  );
}

function PublicationReaderRoute() {
  const { slug, pageId } = useParams();
  const {
    selectedPublication,
    currentPage,
    pages,
    readerClasses,
    isSidebarOpen,
    closeReader,
    openCitation,
    openSettings,
    preparePrint,
    openReaderPage,
    toggleSidebar,
  } = useAppRouteContext();

  if (
    !slug ||
    !selectedPublication ||
    selectedPublication.guide.slug !== slug
  ) {
    return <Navigate to="/" replace />;
  }

  if (pageId && !pages.some((page) => page.id === pageId)) {
    return (
      <Navigate
        to={getPublicationPageRoute(
          slug,
          selectedPublication.pages[0]?.id || "",
        )}
        replace
      />
    );
  }

  return (
    <Suspense fallback={null}>
      <ReaderView
        isOpen
        isSidebarOpen={isSidebarOpen}
        guide={selectedPublication.guide}
        currentPage={currentPage}
        currentPageId={currentPage.id}
        pages={pages}
        readerClasses={readerClasses}
        onClose={closeReader}
        onToggleSidebar={toggleSidebar}
        onOpenCitation={openCitation}
        onOpenSettings={openSettings}
        onPrint={preparePrint}
        onSelectPage={(nextPageId) => openReaderPage(slug, nextPageId)}
      />
    </Suspense>
  );
}

export default function App() {
  return (
    <>
      <DocumentMetadata />
      <Routes>
        <Route
          path="/styleguide"
          element={
            <Suspense fallback={null}>
              <StyleguidePage />
            </Suspense>
          }
        />
        <Route element={<FieldGuidesLayout />}>
          <Route index element={<LandingRoute />} />
          <Route
            path={getPublicationRoute(":slug").replace(/^\//, "")}
            element={<PublicationReaderRoute />}
          />
          <Route
            path={getPublicationPageRoute(":slug", ":pageId").replace(
              /^\//,
              "",
            )}
            element={<PublicationReaderRoute />}
          />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
