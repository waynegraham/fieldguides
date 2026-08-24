# Field Guides

Field Guides is a Vite + React + MDX application for publishing long-form CLIR guides. The site has two main surfaces:

- A landing page that presents the guide series.
- A reader experience that renders publication sections from MDX content.

## Stack

- React 19
- Vite 6
- React Router
- Tailwind CSS 4
- MDX
- TypeScript

## Getting Started

### Prerequisites

- Node.js 22 or newer
- pnpm 10

### Install

```bash
pnpm install
```

### Start the app

```bash
pnpm run dev
```

The Vite dev server is configured to listen on `0.0.0.0`.

## Project Structure

```text
src/
  components/            UI components for landing, reader, navigation, and modals
  content/               Standalone MDX content not attached to a publication
  data/
    publications.ts      Content loading and normalized publication metadata
    guidePresentation.tsx UI-only decoration for guide cards
    routes.ts            Pure route helpers used by the app and tests
publications/
  <slug>/
    index.json           Publication manifest and metadata
    *.mdx                Section content
scripts/
  validate-content.mjs   Repository content validation script
.github/workflows/
  ci.yml                 CI workflow
```

## Content Architecture

Each publication lives under `publications/<slug>/`.

`index.json` is the manifest for a guide. It defines the publication-level metadata and the ordered section list. Each section entry must map to an `.mdx` file in the same directory.

The app separates concerns in the data layer:

- [`src/data/publications.ts`](./src/data/publications.ts) loads and normalizes content metadata and MDX modules.
- [`src/data/guidePresentation.tsx`](./src/data/guidePresentation.tsx) applies UI-only presentation details such as icons and card colors.
- [`scripts/validate-content.mjs`](./scripts/validate-content.mjs) validates the publication manifests and section files in CI and local checks.

## Routing

The app uses route components with React Router.

- `/` renders the landing page.
- `/styleguide` renders the standalone styleguide page.
- `/publications/:slug` redirects into the reader for that publication.
- `/publications/:slug/sections/:pageId` renders a specific publication section.

Pure route helpers live in [`src/data/routes.ts`](./src/data/routes.ts) and are covered by unit tests.

## Quality Checks

### Lint

```bash
pnpm run lint
```

Runs ESLint with a flat config.

### Typecheck

```bash
pnpm run typecheck
```

Runs `tsc --noEmit`.

### Unit tests

```bash
pnpm run test
```

Runs Vitest in `jsdom`.

### Content validation

```bash
pnpm run validate:content
```

Checks publication JSON shape, required metadata, duplicate section IDs, and missing section files.

Before release, run the stricter production content gate:

```bash
pnpm run validate:production
```

This also rejects editorial placeholders, empty sections, malformed or insecure
links, missing local assets, unsafe section slugs, and unreferenced MDX files.

### Import a Google Doc

Preview an import from a shared Google Doc:

```bash
pnpm import:google-doc -- "https://docs.google.com/document/d/DOCUMENT_ID/edit"
```

The command uses Google's Markdown export and performs a dry run by default.
Review the proposed sections and warnings, then add `--write` and publication
metadata options to create files. Run `pnpm import:google-doc -- --help` for all
options. Existing publications require the explicit `--force` option.

### Formatting

```bash
pnpm run format
pnpm run format:check
```

Formats or verifies formatting with Prettier.

### Full repository check

```bash
pnpm run check
```

Runs linting, typechecking, tests, content validation, and formatting checks.

## CI and deployment

GitHub Actions runs [`pnpm run check`](./package.json) for pull requests into
`main` and pushes to `main`. After checks pass on a `main` push or a manual run
from `main`, the workflow builds and deploys the site to GitHub Pages, then
smoke-tests the site root and a publication deep link.

The production build also generates route-specific HTML metadata, structured
data, `sitemap.xml`, and `robots.txt`. Update the canonical site URL and
publisher details in [`metadata.json`](./metadata.json) if the deployment
domain changes.

## Notes for Contributors

- Prefer adding new publications under `publications/<slug>/` instead of hard-coding content in components.
- Keep serializable content metadata in `src/data/publications.ts`.
- Keep UI decoration and design-specific mapping out of the content loader.
- If you add a new route pattern, update both the route components and the tests in [`src/data/routes.test.ts`](./src/data/routes.test.ts).
- See [`docs/google-docs-authoring-workflow.md`](./docs/google-docs-authoring-workflow.md) for the proposed Google Docs editorial and import workflow.
- See [`docs/editorial-submission-and-zenodo-workflow.md`](./docs/editorial-submission-and-zenodo-workflow.md) for the recommended author submission, release, revision, and Zenodo preservation workflow.
