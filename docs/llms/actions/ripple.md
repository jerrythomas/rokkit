# ripple

> Material Design-inspired click ripple effect — expands a circular wave from the click point.

**Package**: `@rokkit/actions`
**File**: `ripple.svelte.js`

## Usage

```svelte
<button use:ripple>Click me</button>
<button use:ripple={{ color: 'white', opacity: 0.2, duration: 600 }}>Custom</button>
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `color` | `string` | `'currentColor'` | Ripple color |
| `opacity` | `number` | `0.15` | Ripple opacity (0–1) |
| `duration` | `number` | `500` | Ripple animation duration (ms) |

## Behavior

1. On `click`: creates an absolutely-positioned `<span>` at the click coordinates.
2. Span scales from 0 to full size and fades out via `@keyframes rokkit-ripple`.
3. Span removed on `animationend` (with timeout fallback for JSDOM).
4. Sets `overflow: hidden` and `position: relative` on the host element if not already set.
5. Keyframes injected once into `document.head` (`#rokkit-ripple-keyframes`).
6. Respects `prefers-reduced-motion` — skips entirely.

## Example

```svelte
<button use:ripple={{ color: 'white', opacity: 0.3 }} class="btn-primary">
  Save
</button>
```

## Notes

- Safe to use on any clickable element.
- Composable with `hoverLift` and `magnetic`.
- The host element must be capable of clipping overflow (action ensures this).
