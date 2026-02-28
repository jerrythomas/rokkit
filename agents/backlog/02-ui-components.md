# Backlog: UI Components

Priority 2 — Component enhancements and new features for `@rokkit/ui`.

---
## 71. Canonical BASE_FIELDS + ProxyItem API Refinements

**Source:** `docs/design/011-states.md` §Canonical Field Mapping

**Goal:** Replace scattered field constants (`DEFAULT_FIELDS`, `PROXY_ITEM_FIELDS`, `defaultItemFields`) with single `BASE_FIELDS` in `@rokkit/core`. Update ProxyItem API.

**Checklist:**
- [ ] Create `BASE_FIELDS` in `@rokkit/core/src/constants.js`
- [ ] Add `avatar` (image URL → `<img>`) and `hrefTarget` (link target) fields
- [ ] Rename `text` → `label`, `description` → `subtext`, `title` → `tooltip` (semantic keys)
- [ ] Update ProxyItem: add `id` (auto-generated), rename `raw` → `original`, add `mutate()`, limit direct getters to `label`, `value`, `id`
- [ ] Update all components to import `BASE_FIELDS` instead of local field constants
- [ ] Backward compatibility: semantic keys map to common raw keys (`label` → `'text'`, `subtext` → `'description'`)
- [ ] Run `bun run test:ci` — 0 failures

**Depends on:** #70 (ProxyTree)

**Priority:** High — foundational change for all components.

---

## 72. Shared Content Component

**Source:** `docs/design/011-states.md` §Phase 5

**Goal:** Extract shared `Content` component from List/Menu/Select/MultiSelect/Tree.

**Context:**
- List, Menu, Select, MultiSelect all have identical rendering logic for GroupContent and ItemContent
- Only differences: `data-{entity}-*` attribute prefix and presence/absence of anchor tags
- Tree/LazyTree also share the same item rendering pattern
- `entity` prop controls `data-{entity}-[group|item]` attributes
- Handles icon/avatar/label/subtext/badge/shortcut rendering
- `avatar` renders as `<img>`, `icon` renders as iconify class (mutually exclusive)

**Checklist:**
- [ ] Create shared `Content.svelte` in `packages/ui/src/components/`
- [ ] `entity` prop for data-attribute prefix (list, menu, select, tree)
- [ ] Support both `<button>` and `<a href>` modes
- [ ] Migrate List, Menu, Select, MultiSelect, Tree to use shared Content
- [ ] Run `bun run test:ci` — all existing tests pass

**Depends on:** #71 (BASE_FIELDS)

**Priority:** Medium — reduces duplication across 5+ components.

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

## 3. ItemProxy + Proxy → Deprecate in favour of ProxyItem

**Updated decision:** ProxyItem (`@rokkit/states`) is now the canonical proxy class. ItemProxy (`@rokkit/ui/types`) and Proxy (`@rokkit/states/proxy.svelte.js`) are deprecated.

**Migration plan** (see `docs/design/011-states.md` §ProxyItem Deprecation):
1. Port fallback resolution chains (text, value, shortcut, description) to ProxyItem
2. Port `getSnippet(snippets, defaultSnippet)` method to ProxyItem
3. Migrate 16 UI components from ItemProxy → ProxyItem
4. Remove Proxy class (also removes Ramda dependency from `@rokkit/states`)
5. Remove ItemProxy class

**Priority:** Medium — enables consistent proxy model across all packages.

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

## ~~65. Select — Migrate to Trigger+Wrapper+Navigator Stack~~ ✅ DONE

Rewritten with `Trigger` action + `Wrapper` + `Navigator`. Dropdown uses `Wrapper.flatView`, `Navigator` on dropdown container. Filter input uses native `addEventListener` (fires before Navigator's handler for correct Escape precedence). `items` prop (was `options`), `align: 'start'/'end'` (was `left`/`right`). Learn site updated, playground updated. 48 tests pass. See commit `7d09c15d`.

---

## ~~66. MultiSelect — Migrate to Trigger+Wrapper+Navigator Stack~~ ✅ DONE

Rewritten with `Trigger` action + `Wrapper` + `Navigator`. Tag remove buttons work correctly (Trigger ignores clicks from interactive children). Toggle rebuilds items from `wrapper.lookup` for both add and remove. `items` prop (was `options`). Learn site updated, playground updated. 28 tests pass. See commit `7d09c15d`.

---

## ~~67. Menu — Migrate to Trigger+Wrapper+Navigator Stack~~ ✅ DONE

Rewritten with `Trigger` action + `Wrapper` + `Navigator`. Dropdown content identical to List pattern. `items` prop (was `options`), `text` field (was `label`). Learn site updated, playground updated. 47 tests pass. See commit `7d09c15d`.

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

## ~~67b. Menu — Trigger Class Approach~~ ✅ DONE (merged with #67 above)

`Trigger` class created in `@rokkit/actions/src/trigger.js`. Uses `isOpen` callback function (not internal state) for sync with component. Ignores clicks from interactive children. Exported from `@rokkit/actions`. See commit `7d09c15d`.

---

## ~~69. Tree — Rewrite Using Wrapper+Navigator + Tree-Line Helper~~ ✅ DONE

Rewritten as `Tree.svelte` (formerly SimpleTree) using `Wrapper` + `Navigator` with `collapsible: true`. Tree line types computed in `buildReactiveFlatView`. `LazyTree.svelte` added for async children loading. Learn site pages created for both. 28 Tree tests pass. See commits `cddada02`, `7d09c15d`.

---

## 70. ProxyTree + Lazy Loading Enhancements

**Source:** `docs/requirements/011-states.md`, `docs/design/011-states.md`

**Goal:** Create `ProxyTree` class for reactive collection management with `append()` and `addChildren()`. Refactor Wrapper to receive ProxyTree. Make LazyWrapper extend Wrapper. Rename `onloadchildren` → `onlazyload`. Add `hasMore` prop and "Load More" button to LazyTree.

**Key decisions (resolved):**
- Wrapper receives ProxyTree (does not create it)
- LazyWrapper extends Wrapper (overrides expand/select only, no code duplication)
- `onlazyload(item)` = fetch children, `onlazyload()` = fetch more root items
- `hasMore` is client-controlled (client sets to false when no more data)
- `showLines` → `lineStyle` prop with `data-line-style` attribute (none|dotted|dashed|solid)
- LazyTree only for now (LazyList, LazyTable later once pattern is proven)
- `toggle()` stays on Wrapper for accordion-trigger pattern

**Checklist:**
- [ ] Create `ProxyTree` class in `packages/states/src/proxy-tree.svelte.js`
  - append(items): add root items, batch version bump
  - addChildren(proxy, items): add children to node, batch version bump
  - Reactive flatView and lookup derived from version
  - Custom proxy factory support (for LazyProxyItem)
- [ ] Refactor `Wrapper` to receive ProxyTree (not build it)
- [ ] Refactor `LazyWrapper` to extend `Wrapper` (override expand/select, add loadMore)
- [ ] Rename `onloadchildren` → `onlazyload` in LazyWrapper + LazyTree
- [ ] Add `hasMore` prop to LazyTree
- [ ] Add "Load More" button to LazyTree template
- [ ] Replace `showLines` with `lineStyle` prop + `data-line-style` attribute on Tree and LazyTree
- [ ] Update tests for ProxyTree, Wrapper, LazyWrapper, and LazyTree
- [ ] Update learn site LazyTree pages
- [ ] Run `bun run test:ci` — 0 failures

**Priority:** High — enables pagination and on-demand data loading across tree components.
