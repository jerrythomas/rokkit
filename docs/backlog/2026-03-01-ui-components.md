# Backlog: UI Components

Priority 2 — Component enhancements and new features for `@rokkit/ui`.

---

## 64. Component Labels — Translatable Strings via MessagesStore

**Problem:** UI components contain hardcoded English strings for aria-labels, button labels, and state text. Data-driven label text is fine when items carry `label`/`text` fields, but control-level and container-level strings are baked into component source, making i18n impossible without forking.

**Existing foundation:** `messages` singleton in `@rokkit/states` already exports a `MessagesStore` with `.set(custom)` / `.current` / `.reset()` pattern. Currently has 6 keys (`emptyList`, `loading`, etc.) but is not yet wired to any component.

**Design — nested label map keyed by component + semantic role:**

```js
// packages/states/src/messages.svelte.js  (extend defaultMessages)
const defaultMessages = {
  // existing
  emptyList: 'No items found',
  emptyTree: 'No data available',
  loading: 'Loading...',
  noResults: 'No results found',
  select: 'Select an option',
  search: 'Search...',
  // new — component label strings
  list:         { label: 'List' },
  tree:         { label: 'Tree', expand: 'Expand', collapse: 'Collapse', loading: 'Loading', loadMore: 'Load More' },
  toolbar:      { label: 'Toolbar' },
  menu:         { label: 'Menu' },
  toggle:       { label: 'Selection' },
  rating:       { label: 'Rating' },
  stepper:      { label: 'Progress' },
  breadcrumbs:  { label: 'Breadcrumb' },
  carousel:     { label: 'Carousel', prev: 'Previous slide', next: 'Next slide', slides: 'Slide navigation' },
  tabs:         { add: 'Add tab', remove: 'Remove tab' },
  code:         { copy: 'Copy code', copied: 'Copied!' },
  range:        { lower: 'Lower bound', upper: 'Upper bound', value: 'Value' },
  search_:      { clear: 'Clear search' },       // SearchFilter
  filter:       { remove: 'Remove filter' },
  floatingNav:  { pin: 'Pin navigation', unpin: 'Unpin navigation' },
  mode:         { system: 'System', light: 'Light', dark: 'Dark' }  // ThemeSwitcher
}
```

**Two-level override model (same as icons pattern):**

1. **App-global** — call `messages.set({ tree: { expand: 'Ouvrir', collapse: 'Fermer' } })` once at app startup.
2. **Per-instance** — each component that needs it accepts a `labels` prop (shallow-merged over `messages.current.<component>`).

```svelte
<!-- App startup — translate once -->
<script>
  import { messages } from '@rokkit/states'
  messages.set({ tree: { expand: 'Ouvrir', collapse: 'Fermer' } })
</script>

<!-- Per-instance override (optional) -->
<Tree labels={{ expand: 'Expand node', collapse: 'Collapse node' }} />
```

**Components to update (hardcoded aria-labels found in audit):**

| Component | Hardcoded strings | Key path |
|-----------|------------------|----------|
| `List` | `aria-label="List"` | `messages.current.list.label` |
| `Tree` | `aria-label="Tree"`, `'Loading'`, `'Expand'`, `'Collapse'` | `messages.current.tree.*` |
| `Toolbar` | `aria-label="Toolbar"` | `messages.current.toolbar.label` |
| `Menu` | `aria-label="Menu"` | `messages.current.menu.label` |
| `Toggle` | `aria-label="Selection"` | `messages.current.toggle.label` |
| `Rating` | `aria-label="Rating"` | `messages.current.rating.label` |
| `Stepper` | `aria-label="Progress"` | `messages.current.stepper.label` |
| `BreadCrumbs` | `aria-label="Breadcrumb"` | `messages.current.breadcrumbs.label` |
| `Carousel` | `"Carousel"`, `"Previous slide"`, `"Next slide"`, `"Slide navigation"` | `messages.current.carousel.*` |
| `Tabs` | `"Add tab"`, `"Remove tab"` | `messages.current.tabs.*` |
| `Code` | `"Copy code"`, `"Copied!"` | `messages.current.code.*` |
| `Range` | `"Lower bound"`, `"Upper bound"`, `"Value"` | `messages.current.range.*` |
| `SearchFilter` | `"Clear search"`, `"Remove filter"` | `messages.current.search_.clear` / `filter.remove` |
| `FloatingNavigation` | `"Pin navigation"`, `"Unpin navigation"` | `messages.current.floatingNav.*` |
| `ThemeSwitcherToggle` | `'System'`, `'Light'`, `'Dark'` in `buildThemeSwitcherOptions()` | `messages.current.mode.*` |

