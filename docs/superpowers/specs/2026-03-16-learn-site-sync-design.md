# Learn Site Sync Design

> Audit and fix learn site pages to be consistent with the `docs/llms/` documentation,
> and add new reference-style utility pages for each non-UI Rokkit package.
> Updated: 2026-03-16

---

## Background

The `docs/llms/*.txt` files are the source of truth for API accuracy. During the LLMs content
expansion work, several inconsistencies were found between the learn site and llms docs. This
spec covers two sub-projects:

1. **Targeted fixes** — correct errors and fill placeholders in existing pages
2. **New utility reference pages** — add Style A (reference-only, no demos) pages for all
   non-UI packages, under the `utilities/` section

The learn site and llms docs serve different audiences: the site is human-readable with more
context; llms docs are compact and API-focused. They must be **consistent** (no contradictions)
but need not be identical.

---

## Sub-project 1: Targeted Fixes

### Fix 1: `data-palette` → `data-style` in theming pages

**Files:**

- `site/src/routes/(learn)/docs/theming/overview/+page.svelte` — line 9
- `site/src/routes/(learn)/docs/theming/+page.svelte` — line 24
- `site/src/routes/(learn)/docs/utilities/controllers/+page.svelte` — NestedController doesn't exist

**Issues:**

- Both theming pages show `<html data-palette="rokkit" ...>` — wrong. `"rokkit"` is a style name,
  not a palette. Correct attribute: `data-style="rokkit"`.
- `data-palette` is a valid attribute but for color variant names (e.g., `data-palette="blue"`),
  not for selecting the visual style personality.

**Correct data attributes:**
| Attribute | Values | Purpose |
|-----------|--------|---------|
| `data-style` | `rokkit`, `minimal`, `material` | Visual personality |
| `data-mode` | `light`, `dark` | Light/dark mode |
| `data-palette` | color variant name | Color skin override |

### Fix 2: Expand `theming/overview`

The current `theming/overview/+page.svelte` is 14 lines and barely more than a stub. Expand it
to be a real overview that covers:

- The `data-*` attribute system (all four: `data-style`, `data-mode`, `data-palette`, `data-density`)
- UnoCSS utility class guidance — the primary authoring model; don't use inline CSS variables
- Brief z-scale token reference (already in `theming/+page.svelte` but overview should link/intro it)

### Fix 3: `getting-started/installation` — add CLI setup path

The current installation page covers only the manual approach. Add a CLI-first section at the top:

```
npx @rokkit/cli@latest init
```

CLI path should be presented as the **recommended** approach. Keep the existing manual install
as an alternative.

**New section to add:**

- "CLI Setup" (before "Installation") — `npx @rokkit/cli@latest init` with brief description of
  what it does (interactive prompts, writes 4 files: `rokkit.config.js`, `uno.config.js`,
  `src/app.css`, `src/app.html`)

### Fix 4: `toolchain/cli` — fill "Coming soon"

Replace the placeholder with full CLI reference content based on `docs/llms/cli.txt`:

- `rokkit init` — interactive setup; list key prompt categories; list files written
- `rokkit doctor` — 4 checks table; `--fix` flag; which checks are auto-fixable; manual fix for
  `uno-uses-preset`
- Icon tools — `rokkit bundle`, `rokkit build` (brief)

### Fix 5: `docs/llms/components/select.txt` — fix `options` → `items`

The llms doc uses `options` as the Select component's prop name throughout. The actual component
prop is `items`. The learn site is correct. Fix all occurrences in `docs/llms/components/select.txt`.

### Fix 6: `utilities/controllers` — remove NestedController reference

`utilities/controllers/+page.svelte` lists `NestedController` as an available controller.
This class does not exist in `@rokkit/states` exports. The tree navigation controller is handled
by `@rokkit/actions` (the `navigator` action with `nested: true`), not a separate state class.
Update the controllers page to remove `NestedController` and reflect the actual controller exports:
`ListController`, `TableController`.

---

## Sub-project 2: New Utility Reference Pages

### Pattern

Each new page follows the same structure as `utilities/state-management/+page.svelte`:

- `article[data-article-root]` wrapper
- Intro paragraph with lead text styling (`text-surface-z6 mb-8 text-[1.0625rem] leading-7`)
- `h2` section headings
- `Code` component from `$lib/components/Story` for code examples
- Code examples in `snippets/` folder, imported with `?raw`
- Related section at the end

Each page requires:

- `meta.json` with `category: "utilities"` and an assigned order
- `+page.svelte` with the article content
- `snippets/` folder with code examples as separate files

### Pages to Create

| Folder               | Package           | Order | Key Content                                                   |
| -------------------- | ----------------- | ----- | ------------------------------------------------------------- |
| `utilities/actions/` | `@rokkit/actions` | 7     | All actions; navigable detail (keyup, events); usage examples |
| `utilities/states/`  | `@rokkit/states`  | 8     | ProxyItem, ListController, TableController, vibe, Wrapper     |
| `utilities/core/`    | `@rokkit/core`    | 9     | FieldMapper, theme utils, string utils                        |
| `utilities/data/`    | `@rokkit/data`    | 10    | Dataset pipeline, filter, formatter, hierarchy                |
| `utilities/unocss/`  | `@rokkit/unocss`  | 11    | presetRokkit setup; what it adds; options                     |
| `utilities/app/`     | `@rokkit/app`     | 12    | ThemeSwitcherToggle, TableOfContents + rescan()               |

### Content Source

Each page's content is sourced from the corresponding `docs/llms/packages/*.txt` file, adapted
for the learn site audience (more prose, less terse). No interactive demos — Style A only.

### Navigation

New pages automatically appear in the sidebar via the `meta.json` glob system. No manual nav
registration required. Order 7–12 places them after existing utilities (overview=1, controllers=2,
navigator=3, custom-primitives=4, state-management=5, icons=6).

---

## File Inventory

### Modified files

- `site/src/routes/(learn)/docs/theming/overview/+page.svelte`
- `site/src/routes/(learn)/docs/theming/+page.svelte`
- `site/src/routes/(learn)/docs/utilities/controllers/+page.svelte`
- `site/src/routes/(learn)/docs/getting-started/installation/+page.svelte`
- `site/src/routes/(learn)/docs/getting-started/snippets/` — add new snippet files
- `site/src/routes/(learn)/docs/toolchain/cli/+page.svelte`
- `site/src/routes/(learn)/docs/toolchain/cli/snippets/` — create with content
- `docs/llms/components/select.txt`

### Created files (×6 packages, each with meta.json + +page.svelte + snippets/)

- `site/src/routes/(learn)/docs/utilities/actions/`
- `site/src/routes/(learn)/docs/utilities/states/`
- `site/src/routes/(learn)/docs/utilities/core/`
- `site/src/routes/(learn)/docs/utilities/data/`
- `site/src/routes/(learn)/docs/utilities/unocss/`
- `site/src/routes/(learn)/docs/utilities/app/`

---

## Non-Goals

- Style B (full learn pages with interactive demos) — marked as future work in gap analysis
- `@rokkit/chart` and `@rokkit/icons` llms package docs — separate work item
- Learn page content extraction into llms docs — separate work item
- Density, Whitelabeling, Quick Start pages — "Coming soon" stubs, future work
