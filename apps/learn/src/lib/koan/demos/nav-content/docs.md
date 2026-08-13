## A two-pane nav + content shell

NavContent is the split-layout primitive: a fixed-size nav panel next to
(or above) a flexible content pane. It's the shape behind settings
screens, docs sites, admin consoles, and master-detail views — one side
holds navigation, the other holds whatever the navigation points at.

Both `nav` and `content` are required snippets, so the component never
renders an empty half.

## Basic example

```svelte
<script>
  import { NavContent } from '@rokkit/ui'
</script>

<NavContent navSize="240px">
  {#snippet nav()}
    <nav>
      <a href="#overview">Overview</a>
      <a href="#billing">Billing</a>
    </nav>
  {/snippet}

  {#snippet content()}
    <article>Selected page renders here.</article>
  {/snippet}
</NavContent>
```

## Orientation

- `orientation="horizontal"` (default) puts the nav rail to the side; the
  content pane fills the remaining width.
- `orientation="vertical"` stacks the nav on top; the content pane fills
  the remaining height.

In both cases `navSize` sizes the nav panel along the split axis — a
width when horizontal, a height when vertical. It sets `--nav-size`, so
you can also drive it from CSS.

## Collapsing

`collapsible` (default `true`) lets the nav panel fold away on small
screens so the content pane gets the full viewport. Set it to `false`
for a rail that must always stay visible.

## Theming hooks

- `[data-nav-content]` — root; carries `data-orientation` and
  `data-collapsible`, and reads `--nav-size`.
- `[data-nav-content-nav]` — the nav panel wrapper.
- `[data-nav-content-main]` — the content panel wrapper.
