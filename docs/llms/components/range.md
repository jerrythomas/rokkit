# Range

> Single or dual-handle slider with tick marks, keyboard navigation, and drag support.

**Export**: `Range` from `@rokkit/ui`
**Navigation**: `keyboard` + `pannable` actions

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | `0` | Single handle value (bindable) |
| `lower` | `number` | `0` | Lower handle value for range mode (bindable) |
| `upper` | `number` | `100` | Upper handle value for range mode (bindable) |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `step` | `number` | `1` | Step increment |
| `range` | `boolean` | `false` | Enable dual-handle range mode |
| `ticks` | `TickMark[]` | — | Tick marks along the track |
| `disabled` | `boolean` | `false` | Disables interaction |
| `class` | `string` | `''` | Extra CSS classes |
| `onchange` | `(value) => void` | — | Called on value change |

## Keyboard Navigation

| Key | Action |
|-----|--------|
| `ArrowLeft / ArrowDown` | Decrease value by step |
| `ArrowRight / ArrowUp` | Increase value by step |
| `Home` | Jump to min |
| `End` | Jump to max |

In range mode, `Tab` switches between lower/upper handle.

## Examples

### Single value

```svelte
<script>
  import { Range } from '@rokkit/ui'
  let volume = $state(50)
</script>

<Range min={0} max={100} step={5} bind:value={volume} />
```

### Dual-handle range

```svelte
<script>
  let lower = $state(20)
  let upper = $state(80)
</script>

<Range range min={0} max={100} bind:lower bind:upper />
```

### With tick marks

```svelte
<script>
  import { generateTicks } from '@rokkit/core'
  const ticks = generateTicks(0, 100, 10, 25)  // minor every 10, major every 25
</script>

<Range min={0} max={100} {ticks} bind:value />
```

## State Attributes (CSS hooks)

| Attribute | Element | When |
|-----------|---------|------|
| `data-range` | Root | Always |
| `data-range-track` | Track | Always |
| `data-range-fill` | Fill area | Always |
| `data-range-handle` | Handle(s) | Always |
| `data-range-lower` | Handle | Lower handle (range mode) |
| `data-range-upper` | Handle | Upper handle (range mode) |
| `data-focused` | Handle | Keyboard focused |
| `data-disabled` | Root | Disabled |
| `data-range-tick` | Tick | Always |
| `data-major` | Tick | Major tick mark |
