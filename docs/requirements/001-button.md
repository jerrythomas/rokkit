# Button Component Requirements

> Requirements for Button, ButtonGroup, and FloatingAction components in `@rokkit/ui`.

## 1. Overview

Button components provide clickable actions. The family includes a standard Button, a ButtonGroup for grouping related buttons, and a FloatingAction for overlay action menus.

**Current status**: All three implemented and functional in `@rokkit/ui`.

## 2. Button

### 2.1 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'primary' \| 'secondary' \| 'danger'` | `'default'` | Semantic color variant |
| `style` | `'default' \| 'outline' \| 'ghost'` | `'default'` | Visual style treatment |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type |
| `label` | `string` | — | Button label text |
| `icon` | `string` | — | Leading icon class |
| `iconRight` | `string` | — | Trailing icon class |
| `href` | `string` | — | Renders as `<a>` link |
| `target` | `string` | — | Link target (when href set) |
| `disabled` | `boolean` | `false` | Disabled state |
| `loading` | `boolean` | `false` | Shows spinner, disables interaction |
| `class` | `string` | `''` | CSS classes |
| `onclick` | callback | — | Click handler |
| `children` | `Snippet` | — | Custom content |

### 2.2 Rendering

- Renders as `<button>` by default, `<a>` when `href` is provided
- Content priority: `children` snippet > `icon` + `label` + `iconRight`
- Loading state replaces icon with spinner
- Icon-only buttons (no label, no children) should have `aria-label`

### 2.3 Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-button` | root | Button container |
| `data-variant` | root | Semantic variant |
| `data-style` | root | Visual style |
| `data-size` | root | Size variant |
| `data-loading` | root | Loading state |
| `data-disabled` | root | Disabled state |

## 3. ButtonGroup

### 3.1 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `'sm' \| 'md' \| 'lg'` | — | Size applied to all child buttons |
| `class` | `string` | `''` | CSS classes |
| `children` | `Snippet` | — | Button children |

### 3.2 Rendering

- Wraps buttons in a flex container with joined borders
- First/last button corners rounded, middle buttons flat
- Size prop cascades to all child buttons

### 3.3 Data Attributes

| Attribute | Element | Purpose |
|-----------|---------|---------|
| `data-button-group` | root | Group container |

## 4. FloatingAction

### 4.1 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `FloatingActionItem[]` | `[]` | Action items |
| `fields` | `FloatingActionFields` | defaults | Field mapping |
| `icon` | `string` | — | Main trigger icon |
| `closeIcon` | `string` | — | Icon when menu open |
| `label` | `string` | — | Accessible trigger label |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'` | Screen position |
| `expand` | `'radial' \| 'vertical' \| 'horizontal'` | `'vertical'` | Item expansion direction |
| `itemAlign` | `'start' \| 'center' \| 'end'` | `'center'` | Item alignment |
| `disabled` | `boolean` | `false` | Disable FAB |
| `open` | `boolean` | `false` | Bindable open state |
| `backdrop` | `boolean` | `false` | Show backdrop overlay |
| `contained` | `boolean` | `false` | Position relative to ancestor |
| `onselect` | callback | — | Action selected |
| `onopen` | callback | — | Menu opened |
| `onclose` | callback | — | Menu closed |
| `item` | `Snippet` | — | Custom item rendering |

### 4.2 Rendering

- Fixed position overlay button with expandable action menu
- Trigger button toggles open/close
- Items animate out from trigger in configured direction
- Backdrop dims background when open (optional)

### 4.3 Keyboard

| Key | Action |
|-----|--------|
| `Enter` / `Space` | Toggle menu or select focused item |
| `Escape` | Close menu |
| `ArrowUp/Down` | Navigate items (vertical expand) |

### 4.4 Enhanced Requirements (Future)

- **Draggable repositioning**: Persist position to localStorage
- **Mobile-friendly**: Minimum 44x44px touch targets

## 5. Dependencies

| Package | What | Purpose |
|---------|------|---------|
| `@rokkit/core` | `defaultStateIcons` | FAB open/close icons |
| `@rokkit/ui` | `ItemProxy` | Field mapping for FAB items |

## 6. Gaps

1. No draggable repositioning on FloatingAction
2. Button loading spinner not standardized across themes
3. No `FloatingActions` container for multiple FABs (only single FAB with items)
