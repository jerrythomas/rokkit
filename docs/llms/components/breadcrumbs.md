# BreadCrumbs

> Navigation breadcrumbs with ARIA, custom separators, and click handling.

**Export**: `BreadCrumbs` from `@rokkit/ui`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `BreadCrumbItem[]` | `[]` | Breadcrumb items |
| `fields` | `Partial<ItemFields>` | — | Field mapping |
| `separator` | `string` | `'/'` | Separator string or icon class |
| `class` | `string` | `''` | Extra CSS classes |
| `onclick` | `(value, item) => void` | — | Called on crumb click |

## Snippets

| Snippet | Signature | Description |
|---------|-----------|-------------|
| `crumb` | `(item, fields, isLast)` | Custom crumb renderer |

## Field Mapping

| Field | Default | Description |
|-------|---------|-------------|
| `text` | `'text'` | Crumb label |
| `value` | `'value'` | Crumb value / href |
| `href` | `'href'` | Direct link URL |

## Examples

### Basic

```svelte
<script>
  import { BreadCrumbs } from '@rokkit/ui'
  const items = [
    { text: 'Home', href: '/' },
    { text: 'Products', href: '/products' },
    { text: 'Laptops' },
  ]
</script>

<BreadCrumbs {items} />
```

### With icon separator

```svelte
<BreadCrumbs {items} separator="i-chevron-right" />
```

### Click handler (SPA navigation)

```svelte
<BreadCrumbs {items} onclick={(v, item) => goto(item.href)} />
```

### Custom crumb snippet

```svelte
{#snippet crumb(item, fields, isLast)}
  {#if isLast}
    <span class="current">{item.text}</span>
  {:else}
    <a href={item.href}>{item.text}</a>
  {/if}
{/snippet}

<BreadCrumbs {items} {crumb} />
```

## Notes

- Last item is rendered without a link by default (current page).
- `aria-label="breadcrumb"` on nav, `aria-current="page"` on last item.
