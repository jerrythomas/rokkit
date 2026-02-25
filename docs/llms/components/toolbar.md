# Toolbar

> Horizontal or vertical toolbar with keyboard navigation, separators, and grouped items.

**Export**: `Toolbar`, `ToolbarGroup` from `@rokkit/ui`
**Navigation**: `ListController` + `navigator` (Pattern A)

## Toolbar Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `ToolbarItem[]` | `[]` | Toolbar items |
| `fields` | `Partial<ToolbarFields>` | — | Field mapping |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Toolbar orientation |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `sticky` | `boolean` | `false` | Sticky positioning |
| `compact` | `boolean` | `false` | Reduce spacing |
| `showDividers` | `boolean` | `false` | Show separators between items |
| `class` | `string` | `''` | Extra CSS classes |
| `onclick` | `(value, item) => void` | — | Called on item click |

## ToolbarGroup Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | — | Accessible label |
| `gap` | `string` | — | CSS gap between items |

## Snippets

| Snippet | Signature | Description |
|---------|-----------|-------------|
| `item` | `(item, fields, handlers)` | Custom item renderer |
| `separator` | `()` | Custom separator renderer |

## Field Mapping

| Field | Default | Description |
|-------|---------|-------------|
| `text` | `'text'` | Item label |
| `value` | `'value'` | Item identifier |
| `icon` | `'icon'` | Item icon |
| `disabled` | `'disabled'` | Per-item disabled |

## Special Item Types

Items with `type: 'separator'` or `type: 'spacer'` are rendered as visual separators/spacers and are **excluded from keyboard navigation** (no `data-path`).

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `ArrowLeft / ArrowRight` | Move focus (horizontal toolbar) |
| `ArrowUp / ArrowDown` | Move focus (vertical toolbar) |
| `Home / End` | First / last item |
| `Enter / Space` | Activate item |

## Examples

### Data-driven toolbar

```svelte
<script>
  import { Toolbar } from '@rokkit/ui'
  const items = [
    { text: 'Bold', value: 'bold', icon: 'i-bold' },
    { text: 'Italic', value: 'italic', icon: 'i-italic' },
    { type: 'separator' },
    { text: 'Undo', value: 'undo', icon: 'i-undo' },
    { text: 'Redo', value: 'redo', icon: 'i-redo' },
  ]
</script>

<Toolbar {items} onclick={(v) => handleAction(v)} />
```

### Slot-based with ToolbarGroup

```svelte
<Toolbar>
  <ToolbarGroup label="Text formatting">
    <button>Bold</button>
    <button>Italic</button>
  </ToolbarGroup>
  <ToolbarGroup label="History">
    <button>Undo</button>
    <button>Redo</button>
  </ToolbarGroup>
</Toolbar>
```

### Sticky vertical sidebar toolbar

```svelte
<Toolbar {items} position="left" sticky onclick={handleAction} />
```

## State Attributes (CSS hooks)

| Attribute | Element | When |
|-----------|---------|------|
| `data-toolbar` | Root | Always |
| `data-toolbar-item` | Item | Always |
| `data-focused` | Item | Keyboard focused |
| `data-disabled` | Item | Disabled |
| `data-toolbar-separator` | Separator | Always |
