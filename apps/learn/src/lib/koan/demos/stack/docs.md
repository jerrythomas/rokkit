## Flex layout primitive with consistent spacing

Stack is a thin wrapper over CSS flexbox with a constrained API —
direction (vertical / horizontal), a six-step gap scale, and the
usual cross-axis / main-axis alignment knobs. Reach for it whenever
you'd write `<div class="flex flex-col gap-md">` by hand.

## Basic example

```svelte
<script>
  import { Stack } from '@rokkit/ui'
</script>

<Stack gap="sm">
  <div data-card>Item one</div>
  <div data-card>Item two</div>
  <div data-card>Item three</div>
</Stack>
```

## Direction

- `direction="vertical"` (default) stacks top-to-bottom.
- `direction="horizontal"` lays out side-by-side.

## Gap scale

Six discrete tokens — `none` / `xs` / `sm` / `md` / `lg` / `xl` —
inherit from the active style's spacing rhythm so vertical and
horizontal spacing stay in lockstep across the app.

## Alignment

- `align` — cross-axis: `start` / `center` / `end` / `stretch`.
- `justify` — main-axis: `start` / `center` / `end` / `between` /
  `around`.

Both default to whatever flexbox does naturally; set them explicitly
when you want a specific behaviour.