**MessagesStore changes needed:**
- Add all component label keys to `defaultMessages` (English)
- Update `Messages` type definition to include them
- `set()` should deep-merge (nested objects), not shallow-merge, so partial locale overrides work

**Files:**
- `packages/states/src/messages.svelte.js` — extend `defaultMessages`, add deep-merge to `set()`
- `packages/states/src/types.js` (or inline JSDoc) — extend `Messages` type
- All components listed above — replace hardcoded strings with `messages.current.<key>`
- `packages/app/src/types/theme-switcher.ts` — `buildThemeSwitcherOptions()` to use `messages.current.mode`

**Priority:** Medium — accessibility impact (screen readers get English regardless of user locale).

---

## 63. Semantic Icons — Fix Hardcoded Icon Strings in Components — DONE

7 components migrated to icons prop pattern with DEFAULT_STATE_ICONS defaults. 6 new SVGs + icon names added. Remaining: Carousel (chevron-left/right) and Tabs (plus) still have i-lucide: strings. Plan: `docs/plans/2026-03-02-semantic-icons.md`.

---

## 62. ThemeSwitcherToggle — Mode Icons and `includeSystem` Flag

**Package:** `@rokkit/app`

**Current state:**
- `modes` defaults to `['system', 'light', 'dark']` — developer must pass a custom array to exclude system mode
- `system` icon is hardcoded as `'i-lucide:monitor'` directly in `defaultThemeSwitcherIcons`
- `light` and `dark` icons come from `defaultStateIcons.mode` (which uses `mode-dark` / `mode-light` from `defaultIcons` in `@rokkit/core`)
- No consistent pattern for the system icon — it's an inline lucide ref, not an overridable `mode-*` entry

**What's needed:**

1. ~~**Add `mode-system` to `defaultIcons`**~~ DONE
   - `packages/icons/src/base/mode-system.svg` added, icons package rebuilt
   - `'mode-system'` added to `defaultIcons` in `packages/core/src/constants.js`
   - `defaultThemeSwitcherIcons.system` now reads `defaultStateIcons.mode.system` (no more hardcoded `i-lucide:monitor`)
   - `packages/core/spec/constants.spec.js` updated

2. **Add `includeSystem` prop** to `ThemeSwitcherToggleProps`
   - `includeSystem?: boolean` — default `true`
   - When `false`, filters out `system` from the rendered options
   - Simpler than requiring the developer to pass `modes={['light', 'dark']}`
   - `modes` prop stays for full control (order, custom subsets); `includeSystem` is the common-case shortcut

3. **Document icon customisation** in the component JSDoc / design doc
   - Default icons use the `mode-*` icon set (overridable via UnoCSS shortcuts)
   - Developer can override per mode via `icons={{ system: '...', light: '...', dark: '...' }}`

**Remaining files:**
- `packages/app/src/types/theme-switcher.ts` — add `includeSystem` prop
- `packages/app/src/components/ThemeSwitcherToggle.svelte` — consume `includeSystem` prop
- `packages/app/spec/` — add tests for `includeSystem` behaviour

**Priority:** Low — cosmetic / DX improvement, no functional regression.

---

## 3. ItemProxy + Proxy → ProxyItem Unification — DONE

ProxyItem is now the single proxy abstraction. ItemProxy deleted, legacy Proxy deleted, 8 components migrated, fields getter added. Plan: `docs/plans/2026-03-01-proxy-unification.md`.

---

## 46. Learn Site — Story Audit & Update

**Problem:** Some learn site stories still reference deprecated components or are missing.

