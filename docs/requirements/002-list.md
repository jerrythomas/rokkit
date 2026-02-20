# List Component Requirements

> Requirements for the data-driven List component supporting flat items and collapsible groups.

## 1. Overview

A `List` component in `@rokkit/ui` that renders flat lists and grouped/collapsible lists. It follows the data-driven pattern: accepts an items array, uses field mapping via `ItemProxy`, and supports navigation links, button items, and grouped sections.

**Current status**: Implemented and functional. This document captures the existing behavior and identifies gaps for improvement.

## 2. Data Input

### 2.1 Items Array

- Accept an array of plain objects
- Each item is accessed through `ItemProxy` with configurable field mapping
- Support `ListFields` configuration to map data keys to display slots

### 2.2 Field Mapping

- `text` — display text (default: `'text'`)
- `value` — selection matching key (default: `'value'`)
- `href` — navigation URL, renders as `<a>` instead of `<button>` (default: `'href'`)
- `icon` — icon class name (default: `'icon'`)
- `description` — secondary text (default: `'description'`)
- `label` — aria-label override (default: `'label'`)
- `disabled` — disabled state (default: `'disabled'`)
- `children` — nested items for groups (default: `'children'`)
- `snippet` — named snippet for custom rendering (default: `'snippet'`)
- `badge` — badge/indicator content (default: `'badge'`)

### 2.3 Item Types

- **Button items**: rendered as `<button>`, fire `onselect` on click
- **Link items**: items with `href` field render as `<a>` for navigation
- **Group items**: items with `children` array render as collapsible sections
- **Disabled items**: items with `disabled: true` are skipped in keyboard navigation

## 3. Grouping

### 3.1 Collapsible Groups

- Groups are items with a `children` array
- When `collapsible` prop is `true`, groups can be expanded/collapsed
- When `collapsible` is `false` (default), groups are always expanded
- `expanded` prop is bindable (`Record<string, boolean>`)
- `onexpandedchange` callback fires when expansion state changes

### 3.2 Group Labels

- Group headers show icon, text, and expand/collapse arrow
- Customizable via `groupLabel` snippet
- Dividers rendered between groups (`data-list-divider`)

## 4. Selection

### 4.1 Single Selection

- Click a button item to select it
- `value` prop tracks current selection
- `active` prop highlights an item externally (e.g., current route)
- `onselect` callback fires with `(value, item)`

### 4.2 Active State

- `active` prop takes precedence over `value` for highlighting
- Items with matching `itemValue` get `data-active` attribute
- Link items use `aria-current="page"` when active

## 5. Keyboard Navigation

### 5.1 Current Implementation (Inline)

The List currently manages keyboard navigation inline with ~100 lines of handler code:

| Key | Action |
|-----|--------|
| `ArrowDown` | Move focus to next visible item |
| `ArrowUp` | Move focus to previous visible item |
| `Home` | Move focus to first item |
| `End` | Move focus to last item |
| `ArrowRight` | Expand group / move to first child |
| `ArrowLeft` | Collapse group / move to parent |
| `Enter` / `Space` | Select focused item or toggle group |

### 5.2 Focus Management

- Focus tracked via `focusedListIndex` state and `data-list-index` attributes
- Index format: `"0"` for top-level, `"2-1"` for child items (parent-child)
- `visibleIndices` derived array tracks navigable items (skips disabled, respects collapsed groups)
- Focus element scrolled into view with `scrollIntoView({ block: 'nearest' })`

## 6. Rendering

### 6.1 Item Rendering

- Default renders `<button>` (for actions) or `<a>` (for links) via `ItemContent`
- `ItemContent` displays icon, text, description, and badge
- Custom rendering via `item` snippet or per-item named snippets (`snippet` field)
- Snippets wrapped in `svelte:boundary` with fallback to default

