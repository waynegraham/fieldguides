# Google Docs authoring workflow

This workflow lets authors work in Google Docs while keeping the application’s
existing `index.json` and MDX files as its publishing format.

## Recommended workflow

1. An editor creates a guide from a shared Google Docs template.
2. Authors draft and review the guide in Google Docs.
3. The editor marks the document as ready and runs a manual **Import Google
   Doc** GitHub Action.
4. The importer reads the document, converts its content, validates the result,
   and opens or updates a pull request.
5. An editor reviews the file diff and the deployment preview.
6. Merging the pull request publishes the guide through the existing deployment
   workflow.

Google Docs is the editorial source during drafting. The repository remains the
published source of record. Authors must not edit a guide in both places at the
same time because the next import replaces generated content.

## Document structure

Use one Google Doc for each guide. Use the first tab for publication metadata
and one additional tab for each section. Tab order determines section order.

### Publication tab

Start the first tab with a two-column table. Use these exact field names in the
left column:

| Field              | Required | Example                                               |
| ------------------ | -------- | ----------------------------------------------------- |
| `Slug`             | Yes      | `community-archives`                                  |
| `Title`            | Yes      | `A Field Guide to Community Archives`                 |
| `Description`      | Yes      | `Practical guidance for...`                           |
| `Author`           | Yes      | `A. N. Author`                                        |
| `Publisher`        | Yes      | `Council on Library and Information Resources`        |
| `Copyright`        | Yes      | `© 2026 Council on Library and Information Resources` |
| `Publication date` | Yes      | `September 2026`                                      |
| `License`          | Yes      | `Published under CC BY-NC-SA 4.0`                     |
| `Featured blurb`   | No       | `A practical introduction to...`                      |
| `Cover image URL`  | No       | `https://...`                                         |
| `Icon`             | No       | `book-open`                                           |

The importer validates the slug and refuses to write outside
`publications/<slug>/`. Supported icons are `archive`, `book-open`, `cpu`,
`database`, `globe`, and `leaf`.

### Section tabs

Name each section tab with its stable identifier and title:

```text
introduction | Introduction
planning-your-project | Planning Your Project
```

The text before `|` becomes the section ID and filename. It must use lowercase
letters, numbers, and hyphens. The text after `|` becomes the reader-facing
title. Renaming an ID creates a new file and should be treated as a URL change.

Authors can use these Google Docs features:

- Normal text for paragraphs.
- Heading 2 and Heading 3 for section headings. The tab title supplies Heading
  1, so authors should not add Heading 1 in a section tab.
- Bold, italic, links, numbered lists, and bulleted lists.
- Inline images with alt text.
- Tables when the information is genuinely tabular.
- A paragraph starting with `Pull quote:` for a pull quote. The importer removes
  the prefix and writes a `GuidePullQuote` MDX component.

The first importer version should reject or warn about comments, unresolved
suggestions, drawings, equations, footnotes, nested tables, and other features
that do not have an agreed MDX representation.

## Import behavior

The importer should:

1. Accept a Google Doc URL or document ID and an optional target branch.
2. Fetch the document with the Google Docs API using
   `includeTabsContent=true` to identify tab boundaries and validate structure.
3. Download Google's Markdown export as the primary conversion input.
4. Parse and validate the publication table and section tab names, then convert
   the supported Markdown to MDX.
5. Download inline images into `publications/<slug>/assets/`, create stable
   filenames, and emit relative image references.
6. Write `publications/<slug>/index.json` and one `<section-id>.mdx` file per
   section.
7. Run `pnpm run format`, `pnpm run validate:content`, and `pnpm run build`.
8. Stop without committing if conversion or validation fails.
9. Open or update a pull request labeled `content-import` and include warnings
   in its description.

Generated files should include the source document ID and imported revision in
machine-readable metadata. The importer should compare that revision on later
runs and exit without changes when the document has not changed.

## Example document assessment

The initial test document is [The CLIR Guide to Field Guides](https://docs.google.com/document/d/1wBLJO6dUMkQRxCdV9DCJKJyCqFA4B1wbniVMRPrV8Zc/edit).
Its public HTML export confirms that the importer must handle more than plain
prose:

- Document tabs and subtabs define the intended section hierarchy.
- Styled title paragraphs appear more than once for some sections, so visible
  headings are not reliable section boundaries.
- Tables are used for both tabular information and visual callouts.
- The document contains ordered and unordered lists, external and email links,
  an inline image, and a comment.
- The image does not currently have alt text and should produce an import
  warning.
- Manual `Next section >>` and `<< Back to Beginning` text is presentation-only
  navigation and should not appear in MDX.

The public Markdown export is the preferred paragraph-level conversion input.
For this document it preserves headings, emphasis, links, lists, tables, and the
embedded image more cleanly than HTML. It still flattens the document, repeats
some visible section titles, converts visual layout into Markdown tables, and
embeds the image as a large base64 data URI. The importer must extract such
images into `publications/<slug>/assets/` before writing MDX.

The production importer should combine Markdown export with the Google Docs API
using `includeTabsContent=true`. Use the API for tab boundaries, hierarchy,
comments, suggestions, and structural validation; use Markdown as the content
conversion layer. HTML export can remain a diagnostic fallback.

For this example, the first conversion pass should classify each table as one
of these types:

- A data table, converted to Markdown or an MDX table component.
- A callout, converted to an agreed callout component.
- A layout table, flattened to its meaningful content with an import warning.

Do not infer table type from color or other visual styling alone. Add an
explicit authoring marker or named convention before automating that decision.

## Authentication and permissions

For a team-owned workflow, use a Google Cloud service account that can only read
the shared authoring folder. Share that folder with the service account and keep
its credential in GitHub Actions secrets. If organizational policy prevents
service-account access, use OAuth with an editor-owned integration account and
the narrowest read-only scopes.

The importer needs read access to the Google Doc and its embedded image data. It
does not need permission to edit documents. Never commit OAuth tokens, service
account keys, or downloaded credentials.

## Editorial states

Use a visible `Status` field in the publication table if the team wants the
importer to enforce editorial state:

- `Draft`: authors can make unrestricted changes; import is blocked.
- `Ready for import`: the GitHub Action can import the document.
- `In review`: an import pull request is open; new changes require another sync.
- `Published`: the last imported revision has been merged.

The initial version can keep status changes manual. A later Google Docs add-on
could show validation errors and trigger an import without requiring authors to
use GitHub.

## Rollout plan

### Phase 1: Prove the conversion

- Create the Google Docs template.
- Build a local `pnpm import:google-doc -- <document-url>` command.
- Support headings, paragraphs, links, emphasis, lists, pull quotes, and images.
- Test against a copy of one existing guide.

### Phase 2: Add editorial automation

- Add a manually triggered GitHub Action.
- Store credentials in GitHub Actions secrets.
- Open or update an import pull request and attach validation warnings.
- Require a deployment preview and editorial approval before merge.

### Phase 3: Improve author feedback

- Add a dry-run report that links errors to document tabs and text.
- Detect unresolved suggestions and comments.
- Add a Google Docs sidebar or add-on only if authors need one-click imports.
- Add Drive change notifications only if manual imports become a bottleneck.

## Decisions to make before implementation

- Choose the shared Drive or folder that owns source documents.
- Confirm whether one document with tabs or one document per section better fits
  the editorial team. Tabs are the default recommendation.
- Decide which Google Docs features must survive the first import.
- Decide whether images must be copied into the repository or may remain hosted
  elsewhere. Repository copies are the default recommendation.
- Choose service-account or user OAuth authentication based on Google Workspace
  policy.
