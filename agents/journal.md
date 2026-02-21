# Project Journal

Chronological log of confirmations, progress, milestones, and decisions.
Design details live in `docs/design/` — modular docs per module.

---

## 2026-02-21

### List — Migrated to NestedController + use:navigator (ADR-003 Phase B)

Second component in Phase B (after Toggle). Replaced ~100 lines of inline keyboard navigation in List.svelte with `NestedController` + `use:navigator`.

**Key decisions:**
- Used `NestedController` (not `ListController`) because expand/collapse is handled by NestedController. Navigator handles all keyboard when `nested: collapsible`.
- Created `expandedByPath` (`$state<Record<string, boolean>>`) as reactive bridge for template rendering. Svelte 5 cannot track reactivity through `controller.lookup` ($derived Map) → `proxy.expanded` ($state). The `expandedByPath` state is the template's source of truth for expansion.
- Removed `onclick` from group label button — navigator intercepts clicks on `data-path` elements. Without this, click would double-toggle (button onclick + navigator select → handleSelectAction toggle).
- `handleSelectAction` handles both button items (fires `onselect`) and group labels (toggles expansion).
- `handleListKeyDown` only intercepts Enter/Space on link items (`<a>`) to let native navigation through.
- `handleFocusIn` syncs DOM focus → controller via `controller.moveTo(path)`.

**Expansion bridge pattern:**
1. External `expanded` prop (keyed by group name: `{ "Favorites": true }`) → `syncExpandedToController()` → controller proxy.expanded + expandedByPath
2. User toggles → `toggleGroupByKey(pathKey)` → controller.toggleExpansion + expandedByPath update → `deriveExpandedFromPath()` → expanded prop + onexpandedchange
3. Navigator toggle action → sync controller proxy states → expandedByPath → expanded prop

**E2e tests (33 total):**
- 9 flat list keyboard tests (ArrowDown/Up repeated, Home, End, no-wrap, Enter, Space, focus≠select)
- 5 grouped list keyboard tests (navigation through groups, collapse/expand, Enter toggle, repeated cycles)
- 3 mouse tests (click select, deselect, group toggle)
- 16 visual snapshots (4 themes × 2 modes × 2 states)

**Not implemented (backlog):**
- ArrowRight on expanded group → move to first child (tree-style navigation)
- ArrowLeft on child → move to parent group label

**Tests:** 1058 unit tests + 60 e2e tests (27 toggle + 33 list) all passing.

### ListController — Skip Disabled Items (Backlog #36)

Added `disabled: 'disabled'` to `@rokkit/core` defaultFields and `#isDisabled(index)` helper to `ListController`. All four movement methods (`moveNext`, `movePrev`, `moveFirst`, `moveLast`) now skip disabled items. `moveToIndex()` and `moveTo()` remain unchanged — they're used for explicit focus (focusin handler, selection) where any index should be reachable.

**Files changed:**
- `packages/core/src/constants.js` — added `disabled: 'disabled'` field
- `packages/core/spec/constants.spec.js` — updated defaultFields snapshot
- `packages/states/src/list-controller.svelte.js` — added `#isDisabled()` + updated 4 movement methods
- `packages/states/spec/list-controller.spec.svelte.js` — 7 new disabled item tests
- `sites/playground/e2e/list.spec.ts` — updated End/ArrowDown tests to verify disabled skip

**Tests:** 1065 unit tests + 60 e2e tests all passing.

### Proxy State Isolation — Controller-Owned expandedKeys

Moved expansion state from Proxy (which mutated original items via `proxy.expanded = true` → `item._expanded = true`) into a `SvelteSet` owned by the controller. Original items are no longer polluted with internal state flags when returned via `onselect`/`onchange`.

**Approach:** Added `expandedKeys = new SvelteSet()` to `ListController`. `flatVisibleNodes` now accepts an optional `expandedKeys` parameter — when provided, checks `expandedKeys.has(key)` instead of `item[fields.expanded]`. Falls back to item field for backward compat when `expandedKeys` is null. `NestedController.expand/collapse/toggleExpansion` now manipulate `expandedKeys` directly instead of `proxy.expanded`. Proxy's `expanded` setter removed; getter kept for reading initial data.

