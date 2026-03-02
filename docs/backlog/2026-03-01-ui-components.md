# Backlog: UI Components

Priority 2 — Component enhancements and new features for `@rokkit/ui`.

---

## 64. Component Labels — Translatable Strings via MessagesStore — DONE

MessagesStore extended with 16 nested component label keys + deep-merge in `set()`. 15 UI components + ThemeSwitcherToggle migrated to read defaults from `messages.current.<component>` with `label`/`labels` prop overrides. Same pattern as icons. Design: `docs/plans/2026-03-02-component-labels-design.md`. Plan: `docs/plans/2026-03-02-component-labels.md`.

---

## 63. Semantic Icons — Fix Hardcoded Icon Strings in Components — DONE

7 components migrated to icons prop pattern with DEFAULT_STATE_ICONS defaults. 6 new SVGs + icon names added. Remaining: Carousel (chevron-left/right) and Tabs (plus) still have i-lucide: strings. Plan: `docs/plans/2026-03-02-semantic-icons.md`.

---

## 62. ThemeSwitcherToggle — Mode Icons and `includeSystem` Flag — DONE

`mode-system` icon added to `defaultIcons`, `includeSystem` boolean prop added to `ThemeSwitcherToggleProps` (default `true`). When `false`, filters `system` from rendered options via `effectiveModes` derived. Icon customisation via `icons` prop documented in JSDoc.

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

## 68. Toggle — Learn Site + E2E — DONE

Toggle rewritten using List pattern + horizontal Navigator. Learn site + e2e tests done. Types cleaned up: removed deprecated `ToggleItemHandlers` and `LegacyToggleItemSnippet`, added `label` prop to `ToggleProps`.
