# NestedController

> Extends ListController for hierarchical data with WAI-ARIA treeview expand/collapse behavior.

**Package**: `@rokkit/states`
**File**: `nested-controller.svelte.js` (extends `ListController`)

## Constructor

Same as `ListController`:

```javascript
const controller = new NestedController(items, value, fields, options)
```

## Additional Methods

All `ListController` methods plus:

```javascript
controller.expand(key)             // Expand a group node
controller.collapse(key)           // Collapse a group node
controller.toggleExpansion(key)    // Toggle expand/collapse
controller.ensureVisible(value)    // Expand all parent nodes so item is visible
```

## Tree-style Navigation Behavior

| Situation | Result |
|-----------|--------|
| `expand()` on collapsed group | Expands group, stays at group |
| `expand()` on already-expanded group | Moves focus to first child |
| `expand()` on leaf (no children) | Returns `false`, no-op |
| `collapse()` on expanded group | Collapses group, stays at group |
| `collapse()` on child/leaf | Moves focus to parent group |
| `collapse()` on root-level (not collapsed) | Returns `false`, no-op |

When `expand()`/`collapse()` changes `focusedKey`, navigator emits a `'move'` event so the component can update DOM focus.

## Examples

### Tree navigation

```javascript
const controller = new NestedController(treeData, null, fields, { nested: true })

// Expand all nodes (for expandAll prop)
for (const [key, proxy] of controller.lookup.entries()) {
  if (proxy.hasChildren) controller.expandedKeys.add(key)
}
```

### Lazy loading integration

```javascript
// When onloadchildren resolves:
async function loadChildren(item) {
  const children = await fetchChildren(item.id)
  item.children = children  // Mutate in place
  controller.items = [...controller.items]  // Trigger reactivity
  controller.expand(key)
}
```

### Sync external expanded prop

```javascript
function syncExpandedToController(expanded, controller, lookup) {
  for (const [key, proxy] of lookup.entries()) {
    if (!proxy.hasChildren) continue
    const nodeKey = proxy.get('value')  // item-level key
    const shouldExpand = expanded[nodeKey] !== false
    if (shouldExpand) controller.expandedKeys.add(key)
    else controller.expandedKeys.delete(key)
  }
}
```

## Notes

- `expandedKeys` stores **path keys** (e.g. `"0"`, `"0.1"`), not item value keys.
- The `List` and `Tree` components bridge between external `expanded` prop (nodeKey-based) and internal `controller.expandedKeys` (pathKey-based) via `syncExpandedToController()`.
- `ensureVisible(value)` is used when programmatically setting `value` to an item inside a collapsed subtree.
