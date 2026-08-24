import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  List,
  Printer,
  Quote,
  Settings,
  X,
} from "lucide-react";
import { useCallback, useId, useState } from "react";

import type {
  Guide,
  GuideHeaderMetaItem,
  PublicationPage,
} from "../data/publications";
import { GuideHeader } from "./mdx/GuideMdxComponents";
import { guideMdxComponents } from "./mdx/mdxComponentMap";
import { useModalAccessibility } from "./useModalAccessibility";

type ReaderViewProps = {
  isOpen: boolean;
  isSidebarOpen: boolean;
  guide: Guide;
  currentPage: PublicationPage;
  currentPageId: string;
  pages: PublicationPage[];
  readerClasses: string;
  onClose: () => void;
  onToggleSidebar: () => void;
  onOpenCitation: () => void;
  onOpenSettings: () => void;
  onSelectPage: (pageId: string) => void;
};

type ContentsListProps = {
  currentPageId: string;
  pages: PublicationPage[];
  onSelectPage: (pageId: string) => void;
};

function ContentsList({
  currentPageId,
  pages,
  onSelectPage,
}: ContentsListProps) {
  return (
    <nav aria-label="Guide contents" className="space-y-2">
      {pages.map((page) => (
        <button
          key={page.id}
          onClick={() => onSelectPage(page.id)}
          type="button"
          aria-current={currentPageId === page.id ? "page" : undefined}
          className={`reader-sidebar-item flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all ${
            currentPageId === page.id
              ? "bg-clir text-white shadow-lg shadow-clir/20"
              : ""
          }`}
          style={
            currentPageId === page.id
              ? undefined
              : { color: "var(--reader-sidebar-item)" }
          }
        >
          <span
            className={`text-[10px] font-bold ${
              currentPageId === page.id ? "text-white/70" : "text-clir"
            }`}
            style={
              currentPageId === page.id
                ? undefined
                : { color: "var(--clir-red)" }
            }
          >
            {page.section}
          </span>
          {page.title}
        </button>
      ))}
    </nav>
  );
}

