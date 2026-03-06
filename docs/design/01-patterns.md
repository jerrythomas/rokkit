# Patterns

The core design patterns that run through every part of Rokkit. These patterns are the source of truth for decisions about new components, changes to existing ones, and how the library's pieces fit together. When in doubt, come back here.

---

## 1. Data-First Binding

The most fundamental pattern: **data flows in as-is; components adapt to it**.

Components never require data to be shaped in a particular way. The consumer passes their data directly — API responses, local state, static arrays — and declares how to read it via a `fields` mapping.

```
Consumer data (any shape)
        │
        ▼
   fields mapping         ← developer declares which fields mean what
        │
        ▼
   ProxyItem wrapper      ← resolves field names, nested paths
        │
        ▼
   Component render       ← reads label, value, icon, children
```

The corollary: **events return original data, not transformed data**. When an item is selected, the callback receives the original object — not a processed or re-shaped version. The consumer gave it; the consumer gets it back.

### What this means in practice

- No `map()` calls before passing to a component
- No adapter objects or view-models for display
- No reshaping just to get `{ label, value }` pairs
- Field mapping is the transformation — and it lives in one place

---

## 2. Field Mapping

Field mapping is the mechanism that implements data-first binding. It tells a component how to read its data without changing the data.

### Default conventions

Every selection component falls back to these field names if no mapping is provided:

| Role | Default field | Used for |
|------|--------------|---------|
| Label | `label` | Display text shown to the user |
| Value | `value` | Selection identifier |
| Icon | `icon` | Icon class or identifier |
| Children | `children` | Nested items (Tree, grouped lists) |
| Snippet | `snippet` | Named snippet for mixed item types |

### Custom mapping

```js
// String paths — field name or dot-path
fields = {
  label: 'fullName',
  value: 'userId',
  icon: 'avatarUrl',
  children: 'reports'   // nested field for Tree
}

// Function values — computed from the raw item
fields = {
  label: (item) => `${item.firstName} ${item.lastName}`,
  value: 'id',
  icon: (item) => item.active ? 'i-solar:check-circle-bold' : 'i-solar:close-circle-bold'
}

// Mixed — any field can be either
fields = {
  label: (item) => formatCurrency(item.price, 'USD'),
  value: 'sku',
  children: 'variants'
}
```

A field definition is either a **string** (field name or dot-path) or a **function** `(rawItem) => any`. ProxyItem normalises both to the same internal representation at construction time — callers never branch on the type.

### Nested field resolution

String field names can be dot-path strings. The resolution happens inside ProxyItem:

```js
fields = { label: 'profile.displayName' }
// resolves item.profile.displayName
```

Resolution is safe: if any segment of the path is absent or null, the result is `undefined` rather than an error.

### Normalisation strategy

All field definitions are converted to resolver functions at ProxyItem construction time:

```js
function toResolver(fieldDef) {
  if (typeof fieldDef === 'function') return fieldDef
  // string path → function
  return (item) => getPath(item, fieldDef)
}
```

This unifies the `get()` implementation — it always calls `resolvers[field](raw)` with no if/else. Adding computed fields costs nothing at read time; the branch happens once at construction.

### Per-item field overrides

An individual item can carry a `snippet` field (or whatever field is mapped to `snippet`) to opt into a different named snippet at render time. This is how a single list can contain headers, dividers, and items without separate components.

---

## 3. ProxyItem

ProxyItem is the runtime adapter between raw data and component rendering. Every item in a component is accessed through a proxy, not directly.

```
raw item object
       │
       ▼
  ProxyItem(item, fields)          ← normalises field defs to resolvers once
       │
   ┌───┼────────────────────┐
   ▼   ▼                    ▼
.label .value            .get('any-field')
  (resolver called)      .has('any-field')
```

### Construction — normalisation

At construction time, every field definition is converted to a resolver function:

