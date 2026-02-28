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
  tree:         { label: 'Tree', expand: 'Expand', collapse: 'Collapse', loading: 'Loading' },
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

## 63. Semantic Icons — Fix Hardcoded Icon Strings in Components

**Problem:** Several components bypass the `defaultStateIcons` system and hardcode `i-lucide:*` strings directly in templates or as prop defaults. This breaks global icon overriding (the two-layer customisation pattern documented in `agents/design-patterns.md`).

**Rule:** All icon defaults must be sourced from `defaultStateIcons.*`. Inline `i-lucide:*` / `i-solar:*` strings are only acceptable in playground/learn-site demos.

**Missing entries in `defaultIcons` (need SVGs + core entry):**
- `action-check` — checkmark / confirm (needed by Stepper, PaletteManager)
- `action-save` — save/persist (PaletteManager)
- `action-pin` / `action-unpin` — pin toggle (FloatingNavigation)

**Cases to fix — hardcoded in template (no prop at all):**

| Component | Hardcoded string | Semantic replacement |
|-----------|-----------------|---------------------|
| `Carousel.svelte` | `i-lucide:chevron-left` | `defaultStateIcons.navigate.left` via `icons` prop |
| `Carousel.svelte` | `i-lucide:chevron-right` | `defaultStateIcons.navigate.right` via `icons` prop |
| `Pill.svelte` | `i-lucide:x` (remove) | `defaultStateIcons.action.remove` or `action.close` |
| `Tabs.svelte` | `i-lucide:x` (remove tab) | `defaultStateIcons.action.close` |
| `Tabs.svelte` | `i-lucide:plus` (add tab) | `defaultStateIcons.action.add` |
| `FloatingNavigation.svelte` | `i-lucide:pin` / `i-lucide:pin-off` | new `action-pin` / `action-unpin` |
| `PaletteManager.svelte` | `i-lucide:save`, `i-lucide:check`, `i-lucide:list`, `i-lucide:hash` | new `action-save`, `action-check` + palette-specific |

**Cases to fix — prop defaults bypassing `defaultStateIcons`:**

| Component | Prop | Current default | Should be |
|-----------|------|----------------|-----------|
| `Rating.svelte` | `filledIcon` | `'i-lucide:star'` | `defaultStateIcons.rating.filled` |
| `Rating.svelte` | `emptyIcon` | `'i-lucide:star'` | `defaultStateIcons.rating.empty` |
| `BreadCrumbs.svelte` | `separator` | `'i-lucide:chevron-right'` | `defaultStateIcons.navigate.right` |
| `FloatingAction.svelte` | `icon` | `'i-lucide:plus'` | `defaultStateIcons.action.add` |
| `FloatingAction.svelte` | `closeIcon` | `'i-lucide:x'` | `defaultStateIcons.action.close` |
| `Stepper.svelte` | `icons.completed` default | `'i-lucide:check'` | new `defaultStateIcons.action.check` |

**Files:**
- `packages/icons/src/base/` — add `action-check.svg`, `action-save.svg`, `action-pin.svg`, `action-unpin.svg`
- `packages/icons` — rebuild
- `packages/core/src/constants.js` — add new names to `defaultIcons`
- `packages/core/spec/constants.spec.js` — update snapshot
- All component files listed above

**Priority:** Low — no functional regression, but violates the icon customisation contract.

---

## 62. ThemeSwitcherToggle — Mode Icons and `includeSystem` Flag

**Package:** `@rokkit/app`

**Current state:**
- `modes` defaults to `['system', 'light', 'dark']` — developer must pass a custom array to exclude system mode
- `system` icon is hardcoded as `'i-lucide:monitor'` directly in `defaultThemeSwitcherIcons`
- `light` and `dark` icons come from `defaultStateIcons.mode` (which uses `mode-dark` / `mode-light` from `defaultIcons` in `@rokkit/core`)
- No consistent pattern for the system icon — it's an inline lucide ref, not an overridable `mode-*` entry

