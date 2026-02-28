# List Component Design

> Design for the data-driven List component using the ProxyItem + Wrapper + Navigator stack.
> This design supersedes the old NestedController-based approach.

## Architecture Overview

```
┌──────────────────────────────────────────────────┐
│  List.svelte  (renders only)                     │
│                                                  │
│  wrapper = new ListWrapper(items, fields, opts)  │
│                                                  │
│  use:navigator={{ wrapper, collapsible }}        │
│                                                  │
│  {#each wrapper.flatView as node (node.key)}     │
│    render node based on type / hasChildren       │
│  {/each}                                         │
└───────────────────────┬──────────────────────────┘
                        │ wrapper.flatView ($derived)
                        ▼
┌──────────────────────────────────────────────────┐
│  ListWrapper  (state + navigation logic)         │
│                                                  │
│  #lookup  Map<key, ProxyItem>                    │
│  #roots   ProxyNode[]                            │
│                                                  │
│  flatView = $derived(buildFlatView(#roots))      │
│    ↑ re-derives when any proxy.expanded changes  │
│                                                  │
│  #focusedKey = $state(null)                      │
│  #navigable  = $derived(flatView.filter(...))    │
└───────────────────────┬──────────────────────────┘
                        │ proxy tree
                        ▼
┌──────────────────────────────────────────────────┐
│  ProxyItem  (per-item reactive model)            │
│                                                  │
│  #raw    — original item, never mutated          │
│  #item   — normalised for field access           │
│  #expanded = $state(false)                       │
│  #selected = $state(false)                       │
│  #children = $derived(buildChildren())           │
│                                                  │
│  key     string   — '0', '0-0', '0-0-1'         │
│  level   number   — equals key.split('-').length │
│  text, value, icon, href, snippet, disabled, ... │
└──────────────────────────────────────────────────┘
```

**The key insight**: ProxyItem IS the reactive model. It owns `expanded` and `selected` as
Svelte `$state`. No separate `expandedKeys` SvelteSet or sync functions needed.
`buildFlatView` reads `proxy.expanded` directly, so `$derived(buildFlatView(roots))`
re-computes automatically when any group is expanded or collapsed.

---

## Layer 1: ProxyItem  (`packages/testbed/src/proxy/proxy.svelte.js`)

Wraps a raw item (object or primitive) and provides:

| Property | Type | Description |
|----------|------|-------------|
| `key` | `string` | Path identifier: `'0'`, `'0-1'`, `'0-1-2'`. Invariant: `level === key.split('-').length` |
| `level` | `number` | Nesting depth. 1 = root, 2 = first children, 3 = grandchildren |
| `text` | `string` | Display text via `fields.text` mapping (default key: `'label'`) |
| `value` | `unknown` | Item value via `fields.value`, falls back to raw item |
| `icon` | `string?` | Icon class name |
| `href` | `string?` | Navigation URL — renders as `<a>` when set |
| `snippet` | `string?` | Custom snippet name for rendering overrides |
| `disabled` | `boolean` | Whether item is non-interactive |
| `hasChildren` | `boolean` | True for object items with a non-empty children array |
| `children` | `ProxyItem[]` | Wrapped child items (auto-derived, stable references) |
| `type` | `'item' \| 'group' \| 'separator' \| 'spacer'` | Item classification |
| `expanded` | `boolean` | `$state` — reads/writes internal state; syncs to raw item when field present |
| `selected` | `boolean` | `$state` — same dual-mode as `expanded` |

Field mapping defaults (in `constants.js`):
```js
{ text: 'label', value: 'value', icon: 'icon', href: 'href',
  description: 'description', children: 'children', type: 'type',
  disabled: 'disabled', expanded: 'expanded', selected: 'selected', snippet: 'snippet' }
```

### Primitive Items

Strings and numbers are valid items. The proxy normalises them to
`{ [fields.text]: raw, [fields.value]: raw }` internally. This means all accessors
work uniformly without any special-casing (`proxy.text`, `proxy.value`, `proxy.get('icon')`
all function correctly).

### `get(fieldName)`

Pure field mapper: `item[fields[fieldName] ?? fieldName]`. For mapped attributes only
(text, value, icon, href, description, badge, etc.). Control state (`expanded`, `selected`)
and computed props (`type`, `hasChildren`, `disabled`) are accessed directly as properties.

---

## Layer 2: buildProxyList + buildFlatView  (`packages/testbed/src/proxy/proxy.svelte.js`)

### `buildProxyList(items, fields?)`

Creates the stable proxy tree from a raw items array:

```js
const { lookup, roots } = buildProxyList(items, fields)
// lookup: Map<key, ProxyItem>  — O(1) access by key
// roots:  ProxyNode[]          — { key, proxy, children: ProxyNode[] }
```