```js
function toResolver(fieldDef) {
  if (typeof fieldDef === 'function') return fieldDef
  return (item) => getPath(item, fieldDef)   // string path → function
}

class ProxyItem {
  #resolvers
  #raw

  constructor(item, fields) {
    this.#raw = item
    this.#resolvers = Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [k, toResolver(v)])
    )
  }

  get(field) {
    const resolver = this.#resolvers[field] ?? toResolver(field)
    return resolver(this.#raw)
  }

  get label()    { return this.get('text') }
  get value()    { return this.get('value') }
  get icon()     { return this.get('icon') }
  get raw()      { return this.#raw }
}
```

No if/else at read time — `get()` always calls `resolver(raw)`. The type distinction between string paths and functions is resolved once at construction.

### Core API

| Member | What it returns |
|--------|----------------|
| `.label` | Value of the `label`-mapped field (string path or computed) |
| `.value` | Value of the `value`-mapped field (string path or computed) |
| `.icon` | Value of the `icon`-mapped field (string path or computed) |
| `.children` | Child ProxyItems (if nested) |
| `.expanded` | Expansion state (for Tree nodes) |
| `.get(field)` | Value of any field — calls resolver function for the field |
| `.has(field)` | Whether the resolved value exists and is non-null |
| `.raw` | The original, unmapped item |

### What counts as a valid field definition

| Form | Example | Behaviour |
|------|---------|-----------|
| String field name | `'fullName'` | `item.fullName` |
| Dot-path string | `'profile.name'` | `item.profile.name` |
| Function | `(item) => formatCurrency(item.price)` | called with raw item |
| Function combining fields | `(item) => [item.first, item.last].join(' ')` | full control |

### Why ProxyItem matters for snippets

When a developer provides a custom snippet, they receive a ProxyItem — not the raw item. This means:

1. The snippet works correctly regardless of the underlying field names or whether they are computed
2. The snippet can access any field it needs via `.get()`
3. Custom renders are as portable as the components themselves

---

## 4. Component API Convention

Every selection component in Rokkit exposes the same core set of props. This is a deliberate contract, not a coincidence.

### Standard props

| Prop | Type | Purpose |
|------|------|---------|
| `items` | `any[]` | The data array |
| `value` | `any` | The selected value (bindable) |
| `fields` | `FieldMapping` | Field name mapping |
| `onchange` | `(item) => void` | Called when selection changes |
| `disabled` | `boolean` | Disables the entire component |
| `class` | `string` | CSS class addition |

> **Note on naming**: Some components use `options` instead of `items` where the semantic is closer to "choices" (Select, MultiSelect). The intent is the same; both accept `any[]` and apply field mapping.

### What the convention enables

- A developer who uses `List` can pick up `Select` or `Tree` immediately
- Documentation needs one API table, not N separate ones
- Testing patterns for one component transfer to all others
- Field mapping, snippets, and keyboard navigation work identically

---

## 5. Snippet Composition

Snippets are the extensibility mechanism. They let consumers replace any rendered part of a component without touching component source and without losing built-in behavior.

```
Component
├── renders each item
│     └── ── checks: does itemContent snippet exist?
│                 ├── YES → calls snippet(proxy)
│                 └── NO  → renders default item layout
│
├── renders empty state
│     └── checks: does empty snippet exist?
│                 ├── YES → calls snippet()
│                 └── NO  → renders nothing (or default empty)
│
└── renders group headers (if grouped)
      └── checks: does groupHeader snippet exist?
```

### Named snippets for mixed types

An item can specify which snippet it wants by including a `snippet` field. This enables a single component to render headers, dividers, and regular items in the same pass:

```
┌──────────────────────────┐
│  item { snippet: null  } │ → itemContent snippet (or default)
│  item { snippet: 'hdr' } │ → header snippet
│  item { snippet: 'div' } │ → divider snippet
└──────────────────────────┘
```

### What snippets receive

Every snippet receives a ProxyItem for the current item, giving access to mapped fields, arbitrary fields via `.get()`, and the raw item via `.raw`. This keeps snippets portable across different data shapes.

### Partial overrides

