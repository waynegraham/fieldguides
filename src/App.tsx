import { useEffect, useRef, useState } from "react";
import {
  Navigate,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useOutletContext,
  useParams,
} from "react-router-dom";

import { CitationModal } from "./components/CitationModal";
import { LandingPage } from "./components/LandingPage";
import { Navigation } from "./components/Navigation";
import { ReaderView } from "./components/ReaderView";
import { SearchOverlay } from "./components/SearchOverlay";
import { SettingsModal } from "./components/SettingsModal";
import { StyleguidePage } from "./components/StyleguidePage";
import { GuideHeader } from "./components/mdx/GuideMdxComponents";
import { guideMdxComponents } from "./components/mdx/mdxComponentMap";
import {
  FEATURED_PUBLICATION,
  GUIDES,
  LANGUAGES,
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
  return parseFieldGuideRoute(window.location.pathname);
}

function FieldGuidesLayout() {
  const navigate = useNavigate();
  const { slug, pageId, isReading } = useFieldGuideRoute();
  const selectedPublication =
    PUBLICATIONS.find((publication) => publication.guide.slug === slug) ||
    FEATURED_PUBLICATION;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);
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
  const langDropdownRef = useRef<HTMLDivElement>(null);

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
    const handleClickOutside = (event: MouseEvent) => {
      if (
        langDropdownRef.current &&
        !langDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLangOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.documentElement.dir = selectedLang.dir;
    document.documentElement.lang = selectedLang.code;
  }, [selectedLang]);

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
        isLangOpen={isLangOpen}
        selectedLang={selectedLang}
        languages={LANGUAGES}
        langDropdownRef={langDropdownRef}
        onToggleMenu={() => setIsMenuOpen((open) => !open)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleLanguageMenu={() => setIsLangOpen((open) => !open)}
        onSelectLanguage={(language) => {
          setSelectedLang(language);
          setIsLangOpen(false);
        }}
        onCloseMenu={() => setIsMenuOpen(false)}
      />

      <SearchOverlay
        isOpen={isSearchOpen}
        searchQuery={searchQuery}
        filteredGuides={filteredGuides}
        filteredPages={filteredPages}
        onClose={closeSearch}
        onSearchChange={setSearchQuery}
        onOpenGuide={openPublication}
        onOpenPage={openReaderPage}
      />

      <main id="main-content" tabIndex={-1}>
        <Outlet context={context} />
      </main>

      <CitationModal
        isOpen={isCiteOpen}
        citeFormat={citeFormat}
        copied={copied}
        citation={generateCitation(citeFormat)}
        onClose={() => setIsCiteOpen(false)}
        onSelectFormat={setCiteFormat}
        onCopy={handleCopyCitation}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        theme={theme}
        readerFontSize={readerFontSize}
        readerLineHeight={readerLineHeight}
        onClose={() => setIsSettingsOpen(false)}
        onThemeChange={setTheme}
        onFontSizeChange={setReaderFontSize}
        onLineHeightChange={setReaderLineHeight}
      />

      {isReading && (
        <div id="print-container" className="hidden">
          {pages.map((page) => (
            <div key={page.id} className="print-page p-12">
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
                <page.Content components={guideMdxComponents} />
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
    <LandingPage
      guides={GUIDES.map((guide, index) => decorateGuide(guide, index))}
      onReadGuide={openPublication}
    />
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

  if (!pageId) {
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

  if (!pages.some((page) => page.id === pageId)) {
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
      onSelectPage={(nextPageId) => openReaderPage(slug, nextPageId)}
    />
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/styleguide" element={<StyleguidePage />} />
      <Route element={<FieldGuidesLayout />}>
        <Route index element={<LandingRoute />} />
        <Route
          path={getPublicationRoute(":slug").replace(/^\//, "")}
          element={<PublicationReaderRoute />}
        />
        <Route
          path={getPublicationPageRoute(":slug", ":pageId").replace(/^\//, "")}
          element={<PublicationReaderRoute />}
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
