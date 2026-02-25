# hoverLift

> Adds translateY + elevated box-shadow on hover, creating a lifting effect.

**Package**: `@rokkit/actions`
**File**: `hover-lift.svelte.js`

## Usage

```svelte
<div use:hoverLift>Card</div>
<div use:hoverLift={{ distance: '-0.5rem', shadow: '0 20px 40px rgba(0,0,0,0.2)', duration: 300 }}>
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `distance` | `string` | `'-0.25rem'` | `translateY` distance (negative = up) |
| `shadow` | `string` | `'0 10px 25px -5px rgba(0,0,0,0.1)'` | Box shadow on hover |
| `duration` | `number` | `200` | Transition duration (ms) |

## Notes

- Stores original `transform`, `boxShadow`, and `transition` values and restores on mouse leave and destroy.
- Respects `prefers-reduced-motion` — skips animation entirely.
- Composable with `ripple` and `magnetic`.

## Example

```svelte
<div use:hoverLift use:ripple class="card">
  Lift + ripple effect
</div>
```