Snippets target named slots. Providing one snippet does not affect others. A developer can replace only the icon rendering in a List without touching the item layout, the empty state, or the group header.

---

## 6. Data-Attribute Hooks

Every DOM element a component renders carries semantic data attributes. These are the styling contract — the stable surface that themes and application CSS targets.

```html
<!-- A selected, focused list item -->
<div
  data-list-item
  data-selected="true"
  data-focused="true"
  data-disabled="false"
  role="option"
  aria-selected="true"
>
```

### Attribute categories

| Category | Examples | Purpose |
|----------|---------|---------|
| Component identity | `data-list`, `data-select`, `data-tree` | Identifies the component type |
| Element identity | `data-list-item`, `data-tree-node` | Identifies element role within component |
| State | `data-selected`, `data-focused`, `data-disabled`, `data-expanded` | Reflects current interactive state |
| Variant | `data-variant="filled"` | Visual variant |
| Size | `data-size="sm"` | Size modifier |
| Density | `data-density="compact"` | Spacing mode |

### Why data attributes (not classes)

Classes are composable but semantically opaque. Data attributes carry meaning — `[data-selected="true"]` is unambiguous in intent and in CSS. They also play naturally with ARIA (many ARIA attributes mirror the same state), and they make theming CSS self-documenting.

```css
/* Theme CSS — reads like documentation */
[data-list-item][data-selected="true"] {
  background: var(--color-primary-z2);
}

[data-list-item][data-focused="true"] {
  outline: 2px solid var(--color-primary-500);
}
```

---

## 7. Controller Pattern

Selection components separate **state management** from **rendering**. The controller holds state; the component renders it.

```
┌──────────────┐       ┌──────────────────────┐
│  Component   │──────►│  ListController or   │
│  (renders)   │       │  NestedController    │
│              │◄──────│  (manages state)     │
│  items       │       │                      │
│  focusedKey  │       │  selectedKeys        │
│  selectedKey │       │  focusedKey          │
└──────────────┘       │  moveNext/Prev       │
                       │  select/extend       │
                       │  expand/collapse     │
                       └──────────────────────┘
```

### ListController

Manages flat selection state:
- `selectedKeys` — the set of selected item keys
- `focusedKey` — the currently keyboard-focused item
- `moveNext()`, `movePrev()`, `moveFirst()`, `moveLast()` — navigation
- `select(key)` — set selection
- `extendSelection(key)` — multi-select extend
- `toggleSelection(key)` — toggle for multi-select

### NestedController

Extends ListController for hierarchical data:
- All ListController capabilities, plus:
- `expandedKeys` — which nodes are currently open
- `expand(key)` / `collapse(key)` — explicit control
- `toggleExpansion(key)` — toggle
- `ensureVisible(key)` — expand ancestors to reveal an item

### Controller is the source of truth for focus

The navigator action and the component both read from the same controller. There is no separate focus tracking in the component — the controller's `focusedKey` drives both the ARIA state and the CSS `data-focused` attribute.

---

## 8. Navigator Action Pattern

The `use:navigator` action connects keyboard interaction to controller state. It is a Svelte action applied to the container element of a navigable component.

```
Container element
  │  use:navigator={{ controller, orientation, nested }}
  │
  ├── Keyboard events → navigator → controller.moveNext() etc.
  │
  └── Click events → navigator → controller.select(key)
```

### How it works

```
┌─────────────────────────────────────────────────┐
│  navigable (low-level)                          │
│  Listens: keydown events                        │
│  Emits: previous, next, first, last,            │
│          select, expand, collapse               │
└─────────────────┬───────────────────────────────┘
                  │ semantic events
┌─────────────────▼───────────────────────────────┐
│  navigator (high-level)                         │
│  Receives: semantic events                      │
│  Applies: controller methods                    │
│  Manages: scrollFocusedIntoView()               │
│  Handles: click vs keyboard discrimination      │
└─────────────────────────────────────────────────┘
```

### The data-path convention

