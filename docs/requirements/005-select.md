# Select Component Requirements

> Requirements for Select, MultiSelect, and dropdown/popover components in `@rokkit/ui`.

## 1. Overview

The Select family provides dropdown selection components. `Select` for single selection, `MultiSelect` for multiple items. Both use data-driven pattern with field mapping via `ItemProxy`. Future: `DropDown` (trigger + list) and `DropSearch` (searchable dropdown).

**Current status**: Select and MultiSelect implemented. DropDown and DropSearch in archive.

## 2. Select (Single Selection)

### 2.1 Props

| Prop | Type | Default | Bindable | Description |
|------|------|---------|----------|-------------|
| `options` | `SelectItem[]` | `[]` | No | Options array |
| `fields` | `SelectFields` | defaults | No | Field mapping (text, value, icon, description, etc.) |
| `value` | `unknown` | — | Yes | Selected value |
| `selected` | `SelectItem \| null` | — | Yes | Selected item reference |
| `placeholder` | `string` | — | No | Placeholder text |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | No | Size variant |
| `align` | `'left' \| 'right' \| 'start' \| 'end'` | `'start'` | No | Dropdown alignment |
| `direction` | `'up' \| 'down'` | `'down'` | No | Dropdown direction |
| `maxRows` | `number` | `5` | No | Visible rows in dropdown |
| `disabled` | `boolean` | `false` | No | Disabled state |
| `icons` | `SelectStateIcons` | defaults | No | Dropdown/check/remove icons |
| `onchange` | callback | — | No | `(value, item) => void` |
| `item` | `Snippet` | — | No | Custom option rendering |
| `groupLabel` | `Snippet` | — | No | Custom group label rendering |
| `selectedValue` | `Snippet` | — | No | Custom selected value display |

### 2.2 Field Mapping

Uses `ItemFields` from `ItemProxy`:
- `text`, `value`, `icon`, `description`, `shortcut`, `label`, `disabled`, `active`, `type`, `children`, `snippet`, `href`, `badge`

### 2.3 Grouped Options

Items with `children` render as groups with a label header and indented children.

## 3. MultiSelect

### 3.1 Additional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `SelectItem[]` | `[]` | Bindable — array of selected items |
| `onchange` | callback | — | `(items: SelectItem[]) => void` |
| `selectedValues` | `Snippet` | — | Custom multi-value display |
| `maxDisplay` | `number` | — | Tags shown before "+N more" |

### 3.2 Rendering

- Selected items displayed as removable tags
- Overflow collapses to count badge
- Click tag remove icon to deselect

## 4. Dropdown/Popover Architecture

### 4.1 Directional Support

Select and dropdown components MUST support directional opening:

```svelte
<Select
  options={data}
  direction="up"
  align="start"
/>
```

**Auto direction** (future): Detect available viewport space and open in direction with more room.

### 4.2 Popover Positioning

```
Select/Dropdown
├── Trigger (selected value display)
├── Portal (optional)
│   └── Popover
│       ├── position: 'up' | 'down'
│       ├── align: 'start' | 'center' | 'end'
│       └── Content (option list)
```

## 5. Keyboard Navigation

| Key | Action |
|-----|--------|
| `Enter` / `Space` | Open dropdown / select focused item |
| `Escape` | Close dropdown |
| `ArrowDown` | Focus next option |
| `ArrowUp` | Focus previous option |
| `Home` | Focus first option |
| `End` | Focus last option |
| `Tab` | Close and move focus |

## 6. Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-select` | root | Select container |
| `data-select-trigger` | button | Trigger button |
| `data-select-dropdown` | div | Dropdown container |
| `data-select-item` | div | Option item |
| `data-selected` | item | Currently selected |
| `data-focused` | item | Currently focused |
| `data-disabled` | item/root | Disabled state |
| `data-open` | root | Dropdown open |
| `data-size` | root | Size variant |

## 7. ARIA

| Element | Role/Attribute |
|---------|---------------|
| Trigger | `role="combobox"`, `aria-expanded`, `aria-haspopup="listbox"` |
| Dropdown | `role="listbox"` |
| Option | `role="option"`, `aria-selected` |
| Group | `role="group"`, `aria-labelledby` |

## 8. Archived: DropDown & DropSearch

### 8.1 DropDown

`archive/ui/src/DropDown.svelte` — dropdown trigger with list content. Shares popover logic with Select. Uses `dismissable` action for close-on-outside-click.

### 8.2 DropSearch

`archive/ui/src/DropSearch.svelte` — searchable dropdown. Composes SearchFilter + DropDown. Filters options as user types.

**Recreation approach**: Build as composition of Select + SearchFilter rather than standalone components.

## 9. Dependencies

| Package | What | Purpose |
|---------|------|---------|
| `@rokkit/core` | `defaultStateIcons` | Dropdown/check/remove icons |
| `@rokkit/ui` | `ItemProxy`, `ItemContent` | Field mapping, option rendering |

## 10. Gaps

1. No auto-direction (viewport detection) — only manual `direction` prop
2. No searchable/filterable mode built into Select (by design — use SearchFilter composition)
3. DropDown and DropSearch not yet recreated from archive
4. No virtualized rendering for very large option lists