- Root items get keys `'0'`, `'1'`, `'2'`, … and level `1`
- Children propagate keys (`'0-0'`, `'0-1'`) and levels automatically
- **Proxies are stable** — created once, never recreated. This is the invariant that makes
  `$derived(buildFlatView(roots))` work: the `$state` signals inside each ProxyItem remain
  the same objects, so reactive subscriptions stay valid across re-computations.

### `buildFlatView(nodes)`

Returns the ordered visible list of nodes:

```js
// Returns: { key, proxy, level, hasChildren, type }[]
// - Includes ALL root-level items (groups appear as group headers)
// - Includes children of expanded groups (recursively)
// - Reads proxy.expanded — registers reactive dependency
// - Separators/spacers appear for rendering; skipped by navigation
```

---

## Layer 3: ListWrapper  (`packages/testbed/src/wrapper/list-wrapper.svelte.js`)

Implements the `IWrapper` interface. Navigator calls `wrapper[action](path)` for all actions.

### State

| Field | Type | Description |
|-------|------|-------------|
| `flatView` | `FlatViewNode[]` | `$derived` — re-derives when any proxy.expanded changes |
| `#focusedKey` | `$state(null)` | Key of focused item (Navigator reads this for scroll) |
| `#navigable` | `$derived` | flatView filtered: excludes separator/spacer/disabled |
| `#lookup` | `Map<key, ProxyItem>` | O(1) access for select/toggle |

### Method Behaviour

**Movement (path ignored, uses `focusedKey`):**

| Method | Behaviour |
|--------|-----------|
| `next()` | Advance to next navigable item; clamp at end |
| `prev()` | Go back; clamp at start |
| `first()` | Focus first navigable item |
| `last()` | Focus last navigable item |
| `expand()` | On collapsed group: open it. On already-open group: move to first child. On leaf: no-op |
| `collapse()` | On open group: close it. Otherwise: move to parent (strip last key segment) |

**Selection:**

| Method | Behaviour |
|--------|-----------|
| `select(path)` | Group → toggle expanded. Leaf → fire `onselect(value, proxy)` |
| `toggle(path)` | Flip `proxy.expanded` (accordion-trigger click pattern) |
| `moveTo(path)` | Update `focusedKey` — called by Navigator on `focusin` and typeahead match |
| `cancel()` | No-op for persistent list (override in dropdown wrappers) |
| `blur()` | No-op for persistent list (override in dropdown wrappers) |
| `extend()` | Multiselect toggle — deferred |
| `range()` | Multiselect range — deferred |

**Typeahead:**

`findByText(query, startAfterKey)` — searches navigable items (case-insensitive prefix match),
wraps around, returns key or null.

### Constructor

```js
const wrapper = new ListWrapper(items, fields, {
  onselect: (value, proxy) => { ... }
})
```

---

## Layer 4: List.svelte  (thin rendering layer)

The component has three responsibilities:
1. Create the `ListWrapper` with item data and callbacks
2. Mount `use:navigator` on the container element
3. Sync `wrapper.focusedKey` → DOM `.focus()` via `$effect`

### Template structure (flat loop)

```svelte
<nav data-list use:navigator={{ wrapper, collapsible }}>
  {#each wrapper.flatView as node (node.key)}
    {@const proxy = node.proxy}

    {#if node.type === 'separator'}
      <hr data-list-separator role="separator">
    {:else if node.type === 'spacer'}
      <div data-list-spacer></div>
    {:else if node.hasChildren}
      <button data-list-group data-path={node.key}
              data-accordion-trigger data-level={node.level}
              aria-expanded={proxy.expanded}>
        {proxy.text}
      </button>
    {:else if proxy.href}
      <a href={proxy.href} data-list-item data-path={node.key}
         data-level={node.level} data-active={isActive || undefined}>
        {proxy.text}
      </a>
    {:else}
      <button type="button" data-list-item data-path={node.key}
              data-level={node.level} data-active={isActive || undefined}>
        {proxy.text}
      </button>
    {/if}
  {/each}
</nav>
```

**What's gone vs. the old `List.svelte`:**

| Removed | Why |
|---------|-----|
| `syncExpandedToController()` | ProxyItem owns expansion state directly |
| `deriveExpandedFromController()` | Template reads `proxy.expanded` directly |
| `handleSelectAction()` / `handleFocusIn()` | Navigator calls wrapper methods directly |
| `toggleGroupByKey()` / `isGroupExpandedByKey()` | `proxy.expanded` is the source of truth |
| Nested `{#each}` for group children | `flatView` already expands groups inline |
| `expandedByPath` / `Record<string, boolean>` | No longer needed |
| `controller.expandedKeys` sync glue | ProxyItem is the controller |
| ~150 lines of wiring | Now ~15 lines |

### DOM Focus Sync (`$effect`)

After keyboard navigation updates `wrapper.focusedKey`, the component focuses the DOM element:

```js
$effect(() => {
  const key = wrapper.focusedKey
  if (!key || !listRef) return
  const el = listRef.querySelector(`[data-path="${key}"]`)
  if (el && el !== document.activeElement) {
    el.focus()
    el.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
  }
})
```

