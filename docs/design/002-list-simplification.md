# Design: List Component Simplification

## Goal

Reduce List.svelte from ~460 lines to ~100 lines by letting `NestedController` + `use:navigator`
own all navigation logic. The component only renders — it never drives state.

## Problem with the current implementation

Current List has accumulated sync glue between the controller and template:
- `syncExpandedToController()` — pushes external `expanded` prop into controller
- `deriveExpandedFromController()` — pulls controller state back out to bindable `expanded`
- `$effect` + custom `action` event listener — reacts to navigator events to focus DOM elements
  and fire `onselect`, `onexpandedchange` callbacks
- Manual `handleSelectAction()`, `handleFocusIn()`, `toggleGroupByKey()` etc.

The controller already owns all of this logic. The component was re-implementing it.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  List.svelte  (renders only)                                │
│                                                             │
│  props: items, value, fields, collapsible, ...             │
│                                                             │
│  controller = new NestedController(items, value, fields)    │
│                                                             │
│  use:navigator={{ wrapper: controller,                      │
│                   orientation: 'vertical',                  │
│                   nested: collapsible }}                    │
│                                                             │
│  {#each controller.data as node}   ← reactive, auto-       │
│    render node                       re-derives when       │
│  {/each}                             expandedKeys changes  │
└─────────────────────────────────────────────────────────────┘
         │                        │
         │ calls                  │ reads
         ▼                        ▼
┌─────────────────┐    ┌──────────────────────────┐
│   navigator     │    │   NestedController        │
│   action        │    │                           │
│                 │    │  expandedKeys: SvelteSet  │
│  keydown →      │    │  focusedKey: $state       │
│  getKeyboard    │    │  selectedKeys: SvelteSet  │
│  Action() →     │───▶│                           │
│  handler[action]│    │  data = $derived(         │
│  (path)         │    │    flatVisibleNodes(      │
│                 │    │      items, fields,       │
│  click →        │    │      expandedKeys))       │
│  getClickAction │    │                           │
│  () → handler   │    │  lookup = $derived(       │
│  (path)         │    │    deriveLookupWithProxy) │
└─────────────────┘    └──────────────────────────┘
```

**Reactive chain:**
```
expandedKeys (SvelteSet) ──→ controller.data ($derived) ──→ {#each} re-renders
focusedKey ($state)      ──→ $effect: el.focus()
selectedKeys (SvelteSet) ──→ template reads .has(key)
```

No manual events. No sync functions. Controller is mutated by navigator; Svelte re-renders
because all controller state is reactive.

---

## Keys → Actions → Controller Functions

| Keys | Navigator action | Controller function | Behaviour |
|------|-----------------|---------------------|-----------|
| ArrowDown | `next` | `controller.moveNext()` | Move focus to next visible item (skips disabled). If at end, stay. |
| ArrowUp | `prev` | `controller.movePrev()` | Move focus to previous visible item (skips disabled). If at start, stay. |
| ArrowRight | `expand` | `controller.expand(key)` | On collapsed group: add to `expandedKeys`. On already-expanded group: move focus to first child. On leaf: no-op. |
| ArrowLeft | `collapse` | `controller.collapse(key)` | On expanded group: remove from `expandedKeys`. On collapsed group or leaf: move focus to parent. At root level: no-op. |
| Enter / Space | `select` | `controller.select(path)` | `moveTo(path)` + `selectedKeys.clear()` + `selectedKeys.add(path)`. For `<a href>` items the navigator lets native click through instead. |
| Home | `first` | `controller.moveFirst()` | Focus first non-disabled visible item. |
| End | `last` | `controller.moveLast()` | Focus last non-disabled visible item. |
| Ctrl+A | *(future)* | `controller.selectAll()` | Multiselect: select all visible items. |
| Click (plain) | `select` | `controller.select(path)` | Same as Enter. For `<a href>`: navigator updates state but lets native navigation through. |
| Ctrl+Click | `extend` | `controller.extendSelection(path)` | Multiselect toggle. Single-select: same as select. |
| Shift+Click | `range` | `controller.selectRange(path)` | Multiselect range. Single-select: same as select. |
| Click on toggle btn | `toggle` | `controller.toggleExpansion(path)` | Flip expansion state regardless of whether it was open or closed. |
| Printable char | *(typeahead)* | `controller.findByText(buf)` then `moveTo` | Jump to first item whose text starts with typed chars. |

---

## Controller Function Specifications

### `moveNext()`
1. Reads `controller.data` (flat visible nodes, already derived).
2. Finds current index from `focusedKey`.
3. Scans forward, skipping disabled items and items with no `data-path` (separators).
4. Calls `moveToIndex(i)` → updates `focusedKey`.

### `movePrev()`
1. Same as `moveNext()` but scans backward.

### `expand(key?)`
1. `key = key ?? focusedKey`
2. Look up item via `controller.lookup`.
3. If item has no children → return `false` (leaf, no-op).
4. If `expandedKeys.has(key)` → already open → `moveTo(key + '-0')` (focus first child).
5. Else → `expandedKeys.add(key)` → `controller.data` re-derives → children appear.

### `collapse(key?)`
1. `key = key ?? focusedKey`
2. If `expandedKeys.has(key)` → `expandedKeys.delete(key)` → children disappear.
3. Else (leaf or already-collapsed group) → derive parent key by removing last segment
   (`'1-2-0'` → `'1-2'`) → `moveTo(parentKey)`.
4. At root level with no parent → no-op.

### `toggleExpansion(key?)`
1. Used by explicit toggle buttons (not keyboard).
2. If `expandedKeys.has(key)` → delete. Else → add.

### `select(path?)`
1. `path = path ?? focusedKey`
2. `moveTo(path)` → updates `focusedKey` and `#currentIndex`.
3. `selectedKeys.clear()` + `selectedKeys.add(path)`.
4. Does NOT fire `onselect` — that is the component's responsibility (via a simple
   `$effect` watching `selectedKeys`, or via the `onselect` prop called after navigator
   emits `action:select`).

### `moveTo(key: string)`
1. Find index in `controller.data` where `node.key === key`.
2. `#currentIndex = index`.
3. `focusedKey = key`.
4. Returns `true` if found, `false` if key not in visible data.

### `moveToValue(value)`
1. Used when the external `value` prop changes.
2. Scans `controller.data` for the node whose `proxy.itemValue === value`.
3. Calls `ensureVisible(value)` to expand ancestor groups.
4. Calls `moveTo(key)` to focus that item.

---

## FlatNode Interface

`controller.data` (from `flatVisibleNodes`) currently yields `{ key, value }`.

The level is derivable from the key: `key.split('-').length - 1`.

```ts
interface FlatNode {
  key: string    // path key: '0', '0-2', '1-3-1'
  value: unknown // original item object
}

// Derived cheaply in template:
level     = node.key.split('-').length - 1
isGroup   = new ItemProxy(node.value, fields).hasChildren
isExpanded = controller.expandedKeys.has(node.key)   // SvelteSet — reactive
isFocused  = node.key === controller.focusedKey        // $state — reactive
isSelected = controller.selectedKeys.has(node.key)    // SvelteSet — reactive
isActive   = proxy.itemValue === value                 // prop comparison — reactive
```

We deliberately avoid putting `isFocused`/`isSelected`/`isActive` into `flatVisibleNodes`
so that a focus change does not cause the entire list to re-derive.

---

## Component Interface (props)

Minimal for the POC; can be extended after validation:

```ts
interface ListProps {
  items?: ListItem[]           // data
  fields?: ListFields          // field mapping
  value?: unknown              // active/selected item value (for highlighting)
  collapsible?: boolean        // enable expand/collapse (nested: true in navigator)
  onselect?: (value, item) => void  // fires when button item is selected
  class?: string
}
```

`expanded`, `selected`, `multiselect`, `active`, `icons`, `item` snippet etc. can be added
incrementally once the core pattern is proven.

---

## Component Skeleton (POC)

```svelte
<script lang="ts">
  import { NestedController } from '@rokkit/states'
  import { navigator } from '@rokkit/actions'
  import { ItemProxy } from '../types/item-proxy.js'

  let { items = [], fields, value, collapsible = false, onselect, class: className = '' } = $props()

  // ── Controller ───────────────────────────────────────────────
  // Single source of truth. Navigator calls its methods; Svelte reacts to its state.
  let controller = new NestedController(items, value, fields, {})
  let listRef = $state<HTMLElement | null>(null)

  // Sync external value → controller (e.g. after SvelteKit navigation)
  $effect(() => { controller.moveToValue(value) })

  // Sync controller.focusedKey → DOM focus (keyboard nav moves focus)
  $effect(() => {
    const key = controller.focusedKey
    if (!key || !listRef) return
    const el = listRef.querySelector(`[data-path="${key}"]`) as HTMLElement | null
    if (el && el !== document.activeElement) {
      el.focus()
      el.scrollIntoView({ block: 'nearest' })
    }
  })

  // Sync DOM focus → controller (tab into list, or click)
  function handleFocusIn(event: FocusEvent) {
    const path = (event.target as HTMLElement).closest('[data-path]')
      ?.getAttribute('data-path')
    if (path) controller.moveTo(path)
  }

  // Fire onselect for button items when controller selection changes
  $effect(() => {
    const key = controller.focusedKey
    if (!key || controller.selectedKeys.size === 0) return
    const proxy = controller.lookup.get(key)
    if (!proxy) return
    const ip = new ItemProxy(proxy.value, fields)
    if (!ip.hasChildren && !ip.get('href')) {
      onselect?.(ip.itemValue, proxy.value)
    }
  })
</script>

<nav
  bind:this={listRef}
  data-list
  class={className || undefined}
  onfocusin={handleFocusIn}
  use:navigator={{ wrapper: controller, orientation: 'vertical', nested: collapsible }}
>
  {#each controller.data as node (node.key)}
    {@const proxy = new ItemProxy(node.value, fields)}
    {@const level = node.key.split('-').length - 1}
    {@const isActive = proxy.itemValue === value}
    {@const isExpanded = controller.expandedKeys.has(node.key)}
    {@const href = proxy.get<string>('href')}

    {#if proxy.hasChildren}
      <!-- Group header -->
      <button
        type="button"
        data-list-group-label
        data-path={node.key}
        style:padding-left="{level * 1.5}rem"
        aria-expanded={isExpanded}
      >
        {proxy.text}
      </button>
    {:else if href}
      <!-- Navigation link -->
      <a
        {href}
        data-list-item
        data-path={node.key}
        style:padding-left="{level * 1.5}rem"
        data-active={isActive || undefined}
        aria-current={isActive ? 'page' : undefined}
      >
        {proxy.text}
      </a>
    {:else}
      <!-- Button item -->
      <button
        type="button"
        data-list-item
        data-path={node.key}
        style:padding-left="{level * 1.5}rem"
        data-active={isActive || undefined}
      >
        {proxy.text}
      </button>
    {/if}
  {/each}
</nav>
```

**What's gone vs. current List.svelte:**
- `syncExpandedToController()` — removed; controller owns expansion state
- `deriveExpandedFromController()` — removed; template reads `controller.expandedKeys` directly
- `handleSelectAction()` — removed; navigator calls `controller.select(path)` directly
- `toggleGroupByKey()` — removed; navigator calls `controller.toggleExpansion(path)` directly
- `isGroupExpandedByKey()` — removed; replaced with `controller.expandedKeys.has(node.key)`
- `handleListKeyDown()` — removed; navigator handles all keys
- The `action` custom-event `$effect` listener — removed; replaced by two simple `$effect`s
- `expandedByPath` / `multiselect` / `selected` bindable — deferred to Phase 2
- Custom snippets (`item`, `groupLabel`) — deferred to Phase 2

---

## Open Questions Before POC

1. **Default expansion**: All groups start collapsed (empty `expandedKeys`). For the sidebar
   use case we want groups open by default. Options:
   - `collapsible={false}` → groups always render children (current sidebar uses this)
   - Add an `expandAll` prop (like Tree has)
   - Meta.json sets `expanded: true` → `#initExpandedKeys` auto-expands them

2. **`onselect` effect reliability**: The `$effect` that fires `onselect` tracks
   `controller.selectedKeys.size` and `focusedKey`. This could fire spuriously if
   `moveTo` updates `focusedKey` without a select. Consider a dedicated callback slot
   on the controller (similar to old `DataWrapper` emitter) or simply handle it via
   an `action` event on the nav element. **Recommendation**: use a dedicated `onselect`
   prop passed into controller options so it fires only from `controller.select()`.

3. **`moveTo` vs visible-only**: `controller.moveTo(key)` scans `controller.data` (visible
   nodes only). If a value is in a collapsed group, `moveTo` fails. `moveToValue(value)`
   calls `ensureVisible(value)` first. External `value` updates should always go through
   `moveToValue`, not `moveTo`.

4. **`ItemProxy` instantiation per render**: Creating `new ItemProxy(node.value, fields)`
   inside `{#each}` is fine — it's a cheap object with no side effects. If profiling
   shows overhead, we can cache via a `$derived` Map keyed by node key.

---

## Migration Path

1. **POC**: Implement the skeleton above, test with 3-item flat list + 2-group nested list
2. **Phase 2**: Add icon, description, badge via `ItemContent` component
3. **Phase 3**: Add custom snippets (`item`, `groupLabel`) with `svelte:boundary` fallback
4. **Phase 4**: Add `expanded` bindable, `multiselect`, `selected` bindable
5. **Replace**: Swap current List.svelte once all e2e tests pass
