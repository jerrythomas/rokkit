# Menu Component Requirements

> Requirements for the Menu component in `@rokkit/ui`.

## 1. Overview

The Menu component renders a button trigger with a dropdown list of actions. Unlike Select (which tracks a selected value), Menu fires an `onselect` callback and closes — it's action-oriented, not state-oriented.

**Current status**: Implemented and functional in `@rokkit/ui`.

## 2. Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `MenuItem[]` | `[]` | Menu items or groups |
| `fields` | `MenuFields` | defaults | Field mapping (text, value, icon, description, shortcut, label, disabled, children, snippet) |
| `label` | `string` | — | Trigger button label |
| `icon` | `string` | — | Trigger button icon |
| `showArrow` | `boolean` | — | Show dropdown arrow indicator |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `align` | `'left' \| 'right' \| 'start' \| 'end'` | `'start'` | Dropdown alignment |
| `direction` | `'up' \| 'down'` | `'down'` | Dropdown direction |
| `disabled` | `boolean` | `false` | Disable entire menu |
| `icons` | `MenuStateIcons` | defaults | Open/close icons |
| `onselect` | callback | — | `(value, item) => void` |
| `item` | `Snippet` | — | Custom item rendering |
| `groupLabel` | `Snippet` | — | Custom group label |

## 3. Field Mapping

```
MenuFields {
  text, value, icon, description, shortcut, label, disabled, children, snippet
}
```

- `shortcut` displays keyboard shortcut text (e.g., "Ctrl+S")
- `children` enables nested groups with group headers
- `snippet` selects a named snippet for per-item rendering

## 4. Grouped Items

Items with `children` render as groups:
- Group header (label or custom `groupLabel` snippet)
- Indented children below
- Visual separator between groups

## 5. Keyboard Navigation

| Key | Action |
|-----|--------|
| `Enter` / `Space` | Open menu / select focused item |
| `Escape` | Close menu |
| `ArrowDown` | Focus next item |
| `ArrowUp` | Focus previous item |
| `Home` | Focus first item |
| `End` | Focus last item |

## 6. Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-menu` | root | Menu container |
| `data-menu-trigger` | button | Trigger button |
| `data-menu-dropdown` | div | Dropdown container |
| `data-menu-item` | div | Menu item |
| `data-menu-group` | div | Group container |
| `data-disabled` | item | Disabled item |
| `data-focused` | item | Focused item |
| `data-open` | root | Menu open |

## 7. ARIA

| Element | Role/Attribute |
|---------|---------------|
| Trigger | `aria-haspopup="menu"`, `aria-expanded` |
| Dropdown | `role="menu"` |
| Item | `role="menuitem"` |
| Group | `role="group"`, `aria-label` |

## 8. Gaps

1. First item always highlighted on open (should not pre-highlight — backlog #5)
2. No context menu support (right-click trigger)
3. No sub-menus (nested flyout menus)
4. No keyboard shortcut activation (displaying "Ctrl+S" but not handling the actual shortcut)