export function ReaderView({
  isOpen,
  isSidebarOpen,
  guide,
  currentPage,
  currentPageId,
  pages,
  readerClasses,
  onClose,
  onToggleSidebar,
  onOpenCitation,
  onOpenSettings,
  onSelectPage,
}: ReaderViewProps) {
  const titleId = useId();
  const mobileContentsTitleId = useId();
  const [isMobileContentsOpen, setIsMobileContentsOpen] = useState(false);
  const closeMobileContents = useCallback(
    () => setIsMobileContentsOpen(false),
    [],
  );
  const dialogRef = useModalAccessibility(
    isOpen && !isMobileContentsOpen,
    onClose,
  );
  const mobileContentsRef = useModalAccessibility(
    isOpen && isMobileContentsOpen,
    closeMobileContents,
  );
  const currentIndex = pages.findIndex((page) => page.id === currentPage.id);
  const previousPage = currentIndex > 0 ? pages[currentIndex - 1] : null;
  const nextPage =
    currentIndex < pages.length - 1 ? pages[currentIndex + 1] : null;
  const pageMetadata: GuideHeaderMetaItem[] = [
    ...(guide.publicationDate ? [{ label: guide.publicationDate }] : []),
    { label: `By ${guide.author}`, emphasis: true },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dialogRef}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[100] overflow-y-auto bg-[var(--bg-paper)] text-[var(--ink-primary)]"
          role="dialog"
          aria-modal={isMobileContentsOpen ? undefined : true}
          aria-labelledby={titleId}
          tabIndex={-1}
        >
          <div className="sticky top-0 z-10 border-b border-stone-200/70 bg-[color-mix(in_srgb,var(--bg-paper)_82%,transparent)] py-4 px-6 backdrop-blur-md dark:border-stone-800/80">
            <div className="max-w-4xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-clir flex items-center justify-center rounded-sm">
                  <BookOpen className="text-white w-5 h-5" />
                </div>
                <span
                  id={titleId}
                  className="serif text-lg font-semibold truncate max-w-[200px] text-[var(--ink-primary)] md:max-w-none"
                >
                  {guide.title}
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-4">
                <button
                  onClick={() => setIsMobileContentsOpen(true)}
                  type="button"
                  aria-expanded={isMobileContentsOpen}
                  aria-controls="mobile-reader-contents"
                  className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-[var(--ink-secondary)] transition-colors hover:bg-stone-100/80 hover:text-[var(--ink-primary)] dark:hover:bg-stone-800/80 lg:hidden"
                >
                  <List className="w-5 h-5" />
                  <span className="hidden sm:inline">Contents</span>
                  <span className="sr-only sm:hidden">Open contents</span>
                </button>
                <button
                  onClick={onToggleSidebar}
                  type="button"
                  aria-expanded={isSidebarOpen}
                  aria-controls="reader-contents"
                  className="hidden lg:flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--ink-secondary)] transition-colors hover:bg-stone-100/80 hover:text-[var(--ink-primary)] dark:hover:bg-stone-800/80"
                >
                  <List className="w-4 h-4" />
                  {isSidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
                </button>
                <div className="hidden h-6 w-px bg-stone-200 dark:bg-stone-800 lg:block" />
                <button
                  onClick={onOpenCitation}
                  type="button"
                  className="hidden items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-[var(--ink-secondary)] transition-colors hover:bg-stone-100/80 hover:text-[var(--ink-primary)] dark:hover:bg-stone-800/80 sm:flex"
                >
                  <Quote className="w-4 h-4" />
                  Cite
                </button>
                <div className="hidden h-6 w-px bg-stone-200 dark:bg-stone-800 lg:block" />
                <button
                  onClick={onClose}
                  type="button"
                  aria-label="Close reader"
                  className="rounded-full p-2 text-[var(--ink-secondary)] transition-colors hover:bg-stone-100/80 hover:text-[var(--ink-primary)] dark:hover:bg-stone-800/80"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          <AnimatePresence>
            {isMobileContentsOpen && (
              <motion.div
                ref={mobileContentsRef}
                id="mobile-reader-contents"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-x-0 top-[73px] bottom-0 z-20 flex lg:hidden"
                role="dialog"
                aria-modal="true"
                aria-labelledby={mobileContentsTitleId}
                tabIndex={-1}
              >
                <motion.aside
                  initial={{ x: "-100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "-100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 260 }}
                  aria-label="Mobile guide contents"
                  className="h-full w-[min(90vw,24rem)] overflow-y-auto border-r p-6 shadow-2xl"
                  style={{
                    backgroundColor: "var(--reader-sidebar-bg)",
                    borderColor: "var(--reader-sidebar-border)",
                  }}
                >
                  <div className="mb-6 flex items-center justify-between">
                    <h2
                      id={mobileContentsTitleId}
                      className="text-xs font-bold uppercase tracking-[0.3em]"
                      style={{ color: "var(--reader-sidebar-label)" }}
                    >
                      Contents
                    </h2>
                    <button
                      onClick={closeMobileContents}
                      type="button"
                      aria-label="Close contents"
                      className="rounded-full p-2 text-[var(--ink-secondary)] transition-colors hover:bg-stone-100/80 hover:text-[var(--ink-primary)] dark:hover:bg-stone-800/80"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <ContentsList
                    currentPageId={currentPageId}
                    pages={pages}
                    onSelectPage={(pageId) => {
                      onSelectPage(pageId);
                      setIsMobileContentsOpen(false);
                    }}
                  />
                </motion.aside>
                <button
                  onClick={closeMobileContents}
                  type="button"
                  aria-label="Close contents"
                  className="flex-1 bg-stone-950/50 backdrop-blur-sm"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex min-h-full">
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.aside
                  id="reader-contents"
                  initial={{ x: -300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -300, opacity: 0 }}
                  className="sticky top-[73px] hidden h-[calc(100vh-73px)] w-80 overflow-y-auto border-r p-8 lg:block"
                  style={{
                    backgroundColor: "var(--reader-sidebar-bg)",
                    borderColor: "var(--reader-sidebar-border)",
                  }}
                >
                  <div className="mb-12">
                    <h4
                      className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em]"
                      style={{ color: "var(--reader-sidebar-label)" }}
                    >
                      Contents
                    </h4>
                    <ContentsList
                      currentPageId={currentPageId}
                      pages={pages}
                      onSelectPage={onSelectPage}
                    />
                  </div>

                  <div
                    className="border-t pt-8"
                    style={{ borderColor: "var(--reader-sidebar-border)" }}
                  >
                    <h4
                      className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em]"
                      style={{ color: "var(--reader-sidebar-label)" }}
                    >
                      Tools
                    </h4>
                    <div className="space-y-4">
                      <button
                        onClick={onOpenCitation}
                        type="button"
                        className="flex items-center gap-3 text-sm transition-colors hover:text-clir"
                        style={{ color: "var(--reader-sidebar-tool)" }}
                      >
                        <Quote className="w-4 h-4" /> Cite this Guide
                      </button>
                      <button
                        onClick={onOpenSettings}
                        type="button"
                        className="flex items-center gap-3 text-sm transition-colors hover:text-clir"
                        style={{ color: "var(--reader-sidebar-tool)" }}
                      >
                        <Settings className="w-4 h-4" /> Reading Preferences
                      </button>
                      <button
                        onClick={() => window.print()}
                        type="button"
                        className="flex items-center gap-3 text-sm transition-colors hover:text-clir"
                        style={{ color: "var(--reader-sidebar-tool)" }}
                      >
                        <Printer className="w-4 h-4" /> Print Entire Guide
                      </button>
                    </div>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            <div className="flex-1">
              <article
                className={`max-w-3xl mx-auto px-6 py-24 ${readerClasses}`}
              >
                <GuideHeader
                  eyebrow={`Section ${currentPage.section}`}
                  title={currentPage.title}
                  metadata={pageMetadata}
                />

                <div className="guide-markdown">
                  <currentPage.Content components={guideMdxComponents} />
                </div>

                <div className="mt-24 flex flex-col items-center justify-between gap-8 border-t border-stone-200 pt-12 dark:border-stone-800 md:flex-row">
                  <div className="text-sm text-[var(--ink-secondary)]">
                    <p>{guide.copyright}</p>
                    {guide.license ? <p>{guide.license}</p> : null}
                  </div>
                  <div className="flex gap-4">
                    {previousPage && (
                      <button
                        onClick={() => onSelectPage(previousPage.id)}
                        type="button"
                        className="rounded-full border border-stone-300 px-6 py-3 font-semibold text-[var(--ink-secondary)] transition-all hover:bg-stone-100/80 hover:text-[var(--ink-primary)] dark:border-stone-700 dark:hover:bg-stone-800/80"
                      >
                        Previous
                      </button>
                    )}
                    {nextPage ? (
                      <button
                        onClick={() => onSelectPage(nextPage.id)}
                        type="button"
                        className="flex items-center gap-2 rounded-full bg-stone-900 px-8 py-4 font-semibold text-white transition-all hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200"
                      >
                        Next Section <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={onClose}
                        type="button"
                        className="flex items-center gap-2 rounded-full bg-stone-900 px-8 py-4 font-semibold text-white transition-all hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-200"
                      >
                        Finish Reading <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
