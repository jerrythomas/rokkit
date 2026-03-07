# Nav Restructure, Playground Grouping & Content Design

**Date:** 2026-03-07
**Status:** Approved

---

## Overview

Complete the learn site nav restructuring, align the playground with the same grouping, add comprehensive e2e coverage, and fill in the missing doc content for components and guide sections.

---

## 1. Cleanup

### 1a. Stage and commit existing changes
- `solution/sites/learn/src/routes/(learn)/docs/components/meta.json` — deleted (was orphaned empty group)
- `solution/sites/learn/src/routes/(learn)/docs/forms/meta.json` — order 6 → 20
- `solution/sites/learn/src/routes/(learn)/docs/charts/meta.json` — order 8 → 21

### 1b. Remove redundant utilities/reveal|shine|tilt files
Each of these directories (`utilities/reveal`, `utilities/shine`, `utilities/tilt`) has:
- `+page.js` — redirect to `/docs/effects/*` (keep)
- `+page.svelte` — old content page (delete)
- `meta.json` — dead nav entry with `category: "utilities"` (delete)

---

## 2. Playground Restructuring

### 2a. Home page (`+page.svelte`)
Replace flat card grid with group-section layout. Each group renders as a labelled section with icon + title header, then a row of component cards beneath it.

Groups and their members (matching docs categories):

| Group | Components |
|-------|-----------|
| Navigation & Selection | list, multi-select, select, drop-down, tabs, toggle, tree, lazy-tree, menu, breadcrumbs, toolbar |
| Inputs | button, calendar, range, rating, stepper, switch, upload-target, upload-progress |
| Display | badge, card, code, forms, item, message, pill, table, timeline |
| Layout | avatar, carousel, divider, floating-action, floating-navigation, grid, palette-manager, progress, stack |

Each card: component icon, name, description, "Open" button that navigates to `/playground/components/<slug>`.

### 2b. Sidebar (`+layout.svelte`)
Replace the single flat "Components" group with collapsible groups matching the same structure above. Hardcoded in layout (no meta.json glob needed for playground). Each group has title + icon matching GROUPS config from `stories.js`.

Group icons (matching GROUPS in stories.js):
- Navigation & Selection: `i-solar:list-check-bold-duotone`
- Inputs: `i-solar:keyboard-bold-duotone`
- Display: `i-solar:gallery-wide-bold-duotone`
- Layout: `i-solar:layers-minimalistic-bold-duotone`

---

## 3. E2e Tests

### 3a. Update `pages.e2e.ts`
- **Add** 7 combined section pages: `/docs/getting-started`, `/docs/data-binding`, `/docs/composability`, `/docs/theming`, `/docs/accessibility`, `/docs/utilities`, `/docs/toolchain`
- **Add** 3 effects pages: `/docs/effects/reveal`, `/docs/effects/shine`, `/docs/effects/tilt`
- **Remove** `/docs/utilities/reveal`, `/docs/utilities/shine`, `/docs/utilities/tilt` (now redirect pages, not canonical)

### 3b. New `playground.e2e.ts`
Tests:
1. Playground home (`/playground`) — loads with grouped sections, each group heading visible
2. All 27 component pages (`/playground/components/<slug>`) — sidebar visible, `[data-playground-content]` area present, no error state

Reuse `checkPage`-style helper pattern from `pages.e2e.ts`.

---

## 4. Missing Content

### 4a. Pure stub component docs (replace "Coming soon" with real content)

Each page gets:
- One-paragraph description
- Props/API reference as a markdown table embedded in prose
- Basic usage example (code snippet via `Code` component)
- Notes on snippet customisation if applicable

Components: `avatar`, `badge`, `data-table`, `divider`, `grid`, `stack`

### 4b. Partial component docs (complete existing stories wiring)

These have `stories.js` but incomplete or broken page content:
- `forms` — page has broken `Code` import, needs proper story wiring
- `multi-select` — has stories.js, page body is minimal
- `select` — has stories.js, page body is minimal
- `tabs` — has stories.js + Preview.svelte, page body is minimal

Each gets the same treatment as well-documented pages (list, tree, menu): intro paragraph, h2 sections for key features, StoryViewer embeds, Code snippets.

### 4c. Guide section stubs

Prose-only pages (no interactive demos):
- `data-binding/overview` — explain field mapping concept, link to sub-pages
- `toolchain/overview` — explain CLI + icon sets, link to sub-pages
- `accessibility/overview` — explain keyboard nav + ARIA approach, link to sub-pages
- `utilities/overview` — explain controller + navigator pattern, link to sub-pages (already exists but "Coming soon")

---

## Success Criteria

- `bun run lint` — 0 errors
- All e2e tests added in 3a and 3b pass
- No "Coming soon" text on the 10 component doc pages listed in 4a/4b
- Guide overview pages have real introductory prose
- Playground home shows grouped sections, sidebar shows collapsible groups
