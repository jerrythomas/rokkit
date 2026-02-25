# reveal

> Scroll-triggered reveal animation using IntersectionObserver. Low-level action — use the `Reveal` component for stagger support.

**Package**: `@rokkit/actions`
**File**: `reveal.svelte.js`

## Usage

```svelte
<div use:reveal={{ direction: 'up', duration: 600 }} on:reveal={(e) => e.detail.visible}>
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `direction` | `'up' \| 'down' \| 'left' \| 'right' \| 'none'` | `'up'` | Slide direction |
| `distance` | `string` | `'1.5rem'` | Slide distance (CSS unit) |
| `duration` | `number` | `600` | Animation duration (ms) |
| `delay` | `number` | `0` | Delay before animation (ms) |
| `once` | `boolean` | `true` | Animate only once |
| `threshold` | `number` | `0.1` | IntersectionObserver threshold (0–1) |
| `easing` | `string` | `'cubic-bezier(0.4, 0, 0.2, 1)'` | CSS easing |

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `reveal` | `{ visible: boolean }` | Fires when element enters/exits viewport |

## CSS Hooks

The action sets:
- `data-reveal="up"` (direction) on the element
- `data-reveal-visible` when intersecting
- CSS custom properties: `--reveal-duration`, `--reveal-distance`, `--reveal-easing`

Theme CSS transitions based on these attributes.

## Example

```svelte
<section use:reveal={{ direction: 'left', duration: 800 }}>
  Content slides from left when scrolled into view.
</section>
```

## Notes

- Respects `prefers-reduced-motion` — immediately shows element.
- For staggered children, use the `Reveal` component wrapper instead.
- Theme CSS (`@rokkit/themes/base`) provides the transition rules.