Navigator finds navigable items by looking for elements with a `data-path` attribute. Items without `data-path` are invisible to navigation — this is how separators and spacers are excluded without special configuration.

```html
<div data-list>                        ← container: use:navigator applied here
  <div data-list-item data-path="1">  ← navigable
  <div data-list-separator>           ← skipped (no data-path)
  <div data-list-item data-path="2">  ← navigable
</div>
```

### Key mapping by orientation

| Key | Vertical (default) | Horizontal |
|-----|-------------------|------------|
| ArrowUp / ArrowDown | previous / next | — |
| ArrowLeft / ArrowRight | collapse / expand (nested) | previous / next |
| Home / End | first / last | first / last |
| Enter / Space | select | select |

RTL reverses the meaning of ArrowLeft/ArrowRight in horizontal mode.

---

## 9. Theme Architecture Pattern

Theming is pure CSS. Components carry no visual opinions — they only annotate the DOM. Themes read those annotations.

```
Component (no visual styles)
  │  annotates DOM with data-attributes
  ▼
Theme CSS file (targets data-attributes)
  │  reads CSS variables for colors, spacing
  ▼
Skin (defines CSS variables for color roles)
  │  maps: primary, secondary, surface, accent
  ▼
Mode (dark/light: inverts the variable values)
```

### The three-layer separation

```
┌──────────────────────────────────────┐
│  Skin layer                          │
│  data-palette="skin-sea-green"       │
│  → sets CSS variable values          │
│    (--color-primary-*, etc.)         │
├──────────────────────────────────────┤
│  Mode layer                          │
│  data-mode="dark"                    │
│  → selects light or dark palette     │
│    values (z-index inversion)        │
├──────────────────────────────────────┤
│  Style layer                         │
│  data-style="rokkit" | "minimal"     │
│  → controls shape, spacing, shadows  │
│    (component visual personality)    │
└──────────────────────────────────────┘
```

### Semantic color scale (z-index system)

Instead of specific shade numbers, theme CSS uses semantic z-indexed references:

- `bg-surface-z1` through `bg-surface-z10`
- z1 = lightest in light mode, darkest in dark mode
- z10 = darkest in light mode, lightest in dark mode

This means a theme written once works correctly in both color modes without any conditional logic.

### What component authors do

1. Apply `data-*` attributes for every meaningful element and state
2. Use semantic color shortcuts (`bg-surface-z2`) — never hardcoded colors
3. Never import or apply CSS inside a component — that lives in theme files

---

## 10. Composition Over Configuration

Components do one job. They do not absorb adjacent features.

### Anti-pattern: feature creep

```svelte
<!-- ❌ Don't do this -->
<List
  items={data}
  searchable={true}
  filterable={true}
  sortable={true}
  paginated={true}
  header="My List"
/>
```

This couples unrelated concerns, makes each harder to test, and locks developers into List's opinions about search UX, sort UI, and pagination layout.

### Pattern: composition

```svelte
<!-- ✅ Do this -->
<Panel>
  {#snippet header()}
    <SearchFilter bind:query onfilter={handleFilter} />
  {/snippet}

  <List items={filteredItems} bind:value />

  {#snippet footer()}
    <Pagination {total} bind:page />
  {/snippet}
</Panel>
```

Each component does its job. They are wired together by the consumer. The consumer controls the UX, not List.

### The rule

> If a feature is independently useful, it belongs in a separate component. A component should be completable (not need the feature to work) and composable with the feature added externally.

---

## 11. Accessibility Pattern

Accessibility is built into every component via two parallel systems: ARIA attributes and data-attribute styling hooks.

### Every interactive component provides

| What | How |
|------|-----|
| Correct ARIA role | Applied to root and item elements |
| Selection state | `aria-selected` mirrors `data-selected` |
| Expansion state | `aria-expanded` mirrors `data-expanded` |
| Disabled state | `aria-disabled` mirrors `data-disabled` |
| Focus management | Controller's `focusedKey` drives `aria-activedescendant` or direct focus |
| Keyboard navigation | via `use:navigator` — no per-component keyboard code |

