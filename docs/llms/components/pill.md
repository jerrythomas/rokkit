# Pill

> Tag/chip component with optional icon and remove button.

**Export**: `Pill` from `@rokkit/ui`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `unknown` | — | Item data |
| `fields` | `Partial<ItemFields>` | — | Field mapping |
| `removable` | `boolean` | `false` | Show remove button |
| `disabled` | `boolean` | `false` | Disables remove |
| `class` | `string` | `''` | Extra CSS classes |
| `onremove` | `(value, item) => void` | — | Called when remove clicked |

## Snippets

| Snippet | Signature | Description |
|---------|-----------|-------------|
| `content` | `(item, fields)` | Custom pill content |

## Field Mapping

| Field | Default | Description |
|-------|---------|-------------|
| `text` | `'text'` | Pill label |
| `value` | `'value'` | Pill value |
| `icon` | `'icon'` | Pill icon |

## Examples

### Basic

```svelte
<Pill value={{ text: 'Svelte', icon: 'i-svelte' }} />
```

### Removable tag

```svelte
<script>
  let tags = $state(['React', 'Vue', 'Svelte'])
</script>

{#each tags as tag}
  <Pill value={tag} removable onremove={() => tags = tags.filter(t => t !== tag)} />
{/each}
```

### String value

```svelte
<Pill value="JavaScript" removable onremove={handleRemove} />
```
