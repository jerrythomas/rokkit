# Tree Component Requirements

> Requirements for the data-driven Tree component supporting hierarchical data with expand/collapse, tree lines, and keyboard navigation.

## 1. Overview

A `Tree` component in `@rokkit/ui` that renders hierarchical data with expand/collapse, tree line connectors, and keyboard navigation. It follows the data-driven pattern: accepts a nested items array, uses field mapping via `ItemProxy`, and flattens the tree for efficient rendering.

**Current status**: Implemented and functional. This document captures the existing behavior and identifies gaps for improvement.

## 2. Data Input

### 2.1 Items Array

- Accept a nested array of objects where each item may have a `children` array
- Each item accessed through `ItemProxy` with configurable `TreeFields`
- Supports arbitrary nesting depth

### 2.2 Field Mapping

Extends `ItemFields` with tree-specific fields:

- `text` — display text (default: `'text'`)
- `value` — selection/key matching (default: `'value'`)
- `icon` — icon class name (default: `'icon'`)
- `description` — secondary text (default: `'description'`)
- `shortcut` — keyboard shortcut display (default: `'shortcut'`)
- `label` — aria-label override (default: `'label'`)
- `disabled` — disabled state (default: `'disabled'`)
- `active` — active state (default: `'active'`)
- `type` — item type (default: `'type'`)
- `children` — nested items (default: `'children'`)
- `snippet` — named snippet (default: `'snippet'`)
- `href` — navigation URL (default: `'href'`)
- `badge` — badge content (default: `'badge'`)
- `expanded` — expanded state field (default: `'expanded'`)
- `level` — depth level field (default: `'level'`)

## 3. Expand/Collapse

### 3.1 Expansion State

- Parent nodes can be expanded or collapsed
- `expanded` prop is bindable (`Record<string, boolean>`)
- `expandAll` prop sets default state for all nodes
- Internal state used when external `expanded` not provided
- Node key derived from `itemValue` or `text` via `getNodeKey()`

### 3.2 Expansion Callbacks

- `onexpandedchange` fires when expansion state changes
- `ontoggle` fires with `(value, item, isExpanded)` on individual toggle

### 3.3 Expand/Collapse Icons

- `TreeStateIcons` with `opened` and `closed` from `@rokkit/core` defaults
- Uses `defaultStateIcons.node.opened` and `defaultStateIcons.node.closed`
- Customizable via `icons` prop

## 4. Tree Line Connectors

### 4.1 Connector Types

Five connector types for tree visualization:
- `child` — T-branch connector (├)
- `last` — L-branch connector (└)
- `sibling` — vertical line (│)
- `empty` — empty space for alignment
- `icon` — expand/collapse icon position

### 4.2 Line Type Algorithm

`getLineTypes(hasChildren, parentTypes, position)`:
1. For each parent type except the last, convert to continuation type:
   - `child` → `sibling` (line continues)
   - `last` → `empty` (branch ended)
2. Last parent type replaced with current node's position (`child` or `last`)
3. Append `icon` for expandable nodes, `empty` for leaf nodes

### 4.3 Show/Hide Lines

- `showLines` prop (default: `true`)
- When `true`: renders `Connector` components for each `lineType`
- When `false`: renders indent spans with calculated width (`depth × 1.25rem`)

## 5. Tree Flattening

### 5.1 FlatNode Structure

The tree is flattened into a `FlatNode[]` array for rendering:

```
interface FlatNode {
  proxy: ItemProxy     // field-mapped data access
  level: number        // depth (0 = root)
  lineTypes: TreeLineType[]  // connector types for each column
  path: string         // unique path key ("0", "0-1", "0-1-2")
  isLast: boolean      // last child in parent
}
```

### 5.2 Flattening Algorithm

`flattenTree(items, level, parentTypes, pathPrefix)`:
1. Iterate items at current level
2. For each item, create proxy, compute `lineTypes` via `getLineTypes()`
3. Push to flat result
4. If item has children and is expanded, recurse with incremented level

## 6. Selection

### 6.1 Single Selection

