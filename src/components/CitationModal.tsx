import { AnimatePresence, motion } from "motion/react";
import { Check, Copy, Quote, X } from "lucide-react";
import { useId } from "react";

import { useModalAccessibility } from "./useModalAccessibility";

type CitationModalProps = {
  isOpen: boolean;
  citeFormat: string;
  copied: boolean;
  citation: string;
  onClose: () => void;
  onSelectFormat: (format: string) => void;
  onCopy: () => void;
};

const CITATION_FORMATS = ["Chicago", "MLA", "Harvard", "Vancouver"];

export function CitationModal({
  isOpen,
  citeFormat,
  copied,
  citation,
  onClose,
  onSelectFormat,
  onCopy,
}: CitationModalProps) {
  const titleId = useId();
  const previewId = useId();
  const dialogRef = useModalAccessibility(isOpen, onClose);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/60 backdrop-blur-sm"
          />
          <motion.div
            ref={dialogRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={previewId}
            tabIndex={-1}
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div
                    aria-hidden="true"
                    className="w-8 h-8 bg-clir/10 flex items-center justify-center rounded-lg"
                  >
                    <Quote className="w-4 h-4 text-clir" />
                  </div>
                  <h3 id={titleId} className="serif text-2xl font-semibold">
                    Cite this Guide
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  type="button"
                  className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400"
                  aria-label="Close citation dialog"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-3 block">
                    Citation Format
                  </label>
                  <div
                    className="grid grid-cols-2 gap-2"
                    role="radiogroup"
                    aria-label="Citation format"
                  >
                    {CITATION_FORMATS.map((format) => (
                      <button
                        key={format}
                        onClick={() => onSelectFormat(format)}
                        type="button"
                        role="radio"
                        aria-checked={citeFormat === format}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          citeFormat === format
                            ? "bg-clir text-white shadow-lg shadow-clir/20"
                            : "bg-stone-50 text-stone-600 hover:bg-stone-100"
                        }`}
                      >
                        {format}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-3 block">
                    Preview
                  </label>
                  <div
                    id={previewId}
                    className="p-6 bg-stone-50 rounded-2xl border border-stone-100 relative group"
                  >
                    <p className="text-sm text-stone-700 leading-relaxed pr-8">
                      {citation}
                    </p>
                  </div>
                </div>

                <button
                  onClick={onCopy}
                  type="button"
                  className="w-full bg-stone-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-stone-800 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 text-emerald-400" />
                      Copied to Clipboard
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5" />
                      Copy Citation
                    </>
                  )}
                </button>
                <p aria-live="polite" className="sr-only">
                  {copied ? "Citation copied to clipboard." : ""}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