**List.svelte simplification:** Removed the `expandedByPath` reactive bridge (which was a workaround for Svelte 5 reactivity not tracking through `$derived` Map → `proxy.expanded` `$state`). Now reads `controller.expandedKeys.has(pathKey)` directly — `SvelteSet` is natively reactive.

**Files changed:**
- `packages/states/src/derive.svelte.js` — `flatVisibleNodes` accepts `expandedKeys` param
- `packages/states/src/list-controller.svelte.js` — added `expandedKeys`, `#initExpandedKeys()`
- `packages/states/src/nested-controller.svelte.js` — expand/collapse/toggle use `expandedKeys`
- `packages/states/src/proxy.svelte.js` — removed `expanded` setter
- `packages/ui/src/components/List.svelte` — removed `expandedByPath`, use `controller.expandedKeys`
- `packages/core/src/mapping.js` — added deprecation note to `isExpanded`
- Tests: updated proxy spec, added derive expandedKeys test, added nested-controller non-mutation test

**Tests:** 1068 unit tests + 60 e2e tests all passing.

---

## 2026-02-20 (session 2)

### Documentation Restructuring — Requirements Split, LLMs Reference, ADR-003

Restructured documentation per approved plan: split catch-all requirements file, created per-component requirements, built package reference docs, and wrote architecture decision for MVC separation.

**Phase 1 — Split 000-component-requirements.md:**
- Created `000-patterns.md` (type system, architecture patterns, TypeScript strategy)
- Created `000-rtl.md` (RTL detection, Vibe direction)
- Created `020-chart.md` (AnimatedChart, accessible patterns)
- Created `060-effects.md` (Tilt, Shine, Glow, Depth3D, Motion, Parallax)
- Created `080-cli.md` (CLI scaffolding, svelte-add)
- Appended TreeTable subsection to `004-table.md`
- Deleted `000-component-requirements.md`

**Phase 2 — Active component requirements (5 new files):**
- `001-button.md`, `005-select.md`, `006-menu.md`, `007-toggle.md`, `008-toolbar.md`

**Phase 3 — Archived component requirements (4 new files):**
- `009-navigation.md` (Tabs, BreadCrumbs, Stepper, PageNavigator)
- `040-layout.md` (Card, Panel, Overlay, ResponsiveGrid, Carousel, SlidingColumns)
- `050-feedback.md` (ProgressBar, Message, Pill, Separator, Summary, Icon, Link, Accordion)
- `070-data.md` (SearchFilter, Calendar)

**Phase 4 — docs/llms/ package reference (14 files + README):**
- Created `docs/llms/` with reference docs for all 14 packages
- Each doc: dependency hierarchy, exports table, key patterns, internal modules

**ADR-003 — MVC Separation (docs/decisions/003-mvc-separation.md):**
- Analysis found ~1200 lines of duplicated keyboard/navigation/focus code across List, Select, Menu, Tree
- Decision: fold composables into ui, add states/actions as ui dependencies, remove bits-ui entirely
- Found chart has dead bits-ui dependency; composables fully superseded by ui equivalents

**Backlog updated:** #28 expanded (ramda project-wide), added #29–#33 (helpers exports, chart bits-ui, ui MVC adoption, parseFilters, composables fold)

**READMEs updated:** requirements + design READMEs with expanded numbering (000–089)

---

## 2026-02-20

### Requirements & Design Documentation — List, Tree, Form

Documented requirements and design for three component areas based on existing code analysis.

