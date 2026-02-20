# Tree Component Design

> Design for the data-driven Tree component with action/state architecture.

## Overview

The Tree component in `@rokkit/ui` renders hierarchical data with expand/collapse, tree line connectors, and keyboard navigation. It currently works but manages keyboard navigation inline (~80 lines). This design documents the existing architecture and proposes refactoring to use the `use:navigator` action + `NestedController` pattern.

## Current Architecture

```
Tree.svelte (~470 lines)
├── Props: items, fields, value, active, showLines, expanded, expandAll, icons, ...
├── State: focusedPath, internalExpanded, treeRef
├── Derived: fields (merged), icons (merged), flatNodes
├── Inline logic:
│   ├── createProxy(item) → ItemProxy
│   ├── flattenTree(items, level, types, pathPrefix) → FlatNode[]
│   ├── handleItemKeyDown (~60 lines) — ArrowDown/Up/Right/Left/Home/End/Enter/Space
│   ├── focusPath() — DOM query + scrollIntoView
│   ├── handleFocusIn() — track focused path
│   ├── isNodeExpanded(), toggleNode()
│   ├── handleItemClick() → value update + onselect
│   └── resolveItemSnippet()
├── Snippets: defaultToggle, defaultItem, renderNode
└── Template: <div role="tree"> with #each flatNodes
```

### How the Tree is Flattened

```
Nested items
  │
  flattenTree(items, level=0, types=[], pathPrefix='')
  │
  ├── For each item at current level:
  │   ├── Create ItemProxy
  │   ├── Compute lineTypes via getLineTypes(hasChildren, parentTypes, position)
  │   ├── Push FlatNode { proxy, level, lineTypes, path, isLast }
  │   └── If expanded + hasChildren: recurse into children
  │
  └── Result: FlatNode[] — flat array for rendering
```

### Rendering Pipeline

```
flatNodes derived array
  │
  #each flatNodes as node (node.path)
  │
  renderNode(node)
  ├── [data-tree-node] wrapper with ARIA attributes
  ├── [data-tree-node-row] row content
  │   ├── showLines? → tree connectors (Connector or snippet)
  │   │   ├── lineType === 'icon' → toggle button
  │   │   └── other types → Connector component
  │   └── !showLines? → indent span + toggle button
  └── Item content: customSnippet or defaultItem
      ├── <a> for items with href
      └── <button> for action items
```

## Proposed Refactoring: `use:navigator` + `NestedController`

### Why

1. **Code reduction**: ~80 lines of inline keyboard handling → delegated to `use:navigator`
2. **Consistency**: Same navigation behavior as List and Table
3. **Existing controller**: `NestedController` already extends `ListController` with `expand`, `collapse`, `toggleExpansion`, `ensureVisible`
4. **Existing infrastructure**: `flatVisibleNodes` and `deriveLookupWithProxy` in `@rokkit/states/derive.svelte.js` handle tree flattening

### NestedController Capabilities

The existing `NestedController` in `@rokkit/states` already provides:

```
NestedController extends ListController
├── Constructor: (items, fields, expanded, path)
├── From ListController:
│   ├── items, focusedKey, selectedKeys (SvelteSet)
│   ├── data → flatVisibleNodes (derived)
│   ├── lookup → Map<path, Proxy> (derived)
│   ├── moveFirst/Last/Next/Prev
│   ├── select(path), extendSelection(path)
│   └── toggleSelection(path)
├── Tree-specific:
│   ├── expand(), collapse()
│   ├── toggleExpansion(path)
│   └── ensureVisible(value)
└── Properties:
    ├── focused → current focused Proxy
    └── selected → selected values array
```

### What Needs Bridging

The `NestedController` uses `@rokkit/states` `Proxy` class (not `ItemProxy` from `@rokkit/ui`). Key differences:

| Feature | `@rokkit/states` Proxy | `@rokkit/ui` ItemProxy |
|---------|----------------------|----------------------|
| Reactivity | `$state`/`$derived` runes | Plain getters |
| Package | `@rokkit/states` | `@rokkit/ui` |
| Dependencies | `@rokkit/core` | None |
| Field mapping | Yes (via `@rokkit/core` defaultFields) | Yes (self-contained) |
| Children | Processed recursively | `createChildProxy` |

**Options**:
1. Use `NestedController` as-is, create `ItemProxy` from controller's Proxy for rendering
2. Adapt `NestedController` to accept `ItemProxy`-compatible field mapping
3. Create a `TreeController` that wraps `NestedController` and bridges the two proxy systems