**What's needed:**

1. ~~**Add `mode-system` to `defaultIcons`**~~ ✅ DONE
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

## ~~61. Navigator — `<a href>` clicks and keyboard Enter blocked by `preventDefault()`~~ ✅ DONE

Both click and keyboard Enter/Space on `<a href>` items were calling `event.preventDefault()` through `handleAction()`.

**Click fix:** `handleClick` detects `event.target.closest('a[href]')` and bypasses `handleAction` — calls controller handler directly (state sync), no `preventDefault`.

**Keyboard fix:** `handleKeydown` returns early when `action === 'select' && event.target.closest('a[href]')` — browser handles Enter/Space natively on focused anchor.

Note: `handleListKeyDown` `stopPropagation()` in `List.svelte` does NOT prevent same-element navigator handler — fix had to be in navigator itself.

6 new tests in `navigator.spec.svelte.js`. See journal 2026-02-25.

---

## 3. ItemProxy → @rokkit/states

**Decision (deferred):** Not appropriate — different abstraction layers:
- `ItemProxy` — pure TypeScript, read-only field-mapper, no reactivity
- `@rokkit/states` classes — reactive Svelte 5 (`$state`/`$derived`), mutable, `@rokkit/core`-dependent

**Revisit when:** The two proxy systems are consolidated or if ItemProxy gains consumers outside `@rokkit/ui`.

**Concern:** Moving would add `states → core` dependency chain to `@rokkit/ui` (currently standalone with zero workspace deps).

---

## ~~11. List/Tree — Type-Ahead Search~~ ✅ DONE

`findByText()` on ListController + `typeahead: true` option on navigator action. Enabled for List and Tree. Buffer accumulates, resets after 500ms, wrapping search, skips disabled. See journal 2026-02-24.

---

## ~~28. MultiSelect — Align Value Contract~~ ✅ DONE

`value` is now `unknown[]` (extracted primitives), `selected` is `SelectItem[]` (bindable full items), `onchange` is `(values, items) => void`. Aligned with Select/List/Tree. See journal 2026-02-24.

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

## ~~50. FloatingNavigation — New Component~~ ✅ DONE

`FloatingNavigation.svelte` in `@rokkit/ui`. Data-driven with ItemProxy, 4-position layouts (left/right/top/bottom), hover expand/collapse, pin toggle, IntersectionObserver tracking, CSS animations, keyboard navigation. Base + 4 theme CSS files. 34 unit tests + playground page. See journal 2026-02-24.

---

## ~~51. Button — Style Enhancements~~ ✅ DONE

Added `gradient` and `link` style variants. Micro-animations (hover lift, press scale, icon shift, loading pulse) in base CSS. Created button CSS for glass/minimal/material themes (previously only rokkit had button theme). Playground updated. See journal 2026-02-24.

---

## 65. Select — Migrate to Navigator/Wrapper/ProxyItem Stack

**Goal:** Replace current `ListController` + `navigator` (Svelte action) implementation with `Wrapper` + `Navigator` (class) stack. Add `class` prop.

**Checklist:**
- [ ] Rewrite `Select.svelte` using `Wrapper` + `Navigator` class
  - Dropdown list uses `Wrapper` with `flatView` for rendering
  - `Navigator` attached to dropdown container (not root)
  - Pre-flatten groups into leaf items before passing to `Wrapper`
  - Keep `Escape`/click-outside as document-level listeners
  - Add `class` prop to root `<div data-select>`
- [ ] Update `packages/ui/src/types/select.ts` if needed
- [ ] Update learn site `(learn)/elements/select/+page.svelte` with improved examples
  - Add playground page at `elements/select/play/+page.svelte`
  - Add `+layout.svelte` for learn/play toggle
  - Update or create `PlaySection` demo
- [ ] Update `sites/learn/src/routes/docs/components/select/llms.txt/+server.ts`
- [ ] Add e2e tests in `sites/learn/e2e/select.spec.ts` (keyboard + mouse + learn page)
- [ ] Run `bun run test:ci` — 0 failures, `bun run lint` — 0 errors
- [ ] Mark complete, commit, wait for confirmation before continuing to #66

