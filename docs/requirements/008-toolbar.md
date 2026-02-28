# Toolbar Component Requirements

> Requirements for Toolbar and ToolbarGroup components in `@rokkit/ui`.

## 1. Overview

The Toolbar component renders a horizontal or vertical bar of action items (buttons, toggles, separators, spacers). Data-driven via items array with field mapping. Supports sectioned layout with start/center/end areas.

**Current status**: Implemented and functional in `@rokkit/ui`.

## 2. Toolbar Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `ToolbarItem[]` | `[]` | Toolbar items |
| `fields` | `ToolbarFields` | defaults | Field mapping |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Position (affects border, sticky) |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `sticky` | `boolean` | `false` | Sticky positioning |
| `compact` | `boolean` | `false` | Reduced padding |
| `showDividers` | `boolean` | `false` | Dividers between sections |
| `disabled` | `boolean` | `false` | Disable all items |
| `onclick` | callback | — | `(value, item) => void` |
| `item` | `Snippet` | — | Custom item rendering |
| `start` | `Snippet` | — | Start section content |
| `center` | `Snippet` | — | Center section content |
| `end` | `Snippet` | — | End section content |
| `children` | `Snippet` | — | Default content |

## 3. Field Mapping

```
ToolbarFields {
  text, value, icon, disabled, active, type, snippet, label, shortcut
}
```

### 3.1 Item Types

| Type | Rendering |
|------|-----------|
| `button` (default) | Clickable button with icon/text |
| `toggle` | Button with active/pressed state |
| `separator` | Visual divider |
| `spacer` | Flexible space |
| `custom` | Rendered via named snippet |

## 4. ToolbarGroup Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Accessibility label |
| `gap` | `'none' \| 'sm' \| 'md' \| 'lg'` | `'sm'` | Item gap |
| `class` | `string` | `''` | CSS classes |
| `children` | `Snippet` | — | Group content |

## 5. Keyboard Navigation

| Key | Action |
|-----|--------|
| `ArrowLeft` / `ArrowRight` | Move focus between items (horizontal) |
| `ArrowUp` / `ArrowDown` | Move focus (vertical toolbar) |
| `Enter` / `Space` | Activate focused item |
| `Home` | Focus first item |
| `End` | Focus last item |

## 6. Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-toolbar` | root | Toolbar container |
| `data-toolbar-group` | div | Item group |
| `data-toolbar-item` | button | Individual item |
| `data-toolbar-separator` | div | Separator |
| `data-toolbar-spacer` | div | Spacer |
| `data-position` | root | Position variant |
| `data-size` | root | Size variant |
| `data-active` | item | Active/pressed toggle |
| `data-disabled` | item/root | Disabled state |

## 7. ARIA

| Element | Role/Attribute |
|---------|---------------|
| Root | `role="toolbar"`, `aria-label`, `aria-orientation` |
| Item | `role="button"` |
| Toggle item | `aria-pressed` |
| Group | `role="group"`, `aria-label` |

## 8. Dependencies

| Package | What | Purpose |
|---------|------|---------|
| `@rokkit/ui` | `ItemProxy` | Field mapping |
| `@rokkit/core` | — | No direct dependency |

## 9. Gaps

1. No overflow menu (items that don't fit collapse into "more" dropdown)
2. No drag-to-reorder items
3. No docked toolbar (auto-hide/show on scroll)