### The dual-attribute principle

State is always expressed in both ARIA and data-attributes simultaneously:

```html
<div
  data-selected="true"   ← CSS target
  aria-selected="true"   ← screen reader
>
```

This ensures that visual state (from CSS) and semantic state (for screen readers) are always in sync. A component never updates one without the other.

---

## 12. State Reactivity Pattern

Rokkit is built on Svelte 5 runes. The reactivity patterns follow specific conventions.

### Bindable value prop

Selection components expose `value` as a bindable prop using Svelte 5's `$bindable()`. This means:
- Consumer can use `bind:value` for two-way sync
- Consumer can also listen to `onchange` for explicit event handling
- Both work; using one does not preclude the other

### Controller as reactive state

Controllers use Svelte 5 `$state` internally. The component reads from the controller reactively:

```
controller.focusedKey changes ($state)
    → component template re-renders the affected item
    → data-focused attribute updates
    → aria-activedescendant updates
```

### Effect isolation

`$effect` blocks in components are scoped to side effects only — scroll management, DOM focus, size observation. They never update state directly, only respond to state changes.

### Map reactivity limitation

Svelte 5 cannot track reactivity through a `$derived` Map into nested `$state` properties. When a component needs to track per-item boolean state (like expanded), maintain a separate `$state<Record<string, boolean>>` as the template's source of truth and sync it manually after mutations. See the expansion pattern in List and Tree.

---

## 13. Package Dependency Order

Packages have a strict one-directional dependency. No package may import from a package above it in this hierarchy.

```
@rokkit/core
      │  Field mapping, types, skin definitions, utilities
      ▼
@rokkit/states
      │  ProxyItem, ListController, NestedController, vibe store
      ▼
@rokkit/actions
      │  navigator, navigable, dismissable, ripple, hoverLift, magnetic
      ▼
@rokkit/data
      │  filter, search, transform, rollup utilities
      ▼
@rokkit/ui
      │  All UI components
      ▼
@rokkit/forms
      │  FormRenderer, FormBuilder, field types
@rokkit/chart
      │  BarChart, LineChart, Sparkline, AnimatedChart
      ▼
@rokkit/themes
      │  CSS theme files, skin CSS, icon definitions
@rokkit/icons
         Icon collections
```

This order is enforced. `@rokkit/ui` never imports from `@rokkit/forms`. `@rokkit/states` never imports from `@rokkit/ui`.

---

## 14. New Component Checklist

When designing or implementing a new component, verify it meets every pattern:

### Data binding
- [ ] Accepts `items` (or `options`) as `any[]`
- [ ] Accepts `fields` for field mapping with sensible defaults
- [ ] Renders via ProxyItem, not direct field access
- [ ] Emits original items (not transformed) in events

### API consistency
- [ ] Exposes `value` / `bind:value` if it is a selection component
- [ ] Exposes `onchange` callback
- [ ] Exposes `disabled` boolean
- [ ] Accepts `class` for extension

### Snippet composition
- [ ] Provides `itemContent` snippet slot for item customization
- [ ] Provides `empty` snippet slot for empty state
- [ ] Dispatches to named snippets when item has `snippet` field

### Accessibility
- [ ] Root element has correct ARIA role
- [ ] Items have correct ARIA role
- [ ] State attributes: `aria-selected`, `aria-expanded`, `aria-disabled`
- [ ] Uses `use:navigator` for keyboard (no manual key handling)
- [ ] Focus management is controller-driven

### Styling
- [ ] Root element has `data-[component]` attribute
- [ ] Items have `data-[component]-item` attribute
- [ ] All interactive states reflected as data attributes
- [ ] No hardcoded colors or spacing in component
- [ ] No CSS inside the component file

### Testing
- [ ] Unit tests for selection behavior
- [ ] Unit tests for field mapping
- [ ] Unit tests for keyboard navigation
- [ ] E2E test with a realistic usage example
