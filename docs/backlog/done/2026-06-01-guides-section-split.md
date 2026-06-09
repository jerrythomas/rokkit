# Split guides into their own `/guides` section + migrate prose-doc storage to `.md`

**Date:** 2026-06-01
**Status:** Shipped (2026-06-01) — see `agents/journal.md`
**Parent:** Koan / Learn app information architecture

## Summary

Two related changes that are easier to land together than apart:

1. **Information architecture**: the eleven `guide-*` entries currently live inside the `/app` chat-shell catalog alongside interactive demos. They are pure prose with no `<Demo />`, but the chat-shell still wraps them in canvas chrome that includes a non-existent Live/Code view, a composer pill, and a conversation list — none of which help a reader of long-form documentation. Move them into a dedicated `/guides` section with its own layout. Remove them from the chat-shell catalog so `/app` is purely interactive demos.
2. **Storage format**: all prose docs — both the 11 guide bodies and the 48 per-component `docs.ts` files used by the `/app` Docs tab — currently live in TypeScript template literals (`` export const xDocs = `...` ``). Every code sample with a backtick or `${...}` needs hand-escaping (300+ escapes across 59 files), there's no markdown syntax highlighting or preview, and non-developers can't edit them. Convert all 59 files to plain `.md` loaded via Vite's `?raw` import suffix.

## Motivation

- The `Live` and `Code` segmented-control views on a guide page show a missing component (no `<Demo />` registered), confusing readers.
- The chat composer / conversation list visible alongside guides suggests interactivity that does not exist for prose pages.
- The doc content currently visible in the canvas duplicates what the markdown body already says.
- Guides are a different reading modality (linear, indexable, search-by-keyword) than demos (interactive, sandboxed, ask-Koan). Forcing them into the same shell hurts both.

## Approach

### URL layout

- New top-level group `/guides` with its own `+layout.svelte` (no chat-shell).
- Sub-routes: `/guides/getting-started`, `/guides/data-binding`, … (drop the `guide-` prefix — the URL namespace covers it).
- One guide per route, single scrolled page. Section TOC anchors come "for free" from markdown headings later if we want them.

### Layout

- Top-bar: brand mark on the left, search input centered, link back to `/app` on the right.
- Body: two columns — 240px left TOC rail (list of guide titles grouped by category) + flex content area with `max-width: 760px` (re-use `GuidePage.svelte` styling).
- No composer, no conversation list, no Live/Code/Docs segmented control.

### Scroll behaviour (load-bearing — prior layouts have shipped without it)

- Root layout uses a deterministic flex column: `body > main { height: 100dvh; display: flex; flex-direction: column; min-height: 0 }`.
- Top-bar is `flex: 0 0 auto`.
- The two-column body region is `flex: 1 1 auto; min-height: 0; overflow: hidden; display: grid; grid-template-columns: 240px 1fr`.
- The left TOC rail is independently scrollable: `overflow-y: auto; min-height: 0`.
- The content column is independently scrollable: `overflow-y: auto; min-height: 0`.
- Every flex/grid ancestor on the path to the scroll container must have `min-height: 0` (or `min-block-size: 0`) — without it, the flex item refuses to shrink below content height and the scroll silently disappears. This is the bug class we have hit before.
- Manual verification on a small viewport (e.g. 1024×600) with the longest guide content is part of acceptance.

### Content source — markdown files, not TS template literals

- Current state: markdown bodies live in `src/lib/koan/demos/guide-*/content.ts` as `` export const guideContent = `…` `` template literals. Every file has 22–41 backslash escapes for backticks and `${...}` in code samples — painful to edit, no syntax highlighting in IDEs.
- New layout: plain `.md` files at `src/lib/guides/<slug>/content.md`. No escapes, full editor support, easier diffs, can be opened by non-developers.
- Loaded via Vite's built-in `?raw` query suffix — zero plugin or runtime dependency:
  ```ts
  // src/lib/guides/index.ts
  const rawContents = import.meta.glob('./*/content.md', {
    query: '?raw',
    import: 'default',
    eager: true
  }) as Record<string, string>

  // Hand-ordered manifest so categories and sort order are explicit, not folder-name-derived.
  export const guides = [
    { slug: 'getting-started', title: 'Getting Started', description: '…', category: 'basics' },
    { slug: 'data-binding', title: 'Data Binding', description: '…', category: 'basics' },
    // …eleven entries total
  ].map((g) => ({ ...g, content: rawContents[`./${g.slug}/content.md`] }))
  ```
- This single `guides` array drives the left TOC, search index, route resolution, and the index page listing.
- Each `/guides/<slug>/+page.svelte` is one line: `<GuidePage markdown={guide.content} />`. The renderer component moves from `src/lib/koan/components/GuidePage.svelte` to `src/lib/guides/GuidePage.svelte` since it is no longer koan-scoped.
- **Migration mechanics**: for each `guide-*/content.ts`, strip the `export const guideContent = \`` prefix and trailing backtick, then unescape `` \` `` → `` ` `` and `\${` → `${`. A short throwaway node script handles this so we don't hand-edit 300 escapes.

### Per-component docs migration (chat-shell side)

Same storage-format change applied to the 48 `src/lib/koan/demos/<component>/docs.ts` files that feed the existing `/app` "Docs" tab:

- Pattern in all 48 files is identical: `export const <name>Docs = \`...markdown...\``. No imports, no logic. 6–30 backslash-escapes each.
- Convert each `docs.ts` to a sibling `docs.md` (same converter script as the guides — strip TS scaffolding, unescape).
- In each `meta.ts`, swap the import:
  ```ts
  // before
  import { tableDocs } from './docs'
  // …
  docs: tableDocs

  // after
  import docs from './docs.md?raw'
  // …
  docs
  ```
