import { motion } from "motion/react";
import {
  Archive,
  ArrowRight,
  BookOpen,
  Landmark,
  Library,
} from "lucide-react";

import { NewsletterSignup } from "./NewsletterSignup";
import type { GuideCard } from "../data/guidePresentation";

type LandingPageProps = {
  guides: GuideCard[];
  onReadGuide: (slug: string) => void;
};

export function LandingPage({ guides, onReadGuide }: LandingPageProps) {
  const featuredGuide = guides[0];

  if (!featuredGuide) {
    return null;
  }

  return (
    <>
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-clir mb-6 block">
              Council on Library and Information Resources
            </span>
            <h1 className="serif text-5xl md:text-7xl lg:text-[100px] leading-[0.95] tracking-tight mb-12 max-w-5xl">
              Essential Knowledge for{" "}
              <span className="italic text-stone-400">Cultural Stewards.</span>
            </h1>

            <div className="flex flex-col md:flex-row gap-12 items-start md:items-center">
              <p className="text-xl text-stone-600 max-w-xl leading-relaxed">
                Field Guides is a series of practical, multi-lingual
                publications designed to help library, archive, and museum
                professionals navigate the most pressing challenges of the 21st
                century.
              </p>
              <motion.button
                onClick={() => featuredGuide && onReadGuide(featuredGuide.slug)}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="bg-clir text-white px-10 py-5 rounded-full flex items-center gap-3 font-semibold hover:bg-red-900 transition-all shadow-xl shadow-clir/20"
              >
                Explore the Guides <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </motion.div>
        </div>

        <div className="absolute top-0 right-0 w-1/3 h-full bg-clir/5 -z-10 translate-x-1/4 skew-x-[-12deg]" />
      </section>

      <section className="py-24 px-6 border-y border-stone-100">
        <div className="max-w-7xl mx-auto">
          <div className="bg-stone-900 rounded-[48px] overflow-hidden flex flex-col lg:flex-row">
            <div className="p-12 lg:p-24 flex-1 flex flex-col justify-center">
              <span className="text-clir font-bold text-xs uppercase tracking-[0.4em] mb-8 block">
                Featured Publication
              </span>
              <h2 className="serif text-white text-4xl md:text-6xl mb-4 leading-tight">
                {featuredGuide.title}
              </h2>
              <p className="text-clir font-bold text-sm uppercase tracking-[0.2em] mb-8">
                By {featuredGuide.author}
              </p>
              <p className="text-stone-400 text-lg mb-12 max-w-lg leading-relaxed">
                {featuredGuide.featuredBlurb}
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => onReadGuide(featuredGuide.slug)}
                  type="button"
                  className="bg-clir text-white px-8 py-4 rounded-full font-semibold hover:bg-red-900 transition-all"
                >
                  Read the Guide
                </button>
              </div>
            </div>
            <div className="lg:w-2/5 relative min-h-[400px]">
              {featuredGuide.image ? (
                <img
                  src={featuredGuide.image}
                  alt={featuredGuide.title}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover opacity-80"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-stone-700 via-stone-800 to-black" />
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-stone-900 via-transparent to-transparent lg:block hidden" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 bg-stone-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="serif text-4xl md:text-5xl mb-4">The Series</h2>
              <p className="text-stone-500">
                Peer-reviewed, open-access, and ready to implement.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {guides.slice(1).map((guide, index) => (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative bg-white rounded-3xl overflow-hidden border border-stone-100 hover:shadow-2xl transition-all duration-500"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  {guide.image ? (
                    <img
                      src={guide.image}
                      alt={guide.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-stone-100 via-stone-200 to-stone-300" />
                  )}
                </div>
                <div className="p-8">
                  <div
                    className={`w-12 h-12 ${guide.color} ${guide.accent} rounded-2xl flex items-center justify-center mb-6`}
                  >
                    {guide.icon}
                  </div>
                  <h3 className="serif text-2xl mb-3 leading-tight">
                    {guide.title}
                  </h3>
                  <p className="text-stone-600 mb-8 leading-relaxed text-sm">
                    {guide.description}
                  </p>
                  <button
                    onClick={() => onReadGuide(guide.slug)}
                    type="button"
                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-clir group-hover:gap-4 transition-all"
                  >
                    Read Guide <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <div className="relative">
            <div className="aspect-square rounded-[40px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&q=80&w=1000"
                alt="Library architecture"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-12 -right-12 bg-clir text-white p-12 rounded-[32px] hidden md:block max-w-xs shadow-2xl">
              <p className="serif text-2xl italic mb-4">
                "A vital bridge between theory and practice for the modern
                archive."
              </p>
              <p className="text-sm opacity-60 uppercase tracking-widest font-bold">
                Dr. Random Person, CLIR Fellow
              </p>
            </div>
          </div>

          <div>
            <h2 className="serif text-5xl mb-8 leading-tight">
              Designed for the <br />
              Stewards of Memory.
            </h2>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-clir/5 rounded-full flex items-center justify-center">
                  <Library className="w-6 h-6 text-clir" />
                </div>
                <div>
                  <h4 className="font-bold mb-2">Libraries & Universities</h4>
                  <p className="text-stone-600">
                    Resources for academic and public libraries to modernize
                    their digital and physical footprints.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-clir/5 rounded-full flex items-center justify-center">
                  <Archive className="w-6 h-6 text-clir" />
                </div>
                <div>
                  <h4 className="font-bold mb-2">Archives & Records</h4>
                  <p className="text-stone-600">
                    Technical guidance on metadata standards, preservation, and
                    ethical access.
                  </p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-clir/5 rounded-full flex items-center justify-center">
                  <Landmark className="w-6 h-6 text-clir" />
                </div>
                <div>
                  <h4 className="font-bold mb-2">Museums & Galleries</h4>
                  <p className="text-stone-600">
                    Strategies for digital curation and engaging diverse
                    audiences in a global context.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6 bg-clir text-white overflow-hidden relative">
        <NewsletterSignup
          title="Stay informed on the future of cultural heritage."
          description="Newsletter signup is not active yet. Join our professional network and receive our updates when it launches."
        />

        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-white rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] border border-white rounded-full" />
        </div>
      </section>

      <footer className="py-24 px-6 border-t border-stone-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-24">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-clir flex items-center justify-center rounded-sm">
                  <BookOpen className="text-white w-5 h-5" />
                </div>
                <span className="serif text-xl font-semibold tracking-tight">
                  Field Guides
                </span>
              </div>
              <p className="text-stone-500 max-w-sm mb-8">
                A project of the Council on Library and Information Resources
                (CLIR), fostering collaboration and innovation in cultural
                heritage.
              </p>
            </div>

            <div>
              <h5 className="font-bold mb-6 uppercase text-[10px] tracking-[0.3em] text-clir">
                Series
              </h5>
              <ul className="space-y-4 text-stone-600 text-sm">
                <li>
                  <a href="#" className="hover:text-clir transition-colors">
                    Sustainability
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-clir transition-colors">
                    AI Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-clir transition-colors">
                    Open Metadata
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-clir transition-colors">
                    Preservation
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold mb-6 uppercase text-[10px] tracking-[0.3em] text-clir">
                Institutional
              </h5>
              <ul className="space-y-4 text-stone-600 text-sm">
                <li>
                  <a
                    target="_blank"
                    href="https://www.clir.org/about-us/"
                    className="hover:text-clir transition-colors"
                  >
                    About CLIR
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-stone-100 gap-6">
            <p className="text-stone-400 text-xs font-medium">
              © 2026 Council on Library and Information Resources. All rights
              reserved.
            </p>
            <div className="flex gap-8 text-xs font-medium text-stone-400">
              <a href="#" className="hover:text-clir transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-clir transition-colors">
                Accessibility
              </a>
              <a href="#" className="hover:text-clir transition-colors">
                Terms of Use
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
