# Editorial submission and Zenodo workflow

This document recommends a submission, review, publication, and preservation
workflow for CLIR Field Guides. It separates the experience of authors, who
work in Google Docs, from the technical publishing work performed by CLIR
staff and automation.

## Recommendation

Use a CLIR-owned Google Docs template as the authoring source until a guide is
approved. Import an approved revision into a pull request, review a private
website preview, and merge that pull request to publish the website. After the
website deployment succeeds, create an immutable release package and deposit
that package in Zenodo as a new version.

Authors should not need GitHub accounts, edit MDX, name files, enter command
line options, or operate Zenodo.

The repository is the source for the published website. Zenodo is the archive
of citable releases. Google Docs is the editorial source during drafting, but
it is not the archive or the published source of record.

## Responsibilities

| Role              | Responsibilities                                                                                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Authors           | Draft in the template, provide required metadata and permissions, resolve comments and suggestions, review the website proof, and participate in post-publication revisions for one year.  |
| CLIR editor       | Commission the guide, create and own the source document, manage editorial status, approve exceptions, accept the manuscript, review the import report and preview, and authorize release. |
| Copyeditor        | Apply CLIR and Chicago style, check citations and references, and flag accessibility, permissions, privacy, and legal concerns.                                                            |
| Production editor | Run the import, resolve conversion warnings, check the pull request and preview, prepare accessible release files, and verify the Zenodo record.                                           |
| Automation        | Validate the document, convert supported content, open or update a pull request, build the website preview, create release artifacts, deposit a Zenodo draft, and record identifiers.      |

One named CLIR editor should be accountable for moving each guide between
states. Authors can see the state, but they do not need to operate the state
machine.

## Editorial states

Use these exact values in the template's `Status` field:

1. `Proposal`: CLIR and the authors are defining scope, audience, contributors,
   outline, schedule, and risks.
2. `Draft`: Authors are writing. Import is allowed only as a nonpublishing
   preview.
3. `Editorial review`: CLIR is reviewing the substance. Authors may revise the
   document.
4. `Copyedit`: The text is stable enough for style and citation review.
5. `Ready for production`: Suggestions are accepted or rejected, blocking
   comments are resolved, and the CLIR editor has accepted the manuscript.
6. `Proof review`: A pull request and website preview exist. Text changes return
   to the Google Doc and require another import.
7. `Approved for release`: The CLIR editor and authors have approved the proof.
8. `Published`: The website release and Zenodo version are public.
9. `Revision in progress`: A post-publication revision is being prepared.
10. `Archived`: The one-year active revision period is complete. CLIR can still
    correct serious errors or preservation problems.

Automation must never publish solely because an author changes `Status`.
Publishing requires approval through the protected GitHub environment or an
equivalent staff-only control.

## Author workflow

### Start the guide

The CLIR editor makes a copy of the template in a CLIR-owned Shared Drive and
grants the author group edit access. The editor completes fields that authors
should not decide alone, including the stable slug, license, publisher,
commissioning editor, and schedule.

Before drafting, the editor and authors agree on:

- the primary audience and what readers should be able to do after reading;
- the topic boundary and important exclusions;
- a target of 5,000–10,000 words, including whether references and captions
  count toward that target;
- the planned sections and contributor responsibilities;
- how community feedback will be collected and evaluated during the one-year
  revision period;
- whether any content presents privacy, safety, legal, cultural, or reputational
  risks; and
- who owns each image, table, dataset, worksheet, or other supplemental item.

### Draft in Google Docs

Use one document for each guide:

- Keep publication metadata in the first tab.
- Use one top-level tab for each website section.
- Use subtabs only to help authors navigate a long section. Subtabs do not
  automatically become separate website pages unless the template says so.
- Use the tab title for the page title. Begin content with Heading 2; do not add
  Heading 1 inside a section tab.
- Use built-in paragraph, heading, list, link, and table styles. Do not simulate
  structure with font size, bold text, spaces, or blank lines.
- Add alt text, a caption, a credit, a rights statement, and a source file for
  every meaningful image. Mark decorative images as decorative.
