# Backlog

Items deferred from the current phase. Reviewed periodically during housekeeping sessions.

---

## 1. InputSwitch — Redesign Required

**Context:** `packages/forms/src/input/InputSwitch.svelte` is commented out of the input index.

**Problem:** The component does `import Switch from '@rokkit/composables'` (wrong: default import instead of named) AND the composables `Switch` is a **boolean toggle** (bits-ui wrapper), while `InputSwitch` expects an **option-list Switch** that takes `options`, `fields`, and `onchange`.

**What exists:**
- `packages/forms/src/input/InputSwitch.svelte` — broken import, API mismatch
- `@rokkit/composables` `Switch` — boolean toggle (bits-ui wrapper)
- `archive/ui/src/Switch.svelte` — old option-selector Switch (used `@rokkit/states` Proxy + `@rokkit/actions` keyboard + archived Item component)

**What's needed:**
- [ ] Decide: boolean toggle or option-list switch for forms
- [ ] If option-list: build a new `OptionSwitch` component (the old one's dependencies are all rewritten)
- [ ] Fix import and uncomment export in `packages/forms/src/input/index.js`
- [ ] Write tests

---

## 2. @rokkit/types — Shared Types Package

**Context:** User asked if types should be centralized.

**Decision (deferred):** Not needed now. The two type systems serve different purposes:
- `@rokkit/ui` types (TypeScript) — UI-specific: text, icon, shortcut, badge, disabled, active (13 fields)
- `@rokkit/core` types (JSDoc) — data-oriented: id, expanded, selected, currency, keywords (30+ fields)

**Revisit when:** A future feature needs shared types between packages (e.g., if `@rokkit/forms` needs to import `ItemFields` from `@rokkit/ui`).

**Concern:** Creating `@rokkit/types` would break `@rokkit/ui`'s zero-dependency isolation.

---

## 3. ItemProxy → @rokkit/states

**Context:** User suggested moving ItemProxy to states since it manages state classes.

**Decision (deferred):** Not appropriate — different abstraction layers:
- `ItemProxy` — pure TypeScript, read-only field-mapper, no reactivity
- `@rokkit/states` classes — reactive Svelte 5 (`$state`/`$derived`), mutable, `@rokkit/core`-dependent

**Revisit when:** The two proxy systems are consolidated or if ItemProxy gains consumers outside `@rokkit/ui`.

**Concern:** Moving would add `states → core` dependency chain to `@rokkit/ui` (currently standalone with zero workspace deps).

---

## 4. Icons — Add menu-closed/menu-opened Aliases

**Source:** docs/issues/001.md

Copy lucide `chevron-right` as `menu-closed` and lucide `chevron-down` as `menu-opened`, then update icon bundles.

---

## 5. Menu — First Item Always Highlighted

**Source:** docs/issues/001.md

The Menu component highlights the first item as active on open. Since Menu doesn't track an active/selected item (it fires onselect and closes), the first item should not be pre-highlighted.

---

## 6. Style Issues (docs/issues/001.md)

### 6a. input-root border 2px → 1px
Border for `[data-input-root]` wrapping Select is 2px thick. Should be 1px to match text inputs.

### 6b. Input/Select height and font-size mismatch
Input text box has larger height and font size than Select. They should match when side-by-side.

### 6c. Button Danger text invisible in dark mode
Danger variant text not visible in dark mode for all button styles.

### 6d. Minimal theme — underline style
Minimal inputs should have no padding, just underline. Select and MultiSelect should match. On focus use secondary color (or `::after` gradient underline on `[data-input-root]`). Label size should be smaller. Input text height+padding should match Select.

### 6e. Material theme — outlined input with floating label
Material style: inputs should have outline border on `[data-input-root]`, labels inline as placeholder, on focus the border appears and label floats onto the border (standard Material Design text field pattern).

### 6f. Button icon select — extra thick top border on empty value
In playground button page, icon dropdown has extra thick top border on first load (empty value). There's an extra empty item in the list. After selecting an item the border normalizes, but the first item in the list has smaller height than others.

---

## 7. Input Text — Value Binding Bug

**Source:** docs/issues/001.md

Input text value binds to the event object instead of the string value when changed. Example: in the button playground, the label field shows "Click Me" initially but changes to `[Object Event]` on edit. The `oninput`/`onchange` handler is likely passing the event rather than `event.target.value`.

---

## 8. ~~List — Refactor to use:navigator + Controller~~ ✅ DONE

**Completed:** 2026-02-21. Used `NestedController` + `use:navigator` with `nested: collapsible`. Added `expandedByPath` reactive state for template rendering bridge. 1058 unit tests + 33 e2e tests pass.

---

## 9. Tree — Refactor to use:navigator + NestedController

**Source:** docs/design/003-tree.md, docs/requirements/003-tree.md

**Problem:** Tree.svelte has ~80 lines of inline keyboard navigation code (handleItemKeyDown, focusPath, handleFocusIn). The `NestedController` in `@rokkit/states` already implements expand/collapse/toggleExpansion/ensureVisible.

**What's needed:**
- [ ] Verify `NestedController` meets Tree's navigation needs
- [ ] Wire `use:navigator={{ wrapper: controller, nested: true }}` on root element
- [ ] Remove inline keyboard handlers (~80 lines)
- [ ] Bridge `NestedController` expansion state with Tree's bindable `expanded` prop
- [ ] Add `data-path` attributes to tree nodes

**Benefits:** ~54 lines removed, consistent navigation, reuses existing controller.

**Open question:** How to bridge `@rokkit/states` Proxy with `@rokkit/ui` ItemProxy for rendering.

---

## 10. List/Tree — Multi-Selection Support

**Source:** docs/requirements/002-list.md §10.2, docs/requirements/003-tree.md §12.2

**Problem:** Both List and Tree only support single selection. Ctrl+click multi-select and `selected` array prop would be useful (e.g., file manager pattern, multi-select list).

**What's needed:**
- [ ] Add `multiSelect` prop to List and Tree
- [ ] Ctrl+click toggles item in selection set
- [ ] Shift+click for range selection
- [ ] `selected` bindable prop (array of values)
- [ ] `ListController`/`NestedController` already support `extendSelection` — need to surface it

---

## 11. Tree — Lazy Loading of Children

**Source:** docs/requirements/003-tree.md §12.4

**Problem:** Tree requires all children upfront. No support for async loading of subtrees on expand.

**What's needed:**
- [ ] `onloadchildren` callback that fires when a node is expanded and has no children loaded
- [ ] Loading spinner on expanding node while fetching
- [ ] Callback receives node value/path, returns Promise<TreeItem[]>

---

## 12. Forms — FormBuilder Recreated on Every Render

**Source:** docs/design/010-form.md, docs/requirements/010-form.md §12.6

**Problem:** `FormRenderer` creates a new `FormBuilder` on every derivation: `let formBuilder = $derived(new FormBuilder(data, schema, layout))`. This loses validation state, lookup manager, and internal state on each data change.

**What's needed:**
- [ ] Use stable `FormBuilder` instance with reactive updates via `$effect`
- [ ] Only recreate on schema/layout changes, update data reactively

---

## 13. Forms — Legacy Component Migration

**Source:** docs/design/010-form.md, docs/requirements/010-form.md §12.1

**Problem:** `DataEditor`, `FieldLayout`, `ListEditor`, `NestedEditor` use Svelte 4 patterns (`export let`, `createEventDispatcher`, `getContext('registry')`). These don't work properly in Svelte 5 apps.

**What's needed:**
- [ ] Migrate `FieldLayout` to Svelte 5 runes
- [ ] Enhance `FormRenderer` to handle nested `type: 'group'` elements recursively
- [ ] Replace `ListEditor` with List + FormRenderer composition
- [ ] Replace `NestedEditor` with Tree + FormRenderer composition

---

## 14. Forms — No Dirty Tracking

**Source:** docs/requirements/010-form.md §12.9

**Problem:** No mechanism to track which fields have been modified from initial values. Useful for "unsaved changes" warnings and conditional submit.

**What's needed:**
- [ ] Add `isDirty` / `dirtyFields` to `FormBuilder`
- [ ] Compare current values against initial snapshot
- [ ] `onDirtyChange` callback or reactive `dirty` state

---

## 15. Export parseFilters/filterData from @rokkit/data

**Source:** docs/requirements/004-table.md §6.2

**Problem:** `parseFilters`, `filterData`, `filterObjectArray` are implemented and tested in `@rokkit/data` but not exported from the package index.

**What's needed:**
- [ ] Add exports to `packages/data/src/index.js`:
  ```javascript
  export { parseFilters } from './parser'
  export { filterData, filterObjectArray } from './filter'
  ```

---

## 16. List/Tree — Type-Ahead Search

**Source:** docs/requirements/002-list.md §10.3

**Problem:** No type-ahead (pressing a letter to jump to matching item). Common accessibility pattern for lists and trees.

**What's needed:**
- [ ] Could be added to `navigator` action or as a separate `use:typeahead` action
- [ ] Buffer typed characters, find matching item, focus it
- [ ] Reset buffer after timeout (~500ms)

---

## 17. Forms — Custom Type Renderer Registry

**Source:** docs/requirements/010-form.md §5, docs/design/010-form.md "Custom Type Renderer Registry"

**Problem:** Type-to-component mapping is hardcoded in `types.js` (`extractComponentMap`). Different data types should support multiple visual representations (e.g., enum → select/radio/toggle/menu, boolean → checkbox/switch/toggle).

**What's needed:**
- [ ] Build a default renderer registry mapping type + format + hints to components
- [ ] Support `renderer` hint in schema/layout to override default component
- [ ] `renderers` prop on `FormRenderer` for user-provided custom components
- [ ] Resolution order: explicit renderer → format mapping → type mapping → fallback
- [ ] Standard renderer interface (`InputRendererProps`) all components must implement

**Phase:** 2 (after FormBuilder stability fix)

---

## 18. Forms — Validation Integration into FormRenderer

**Source:** docs/requirements/010-form.md §6, docs/design/010-form.md "Integrated Validation"

**Problem:** `validation.js` has `validateField()` and `validateAll()` but they are NOT called by `FormRenderer`. Validation is purely external via the `onvalidate` callback.

**What's needed:**
- [ ] `FormRenderer` calls `validateField()` on blur automatically
- [ ] `FormBuilder` runs `validateAll()` when `builder.validate()` is called
- [ ] `builder.isValid` derived property (true when no errors)
- [ ] `builder.errors` derived array of all error messages
- [ ] Configurable `validateOn` prop: `'blur'` | `'change'` | `'submit'`
- [ ] Async validation via `onvalidate` hook: `(path, value, trigger) => Promise<ValidationMessage | null>`
- [ ] On submit: validate all → if invalid, show errors + focus first error field

**Phase:** 1 (high priority)

---

## 19. Forms — ValidationReport Component Migration

**Source:** docs/requirements/010-form.md §6.6, docs/design/010-form.md "ValidationReport Component"

**Problem:** `archive/ui/src/ValidationReport.svelte` exists but uses old patterns. Needs migration to Svelte 5 and integration with `FormBuilder`.

**What's needed:**
- [ ] Migrate `ValidationReport` from archive to `@rokkit/forms` (or `@rokkit/ui`)
- [ ] Groups messages by severity (errors first, then warnings, then info)
- [ ] Click-to-focus: clicking a message scrolls to and focuses the field
- [ ] Count badges: "3 errors, 1 warning"
- [ ] Optional collapsible sections by severity
- [ ] Data attributes: `data-validation-report`, `data-validation-group`, `data-severity`, `data-validation-item`, `data-status`

**Phase:** 2

---

## 20. Forms — InputToggle Component

**Source:** docs/requirements/010-form.md §9.2

**Problem:** No option-set toggle component for rendering enums or booleans as toggle button groups.

**What's needed:**
- [ ] `InputToggle` component: renders options as a horizontal button group
- [ ] Works for both enum types (multiple options) and boolean (on/off)
- [ ] Implements standard `InputRendererProps` interface
- [ ] Triggered by `renderer: 'toggle'` hint in schema/layout

**Depends on:** Backlog #1 (InputSwitch) for boolean toggle variant

**Phase:** 2

---

## 21. Forms — FieldGroup Component (Nested Objects)

**Source:** docs/requirements/010-form.md §9.2, docs/design/010-form.md

**Problem:** No component for rendering `type: 'object'` fields as nested form sections. Legacy `FieldLayout` is Svelte 4.

**What's needed:**
- [ ] `FieldGroup` component: renders nested schema properties as a collapsible section
- [ ] Recursive rendering using `FormRenderer` or similar pattern
- [ ] Label/header for the group
- [ ] Handles nested scope paths (`#/address/city`)

**Phase:** 2

---

## 22. Forms — ArrayEditor Component

**Source:** docs/requirements/010-form.md §9.2

**Problem:** No component for editing `type: 'array'` fields (list of items with add/remove). Legacy `ListEditor` is Svelte 4 and broken.

**What's needed:**
- [ ] `ArrayEditor` component: renders array items with add/remove buttons
- [ ] Each item rendered as a form row (using `FormRenderer` or inline fields)
- [ ] Reorder support (optional drag-and-drop)
- [ ] Schema-driven: uses `items` sub-schema for per-item type

**Phase:** 2

---

## 23. Forms — Enhanced Lookup System (Fetch/Filter Hooks)

**Source:** docs/requirements/010-form.md §7, docs/design/010-form.md "Enhanced Lookup System"

**Problem:** Current lookup system is URL-template-based only (`/api/cities?country={country}`). Doesn't support arbitrary async fetch functions, client-side filtering of pre-loaded data, or cascading dependency chains with auto-disable.

**What's needed:**
- [ ] `fetch` hook pattern: `async (formData) => options[]` replaces URL template
- [ ] `filter` hook pattern: `(source, formData) => filteredOptions[]` for client-side filtering
- [ ] Cascading dependencies: dependent fields auto-disable until deps have values
- [ ] Dependent field values cleared when upstream dependency changes
- [ ] `cacheKey` function for custom cache keys
- [ ] Loading spinner and error state on dependent fields
- [ ] Placeholder "Select {dependency} first" on disabled dependent fields
- [ ] Integrate lookup state into `FormRenderer` rendering pipeline

**Phase:** 3

---

## 24. Forms — Form Submission Handling

**Source:** docs/requirements/010-form.md §14

**Problem:** No built-in submission flow. Consumers handle submit externally with no integration to validation.

**What's needed:**
- [ ] `onsubmit` callback: `(data, { isValid, errors }) => Promise<void>`
- [ ] Auto-validate all fields before submission
- [ ] If invalid: show `ValidationReport`, focus first error field
- [ ] Loading state while submit is in progress
- [ ] Optional submit/reset buttons when `onsubmit` provided
- [ ] Reset button restores initial values (uses dirty tracking)

**Phase:** 3

---

## 25. Forms — Audit/System Field Metadata

**Source:** docs/requirements/010-form.md §10.4, docs/design/010-form.md "Audit/System Field Handling"

**Problem:** No metadata convention for fields that are auto-generated (id, uuid) or audit-tracked (created_at, updated_by). These should be read-only in edit mode and excluded from add forms.

**What's needed:**
- [ ] `generated: true` schema property → display as read-only info, exclude from add forms
- [ ] `audit: true` schema property → display as read-only info, exclude from add forms
- [ ] `hidden: true` schema property → exclude from form entirely
- [ ] `FormBuilder` processes these flags when building elements

**Phase:** 4 (with Master-Detail)

---

## 26. Forms — Master-Detail View

**Source:** docs/requirements/010-form.md §10, docs/design/010-form.md "Master-Detail View"

**Problem:** Legacy `ListEditor` (Svelte 4, broken) provided master-detail editing. Need a modern component for CRUD operations on collections.

**What's needed:**
- [ ] `MasterDetail` component: two-column layout (list + detail form)
- [ ] Composition of `SearchFilter` + `List` + `FormRenderer` + `ValidationReport`
- [ ] CRUD: add (empty form with defaults), edit (click list item), delete (with confirmation), save (validate first)
- [ ] Dirty tracking: warn on navigation away with unsaved changes
- [ ] Optional pagination with `onloadmore` callback
- [ ] `lookups` and `renderers` props passed through to `FormRenderer`
- [ ] Custom snippets for list item and detail sections

**Depends on:** #12 (FormBuilder stability), #18 (validation integration), #14 (dirty tracking), #25 (audit fields)

**Phase:** 4

---

## 27. Forms — Semantic Command Input

**Source:** docs/requirements/010-form.md §11, docs/design/010-form.md "Semantic Command Input"

**Problem:** No natural-language-like command interface for data operations. Users should be able to type "find customers by name john" and get tabular results, then "edit row 1" to see an edit form.

**What's needed:**
- [ ] `CommandConsole` component with command input, interpreter, and result view
- [ ] Command parser: tokenize + grammar match (find/show/list/edit/add/delete/save/cancel)
- [ ] Entity registry: `Map<name, { schema, fetch, save, delete }>` with aliases
- [ ] View state machine: idle → table → form → loading → error
- [ ] Reuse `parseFilters()` from `@rokkit/data` for filter syntax
- [ ] Autocomplete suggestions for entity names, field names, operators
- [ ] Command history (up/down arrows)
- [ ] Integration with `Table`, `FormRenderer`, `ValidationReport`

**Depends on:** #26 (Master-Detail), #18 (validation), Table component, `parseFilters` export (#15)

**Phase:** 5 (future)

---

## 28. Project-Wide ramda Removal

**Source:** docs/design/010-form.md, docs/llms/ analysis

**Problem:** `ramda` is used across 8/14 packages for trivial functions (`pick`, `omit`, `isNil`, `equals`, `has`). Each can be replaced with native JS.

**Affected packages:** core, states, actions, data, composables, forms, chart, helpers

**What's needed:**
- [ ] Replace `isNil(v)` with `v == null`
- [ ] Replace `pick`/`omit` with `Object.fromEntries(Object.entries(...).filter(...))`
- [ ] Replace `equals` with `JSON.stringify` comparison or custom deep-equal
- [ ] Replace `has` with `Object.hasOwn` or `in` operator
- [ ] Remove `ramda` from each package.json
- [ ] Verify all tests pass

**Phase:** Any (low priority, no dependencies)

---

## 29. @rokkit/helpers — Under-Exported Utilities

**Source:** docs/llms/ analysis

**Problem:** `@rokkit/helpers` has matchers, mocks, and components directories but the main `index.js` may not export everything. Test helpers like `MockItem`, `StaticContent`, and some mock utilities aren't accessible.

**What's needed:**
- [ ] Audit `packages/helpers/src/index.js` exports vs available modules
- [ ] Export all matchers, mocks, simulators, and test components
- [ ] Update documentation

---

## 30. @rokkit/chart — Dead bits-ui Dependency

**Source:** docs/llms/ analysis, ADR-003

**Problem:** `@rokkit/chart` package.json lists `bits-ui^2.10.0` as dependency but **no source file imports from bits-ui**. Dead dependency inflating install size.

**What's needed:**
- [ ] Remove `bits-ui` from `packages/chart/package.json`
- [ ] Verify build and tests pass

---

## 31. @rokkit/ui — Adopt States/Actions Dependencies (ADR-003)

**Source:** docs/decisions/003-mvc-separation.md

**Problem:** @rokkit/ui reimplements ~1200 lines of navigation/selection/focus logic that already exists in @rokkit/states (ListController, NestedController) and @rokkit/actions (navigator). See ADR-003 for full analysis.

**What's needed:**
- [ ] Phase A: Clean up (remove composables dep from forms, fix InputSwitch, remove bits-ui from chart)
- [ ] Phase B: Add @rokkit/states and @rokkit/actions to ui package.json
- [ ] Phase C: Migrate ~~Toggle~~, Menu, Select, MultiSelect, ~~List~~, Toolbar, Tree to use controllers + navigator (Toggle: done `54202902`, List: done 2026-02-21)
- [ ] Phase D: Remove @rokkit/composables package
- [ ] Unify Proxy/ItemProxy

**See:** ADR-003 implementation plan for detailed checklist

---

## 32. @rokkit/data — Export parseFilters and filterData

**Source:** docs/requirements/070-data.md, backlog #15

**Note:** Duplicate of #15 but elevated priority. SearchFilter recreation and Table column filtering both depend on these exports.

---

## 33. @rokkit/composables — Fold Into UI and Remove

**Source:** docs/decisions/003-mvc-separation.md

**Problem:** Package has 4 exports, all superseded by @rokkit/ui equivalents. Only real consumer is sites/learn Sidebar (uses GroupedList). bits-ui would be removed from project entirely.

**What's needed:**
- [ ] Replace `GroupedList` in sites/learn Sidebar with `@rokkit/ui` List
- [ ] Fix InputSwitch (backlog #1)
- [ ] Remove `@rokkit/composables` dependency from `@rokkit/forms` package.json
- [ ] Delete `packages/composables/`
- [ ] Remove from workspace config

**See:** ADR-003 Phase A + D

---

## 34. MultiSelect — Align Value Contract

**Source:** ADR-003 Phase C, value contract standardization

**Problem:** MultiSelect binds `value` as an array of full item objects (`SelectItem[]`), while all other selection components (Toggle, Select, List, Tree) bind `value` as the extracted value-field primitive. This is inconsistent.

**Current behavior:**
- `value = $bindable<SelectItem[]>([])` — stores `[{ text: 'A', value: 'a' }, ...]`
- `onchange?.(newValues)` — passes array of full items
- Selection comparison uses both reference and itemValue matching

**Expected (consistent) behavior:**
- `value` should be an array of extracted primitives: `['a', 'c']`
- `onchange?.(extractedValues, fullItems)` — primitives first, full items second
- `isSelected` compares `proxy.itemValue` against value array entries

**Standard contract (all components):**
- `value` (bindable): extracted value-field primitive(s) — what you'd bind to an id/key
- `onchange`/`onselect`: `(value, item)` — primitive + full item for when you need the object

**What's needed:**
- [ ] Change `value` type from `SelectItem[]` to `unknown[]`
- [ ] Store extracted primitives in value array
- [ ] Update `onchange` signature to `(values: unknown[], items: SelectItem[])`
- [ ] Update `selectedItems` derivation to match by extracted value
- [ ] Update `toggleItemSelection` and `removeItem`
- [ ] Update tests

---

## 35. NestedController — Tree-style Focus Navigation

**Source:** List e2e test findings (2026-02-21)

**Problem:** NestedController's `expand(key)` only sets `proxy.expanded = true` — it doesn't move focus into children. Similarly, `collapse(key)` doesn't move focus to parent. Tree-style navigation (WAI-ARIA treeview pattern) expects:
- ArrowRight on expanded group → focus first child
- ArrowLeft on child → focus parent group

**Currently:** Both actions are no-ops when group is already in target state. The navigator's `expand`/`collapse` handlers return `true` but focus doesn't change.

**What's needed:**
- [ ] `expand(key)` when already expanded: call `moveNext()` or `moveToChild()` to focus first child
- [ ] `collapse(key)` when item is a child: move focus to parent group label
- [ ] Update navigator to handle the focus change after expand/collapse
- [ ] Add e2e tests for tree-style navigation in List and Tree

---

## ~~36. ListController / NestedController — Skip Disabled Items~~ DONE

Implemented in ListController. Added `disabled: 'disabled'` to `@rokkit/core` defaultFields, `#isDisabled(index)` helper, and updated all four movement methods (`moveNext`, `movePrev`, `moveFirst`, `moveLast`) to skip disabled items. NestedController inherits this behavior. 7 unit tests + 2 e2e tests verify the behavior.
