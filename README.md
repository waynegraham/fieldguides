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

## CI

GitHub Actions runs [`pnpm run check`](./package.json) on pushes to `main` and on pull requests.

## Notes for Contributors

- Prefer adding new publications under `publications/<slug>/` instead of hard-coding content in components.
- Keep serializable content metadata in `src/data/publications.ts`.
- Keep UI decoration and design-specific mapping out of the content loader.
- If you add a new route pattern, update both the route components and the tests in [`src/data/routes.test.ts`](./src/data/routes.test.ts).