- Use tables only for row-and-column data. Use an explicit `Callout:` or
  `Pull quote:` paragraph for callouts; do not use a one-cell table for visual
  layout.
- Put citations in author-date form and include a matching full entry in
  `References`. Separate cited works from optional recommended reading.
- Do not add manual `Next section` or `Back` links. The website supplies
  navigation.
- Resolve all suggestions before production. Resolve comments or mark each
  remaining comment `NONBLOCKING:` with the editor's approval.

Authors should review content in Google Docs, not edit files generated in the
pull request. If a production-only correction must be made in the repository,
record it in an import-exceptions file so that the next import does not silently
remove it.

### Submit for production

The author changes nothing in GitHub. The CLIR editor checks the readiness
checklist and changes the status to `Ready for production`. A staff-only action
then imports the document.

The authors receive a preview link and a short proof checklist. They review:

- title, names, affiliations, and contributor order;
- headings, lists, links, notes, citations, and references;
- image choice, crop, caption, credit, and alt text;
- tables on a narrow screen;
- downloadable files and worksheets;
- citation text, license, copyright, and preferred citation; and
- content omitted, duplicated, or moved during conversion.

Authors send corrections in the Google Doc. The production editor reimports
the document and sends a new preview. The CLIR editor records final approval.

## Required template fields

Use plain-language labels in Google Docs. Store machine names in the importer,
not in author instructions.

| Field                             | Who supplies it    | Guidance                                                                                                                                                    |
| --------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Status                            | CLIR editor        | Use one of the controlled editorial states.                                                                                                                 |
| Title and subtitle                | Authors and editor | Supply the title exactly as it should appear and be cited.                                                                                                  |
| Short description                 | Authors            | Write 1–2 sentences for search results, sharing, and repository metadata. Do not use placeholder text.                                                      |
| Authors                           | Authors and editor | Enter one person per row in publication order: family name, given name, affiliation, and ORCID when available. Distinguish authors from other contributors. |
| Contributors                      | Editor             | Record editors, illustrators, data curators, translators, and other roles using a controlled role list.                                                     |
| Primary audience                  | Authors            | Name roles and organizational contexts, not only a broad sector.                                                                                            |
| Reader outcomes                   | Authors            | List 2–5 things readers should understand, decide, or do.                                                                                                   |
| Keywords                          | Authors and editor | Supply 5–10 specific terms for discovery.                                                                                                                   |
| Language                          | Editor             | Use a language name and code, such as `English (en)`.                                                                                                       |
| License                           | CLIR editor        | State separately what license covers the text, code, data, and third-party media. Do not assume the guide's license covers reused images.                   |
| Copyright holder                  | CLIR editor        | Name the legal rights holder; do not use a copyright notice as a substitute for the license.                                                                |
| Expected publication date         | Editor             | Treat this as provisional until release. Automation records the actual date.                                                                                |
| Contact                           | Editor             | Use a durable CLIR role address, not a personal address, for reader feedback.                                                                               |
| Funding and acknowledgments       | Authors and editor | Record funders, grant identifiers, and required acknowledgment language.                                                                                    |
| Related works                     | Authors and editor | Record DOIs or stable URLs for related reports, datasets, software, or earlier editions.                                                                    |
| Accessibility and permissions log | Authors and editor | Track media source files, alt text, credits, licenses, permissions, and any accessibility exception.                                                        |

The stable slug, source document ID, imported revision, Git commit, release tag,
publication URL, Zenodo record ID, version DOI, and concept DOI are system
fields. Automation should populate them; writers should not type them.

## Readiness checklist

Block production when any of these checks fail:

- Required metadata is missing or still contains template text.
- A section tab has no stable ID or title, or two IDs are the same.
- Suggestions remain unresolved.
- A comment is unresolved and is not explicitly approved as nonblocking.
- An image lacks alt text or a decorative designation.
- An image, dataset, or substantial quotation lacks a rights determination.
- A link is malformed or points to an author-only resource.
- A citation has no reference, or a reference is never cited, unless it is
  explicitly listed as recommended reading.
- Personal or sensitive information has not received documented editorial
  review.
- A table is being used only for layout, or a complex table has no accessible
  alternative.
