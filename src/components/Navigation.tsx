import { AnimatePresence, motion } from "motion/react";
import { BookOpen, Globe, Menu, Search, X } from "lucide-react";
import { Link } from "react-router-dom";

import type { PublicationLanguage } from "../data/publications";
import { useModalAccessibility } from "./useModalAccessibility";

type NavigationProps = {
  scrolled: boolean;
  isMenuOpen: boolean;
  interfaceLanguage: PublicationLanguage;
  onToggleMenu: () => void;
  onOpenSearch: () => void;
  onCloseMenu: () => void;
};

export function Navigation({
  scrolled,
  isMenuOpen,
  interfaceLanguage,
  onToggleMenu,
  onOpenSearch,
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

            <div
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-stone-600"
              aria-label={`Interface language: ${interfaceLanguage.name}`}
            >
              <Globe className="w-4 h-4 text-clir" />
              <span>Interface: {interfaceLanguage.name}</span>
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
                  Interface language
                </p>
                <div className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3 text-lg text-stone-600">
                  <Globe className="h-5 w-5 text-clir" />
                  {interfaceLanguage.name}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