### 6.2 Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-list` | `<nav>` | Root container |
| `data-size` | `<nav>` | Size variant (sm/md/lg) |
| `data-disabled` | `<nav>` | List disabled state |
| `data-collapsible` | `<nav>` | Collapsible mode |
| `data-list-item` | `<button>`/`<a>` | Item element |
| `data-list-index` | item elements | Navigation index |
| `data-active` | item elements | Active/selected state |
| `data-disabled` | item elements | Disabled item |
| `data-list-group` | `<div>` | Group container |
| `data-list-group-label` | `<button>` | Group header |
| `data-list-group-items` | `<div>` | Group children container |
| `data-list-group-collapsed` | `<div>` | Collapsed group |
| `data-list-divider` | `<div>` | Divider between groups |

### 6.3 ARIA

| Element | Role/Attribute |
|---------|---------------|
| `<nav>` | `aria-label="List"` |
| `<button>` item | `aria-pressed={active}`, `aria-label` |
| `<a>` item | `aria-current="page"` when active |
| group label | `aria-expanded` |
| divider | `role="separator"` |

## 7. Snippet Customization

| Snippet | Parameters | Purpose |
|---------|-----------|---------|
| `item` | `(item, fields, handlers, isActive)` | Custom item rendering |
| `groupLabel` | `(item, fields, toggle, isExpanded)` | Custom group header |
| Named snippets | `(item, fields, handlers, isActive)` | Per-item via `snippet` field |

## 8. Props Summary

| Prop | Type | Default | Bindable | Description |
|------|------|---------|----------|-------------|
| `items` | `ListItem[]` | `[]` | No | Array of items |
| `fields` | `ListFields` | defaults | No | Field mapping |
| `value` | `unknown` | — | No | Selected value |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | No | Size variant |
| `disabled` | `boolean` | `false` | No | Disable all items |
| `collapsible` | `boolean` | `false` | No | Enable group collapse |
| `expanded` | `Record<string, boolean>` | `{}` | Yes | Expansion state |
| `active` | `unknown` | — | No | Externally active item |
| `icons` | `ListStateIcons` | defaults | No | Expand/collapse icons |
| `onselect` | callback | — | No | Selection handler |
| `onexpandedchange` | callback | — | No | Expansion change handler |

## 9. Dependencies

### Uses from existing packages

| Package | What | Purpose |
|---------|------|---------|
| `@rokkit/ui` | `ItemProxy`, `ItemContent` | Field mapping, content rendering |
| `@rokkit/core` | `defaultStateIcons` | Group expand/collapse icons |

## 10. Gaps

### 10.1 Keyboard Navigation Should Use `use:navigator` Action

**Current**: ~100 lines of inline `handleKeyDown` logic managing focus, expansion, and selection.

**Proposed**: Replace with `use:navigator` action wired to a `ListController` from `@rokkit/states`. The existing `ListController` already supports `moveFirst/Last/Next/Prev`, `select`, `extendSelection`. The `NestedController` adds `expand/collapse/toggleExpansion`.

**Benefits**:
- Reduces component from ~380 lines to ~200 lines
- Consistent keyboard behavior across List, Tree, Table
- Testable controller logic independent of UI

**Approach**:
1. Create a `ListController` instance from props (items, fields, expanded state)
2. Wire `use:navigator={{ wrapper: controller }}` on `<nav>`
3. Remove inline `handleKeyDown`, `focusListIndex`, `navigateRelative`, `visibleIndices`
4. The controller manages focus tracking and index resolution

### 10.2 Multi-Selection Not Supported

Current List only supports single selection. Future need for Ctrl+click multi-select and `selected` array prop.

### 10.3 No Type-Ahead Search

No type-ahead (pressing a letter to jump to matching item). Could be added to navigator action.

### 10.4 Missing `role="listbox"` for Button Lists

Currently uses `<nav>`. Button-based lists should use `role="listbox"` with `role="option"` on items per WAI-ARIA.
