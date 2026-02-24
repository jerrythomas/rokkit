# Backlog: Forms

Priority 1 — `@rokkit/forms` enhancements.

**Source docs:** `docs/requirements/010-form.md`, `docs/design/010-form.md`

---

## 7. FormBuilder Recreated on Every Render

**Priority:** High

**Problem:** `FormRenderer` creates a new `FormBuilder` on every derivation: `let formBuilder = $derived(new FormBuilder(data, schema, layout))`. This loses validation state, lookup manager, and internal state on each data change.

**What's needed:**
- [ ] Use stable `FormBuilder` instance with reactive updates via `$effect`
- [ ] Only recreate on schema/layout changes, update data reactively

---

## 8. Legacy Component Migration

**Priority:** High

**Problem:** `DataEditor`, `FieldLayout`, `ListEditor`, `NestedEditor` use Svelte 4 patterns (`export let`, `createEventDispatcher`, `getContext('registry')`). These don't work properly in Svelte 5 apps.

**What's needed:**
- [ ] Migrate `FieldLayout` to Svelte 5 runes
- [ ] Enhance `FormRenderer` to handle nested `type: 'group'` elements recursively
- [ ] Replace `ListEditor` with List + FormRenderer composition
- [ ] Replace `NestedEditor` with Tree + FormRenderer composition

---

## 9. No Dirty Tracking

**Priority:** Medium

**Problem:** No mechanism to track which fields have been modified from initial values. Useful for "unsaved changes" warnings and conditional submit.

**What's needed:**
- [ ] Add `isDirty` / `dirtyFields` to `FormBuilder`
- [ ] Compare current values against initial snapshot
- [ ] `onDirtyChange` callback or reactive `dirty` state

---

## 12. Custom Type Renderer Registry

**Source:** docs/requirements/010-form.md §5, docs/design/010-form.md

**Phase:** 2 (after FormBuilder stability fix)

**What's needed:**
- [ ] Configurable registry mapping schema types + hints to UI components
- [ ] Support `renderer` field in layout to override default type resolution
- [ ] Custom renderers via `renderers` prop on `FormRenderer`

---

## 13. Validation Integration into FormRenderer

**Source:** docs/requirements/010-form.md §6, docs/design/010-form.md

**Priority:** High — Phase 1

**What's needed:**
- [ ] Wire `validateField()` into FormRenderer on blur
- [ ] `builder.validate()` runs `validateAll()` on submit
- [ ] `builder.isValid` and `builder.errors` derived properties
- [ ] Validation messages flow to InputField via `FormElement.props.message`

---

## 14. ValidationReport Component Migration

**Source:** docs/requirements/010-form.md §6.6

**Phase:** 2

**What's needed:**
- [ ] Migrate from archive to `@rokkit/forms` or `@rokkit/ui`
- [ ] Svelte 5, data-attributes, grouping by severity
- [ ] Click-to-focus-field support

---

## 15. InputToggle Component

**Source:** docs/requirements/010-form.md §9.2

**Phase:** 2

**What's needed:**
- [ ] Option toggle group for enums or booleans
- [ ] Wraps `@rokkit/ui` Toggle

---

## 16. FieldGroup Component (Nested Objects)

**Source:** docs/requirements/010-form.md §9.2

**Phase:** 2

**What's needed:**
- [ ] Renders nested `type: 'object'` as a sub-form section
- [ ] Recursive FormRenderer integration

---

## 17. ArrayEditor Component

**Source:** docs/requirements/010-form.md §9.2

**Phase:** 2

**What's needed:**
- [ ] List editor for `type: 'array'` with add/remove
- [ ] Composes List + FormRenderer

---

## 18. Enhanced Lookup System (Fetch/Filter Hooks)

**Source:** docs/requirements/010-form.md §7

**Phase:** 3

**What's needed:**
- [ ] Fetch hook pattern (async function replaces URL template)
- [ ] Filter hook pattern (client-side filtering of pre-loaded data)
- [ ] Cascading dependencies with disabled state

