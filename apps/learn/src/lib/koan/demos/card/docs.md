## Container with header / body / footer zones

Card wraps arbitrary content with a paper-edge border, a body slot,
and optional header and footer snippets. It can render as a plain
container, an `<a>` link, or an interactive `<button>` — whichever
of `href` / `onclick` is set picks the rendered element.

## Basic example

```svelte
<script>
  import { Card } from '@rokkit/ui'
</script>

<Card>
  <h3>Simple Card</h3>
  <p>Basic body content.</p>
</Card>

<Card href="/dashboard">
  <h3>Linked Card</h3>
  <p>Renders as an anchor.</p>
</Card>

<Card onclick={() => console.log('clicked')}>
  <h3>Interactive Card</h3>
  <p>Renders as a button.</p>
</Card>
```

## Header & footer snippets

The `header` and `footer` snippets render in their own zones above
and below the body, separated by paper-edge dividers. Use them for
titles + icons up top, action buttons at the bottom.

```svelte
<Card>
  {#snippet header()}
    <h3>Profile</h3>
  {/snippet}

  <p>Body content goes here.</p>

  {#snippet footer()}
    <button>Edit</button>
    <button>View</button>
  {/snippet}
</Card>
```

## Variants

`variant` (`default` / `primary` / `secondary` / `tertiary`)
selects a colour palette via `data-variant` on the root — themes
provide the actual styling.
