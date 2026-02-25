# skinnable

> Applies CSS custom properties directly to an element's inline style.

**Package**: `@rokkit/actions`
**File**: `skinnable.svelte.js`

## Usage

```svelte
<div use:skinnable={{ '--primary': '#ff0000', '--radius': '8px' }}>
```

## Options

Pass a plain object where keys are CSS custom property names (with `--` prefix) and values are CSS values.

## Example

```svelte
<script>
  const palette = { '--primary': '#6366f1', '--primary-hover': '#4f46e5' }
</script>

<div use:skinnable={palette}>
  <Button variant="primary">Indigo Button</Button>
</div>
```

## Notes

- Useful for per-component or per-instance color overrides without a full theme.
- Reactive — updates inline styles when the options object changes.
- Complements `themable` for coarse-grained theme and `skinnable` for fine-grained overrides.
