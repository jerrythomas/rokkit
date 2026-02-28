# Toggle

> Mutually exclusive button group for selecting one option from a small set.

**Export**: `Toggle` from `@rokkit/ui`
**Navigation**: `ListController` + `navigator` (Pattern A)

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `ToggleItem[]` | `[]` | Toggle options |
| `fields` | `Partial<ToggleFields>` | — | Field mapping |
| `value` | `unknown` | — | Selected value (bindable) |
| `showLabels` | `boolean` | `true` | Show text labels |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `disabled` | `boolean` | `false` | Disables all options |
| `class` | `string` | `''` | Extra CSS classes |
| `onchange` | `(value, item) => void` | — | Called on selection |

## Field Mapping

| Field | Default | Description |
|-------|---------|-------------|
| `text` | `'text'` | Button label |
| `value` | `'value'` | Selection value |
| `icon` | `'icon'` | Button icon |
| `disabled` | `'disabled'` | Per-option disabled |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `ArrowLeft / ArrowRight` | Move focus between options |
| `Home / End` | First / last option |
| `Enter / Space` | Select focused option |

## Examples

### String array (primitive values)

```svelte
<script>
  import { Toggle } from '@rokkit/ui'
  let period = $state('week')
</script>

<Toggle options={['day', 'week', 'month']} bind:value={period} />
```

### With icons

```svelte
<Toggle
  options={[
    { text: 'List', value: 'list', icon: 'i-list' },
    { text: 'Grid', value: 'grid', icon: 'i-grid' },
    { text: 'Table', value: 'table', icon: 'i-table' },
  ]}
  bind:value={viewMode}
/>
```

### Icon-only (no labels)

```svelte
<Toggle
  options={[{ icon: 'i-bold', value: 'bold' }, { icon: 'i-italic', value: 'italic' }]}
  showLabels={false}
  bind:value={textStyle}
/>
```

## State Attributes (CSS hooks)

| Attribute | Element | When |
|-----------|---------|------|
| `data-toggle` | Root | Always |
| `data-toggle-item` | Button | Always |
| `data-selected` | Button | Currently selected |
| `data-focused` | Button | Keyboard focused |
| `data-disabled` | Button | Disabled |
