import { AnimatePresence, motion } from "motion/react";
import { AlignLeft, Monitor, Moon, Settings, Sun, X } from "lucide-react";
import { useId } from "react";

import { useModalAccessibility } from "./useModalAccessibility";

type ThemeOption = "light" | "dark" | "system";
type ReaderFontSize = "small" | "medium" | "large";
type ReaderLineHeight = "tight" | "normal" | "relaxed";

type SettingsModalProps = {
  isOpen: boolean;
  theme: ThemeOption;
  readerFontSize: ReaderFontSize;
  readerLineHeight: ReaderLineHeight;
  onClose: () => void;
  onThemeChange: (theme: ThemeOption) => void;
  onFontSizeChange: (fontSize: ReaderFontSize) => void;
  onLineHeightChange: (lineHeight: ReaderLineHeight) => void;
};

const APPEARANCE_OPTIONS = [
  { id: "light" as const, icon: <Sun className="w-4 h-4" />, label: "Light" },
  { id: "dark" as const, icon: <Moon className="w-4 h-4" />, label: "Dark" },
  {
    id: "system" as const,
    icon: <Monitor className="w-4 h-4" />,
    label: "Auto",
  },
];

const TEXT_SIZE_OPTIONS = [
  { id: "small" as const, label: "A", className: "text-sm" },
  { id: "medium" as const, label: "A", className: "text-base" },
  { id: "large" as const, label: "A", className: "text-lg" },
];

const LINE_HEIGHT_OPTIONS = [
  { id: "tight" as const, icon: <AlignLeft className="w-4 h-4" /> },
  { id: "normal" as const, icon: <AlignLeft className="w-5 h-5" /> },
  { id: "relaxed" as const, icon: <AlignLeft className="w-6 h-6" /> },
];

export function SettingsModal({
  isOpen,
  theme,
  readerFontSize,
  readerLineHeight,
  onClose,
  onThemeChange,
  onFontSizeChange,
  onLineHeightChange,
}: SettingsModalProps) {
  const titleId = useId();
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
            className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-[32px] shadow-2xl overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div
                    aria-hidden="true"
                    className="w-8 h-8 bg-clir/10 flex items-center justify-center rounded-lg"
                  >
                    <Settings className="w-4 h-4 text-clir" />
                  </div>
                  <h3
                    id={titleId}
                    className="serif text-2xl font-semibold dark:text-white"
                  >
                    Reading Preferences
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  type="button"
                  className="p-2 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors text-stone-400"
                  aria-label="Close reading preferences"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-8">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-4 block">
                    Appearance
                  </label>
                  <div
                    className="grid grid-cols-3 gap-2"
                    role="radiogroup"
                    aria-label="Appearance"
                  >
                    {APPEARANCE_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => onThemeChange(option.id)}
                        type="button"
                        role="radio"
                        aria-checked={theme === option.id}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all border ${
                          theme === option.id
                            ? "bg-clir border-clir text-white shadow-lg shadow-clir/20"
                            : "bg-stone-50 dark:bg-stone-800 border-stone-100 dark:border-stone-700 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700"
                        }`}
                      >
                        {option.icon}
                        <span className="text-xs font-medium">
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-4 block">
                    Text Size
                  </label>
                  <div
                    className="flex items-center gap-2 p-1 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-100 dark:border-stone-700"
                    role="radiogroup"
                    aria-label="Text size"
                  >
                    {TEXT_SIZE_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => onFontSizeChange(option.id)}
                        type="button"
                        role="radio"
                        aria-checked={readerFontSize === option.id}
                        aria-label={`${option.id} text size`}
                        className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center ${
                          readerFontSize === option.id
                            ? "bg-white dark:bg-stone-700 text-clir shadow-sm"
                            : "text-stone-400 hover:text-stone-600"
                        }`}
                      >
                        <span className={`${option.className} font-bold`}>
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-4 block">
                    Line Spacing
                  </label>
                  <div
                    className="flex items-center gap-2 p-1 bg-stone-50 dark:bg-stone-800 rounded-2xl border border-stone-100 dark:border-stone-700"
                    role="radiogroup"
                    aria-label="Line spacing"
                  >
                    {LINE_HEIGHT_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => onLineHeightChange(option.id)}
                        type="button"
                        role="radio"
                        aria-checked={readerLineHeight === option.id}
                        aria-label={`${option.id} line spacing`}
                        className={`flex-1 py-3 rounded-xl transition-all flex items-center justify-center ${
                          readerLineHeight === option.id
                            ? "bg-white dark:bg-stone-700 text-clir shadow-sm"
                            : "text-stone-400 hover:text-stone-600"
                        }`}
                      >
                        {option.icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