**Priority:** High — largest user-facing selection component.

---

## 66. MultiSelect — Migrate to Navigator/Wrapper/ProxyItem Stack

**Goal:** Replace `ListController` + `navigator` with `Wrapper` + `Navigator` class. Add `class` prop.

**Checklist:**
- [ ] Rewrite `MultiSelect.svelte` using `Wrapper` + `Navigator` class
  - Multi-selection: `Wrapper` supports `selectAll`/`deselectAll` or extend for multi mode
  - Keep tag/pill row for selected items; keyboard removes last tag on `Backspace`
  - Add `class` prop to root element
- [ ] Update `packages/ui/src/types/multi-select.ts` if needed
- [ ] Update learn site `(learn)/elements/multi-select/+page.svelte` with improved examples
  - Add playground page at `elements/multi-select/play/+page.svelte`
  - Add `+layout.svelte` for learn/play toggle
- [ ] Update `sites/learn/src/routes/docs/components/multiselect/llms.txt/+server.ts`
- [ ] Add e2e tests in `sites/learn/e2e/multi-select.spec.ts`
- [ ] Run `bun run test:ci` — 0 failures, `bun run lint` — 0 errors
- [ ] Mark complete, commit, wait for confirmation before continuing to #67

**Priority:** High — companion to Select.

---

## 67. Menu — Migrate to Navigator/Wrapper/ProxyItem Stack

**Goal:** Replace `ListController` + `navigator` with `Wrapper` + `Navigator` class. Add `class` prop.

**Checklist:**
- [ ] Rewrite `Menu.svelte` using `Wrapper` + `Navigator` class
  - Dropdown: `Navigator` on dropdown container only (not root trigger button)
  - Pre-flatten groups into leaf items
  - Separator/spacer items supported via `proxy.type === 'separator'`
  - Keep `Escape`/click-outside as document-level listeners
  - Add `class` prop to root element
- [ ] Update `packages/ui/src/types/menu.ts` if needed
- [ ] Update learn site `(learn)/elements/menu/+page.svelte` with improved examples
  - Add playground page at `elements/menu/play/+page.svelte`
  - Add `+layout.svelte` for learn/play toggle
- [ ] Update `sites/learn/src/routes/docs/components/menu/llms.txt/+server.ts`
- [ ] Add e2e tests in `sites/learn/e2e/menu.spec.ts`
- [ ] Run `bun run test:ci` — 0 failures, `bun run lint` — 0 errors
- [ ] Mark complete, commit, wait for confirmation before continuing to #68

**Priority:** High — used in toolbars and context menus.

---

## 68. Toggle — Rewrite Using List Pattern

**Goal:** Copy List.svelte pattern: `wrapper.flatView` loop, `resolveSnippet`, horizontal Navigator, external value sync. Add `class` prop.

**Architecture (adopted):**
- Copy List.svelte as starting point — same `wrapper.flatView` rendering loop
- `new Navigator(containerRef, wrapper, { orientation: 'horizontal' })` for left/right navigation
- External value sync `$effect` — calls `wrapper.moveTo(key)` when `value` changes
- `resolveSnippet(snippets, proxy, 'item')` replaces local `resolveItemSnippet`
- `...snippets` rest props instead of `item: itemSnippet` destructuring
- `proxy.raw` in `handleSelect` callback (needs `raw` getter on `ProxyItem`)
- No group content (flat options only)

**Checklist:**
- [x] Add `raw` getter to `ProxyItem` in `@rokkit/states`
- [x] Rewrite `Toggle.svelte` using List pattern + horizontal Navigator
- [ ] Update `packages/ui/src/types/toggle.ts` if needed
- [ ] Update learn site `(learn)/elements/toggle/+page.svelte` with improved examples
  - Add playground page at `elements/toggle/play/+page.svelte`
  - Add `+layout.svelte` for learn/play toggle