- Click an item to select it
- `value` prop is bindable (selected item's value)
- `active` prop for external highlight (e.g., current route)
- `onselect` callback fires with `(value, item)`

### 6.2 Active State

- `active` prop takes precedence over `value` for highlighting
- Active items get `data-active` attribute
- Link items use `aria-current="page"` when active

## 7. Keyboard Navigation

### 7.1 Current Implementation (Inline)

The Tree currently manages keyboard navigation inline with ~80 lines of handler code:

| Key | Action |
|-----|--------|
| `ArrowDown` | Move focus to next visible node |
| `ArrowUp` | Move focus to previous visible node |
| `ArrowRight` | Expand node / move to first child |
| `ArrowLeft` | Collapse node / move to parent |
| `Home` | Move focus to first node |
| `End` | Move focus to last node |
| `Enter` / `Space` | Select focused node |

### 7.2 Focus Management

- Focus tracked via `focusedPath` state and `data-tree-path` attributes
- Focus targets the `[data-tree-item-content]` button/link within a node
- Path-based navigation: `"0"`, `"0-1"`, `"0-1-2"` for nested items
- Parent path derived by truncating at last `-`
- Focused element scrolled into view with `scrollIntoView({ block: 'nearest' })`

## 8. Rendering

### 8.1 Node Rendering

- Each `FlatNode` renders as a `[data-tree-node]` div
- Node row contains: tree connectors + toggle button + item content
- Item content: `<button>` (for actions) or `<a>` (for links) via `ItemContent`
- `ItemContent` displays icon, text, description, and badge
- Custom rendering via `item` snippet or per-item named snippets
- Snippets wrapped in `svelte:boundary` with fallback to default

### 8.2 Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-tree` | root `<div>` | Root container |
| `data-size` | root `<div>` | Size variant (sm/md/lg) |
| `data-show-lines` | root `<div>` | Lines enabled |
| `data-tree-node` | `<div>` | Node container |
| `data-tree-path` | `<div>` node | Unique path key |
| `data-tree-level` | `<div>` node | Depth level |
| `data-tree-expanded` | `<div>` node | Expanded state |
| `data-tree-has-children` | `<div>` node | Has children |
| `data-active` | node + content | Active/selected |
| `data-tree-toggle` | `<span>` | Toggle icon container |
| `data-tree-toggle-btn` | `<button>` | Toggle button |
| `data-tree-item-content` | `<button>`/`<a>` | Focusable content |
| `data-tree-indent` | `<span>` | Indent spacer (no-lines mode) |

### 8.3 ARIA

| Element | Role/Attribute |
|---------|---------------|
| root `<div>` | `role="tree"`, `aria-label="Tree"` |
| node `<div>` | `role="treeitem"` |
| node | `aria-expanded` (when has children) |
| node | `aria-selected` |
| node | `aria-level={level+1}` |

## 9. Snippet Customization

| Snippet | Parameters | Purpose |
|---------|-----------|---------|
| `item` | `(item, fields, handlers, isActive, isExpanded, level)` | Custom node content |
| `toggle` | `(isExpanded, hasChildren, icons)` | Custom expand/collapse icon |
| `connector` | `(lineType)` | Custom tree line connector |
| Named snippets | `(item, fields, handlers, isActive, isExpanded, level)` | Per-item via `snippet` field |

## 10. Props Summary

| Prop | Type | Default | Bindable | Description |
|------|------|---------|----------|-------------|
| `items` | `TreeItem[]` | `[]` | No | Nested items array |
| `fields` | `TreeFields` | defaults | No | Field mapping |
| `value` | `unknown` | — | Yes | Selected value |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | No | Size variant |
| `showLines` | `boolean` | `true` | No | Show tree connectors |
| `expanded` | `Record<string, boolean>` | `{}` | Yes | Expansion state |
| `expandAll` | `boolean` | `false` | No | Default expand state |
| `active` | `unknown` | — | No | Externally active item |
| `icons` | `TreeStateIcons` | defaults | No | Expand/collapse icons |
| `onselect` | callback | — | No | Selection handler |
| `onexpandedchange` | callback | — | No | Expansion change handler |
| `ontoggle` | callback | — | No | Individual toggle handler |

## 11. Dependencies

### Uses from existing packages

| Package | What | Purpose |
|---------|------|---------|
| `@rokkit/ui` | `ItemProxy`, `ItemContent`, `Connector` | Field mapping, rendering |
| `@rokkit/core` | `defaultStateIcons` | Expand/collapse icons |

## 12. Gaps

### 12.1 Keyboard Navigation Should Use `use:navigator` Action

**Current**: ~80 lines of inline `handleItemKeyDown` logic managing focus, expansion, and selection.

**Proposed**: Replace with `use:navigator` action wired to a `NestedController` from `@rokkit/states`. The existing `NestedController` already supports `moveFirst/Last/Next/Prev`, `select`, `extendSelection`, `expand`, `collapse`, `toggleExpansion`, `ensureVisible`.

**Benefits**:
- Reduces component from ~470 lines to ~300 lines
- Consistent keyboard behavior across List, Tree, Table
- Testable controller logic independent of UI
- `navigator` already handles scroll-into-view

**Approach**:
1. Create a `NestedController` instance from props (items, fields, expanded state)
2. Wire `use:navigator={{ wrapper: controller, orientation: 'vertical', nested: true }}` on root
3. Remove inline `handleItemKeyDown`, `focusPath`, `handleFocusIn`
4. The controller manages focus tracking and flat node resolution
5. Need to bridge controller's `data-path` attribute convention with tree's `data-tree-path`

### 12.2 Multi-Selection Not Supported

Current Tree only supports single selection. Future need for Ctrl+click multi-select (e.g., file manager pattern).

### 12.3 No Drag-and-Drop

No support for reordering tree nodes via drag-and-drop. Future enhancement.

### 12.4 No Lazy Loading of Children

Currently all children must be provided upfront. No `onloadchildren` callback for async loading of subtrees.

### 12.5 Flattenning Recreates Proxies on Every Render

`flattenTree` creates new `ItemProxy` instances on every derivation. Could be optimized with memoization or by integrating with controller's `deriveLookupWithProxy`.

### 12.6 No Search/Filter Integration

While `SearchFilter` component can filter flat data before passing to Tree, there's no built-in highlight-matching or hierarchy-aware filter that retains parent path to matching nodes. The `hierarchicalFilter` from `@rokkit/data` exists but isn't surfaced as a pattern.
