# List Component Design

> Design for the data-driven List component with action/state architecture.

## Overview

The List component in `@rokkit/ui` renders flat lists and grouped/collapsible lists. It currently works but manages keyboard navigation inline (~100 lines). This design documents the existing architecture and proposes refactoring to use the `use:navigator` action + controller pattern.

## Current Architecture

```
List.svelte (~380 lines)
├── Props: items, fields, value, active, collapsible, expanded, ...
├── State: focusedListIndex, internalExpanded, listRef
├── Derived: visibleIndices, effectiveExpanded
├── Inline logic:
│   ├── createProxy(item) → ItemProxy
│   ├── handleKeyDown (~80 lines) — ArrowDown/Up/Right/Left/Home/End/Enter/Space
│   ├── focusListIndex() — DOM query + scrollIntoView
│   ├── navigateRelative() — next/prev through visibleIndices
│   ├── toggleGroup() / toggleGroupByIndex()
│   ├── handleItemClick() → onselect
│   └── isGroupExpanded() / isGroupIndex() / checkIsActive()
├── Snippets: defaultItem, defaultGroupLabel, renderItem, renderGroupLabel
└── Template: <nav data-list> with #each items
```

### How Items Are Rendered

```
items array
  │
  ├── Group items (hasChildren)
  │   ├── renderGroupLabel → defaultGroupLabel or groupLabelSnippet
  │   └── if expanded: renderItem for each child
  │
  └── Standalone items
      └── renderItem → defaultItem or custom snippet
          ├── <a> for items with href
          └── <button> for action items
```

### Index System

Items are identified by string indices for keyboard navigation:
- `"0"`, `"1"`, `"2"` — top-level items
- `"2-0"`, `"2-1"` — children of group at index 2
- `visibleIndices` — derived array of navigable indices (skips disabled items, respects collapsed groups)

## Proposed Refactoring: `use:navigator` + Controller

### Why

1. **Code reduction**: ~100 lines of inline keyboard handling → delegated to `use:navigator`
2. **Consistency**: Same navigation behavior as Tree and Table
3. **Testability**: Controller logic can be unit-tested without DOM
4. **Features for free**: `navigator` already supports scroll-into-view, action events, click handling

### How the Navigator Action Works

```
use:navigator={{ wrapper: controller, orientation: 'vertical', nested: hasGroups }}
  │
  ├── Listens: keyup → getKeyboardAction(event, config)
  │   ├── ArrowDown → 'next'  → controller.moveNext()
  │   ├── ArrowUp   → 'previous' → controller.movePrev()
  │   ├── Home      → 'first' → controller.moveFirst()
  │   ├── End       → 'last'  → controller.moveLast()
  │   ├── Enter     → 'select' → controller.select(path)
  │   ├── ArrowRight → 'expand' → controller.expand()
  │   └── ArrowLeft  → 'collapse' → controller.collapse()
  │
  ├── Listens: click → getClickAction(event)
  │   ├── click → 'select' → controller.select(path)
  │   └── ctrl+click → 'extend' → controller.extendSelection(path)
  │
  └── Emits: custom 'action' event → { name: 'move'|'select'|'toggle', data }
```

### Controller Interface Required by Navigator

The `navigator` action calls these methods on `wrapper`:

```javascript
// Required by navigator (from ListController)
moveFirst()           // focus first item
moveLast()            // focus last item
moveNext()            // focus next item
movePrev()            // focus previous item
select(path)          // select item by path
extendSelection(path) // toggle item in selection set

// Required for nested mode (from NestedController)
expand()              // expand focused group
collapse()            // collapse focused group
toggleExpansion(path) // toggle by path

// Required for scroll-into-view
focusedKey            // currently focused key
```

### What the List Controller Needs to Manage

For List, a new `ListDataController` (or enhanced `ListController`) needs:

```
ListDataController
├── $state
│   ├── items: ListItem[]
│   ├── fields: ListFields
│   ├── expandedState: Record<string, boolean>
│   ├── focusedKey: string | null
│   └── selectedKeys: SvelteSet<string>
│
├── $derived
│   ├── flatItems: { proxy, path, isGroup, parentPath }[]
│   ├── visibleItems: flatItems filtered by expansion state
│   └── lookup: Map<path, item>
│
├── Methods
│   ├── moveFirst/Last/Next/Prev
│   ├── select(path), extendSelection(path)
│   ├── expand(), collapse(), toggleExpansion(path)
│   └── focused: current focused item proxy
```

### Wiring in List.svelte (After Refactoring)

```svelte
<script lang="ts">
  import { navigator } from '@rokkit/actions'
  import { ListDataController } from '@rokkit/states'
  import { ItemProxy } from '../types/item-proxy.js'
  import ItemContent from './ItemContent.svelte'

  let { items, fields, value, active, collapsible, expanded, onselect, ... } = $props()

  // Controller manages all interaction state
  let controller = $derived(new ListDataController(items, {
    fields,
    expanded,
    collapsible
  }))

  // Bridge action events to component callbacks
  function handleAction(event) {
    const { name, data } = event.detail
    if (name === 'select') onselect?.(data.value, data.selected)
    if (name === 'toggle') onexpandedchange?.(controller.expandedState)
  }
</script>

<nav
  data-list
  data-size={size}
  use:navigator={{
    wrapper: controller,
    orientation: 'vertical',
    nested: collapsible
  }}
  onaction={handleAction}
>
  <!-- Template remains the same, but:
       - No handleKeyDown
       - No focusListIndex
       - No navigateRelative
       - No visibleIndices
       - data-path attributes added for navigator's click detection -->
  {#each controller.visibleItems as item (item.path)}
    <!-- render items using item.proxy -->
  {/each}
</nav>
```

### Lines Removed vs Added

| Removed | Lines | Added | Lines |
|---------|-------|-------|-------|
| `handleKeyDown` | ~55 | `use:navigator` + `handleAction` | ~10 |
| `focusListIndex` | ~8 | Controller import + creation | ~5 |
| `navigateRelative` | ~12 | `data-path` attributes on items | ~5 |
| `handleFocusIn` | ~8 | — | — |
| `visibleIndices` derivation | ~25 | — | — |
| `toggleGroupByIndex`, `isGroupIndex`, etc. | ~30 | — | — |
| **Total removed** | **~138** | **Total added** | **~20** |

Net reduction: ~118 lines from List.svelte, moved to reusable controller.

## Data Attributes

No changes to existing data attributes. Add `data-path` to each focusable element for the navigator's click detection:

```html
<button data-list-item data-path={listIndex} data-list-index={listIndex} ...>
```

## Dependencies After Refactoring

| Package | What | Purpose |
|---------|------|---------|
| `@rokkit/ui` | `ItemProxy`, `ItemContent` | Field mapping, rendering |
| `@rokkit/core` | `defaultStateIcons` | Group icons |
| `@rokkit/actions` | `navigator` | Keyboard/click handling |
| `@rokkit/states` | `ListDataController` | Focus, selection, expansion state |

## Migration Strategy

1. **Phase 1**: Create `ListDataController` in `@rokkit/states` that wraps the List's current logic
2. **Phase 2**: Wire `use:navigator` in List.svelte, remove inline handlers
3. **Phase 3**: Update `data-path` attributes for navigator scroll-into-view
4. **Backward compatible**: All existing props and callbacks remain the same
