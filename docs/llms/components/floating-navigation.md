# FloatingNavigation

> Edge-anchored navigation panel with hover expand, pin toggle, and IntersectionObserver active tracking.

**Export**: `FloatingNavigation` from `@rokkit/ui`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `FloatingNavigationItem[]` | `[]` | Navigation items |
| `fields` | `Partial<ItemFields>` | — | Field mapping |
| `value` | `unknown` | — | Active item value (bindable) |
| `position` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'right'` | Screen edge to anchor |
| `pinned` | `boolean` | `false` | Keep nav expanded (bindable) |
| `observe` | `boolean` | `false` | Auto-track active section via IntersectionObserver |
| `observerOptions` | `IntersectionObserverInit` | — | IntersectionObserver configuration |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `label` | `string` | `'Navigation'` | Accessible label |
| `class` | `string` | `''` | Extra CSS classes |
| `onselect` | `(value, item) => void` | — | Called on item selection |
| `onpinchange` | `(pinned) => void` | — | Called when pin state changes |

## Snippets

| Snippet | Signature | Description |
|---------|-----------|-------------|
| `item` | `(item, proxy)` | Custom item renderer. `proxy` has `{ text, icon, active }` |

## Field Mapping

| Field | Default | Description |
|-------|---------|-------------|
| `text` | `'text'` | Nav item label |
| `value` | `'value'` | Nav item identifier / section ID |
| `icon` | `'icon'` | Nav item icon |
| `href` | `'href'` | Link URL |

## Examples

### Page section navigator

```svelte
<script>
  import { FloatingNavigation } from '@rokkit/ui'
  const sections = [
    { text: 'Overview', value: 'overview', icon: 'i-home' },
    { text: 'API', value: 'api', icon: 'i-code' },
    { text: 'Examples', value: 'examples', icon: 'i-beaker' },
  ]
  let activeSection = $state('overview')
</script>

<FloatingNavigation
  items={sections}
  bind:value={activeSection}
  position="right"
  observe
  onselect={(v) => document.getElementById(v)?.scrollIntoView({ behavior: 'smooth' })}
/>
```

### Pinnable sidebar

```svelte
<FloatingNavigation items={navItems} position="left" bind:pinned bind:value onselect={handleNav} />
```

### Custom item renderer

```svelte
{#snippet navItem(item, proxy)}
  <a href="#{proxy.icon}" class:active={proxy.active}>
    <span class={proxy.icon}></span>
    <span>{proxy.text}</span>
  </a>
{/snippet}

<FloatingNavigation items={sections} item={navItem} />
```

## Notes

- Nav collapses to icon-only strip by default; expands to show labels on hover.
- Pin toggle keeps it expanded permanently.
- `observe: true` uses `IntersectionObserver` to auto-update `value` as sections scroll into view — link `value` field to section `id` attributes.
- Keyboard: `ArrowUp/Down`, `Home`, `End`, `Enter` for item navigation.