- The document contains unsupported drawings, equations, embedded objects,
  nested tables, or other content with no approved conversion rule.

Warnings may allow a preview, but the CLIR editor must resolve or explicitly
waive each warning before release. Store waivers with the release record.

## Production workflow

1. **Validate the source.** Read the document with the Google Docs API using
   tab content. Check metadata, tab IDs, suggestions, comments, images,
   unsupported features, and editorial status.
2. **Convert without publishing.** Use the Markdown export for paragraph-level
   formatting and the Docs API for structure. Download images to the guide's
   asset directory. Produce a machine-readable import report.
3. **Open or update one pull request.** Key the branch to the source document
   ID. Record the source revision and refuse to overwrite hand edits unless an
   exception is declared.
4. **Run quality checks.** Format files; validate metadata and content; build
   the site; check internal links, external links, headings, image dimensions,
   alt text, and accessibility; and verify downloadable artifacts.
5. **Create a preview.** Give authors a stable preview URL and keep it private
   if the manuscript is not ready for public distribution.
6. **Approve the proof.** Require named editorial and production approvals.
   Record the approved Google revision and Git commit.
7. **Merge and deploy.** Deploy the immutable commit. Run a smoke test against
   the public URL before announcing publication.
8. **Package the release.** Create a versioned ZIP of the source content and
   assets, plus a standalone accessible PDF when production quality is
   sufficient. Include `CITATION.cff`, `metadata.json`, `LICENSE`, and a plain
   text README. Generate checksums.
9. **Create the Zenodo draft.** Upload the exact release artifacts and metadata.
   Verify the draft manually for the first several guides.
10. **Publish the Zenodo version.** Publish only after the website smoke test
    passes. Write the record ID, version DOI, concept DOI, release tag, and
    public URL back to publication metadata.
11. **Announce the release.** Use the concept DOI as the durable general
    citation link and expose the version DOI when a reader needs to cite the
    exact version.

If Zenodo is unavailable, publish the website only when CLIR has defined a
documented recovery procedure. Queue the deposit and do not claim that a DOI
exists until Zenodo has published the record.

## Zenodo integration

### Recommended model

Create one Zenodo concept record for each Field Guide. Deposit each public
release as a new version under that concept. Do not create a new unrelated
record for routine revisions.

Use semantic release labels that readers can understand, such as `1.0`, `1.1`,
and `2.0`:

- Increment the patch component for corrections that do not change meaning.
- Increment the minor component for added examples, links, or guidance that
  preserves the guide's scope.
- Increment the major component for substantial changes to conclusions,
  structure, scope, or authorship.

Every release remains available. Never replace a published Zenodo version with
new files. Explain material changes in both a changelog and the Zenodo version
description.

### Deposit sequence

Use the Zenodo sandbox before production. It uses separate accounts and tokens
and issues test identifiers with the `10.5072` prefix. Sandbox records may be
removed, so never treat them as preservation copies.

For the first release:

1. Create a draft deposition with `POST /api/deposit/depositions` and request a
   reserved DOI with `prereserve_doi`.
2. Save the returned deposition ID and draft URL as deployment state. A
   reserved DOI is not a published DOI.
3. Upload each artifact with `PUT {links.bucket}/{filename}`.
4. Update metadata with `PUT /api/deposit/depositions/{id}`.
5. Compare uploaded filenames and checksums with the release manifest.
6. Have the production editor inspect the Zenodo draft.
7. Publish with
   `POST /api/deposit/depositions/{id}/actions/publish`.
8. Read the published response and store both the version-specific DOI and the
   concept DOI.

For later releases, call
`POST /api/deposit/depositions/{latest-id}/actions/newversion`, follow the
returned `latest_draft` link, replace inherited files as needed, update
metadata, verify, and publish. Zenodo permits only one unpublished new version
at a time.