- [ ] Update `sites/learn/src/routes/docs/components/toggle/llms.txt/+server.ts` (create if missing)
- [ ] Add e2e tests in `sites/learn/e2e/toggle.spec.ts`
- [x] Run `bun run test:ci` — 1600 pass, `bun run lint` — 0 errors
- [ ] Mark complete, commit, wait for confirmation before continuing to #67

**Priority:** Medium — used in ThemeSwitcher and other UI areas.

---

## 67. Menu — Rewrite Using List Pattern + Trigger Class

**Goal:** Compose Menu from List rendering pattern + new `Trigger` class for open/close management.

**Architecture (new approach):**
- Create `Trigger` class in `@rokkit/actions/src/trigger.svelte.js`
  - Manages `isOpen = $state(false)` (reactive — template uses directly)
  - Click on `[data-menu-trigger]` child toggles open/close
  - Click-outside detection (document capture listener)
  - Escape key closes + returns focus to trigger
- Rewrite `Menu.svelte` using List rendering pattern:
  - `renderNodes` computed array: `{ type: 'group', proxy }` | `{ type: 'item', key }`
  - Pre-flatten leaf items for `Wrapper` (groups are visual-only — not navigable)
  - `wrapper.flatView` for items rendered inside `{#if trigger?.isOpen}` panel
  - `resolveSnippet(snippets, proxy, 'item')` from `@rokkit/core`
  - `...snippets` rest props (no explicit `item:` destructuring)
  - `proxy.raw` in `handleSelect` callback

**Checklist:**
- [x] `raw` getter on `ProxyItem` (done in #68)
- [ ] Create `Trigger` class in `packages/actions/src/trigger.svelte.js`
- [ ] Export `Trigger` from `packages/actions/src/index.js`
- [ ] Rewrite `Menu.svelte` using List pattern + `Trigger`
- [ ] Update `packages/ui/src/types/menu.ts` if needed
- [ ] Update learn site `(learn)/elements/menu/+page.svelte` with improved examples
- [ ] Run `bun run test:ci` — 0 failures, `bun run lint` — 0 errors
- [ ] Mark complete, commit, wait for confirmation before continuing to #69

**Priority:** High — used in toolbars and context menus.

---

## 69. Tree — Rewrite Using List Pattern + Tree-Line Helper

**Goal:** Copy List.svelte as starting point; change rendering to use tree-line decorations instead of simple indentation. Everything else (Wrapper, Navigator, collapsible) stays the same.

**Architecture (new approach):**
- Copy List.svelte — same `wrapper.flatView` rendering loop, `collapsible: true` on Navigator
- Change rendering: instead of `data-level` indentation only, compute tree-line type per node
  - Helper `getTreeLineType(node, flatView)` → `'leaf' | 'last-leaf' | 'branch' | 'last-branch' | 'none'`
  - Render tree-line decorations (`data-tree-line` attribute) based on type
- No separate Tree type file changes needed — same props as current
- `resolveSnippet(snippets, proxy, ...)` from `@rokkit/core`
- `...snippets` rest props

**Checklist:**
- [ ] Write `getTreeLineType(node, index, nodes)` helper function
- [ ] Rewrite `Tree.svelte` using List pattern + tree-line helper
- [ ] Update `packages/ui/src/types/tree.ts` if needed
- [ ] Add tree story to learn site (`(learn)/elements/tree/+page.svelte`)
  - Add playground page at `elements/tree/play/+page.svelte`
  - Add `+layout.svelte` for learn/play toggle
- [ ] Create `sites/learn/src/routes/docs/components/tree/llms.txt/+server.ts`
- [ ] Add e2e tests in `sites/learn/e2e/tree.spec.ts`
- [ ] Run `bun run test:ci` — 0 failures, `bun run lint` — 0 errors
- [ ] Mark complete, commit

**Priority:** Medium — complex nested navigation, good validation of the stack.
