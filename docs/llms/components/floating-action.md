# FloatingAction

> Speed dial floating action button — expands to reveal multiple action items.

**Export**: `FloatingAction` from `@rokkit/ui`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `FloatingActionItem[]` | `[]` | Action items |
| `fields` | `Partial<ItemFields>` | — | Field mapping |
| `icon` | `string` | `'i-plus'` | Main button icon |
| `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left'` | `'bottom-right'` | Screen position |
| `expand` | `'up' \| 'down' \| 'left' \| 'right'` | `'up'` | Direction items expand |
| `open` | `boolean` | `false` | Controlled open state (bindable) |
| `backdrop` | `boolean` | `false` | Show overlay backdrop when open |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `class` | `string` | `''` | Extra CSS classes |
| `onselect` | `(value, item) => void` | — | Called on action item select |

## Field Mapping

| Field | Default | Description |
|-------|---------|-------------|
| `text` | `'text'` | Action label (tooltip) |
| `value` | `'value'` | Action identifier |
| `icon` | `'icon'` | Action item icon |
| `disabled` | `'disabled'` | Per-item disabled |

## Examples

### Basic

```svelte
<script>
  import { FloatingAction } from '@rokkit/ui'
  const items = [
    { text: 'New File', value: 'file', icon: 'i-file-plus' },
    { text: 'New Folder', value: 'folder', icon: 'i-folder-plus' },
    { text: 'Upload', value: 'upload', icon: 'i-upload' },
  ]
</script>

<FloatingAction {items} onselect={(v) => handleAction(v)} />
```

### With backdrop, bottom-left

```svelte
<FloatingAction {items} position="bottom-left" backdrop bind:open onselect={handleAction} />
```