The Navigator also calls `scrollFocusedIntoView()` after keyboard actions, so in practice
both the focus and the scroll are handled.

---

## Keys → Actions → Wrapper Methods

| Keys | Action | Wrapper method | Behaviour |
|------|--------|----------------|-----------|
| ArrowDown | `next` | `wrapper.next(path)` | Focus next navigable item |
| ArrowUp | `prev` | `wrapper.prev(path)` | Focus prev navigable item |
| Home | `first` | `wrapper.first(path)` | Focus first navigable item |
| End | `last` | `wrapper.last(path)` | Focus last navigable item |
| ArrowRight | `expand` | `wrapper.expand(path)` | Expand group or enter it |
| ArrowLeft | `collapse` | `wrapper.collapse(path)` | Collapse group or go to parent |
| Enter / Space | `select` | `wrapper.select(path)` | Select leaf or toggle group |
| Click (plain) | `select` | `wrapper.select(path)` | Same as Enter |
| Click (group btn) | `toggle` | `wrapper.toggle(path)` | Flip expansion (accordion) |
| Ctrl+Space | `extend` | `wrapper.extend(path)` | Multiselect toggle (deferred) |
| Shift+Space | `range` | `wrapper.range(path)` | Multiselect range (deferred) |
| Escape | `cancel` | `wrapper.cancel(path)` | No-op for persistent list |
| Printable char | typeahead | `wrapper.findByText(q, k)` → `moveTo` | Jump to matching item |

---

## Data Attributes

| Attribute | Element | Value | Purpose |
|-----------|---------|-------|---------|
| `data-path` | Every focusable item | `'0'`, `'0-0'`, … | Navigator click detection + scroll target |
| `data-level` | Every item | integer ≥ 1 | CSS indentation (`padding-left: calc(var(--level) * 1.25rem)`) |
| `data-list-item` | Leaf items (`<a>`, `<button>`) | (present) | Theme + CSS selector |
| `data-list-group` | Group headers | (present) | Theme + CSS selector |
| `data-accordion-trigger` | Group headers | (present) | Navigator: dispatch `toggle` instead of `select` on click |
| `data-list-separator` | Separator dividers | (present) | Rendered but never focused |
| `data-list-spacer` | Spacer items | (present) | Rendered but never focused |
| `data-active` | Active leaf item | (present or absent) | Highlight current route / selection |
| `data-disabled` | Disabled items | (present or absent) | Visual + functional disabled state |

---

## Component Props

Minimal first pass (extend incrementally once proven):

```ts
interface ListProps {
  items?: unknown[]
  fields?: Partial<FieldConfig>   // maps semantic names to raw data keys
  value?: unknown                  // active item — matched via proxy.value === value
  collapsible?: boolean            // enable expand/collapse (adds ArrowLeft/Right bindings)
  onselect?: (value: unknown, proxy: ProxyItem) => void
  class?: string
}
```

**Future props (deferred):**
- `multiselect` + `selected` bindable (extend/range support)
- `expanded` bindable (sync proxy.expanded ↔ external state)
- `item` snippet (custom item rendering)
- `groupLabel` snippet (custom group header rendering)
- `icons` (custom expand/collapse icons)
- `size` variant
- `disabled` (disable entire list)

---

## Reactive Chain

```
wrapper.flatView ($derived)
  ← buildFlatView(#roots)
      ← proxy.expanded ($state) for each group
            ← wrapper.expand() / collapse() / select() / toggle()
                  ← Navigator calls wrapper[action](path)
                        ← keydown / click DOM events
```

No manual events. No sync functions. The ProxyItem `$state` drives everything.

---

## Files Reference

| File | Package | Status |
|------|---------|--------|
| `src/proxy/proxy.svelte.js` | `@rokkit/testbed` | ✅ Done (100% coverage) |
| `src/navigator/keymap.js` | `@rokkit/testbed` | ✅ Done (100% coverage) |
| `src/navigator/wrapper.js` | `@rokkit/testbed` | ✅ Done (100% coverage) |
| `src/navigator/navigator.js` | `@rokkit/testbed` | ✅ Done (100% coverage) |
| `src/wrapper/list-wrapper.svelte.js` | `@rokkit/testbed` | 🔨 In progress |
| `src/ui/List.svelte` | `@rokkit/testbed` | 🔨 In progress |
| `src/components/List.svelte` | `@rokkit/ui` | ⏸ Existing (keep until complete) |
| `src/components/List.new.svelte` | `@rokkit/ui` | 📋 Planned |

**Promotion path** (when design is proven):
1. Move `ProxyItem`, `buildProxyList`, `buildFlatView` → `packages/states`
2. Move `Wrapper`, `Navigator`, `ListWrapper` → `packages/actions` / `packages/states`
3. Update `List.new.svelte` imports → production packages
4. Delete old `List.svelte`; rename `List.new.svelte` → `List.svelte`