- Delete each `docs.ts` after the `.md` sibling is in place and the meta.ts swap is verified.
- The chat-shell layout (`src/routes/app/+layout.svelte`) needs **no** changes — `findById(...)?.docs` still resolves to a `string`. The `Live | Code | API | Docs` segmented control in that layout is already conditional (Docs tab only renders when `demoDocs` is truthy), so per-component docs continue to surface correctly.
- Note: the broken Live/Code views on the guide pages disappear because the guides leave the chat-shell entirely, not because we touch the segmented-control logic.

### Search

- Reuse `minisearch` (already a dependency).
- Index `title + description + content` per guide.
- Top-bar input opens a dropdown with matched titles + short snippet. Selecting a result navigates to `/guides/<slug>`.

### Chat-shell cleanup

- Remove the 11 `guide-*` imports + entries from `src/lib/koan/catalog.ts`.
- Remove `guide-*` literals from the `ShellDemoType` union in `src/lib/koan/shell.svelte.ts`.
- Delete `src/routes/app/guide-*/` route folders (11 of them).
- Add a catch-all redirect `src/routes/app/guide-[slug]/+page.ts` that 301s to `/guides/<slug>` so existing inbound links keep working.

### Discoverability back to Koan

- Footer on each guide page: a single "Have a follow-up? Ask Koan →" link to `/app?q=<primary-keyword>` so a reader who wants interactivity gets routed back to chat-shell with the query primed. Primary keyword comes from the existing `meta.keywords[0]`.

## Out of scope

- Multi-page guides / nested sub-pages.
- Tagging or filter UI beyond search.
- Per-guide comments, ratings, or "was this helpful" feedback.
- Auto-generated in-page TOC sidebar (h2 anchors). Easy follow-up if desired.
- Adding new guide content.

## Files to touch

### Create

- `src/routes/guides/+layout.svelte` — top-bar + TOC rail + slot.
- `src/routes/guides/+page.svelte` — index page listing all guides by category.
- `src/routes/guides/[slug]/+page.svelte` — guide renderer (one-liner using `GuidePage`).
- `src/routes/guides/[slug]/+page.ts` — load function that resolves `slug` → guide content; 404 on miss.
- `src/lib/guides/index.ts` — exported `guides` array (uses `import.meta.glob('./*/content.md', { query: '?raw', import: 'default', eager: true })`) + helpers (`findGuide`, search index builder).
- `src/lib/guides/GuidePage.svelte` — moved from `src/lib/koan/components/GuidePage.svelte`.
- `src/lib/guides/<slug>/content.md` × 11 — plain markdown files, converted from the `.ts` template-literal exports (no escapes).
- `src/routes/app/guide-[slug]/+page.ts` — redirect to `/guides/<slug>`.

### Modify

- `src/lib/koan/catalog.ts` — remove guide imports + entries from catalog array and intent map.
- `src/lib/koan/shell.svelte.ts` — remove `guide-*` literals from `ShellDemoType`.
- `src/lib/koan/match.svelte.ts` (if it references guides directly) — drop guide intent routes.
- `src/lib/koan/demos/<component>/meta.ts` × 48 — swap `import { xDocs } from './docs'` → `import docs from './docs.md?raw'` and update the `docs:` field in the exported meta.

### Delete

- `src/lib/koan/demos/guide-*/` — eleven folders. The `meta.ts` and `index.svelte` files are no longer needed because guides bypass the demo registry.
- `src/routes/app/guide-*/` — eleven folders (replaced by single redirect route).
- `src/lib/koan/components/GuidePage.svelte` — moved, not deleted in-place.
- `src/lib/koan/demos/<component>/docs.ts` × 48 — replaced by sibling `docs.md`.

### Create alongside (per-component)

- `src/lib/koan/demos/<component>/docs.md` × 48 — markdown bodies, converted from the `.ts` exports (no escapes).

## Acceptance

- Navigating to `/guides` shows a list of all eleven guides.
- Navigating to `/guides/accessibility` renders the accessibility guide with no chat chrome and no broken Live/Code tabs.
- Top-bar search filters guides as the user types.
- Visiting an old `/app/guide-accessibility` URL redirects to `/guides/accessibility`.
- `/app` no longer surfaces guides in suggestions, catalog browser, or intent matching.
- All existing demos under `/app` continue to render correctly.
- `bun run build` from `apps/learn` completes with no new warnings.
- `bun run lint` reports 0 errors.
- `bun run test:ci` from repo root passes.
- On a 1024×600 viewport, the longest guide is fully scrollable to the end — both the content column and the left TOC rail scroll independently without the page itself scrolling.
- The `/app` Docs tab on at least three representative components (e.g. `table`, `form`, `chart`) renders byte-identical markdown output to the pre-migration version. Spot-check via a brief manual diff of the rendered HTML in the browser.
- No `docs.ts` files remain under `src/lib/koan/demos/*/`.
- No guide `content.ts` files remain under `src/lib/koan/demos/guide-*/` (folder removed entirely).

## Risks / open questions

- **Inbound links from external content** (llms.txt, README badges, social) — the `/app/guide-*` → `/guides/*` redirect handles SvelteKit-internal links but external links rely on the same redirect. Verify `docs/llms/` doesn't hardcode guide paths.
- **Search index size** — eleven guides at a few KB each is negligible, but if guide content grows we may want to split the index into per-category chunks. Not a current concern.
- **Theming** — the `/guides` layout should inherit the same theme system (`@rokkit/themes` + UnoCSS preset). Re-use existing tokens; no new design tokens.