**Remaining phases:**
- Tree story (deferred)
- Effects stories: Tilt, Shine
- Input stories: Calendar, Range (when components exist)
- Table story (when #47 phases complete)
- Playground integration into learn site

---

## 47. Table — Phases 2-4

**Source:** `docs/requirements/004-table.md`, `docs/design/004-table.md`

**Phase 1 done** (2026-02-23): Core flat table + SearchFilter + sort + selection.

**Remaining phases:**
- [ ] Phase 2: Hierarchy (path-based + multi-column grouping, `groupToHierarchy()`)
- [ ] Phase 3: Pagination (client-side + lazy loading)
- [ ] Phase 4: Polish (sub-component split, named column snippets, accessibility audit, docs)

---

## 49. Documentation Gaps — Requirements & Design Docs

**Problem:** Several implemented components lack requirements and/or design docs.

**What's needed:**
- [ ] Add Rating to `050-feedback.md` (or create dedicated doc)
- [ ] Add Code to requirements (new file or extend existing)
- [ ] Create design docs for components that only have requirements
- [ ] Range requirements (now implemented)

**Priority:** Low — documentation catch-up, not blocking implementation.

---

## 73. Upload Components — UploadTarget, Grid, UploadProgress

**Requirements:** `docs/requirements/012-upload.md`
**Design:** `docs/design/012-upload.md`

**Goal:** File upload UI — drop zone target, general-purpose grid component, and upload progress viewer composing List/Tree/Grid with file-status semantics. Consumer owns upload logic.

**Implementation steps:**

1. **Grid component** — new reusable tile grid in `@rokkit/ui`
   - `Grid.svelte` — Wrapper + horizontal Navigator + CSS Grid (`auto-fill, minmax`)
   - Props: `items`, `fields`, `value` (bindable), `onselect`, `minSize`, `gap`, `disabled`, `class`
   - Snippet: `itemContent(proxy)`, default uses `ItemContent`
   - Data attrs: `data-grid`, `data-grid-item`, `data-active`, `data-path`
   - Base layout CSS: `packages/themes/src/base/grid.css`
   - Theme CSS: `packages/themes/src/rokkit/grid.css`
   - Unit tests

2. **upload-utils.js** — shared utilities
   - `matchesAccept(file, accept)` — MIME/extension validation
   - `validateFile(file, { accept, maxSize })` — returns `{valid, reason}`
   - `inferIcon(mimeType)` — MIME → lucide icon mapping
   - `formatSize(bytes)` — human-readable file sizes
   - `groupByPath(files, pathField)` — flat files → nested tree structure
   - Unit tests

3. **UploadTarget** — drop zone component
   - `UploadTarget.svelte` — drag-and-drop + hidden file input + validation
   - Props: `accept`, `maxSize`, `multiple`, `disabled`, `onfiles`, `onerror`, `class`
   - Snippet: `content(dragging)`
   - Data attrs: `data-upload-target`, `data-upload-button`, `data-dragging`, `data-disabled`
   - Base layout CSS + theme CSS
   - Unit tests

4. **UploadProgress** — file status viewer
   - `UploadProgress.svelte` — composes List, Tree, Grid + built-in view Toggle
   - Props: `files`, `fields`, `view` (bindable), `oncancel`, `onremove`, `onretry`, `onclear`, `showActions`, `class`
   - Upload field mapping extending BASE_FIELDS (label→name, status, progress, size, path, type, error)
   - Per-view snippets: `listItem`, `treeItem`, `treeGroup`, `gridItem`, `headerContent`
   - Tree data transformation via `groupByPath()`
   - Icon inference, size formatting, status summary
   - Data attrs: `data-upload-progress`, `data-upload-view`, `data-upload-file`, `data-upload-bar`, etc.
   - Base layout CSS + theme CSS
   - Unit tests

5. **Barrel exports** — add UploadTarget, Grid, UploadProgress to `packages/ui/src/components/index.js`

6. **Learn site** — play page, llms.txt, e2e tests for all three components

**Priority:** Medium — new feature, no existing code depends on it.

---

## 74. Shared ItemContent Migration — List, Menu, Select, MultiSelect — DONE

All components migrated to shared `ItemContent.svelte`. Dead CSS selectors removed from base + all 4 themes. Commit `d9dca813`.

---

## 75. ProxyTree + Wrapper Unification — DONE

Wrapper accepts ProxyTree, LazyWrapper extends Wrapper (no duplication), all 8 components migrated, showLines→lineStyle, dead code removed. Plan: `docs/plans/2026-03-01-wrapper-unification.md`.

---

## 68. Toggle — Learn Site + E2E (mostly done)

**Done:**
- [x] Toggle rewritten using List pattern + horizontal Navigator
- [x] Learn site: layout, play page, llms.txt updated
- [x] E2e tests: 11 tests passing (keyboard, mouse, text-only, learn/play navigation)

**Remaining:**
- [ ] Update `packages/ui/src/types/toggle.ts` if needed

**Priority:** Low — nearly complete.
