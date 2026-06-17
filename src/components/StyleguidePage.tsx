import StyleguideContent from "../content/styleguide.mdx";
import { guideMdxComponents } from "./mdx/mdxComponentMap";

export function StyleguidePage() {
  return (
    <main className="min-h-screen bg-[var(--bg-paper)] text-[var(--ink-primary)]">
      <div className="max-w-5xl mx-auto px-6 py-20 md:py-28">
        <div className="mb-16 max-w-3xl">
          <span className="text-clir font-bold text-xs uppercase tracking-[0.4em] mb-5 block">
            Root Page
          </span>
          <h1 className="serif text-5xl md:text-7xl leading-[0.95] tracking-tight text-stone-900 mb-6">
            Styleguide
          </h1>
          <p className="text-lg md:text-xl text-stone-600 leading-relaxed">
            A standalone reference for the site&apos;s markdown styles and MDX
            components. This page lives at <code>/styleguide</code> and is not
            attached to any publication.
          </p>
        </div>

        <article className="guide-markdown max-w-3xl">
          <StyleguideContent components={guideMdxComponents} />
        </article>
      </div>
    </main>
  );
}