---

## 19. Form Submission Handling

**Source:** docs/requirements/010-form.md §14

**Phase:** 3

**What's needed:**
- [ ] `onsubmit` callback with validate-before-submit
- [ ] Loading state, success/error feedback
- [ ] Optional submit/reset buttons

---

## 20. Audit/System Field Metadata

**Source:** docs/requirements/010-form.md §10.4

**Phase:** 4

**What's needed:**
- [ ] `audit: true` and `generated: true` schema flags
- [ ] Read-only display in edit mode, excluded from add forms

---

## 21. Master-Detail View

**Source:** docs/requirements/010-form.md §10

**Depends on:** #7, #13, #9, #20

**Phase:** 4

**What's needed:**
- [ ] Two-column layout: List + FormRenderer
- [ ] SearchFilter, CRUD operations, dirty tracking warning
- [ ] Composes existing components

---

## 22. Semantic Command Input

**Source:** docs/requirements/010-form.md §11

**Phase:** 5 (future)

**What's needed:**
- [ ] Natural-language command input for CRUD operations
- [ ] Entity registry, command parser, autocomplete
- [ ] Composes Table + FormRenderer

---

## 60. Display-Only Schema Rendering

**Priority:** High — enables generic UI rendering for agent interactions

**Source:** `docs/requirements/010-form.md §18`, `docs/design/010-form.md`

**Cross-project:** Strategos backlog #15 (Human-in-the-Loop Interaction System) depends on this for rendering agent interaction requests.

### What exists
- `InfoField.svelte` — renders a single readonly value with label
- `FormRenderer` — renders schema+layout as input fields, with `readonly` layout prop routing to `InfoField`
- `FormBuilder` — merges schema + layout into renderable elements
- `@rokkit/ui` Table — data-driven table with columns, sort, selection

### What's needed

#### Display layout types
- [ ] New layout element types for display-only rendering:
  - `type: 'display-table'` — renders data array as a table with column definitions
  - `type: 'display-cards'` — renders data array as a card grid
  - `type: 'display-section'` — renders grouped key-value pairs (like a detail view)
  - `type: 'display-list'` — renders data array as a styled list
- [ ] Each type accepts a `columns` or `fields` definition specifying which data fields to show, labels, and format hints

#### Format hints for display values
- [ ] `format` property on display fields: `'currency'`, `'datetime'`, `'duration'`, `'number'`, `'badge'`, `'text'`, `'boolean'`
- [ ] `DisplayValue` component — renders a single value with format-aware formatting
- [ ] Format is a rendering concern only — no data transformation

#### Display components
- [ ] `DisplayTable.svelte` — wraps `@rokkit/ui` Table, accepts data array + column definitions from layout schema
- [ ] `DisplayCard.svelte` — renders a single data object as a card with field labels + formatted values
- [ ] `DisplayCardGrid.svelte` — renders array of cards in a responsive grid
- [ ] `DisplaySection.svelte` — renders grouped key-value pairs as a detail/summary section
- [ ] All components are schema-driven — receive data + display schema, no domain-specific props

#### FormRenderer integration
- [ ] `FormRenderer` recognizes `display-*` layout types and routes to display components
- [ ] Mixed layouts: a form can contain both input fields and display sections
- [ ] `FormBuilder.elements` supports display elements alongside input elements

#### Selection support for display components
- [ ] `DisplayTable` and `DisplayCardGrid` support optional selection (`select: 'one'` or `select: 'many'`)
- [ ] Selected items emitted via `onselect` callback or bindable `selected` prop

**Depends on:** #7 (FormBuilder stability), #47 Phase 1 (Table — done)

### Example usage patterns

See `docs/requirements/010-form.md §18` for full examples including:
1. Agent interaction: "Pick a flight" (select_one with table)
2. Agent interaction: "Review itinerary" (display sections)
3. Mixed layout: display data + input form
4. Card grid with selection
