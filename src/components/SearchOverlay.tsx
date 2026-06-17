import { AnimatePresence, motion } from "motion/react";
import { Search, X } from "lucide-react";
import { useId } from "react";

import type { Guide, PublicationPage } from "../data/publications";
import { useModalAccessibility } from "./useModalAccessibility";

type SearchOverlayProps = {
  isOpen: boolean;
  searchQuery: string;
  filteredGuides: Guide[];
  filteredPages: PublicationPage[];
  onClose: () => void;
  onSearchChange: (value: string) => void;
  onOpenGuide: (slug: string) => void;
  onOpenPage: (publicationSlug: string, pageId: string) => void;
};

function getSearchExcerpt(searchableText: string, searchQuery: string) {
  const normalizedQuery = searchQuery.toLowerCase();
  const start = Math.max(
    0,
    searchableText.toLowerCase().indexOf(normalizedQuery) - 40,
  );
  const end = Math.min(
    searchableText.length,
    searchableText.toLowerCase().indexOf(normalizedQuery) + 100,
  );

  return `...${searchableText.substring(start, end)}...`;
}

export function SearchOverlay({
  isOpen,
  searchQuery,
  filteredGuides,
  filteredPages,
  onClose,
  onSearchChange,
  onOpenGuide,
  onOpenPage,
}: SearchOverlayProps) {
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useModalAccessibility(isOpen, onClose);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={dialogRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-stone-900/95 backdrop-blur-xl p-6 md:p-24"
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          tabIndex={-1}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-12">
              <h2
                id={titleId}
                className="text-clir font-bold text-xs uppercase tracking-[0.4em]"
              >
                Search Field Guides
              </h2>
              <button
                onClick={onClose}
                type="button"
                className="p-2 text-white/60 hover:text-white transition-colors"
                aria-label="Close search"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="relative mb-16">
              <Search
                aria-hidden="true"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 text-clir"
              />
              <label htmlFor="site-search" className="sr-only">
                Search publications and guide sections
              </label>
              <input
                id="site-search"
                autoFocus
                enterKeyHint="search"
                type="text"
                placeholder="Search publications, guides, and resources..."
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                className="w-full bg-transparent border-b-2 border-white/10 py-6 pl-12 text-3xl md:text-5xl serif text-white placeholder:text-white/20 focus:outline-none focus:border-clir transition-colors"
              />
            </div>

            <p id={descriptionId} className="sr-only">
              Search across publications and guide sections. Press Escape to
              close this dialog.
            </p>
            <p aria-live="polite" className="sr-only">
              {`${filteredGuides.length} publications and ${filteredPages.length} guide sections found.`}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <h4 className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold mb-8">
                  Publications
                </h4>
                <div className="space-y-6">
                  {filteredGuides.length > 0 ? (
                    filteredGuides.map((guide) => (
                      <button
                        key={guide.id}
                        type="button"
                        className="group block w-full cursor-pointer text-left"
                        onClick={() => onOpenGuide(guide.slug)}
                      >
                        <h5 className="serif text-xl text-white group-hover:text-clir transition-colors mb-2">
                          {guide.title}
                        </h5>
                        {guide.author && (
                          <p className="text-[10px] text-clir font-bold uppercase tracking-widest mb-2">
                            {guide.author}
                          </p>
                        )}
                        <p className="text-sm text-white/40 line-clamp-2">
                          {guide.description}
                        </p>
                      </button>
                    ))
                  ) : (
                    <p className="text-white/20 italic">
                      No publications match your search.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold mb-8">
                  Guide Sections
                </h4>
                <div className="space-y-6">
                  {filteredPages.length > 0 ? (
                    filteredPages.map((page) => (
                      <button
                        key={`${page.id}-${page.section}`}
                        type="button"
                        className="group block w-full cursor-pointer text-left"
                        onClick={() =>
                          onOpenPage(page.publicationSlug, page.id)
                        }
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] font-bold text-clir">
                            {page.section}
                          </span>
                          <h5 className="serif text-xl text-white group-hover:text-clir transition-colors">
                            {page.title}
                          </h5>
                        </div>
                        <p className="text-sm text-white/40 line-clamp-2">
                          {page.searchableText
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase()) &&
                          searchQuery.length > 2
                            ? getSearchExcerpt(page.searchableText, searchQuery)
                            : "Generative Sustainability Guide"}
                        </p>
                      </button>
                    ))
                  ) : (
                    <p className="text-white/20 italic">
                      No guide sections match your search.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
