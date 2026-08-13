## The card-shaped UI block primitive

Frame is a generic header / body / footer container — the canonical
"card-shaped UI block". It owns no visuals of its own; it simply hands
three structural zones to the active theme through data-attributes and
lets the consumer decide what goes inside each one.

Reach for it whenever a header/body/footer card is the right shape:
CodeBlock wraps its chrome in a Frame, PlotPlugin wraps a chart in one,
and anywhere else you'd otherwise hand-roll a bordered panel. For an
*interactive* card (a link or a button), use `<Card/>` instead.

## Basic example

```svelte
<script>
  import { Frame } from '@rokkit/ui'
</script>

<Frame>
  {#snippet header()}
    <strong>Deployment</strong>
  {/snippet}

  <p>Body content sits between the header and footer zones.</p>

  {#snippet footer()}
    <button type="button">Retry</button>
  {/snippet}
</Frame>
```

## Slots are optional

`header`, `children`, and `footer` are all snippets, and each renders
its wrapper only when supplied. A Frame with just a body collapses to a
single padded panel — no empty header or footer chrome is emitted.

## Flush body

Set `flush` when the body holds a self-padding artifact — a chart, a
`<pre>`, a table. The body wrapper then carries `data-flush` and drops
its own padding so the inner element bleeds edge to edge.

## Theming hooks

- `[data-frame]` — root container.
- `[data-frame-header]` — header wrapper (only when `header` is given).
- `[data-frame-body]` — body wrapper; carries `data-flush` when `flush`
  is set.
- `[data-frame-footer]` — footer wrapper (only when `footer` is given).
