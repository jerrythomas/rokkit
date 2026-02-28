# Tabs

> Tab bar with panel content, keyboard navigation, and flexible positioning.

**Export**: `Tabs` from `@rokkit/ui`
**Navigation**: `ListController` + `navigator` (Pattern A)

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `TabItem[]` | `[]` | Tab items |
| `fields` | `Partial<ToggleFields>` | — | Field mapping |
| `value` | `unknown` | — | Active tab value (bindable) |
| `position` | `'top' \| 'bottom' \| 'left' \| 'right'` | `'top'` | Tab bar position |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `disabled` | `boolean` | `false` | Disables all tabs |
| `class` | `string` | `''` | Extra CSS classes |
| `onchange` | `(value, item) => void` | — | Called on tab change |

## Snippets

| Snippet | Signature | Description |
|---------|-----------|-------------|
| `[key]` | `()` | Panel content for tab with matching value/key |

## Field Mapping

| Field | Default | Description |
|-------|---------|-------------|
| `text` | `'text'` | Tab label |
| `value` | `'value'` | Tab identifier |
| `icon` | `'icon'` | Tab icon |
| `disabled` | `'disabled'` | Per-tab disabled |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `ArrowLeft / ArrowRight` | Move focus (top/bottom tabs) |
| `ArrowUp / ArrowDown` | Move focus (left/right tabs) |
| `Home / End` | First / last tab |
| `Enter / Space` | Activate tab |

## Examples

### Basic with panel snippets

```svelte
<script>
  import { Tabs } from '@rokkit/ui'
  const items = [
    { text: 'Profile', value: 'profile' },
    { text: 'Settings', value: 'settings' },
    { text: 'Billing', value: 'billing' },
  ]
  let value = $state('profile')
</script>

<Tabs {items} bind:value>
  {#snippet profile()}
    <div>Profile content</div>
  {/snippet}
  {#snippet settings()}
    <div>Settings content</div>
  {/snippet}
  {#snippet billing()}
    <div>Billing content</div>
  {/snippet}
</Tabs>
```

### Left sidebar tabs

```svelte
<Tabs {items} position="left" bind:value />
```

## State Attributes (CSS hooks)

| Attribute | Element | When |
|-----------|---------|------|
| `data-tabs` | Root | Always |
| `data-tabs-bar` | Tab list | Always |
| `data-tab` | Tab button | Always |
| `data-selected` | Tab button | Active tab |
| `data-focused` | Tab button | Keyboard focused |
| `data-tabs-panel` | Panel | Always |