Zenodo's current deposition API documentation is available in the
[Zenodo developer documentation](https://developers.zenodo.org/). The API
token belongs in a protected GitHub environment secret. Give the workflow only
the permissions it needs, never print the token, and require staff approval for
the production publishing job.

### Author metadata guidelines

Collect metadata in a structured table in the first Google Docs tab or in a
linked form. Do not ask authors to compose Zenodo JSON. Use one row per person
and preserve the approved order because Zenodo displays creators in that order.

For every author, collect:

- **Given name and family name:** Keep these in separate fields. Ask how the
  name should appear publicly, including initials, punctuation, diacritics, and
  compound family names. Automation can create Zenodo's `Family, Given` value.
- **ORCID:** Strongly recommend an authenticated ORCID iD, such as
  `0000-0002-1825-0097`, but do not require an author to create one as a
  condition of publication. Accept the full `https://orcid.org/...` URL or the
  16-character identifier, normalize it, validate its checksum, and ask the
  author to confirm that the ORCID record belongs to them. The identifier is
  **ORCID**, not “ORCHID.”
- **Affiliation:** Record the organization associated with this work, using the
  organization's official public name. Allow `Independent researcher`,
  `Independent practitioner`, or no affiliation when appropriate. Do not infer
  an affiliation from an email domain. If an author's affiliation changes
  after the work was completed, record the work affiliation and optionally a
  clearly labeled current affiliation or note.
- **Authorship order:** Require the author group and CLIR editor to approve the
  order before proof review. Do not alphabetize automatically.
- **Email:** Collect a contact email only when editorial operations require it.
  Do not send personal email addresses to Zenodo or expose them on the website
  without explicit consent. Prefer a durable CLIR role address for public
  correspondence.
- **Name approval:** Show the exact public name, affiliation, and ORCID in the
  proof checklist. Authors should approve this metadata with the publication
  proof.

Distinguish authors from contributors. List a person as a creator only when the
editorial policy credits them as an author of the guide. Record copyeditors,
commissioning editors, illustrators, translators, data curators, project
managers, and technical staff as contributors with an accurate
Zenodo-supported role. Do not promote someone to author merely because the
system requires at least one creator. Document CLIR's authorship and
contributor-credit policy, including how disputes and changes are resolved.

For the guide as a whole, collect or assign:

- **Title and subtitle:** Use the approved wording and capitalization. Do not
  add a release number to the title unless it is part of the public title.
- **Description:** Provide a stand-alone abstract of about 100–250 words that
  explains the subject, audience, purpose, and practical value. It must not
  depend on website navigation or promotional language for meaning.
- **Publication type:** Classify the deposit as a publication and choose the
  most specific supported subtype during implementation testing. Store the
  chosen controlled value in canonical metadata rather than asking writers to
  know Zenodo terminology.
- **Publication date:** Populate this from the actual public release, in ISO
  `YYYY-MM-DD` form for deposit metadata. Do not use the draft completion or
  contract date.
- **Version:** Assign a visible release value such as `1.0`. Use the same value
  in the website metadata, release package, Git tag, changelog, and Zenodo
  record.
- **Language:** Record the primary language with a standard language code. If
  translations are separate publications, relate their records explicitly and
  identify the language of each version.
- **Keywords:** Supply 5–10 specific phrases. Include the subject, relevant
  professional domain, intended practice or method, and important technology
  or population names. Avoid repeating the title as a single keyword and avoid
  unexplained internal abbreviations.
- **License and access:** Default to open access when CLIR policy permits. Use a
  recognized license identifier that matches the license statement inside the
  files. Document exceptions for third-party images, data, or code. An embargo
  requires an embargo date; restricted access requires access conditions.
- **Funding:** Record the funder's official name, award or grant number, and
  required acknowledgment. The production editor maps supported grants to
  Zenodo identifiers and retains unsupported funding in acknowledgments or
  notes.
- **Related works:** Prefer persistent identifiers such as DOI, ISBN, Handle,
  or archival identifier. Record what each item is and how it relates to the
  guide—for example, a prior edition, translation, supporting dataset,
  software, or report. The production editor selects the matching Zenodo
  relationship vocabulary; authors describe the relationship in plain
  language.
- **References:** Keep full references in the guide. Add them to Zenodo only if
  CLIR wants repository-level reference discovery and can generate them from a
  single canonical bibliography rather than maintaining a second manual list.
- **Community:** If CLIR creates a Zenodo community, treat submission to it as
  an editorial setting. Authors should not need to know or enter its internal
  identifier.
- **Notes:** Reserve this for release-specific preservation or accessibility
  information. Do not use it as a catch-all for missing structured metadata.

Before publishing the Zenodo draft, the production editor should compare a
human-readable metadata proof against the title page, preferred citation,
website, release files, and Zenodo record. Block publication when creator
order, ORCID, title, date, version, license, or related identifiers disagree.

### Zenodo metadata mapping

| Zenodo value        | Source                                                                                                                             |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Title               | Approved guide title and subtitle                                                                                                  |
| Creators            | Structured author rows, including ORCID and affiliation where available                                                            |
| Contributors        | Structured contributor rows with roles                                                                                             |
| Description         | Approved short description; optionally add the table of contents and version note                                                  |
| Publication date    | Actual public release date                                                                                                         |
| Resource type       | Publication; select the most specific supported subtype during implementation testing                                              |
| Version             | Release label such as `1.0`                                                                                                        |
| License             | A Zenodo-recognized license identifier that matches the release files                                                              |
| Keywords            | Approved controlled and free-text terms                                                                                            |
| Language            | Template language code                                                                                                             |
| Related identifiers | Public website URL, GitHub release URL, related datasets or software, and other persistent identifiers with explicit relationships |
| Communities         | CLIR's Zenodo community, if CLIR establishes one and its curation process                                                          |
| Grants              | Valid supported grant identifiers when applicable                                                                                  |
| Notes               | Accessibility exceptions, preservation notes, or other release-specific information                                                |

Do not use the repository's current free-text `author` and `license` fields as
the only Zenodo source. Zenodo needs structured people, identifiers, and a
recognized license value. Extend publication metadata before automating
deposits.

### GitHub integration or direct API

Zenodo can archive GitHub releases and read custom metadata from a repository
root `.zenodo.json` file. That is useful for archiving the entire software
repository, but it is a poor default when one repository contains multiple
independently versioned Field Guides. Repository-level metadata cannot cleanly
describe a different creator list, title, license, and concept DOI for every
guide.

Use a direct Zenodo API workflow for per-guide releases. If CLIR later moves
each guide to its own repository, reevaluate the native GitHub integration.
Keep any `.zenodo.json` generation release-specific and validate it against the
same canonical metadata; do not maintain two hand-edited metadata sources.

### Safe automation

- Use a unique release key such as `<guide-slug>@<version>` and store the
  Zenodo deposition ID. On retry, update that draft instead of creating another
  record.
- Split `prepare draft` and `publish record` into separate jobs. Only the
  publish job requires staff approval.
- Confirm that the Git commit and artifact checksums match the approved release
  before publishing.
- Stop when a published record already exists for the same release key but its
  checksums differ. Require human investigation.
- Preserve API responses and the final metadata JSON as release artifacts, but
  remove credentials and private URLs.
- Treat publication as irreversible. Test failure paths in the sandbox,
  including retries after each API operation.

## Revisions and community feedback

The guide promises that authors will respond to community input for one year,
but it does not yet define how that works. Add a durable feedback form or role
email to every guide and publish a short moderation and privacy notice.

CLIR should triage feedback into:

- factual or typographic correction;
- broken or outdated resource;
- accessibility problem;
- proposed clarification or new example;
- substantive disagreement;
- safety, privacy, rights, or legal concern; or
- out of scope.

Record the disposition and response owner. For urgent harmful or legally risky
content, allow an editor to add a visible notice or temporarily withdraw the
website while preserving the existing archival record and an audit trail.
Bundle routine accepted changes into planned releases instead of changing the
public text continuously without a version boundary.

At the end of the year, publish a final planned revision or a statement that no
revision was needed. Change the status to `Archived`, retain the feedback
channel for serious corrections, and keep all earlier versions citable.

## Clarifications needed in the guide for writers

Revise _The CLIR Guide to Field Guides_ before using it as an author manual:

- Replace the unfinished `Formatting Conventions` placeholder with the rules
  in the author workflow above.
- State whether the 5,000–10,000-word target includes references, captions,
  worksheets, and author biographies.
- Reconcile “commissioned by invitation” with language addressed to
  “interested authors.” Explain whether unsolicited ideas are accepted and how
  they are evaluated.
- Define “collaboratively authored.” State the minimum expected author group
  and how contributor roles and author order are decided.
- Explain what “not exhaustively peer reviewed” means. Name the actual review
  stages, reviewers, criteria, conflicts policy, and approval authority.
- Define the one-year revision commitment: expected cadence, feedback channel,
  response standard, decision authority, versioning, and what happens when an
  author becomes unavailable.
- Replace “if possible” for offline or print access with a testable publishing
  commitment or remove it.
- Define “high-resolution” images with accepted formats, minimum dimensions,
  color and contrast expectations, maximum file size, alt text, captions,
  credits, permissions, and treatment of charts.
- Clarify when links may appear outside the references section. Practical
  guides often need links next to the action they support.
- Define how authors identify data tables, callouts, pull quotes, examples,
  warnings, worksheets, code, and mathematical notation.
- Specify citation and reference examples, DOI formatting, web citations,
  access dates, software and dataset citations, and how recommended resources
  differ from cited sources.
- State which license CLIR normally uses and explain exceptions. The current
  guide says `CC BY-NC-SA 4.0`; confirm that this is policy and explain whether
  it covers downloads, code, data, and third-party material.
- Add accessibility, inclusive language, privacy, permissions, research ethics,
  conflicts of interest, generative artificial intelligence, and fact-checking
  requirements or link to controlling policies.
- Replace “Authors can choose to make a copy of this document” with a link to a
  controlled template. CLIR staff should create the official working copy so
  ownership and permissions are consistent.
- State what subtabs do. The proposed production design treats top-level tabs
  as website pages; subtabs require an explicit flattening or page rule.
- Add concrete acceptance criteria to every milestone and name the responsible
  person. Distinguish manuscript approval, design approval, release approval,
  and post-release revision.
- Expand `Contact` to include a durable address and instructions for proposals,
  production questions, accessibility reports, and post-publication feedback.
- Remove draft dates and empty headings from the published guide, or display a
  clear draft banner if it is intentionally public.

## Current implementation gap

The existing importer is a useful conversion prototype, not yet the workflow
described in `docs/google-docs-authoring-workflow.md`.

It currently:

- downloads Google's flattened Markdown export;
- splits sections at level-one headings rather than Google Docs tab IDs;
- accepts publication metadata through command-line options rather than parsing
  the proposed metadata table;
- extracts embedded base64 images and warns about missing alt text;
- warns about Markdown tables and removes manual navigation text; and
- writes files locally after an explicit `--write` option.

It does not yet:

- call the Google Docs API with tab content;
- preserve stable tab IDs or a section hierarchy;
- inspect comments, suggestions, revision IDs, permissions, or unsupported
  Google Docs objects;
- parse the documented publication table or editorial status;
- create an import report that can be approved or waived;
- open a pull request, create a preview, or enforce approvals;
- protect repository-only corrections from a later forced import;
- remove obsolete generated section or asset files safely;
- generate release packages or structured citation metadata; or
- create, update, verify, or publish Zenodo records.

Until these capabilities exist, CLIR staff should describe the process as a
staff-assisted conversion. Do not tell writers that tab-aware automated
submission is available.

## Implementation order

1. Finalize policy choices and revise the author guide.
2. Create and user-test the Google Docs template with two non-technical authors.
3. Define one canonical, structured publication metadata schema that supports
   the website, citations, release packages, and Zenodo.
4. Upgrade the importer to use the Docs API for tabs, stable IDs, revision
   checks, comments, suggestions, and validation.
5. Add pull-request creation, preview deployment, validation reports, and
   approval controls.
6. Add accessible release artifact generation and verification.
7. Build and test idempotent Zenodo deposits in the sandbox.
8. Pilot one guide end to end with manual approval at every boundary.
9. Automate the proven steps while retaining staff approval for public release
   and Zenodo publication.
10. Review metrics after two or three guides: author support time, conversion
    warnings, proof cycles, accessibility defects, deposit failures, and time
    from accepted manuscript to release.