**Recommended**: Option 1 — use `NestedController` for state management, create `ItemProxy` from the underlying data when rendering. The controller tracks paths/keys, the component creates proxies for display.

### Wiring in Tree.svelte (After Refactoring)

```svelte
<script lang="ts">
  import { navigator } from '@rokkit/actions'
  import { NestedController } from '@rokkit/states'
  import { ItemProxy } from '../types/item-proxy.js'
  import Connector from './Connector.svelte'
  import ItemContent from './ItemContent.svelte'

  let { items, fields, value, active, showLines, expanded, expandAll, icons, ... } = $props()

  // Controller manages navigation, focus, expansion
  let controller = $derived(new NestedController(items, fields, expanded, 'value'))

  // Bridge action events to component callbacks
  function handleAction(event) {
    const { name, data } = event.detail
    if (name === 'select') {
      value = data.value
      onselect?.(data.value, data.selected)
    }
    if (name === 'toggle') onexpandedchange?.(controller.expandedState)
  }

  // Tree flattening still needed for line type computation
  // But focus/selection/expansion state comes from controller
</script>

<div
  data-tree
  data-size={size}
  role="tree"
  use:navigator={{
    wrapper: controller,
    orientation: 'vertical',
    nested: true
  }}
  onaction={handleAction}
>
  {#each flatNodes as node (node.path)}
    <!-- renderNode unchanged, but:
         - No handleItemKeyDown
         - No focusPath
         - data-path added for navigator's click/scroll detection -->
  {/each}
</div>
```

### Lines Removed vs Added

| Removed | Lines | Added | Lines |
|---------|-------|-------|-------|
| `handleItemKeyDown` | ~60 | `use:navigator` + `handleAction` | ~12 |
| `focusPath` | ~8 | Controller import + creation | ~5 |
| `handleFocusIn` | ~8 | `data-path` attributes | ~5 |
| **Total removed** | **~76** | **Total added** | **~22** |

Net reduction: ~54 lines from Tree.svelte, moved to reusable controller.

### What Remains in the Component

Even with navigator, Tree.svelte retains:
- **Tree flattening** (`flattenTree`): computes line types for connectors — controller doesn't know about visual connectors
- **Proxy creation**: `ItemProxy` instances for rendering `ItemContent`
- **Snippet resolution**: `resolveItemSnippet`, `svelte:boundary` fallback pattern
- **Template markup**: all the rendering logic (connectors, toggle buttons, item content)

## Data Attributes

Add `data-path` to each node for navigator's click detection and scroll-into-view:

```html
<div data-tree-node data-path={node.path} data-tree-path={node.path} ...>
```

The `navigator` action looks for `[data-path]` to identify clicked items and to scroll focused items into view.

## Expansion State Synchronization

Current: Tree manages expansion internally (`internalExpanded`) or externally (`expanded` prop).

With controller: `NestedController` manages expansion. Need to synchronize with bindable `expanded` prop:

```svelte
// Sync controller expansion → external prop
$effect(() => {
  if (controller.expandedState !== expanded) {
    expanded = controller.expandedState
    onexpandedchange?.(expanded)
  }
})
```

## Dependencies After Refactoring

| Package | What | Purpose |
|---------|------|---------|
| `@rokkit/ui` | `ItemProxy`, `ItemContent`, `Connector` | Field mapping, rendering |
| `@rokkit/core` | `defaultStateIcons` | Expand/collapse icons |
| `@rokkit/actions` | `navigator` | Keyboard/click handling |
| `@rokkit/states` | `NestedController` | Focus, selection, expansion state |

## Migration Strategy

1. **Phase 1**: Verify `NestedController` meets Tree's needs — test with current items/fields format
2. **Phase 2**: Add `data-path` attributes to tree nodes
3. **Phase 3**: Wire `use:navigator`, remove inline handlers
4. **Phase 4**: Synchronize controller expansion state with bindable props
5. **Backward compatible**: All existing props, callbacks, and rendering remain the same

## Open Questions

1. **Proxy bridging**: Should `NestedController` be enhanced to work with `ItemProxy` fields, or should we keep the two proxy systems separate?
2. **Line type computation**: Should line types be computed in the controller (making it UI-aware) or remain in the component (current approach)?
3. **Performance**: Does using `NestedController` + `flattenTree` duplicate the flattening work? The controller already flattens for navigation, but Tree also flattens for rendering with line types.