**Files created:**
- `docs/requirements/002-list.md` — 10 sections, identified 4 gaps (navigator refactor, multi-selection, type-ahead, missing role="listbox")
- `docs/requirements/003-tree.md` — 12 sections, identified 6 gaps (navigator refactor, multi-selection, drag-and-drop, lazy loading, proxy recreation, search/filter)
- `docs/requirements/010-form.md` — 17 sections covering current + future features (custom type renderers, validation integration, enhanced lookups, master-detail, semantic command input, dirty tracking, form submission, audit fields)
- `docs/design/002-list.md` — Current architecture + proposed `use:navigator` + `ListDataController` refactor (~118 lines saved)
- `docs/design/003-tree.md` — Current architecture + proposed `use:navigator` + `NestedController` refactor (~54 lines saved)
- `docs/design/010-form.md` — Current architecture + 5-phase enhancement plan (FormBuilder stability, type registry, validation, lookups, master-detail, semantic command)

**Backlog updated:**
- Items #8-#16: List/Tree navigator refactor, multi-selection, lazy loading, FormBuilder recreation, legacy migration, dirty tracking, parseFilters export, type-ahead search
- Items #17-#28: Custom type renderer registry, validation integration, ValidationReport migration, InputToggle, FieldGroup, ArrayEditor, enhanced lookups, form submission, audit metadata, master-detail, semantic command input, ramda removal

**Key decisions:**
- Forms do NOT benefit from `use:navigator` — standard tab order is sufficient, arrow keys would break text inputs
- List (~100 lines inline keyboard code) and Tree (~80 lines) should be refactored to use `use:navigator` + controllers
- Form enhancement follows 5-phase strategy: fix current → type renderers → lookups/validation → master-detail → semantic command

---

## 2026-02-19

### Forms Phase 1 — Complete (Steps 1–8)

Implemented form-driven property controls via `@rokkit/forms`.

**Steps completed:**
1. Replaced `Icon` import with `<span class={icon}>` in InputField
2. Replaced InputSelect native `<select>` with `@rokkit/ui` Select component
3. Created `InfoField.svelte` for read-only value display
4. Added `info` and `separator` type dispatch in Input.svelte
5. Extended FormBuilder type resolution (options, separator, info/readonly, type at top level)
6. Handle separator elements in FormRenderer render loop
7. Exported InfoField + lib utilities from forms index
8. Pilot conversion: toggle playground page → FormRenderer with schema + layout

**Additional fixes during phase 1:**
- Changed InputCheckbox default variant to 'custom' (icon-based, not native blue checkbox)
- Moved checkbox outside `[data-input-root]` (doesn't need gradient border wrapper)
- Added `[data-input-root] [data-select] { flex-1 }` to stretch Select in input wrapper
- Created theme CSS files: `base/input.css`, `rokkit/input.css`, `minimal/input.css`
- Updated index.css files in base, rokkit, minimal to import input.css
- Added `@rokkit/forms` dependency to playground
- Wrote comprehensive `@rokkit/forms` README with future enhancements

**Commits:**
- `910499e0` — feat: form-driven property controls via @rokkit/forms

**Tests:** 1057 passing, all green

### Forms Phase 2 — Complete

Converted 8 playground pages to FormRenderer and cleaned up deprecated code.

**Page conversions (8):** list, tree, toolbar, code, floating-action, menu, select, multi-select
- Each page: replaced individual `$state()` + Prop* imports with single `props = $state({})` + schema + layout + `<FormRenderer>`
- PaletteManager skipped (uses custom snippets, not expressible as schema)

**Controls deletion:** removed `sites/playground/src/lib/controls/` (PropSelect, PropCheckbox, PropText, PropInfo, index.ts)

**Archive/deprecated cleanup:**
- Deleted `archive/forms/` (forms-old, inp, lib-deprecated, spec-inp)
- Deleted rebuilt components from `archive/ui/` (Button, List, Tree, Select, MultiSelect, Toggle, FloatingAction(s), Connector, Node, Item, NestedList + specs/snapshots)
- Deleted `packages/states/deprecated/` (hierarchy.js)
- Deleted `packages/forms/src/forms-old/`, `packages/forms/src/inp/`, `packages/forms/src/lib/deprecated/`
- Kept `archive/themes/` (reference for theme migration)
- Kept un-rebuilt components in `archive/ui/` (47 components)

**Commits:**
- `7af488f8` — feat: convert playground pages to FormRenderer and clean up deprecated code

**Tests:** 1057 passing, all green
