import { AnimatePresence, motion } from "motion/react";
import { BookOpen, ChevronDown, Globe, Menu, Search, X } from "lucide-react";
import { type RefObject } from "react";
import { Link } from "react-router-dom";

import type { Language } from "../data/publications";
import { useModalAccessibility } from "./useModalAccessibility";

type NavigationProps = {
  scrolled: boolean;
  isMenuOpen: boolean;
  isLangOpen: boolean;
  selectedLang: Language;
  languages: Language[];
  langDropdownRef: RefObject<HTMLDivElement | null>;
  onToggleMenu: () => void;
  onOpenSearch: () => void;
  onToggleLanguageMenu: () => void;
  onSelectLanguage: (language: Language) => void;
  onCloseMenu: () => void;
};

export function Navigation({
  scrolled,
  isMenuOpen,
  isLangOpen,
  selectedLang,
  languages,
  langDropdownRef,
  onToggleMenu,
  onOpenSearch,
  onToggleLanguageMenu,
  onSelectLanguage,
  onCloseMenu,
}: NavigationProps) {
  const mobileMenuRef = useModalAccessibility(isMenuOpen, onCloseMenu);

  return (
    <>
      <nav
        aria-label="Primary"
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? "bg-white/90 backdrop-blur-md border-b border-stone-200 py-4"
            : "bg-transparent py-8"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="w-10 h-10 bg-clir flex items-center justify-center rounded-sm shadow-sm"
            >
              <BookOpen className="text-white w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="serif text-xl font-semibold tracking-tight leading-none">
                Field Guides
              </span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold">
                A CLIR Publication
              </span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-6 text-sm font-medium text-stone-600">
              <Link to="/" className="hover:text-clir transition-colors">
                Publications
              </Link>
              <span
                aria-disabled="true"
                className="text-stone-400 cursor-not-allowed"
                title="Coming soon"
              >
                About CLIR
              </span>
              <span
                aria-disabled="true"
                className="text-stone-400 cursor-not-allowed"
                title="Coming soon"
              >
                Resources
              </span>
            </div>

            <div className="h-4 w-px bg-stone-200" />

            <button
              onClick={onOpenSearch}
              className="p-2 text-stone-600 hover:text-clir transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <div className="h-4 w-px bg-stone-200" />

            <div className="relative" ref={langDropdownRef}>
              <button
                onClick={onToggleLanguageMenu}
                type="button"
                aria-expanded={isLangOpen}
                aria-haspopup="listbox"
                aria-controls="language-selector"
                className="flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-clir transition-colors px-3 py-2 rounded-lg hover:bg-stone-50"
              >
                <Globe className="w-4 h-4 text-clir" />
                <span>{selectedLang.name}</span>
                <ChevronDown
                  className={`w-3 h-3 transition-transform duration-300 ${
                    isLangOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    id="language-selector"
                    role="listbox"
                    aria-label="Select language"
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-40 bg-white border border-stone-200 rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    <div className="py-1">
                      {languages.map((language) => (
                        <button
                          key={language.code}
                          onClick={() => onSelectLanguage(language)}
                          type="button"
                          role="option"
                          aria-selected={selectedLang.code === language.code}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                            selectedLang.code === language.code
                              ? "bg-clir text-white"
                              : "text-stone-600 hover:bg-stone-50 hover:text-clir"
                          }`}
                        >
                          {language.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onOpenSearch}
              className="p-2 text-stone-600 hover:text-clir transition-colors"
              aria-label="Search"
              type="button"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              className="p-2 text-stone-900"
              onClick={onToggleMenu}
              type="button"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            ref={mobileMenuRef}
            id="mobile-navigation"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-white pt-24 px-6 md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
            tabIndex={-1}
          >
            <div className="flex flex-col gap-8 text-2xl serif">
              <button
                onClick={() => {
                  onOpenSearch();
                  onCloseMenu();
                }}
                className="flex items-center gap-3 text-left hover:text-clir transition-colors"
                type="button"
              >
                <Search className="w-6 h-6" /> Search
              </button>
              <Link to="/" onClick={onCloseMenu}>
                Publications
              </Link>
              <span
                aria-disabled="true"
                className="text-stone-400 cursor-not-allowed"
                title="Coming soon"
              >
                About CLIR
              </span>
              <span
                aria-disabled="true"
                className="text-stone-400 cursor-not-allowed"
                title="Coming soon"
              >
                Resources
              </span>
              <div className="h-px bg-stone-100" />
              <div className="space-y-4">
                <p className="text-sm uppercase tracking-widest text-stone-400 font-bold">
                  Language
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => {
                        onSelectLanguage(language);
                        onCloseMenu();
                      }}
                      type="button"
                      className={`px-4 py-3 rounded-xl text-left text-lg ${
                        selectedLang.code === language.code
                          ? "bg-clir text-white"
                          : "bg-stone-50 text-stone-600"
                      }`}
                    >
                      {language.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
