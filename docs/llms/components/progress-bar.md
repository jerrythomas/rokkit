# ProgressBar

> Determinate or indeterminate progress indicator.

**Export**: `ProgressBar` from `@rokkit/ui`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number \| null` | `null` | Current value. `null` = indeterminate |
| `max` | `number` | `100` | Maximum value |
| `class` | `string` | `''` | Extra CSS classes |

## Examples

### Determinate

```svelte
<script>
  import { ProgressBar } from '@rokkit/ui'
  let progress = $state(0)
</script>

<ProgressBar value={progress} max={100} />
```

### Indeterminate (loading)

```svelte
<ProgressBar value={null} />
```

### Custom max

```svelte
<ProgressBar value={3} max={10} />  <!-- 30% -->
```

## State Attributes (CSS hooks)

| Attribute | Element | When |
|-----------|---------|------|
| `data-progress` | Root | Always |
| `data-indeterminate` | Root | When value is null |
| `role="progressbar"` | Root | Always |
| `aria-valuenow` | Root | Current value |
| `aria-valuemax` | Root | Max value |
