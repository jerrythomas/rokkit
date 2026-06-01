## Hierarchical navigation trail

BreadCrumbs renders an ordered list of crumbs leading to the user's
current location. Each crumb is interactive — click a parent to
navigate back — and the final crumb is marked `aria-current="page"`
so screen readers announce the active level.

## Basic example

```svelte
<script>
  import { BreadCrumbs } from '@rokkit/ui'

  const trail = [
    { label: 'Home', href: '/', icon: 'i-glyph:home' },
    { label: 'Products', href: '/products', icon: 'i-glyph:box' },
    { label: 'Electronics', href: '/products/electronics' },
    { label: 'Laptops' }
  ]
</script>

<BreadCrumbs items={trail} onclick={(value, item) => console.log(item)} />
```

When an item has an `href` it renders as an `<a>`; otherwise as a
`<button>`. The last item is always rendered as plain text — never
linked back to itself.

## Field mapping

The default fields are `label`, `icon`, `href`. If your data uses
different keys, remap via the `fields` prop:

```svelte
<BreadCrumbs items={data} fields={{ label: 'title', href: 'path' }} />
```

## Separator

The chevron between crumbs is themable via the `icons.separator`
prop. Pass any UnoCSS icon class to swap it for an arrow, slash, dot,
or whatever fits the style:

```svelte
<BreadCrumbs items={trail} icons={{ separator: 'i-mdi:slash-forward' }} />
```

## Custom crumb content

The `crumb` snippet receives a ProxyItem plus an `isLast` flag —
useful when you want a different visual for the active leaf (e.g. a
pill background) or to add badges next to certain levels.
