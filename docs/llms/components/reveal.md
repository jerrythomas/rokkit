# Reveal

> Scroll-triggered entry animation wrapper using IntersectionObserver.

**Export**: `Reveal` from `@rokkit/ui`
**Action used**: `reveal` from `@rokkit/actions`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `'up' \| 'down' \| 'left' \| 'right' \| 'none'` | `'up'` | Slide direction |
| `distance` | `string` | `'1.5rem'` | Slide distance (CSS unit) |
| `duration` | `number` | `600` | Animation duration (ms) |
| `delay` | `number` | `0` | Delay before animation starts (ms) |
| `stagger` | `number` | `0` | Delay increment per direct child (ms) — staggers children |
| `once` | `boolean` | `true` | Animate only once (re-animates on scroll out/in if false) |
| `threshold` | `number` | `0.1` | IntersectionObserver threshold (0–1) |
| `easing` | `string` | `'cubic-bezier(0.4, 0, 0.2, 1)'` | CSS easing function |
| `class` | `string` | `''` | Extra CSS classes |
| `children` | `Snippet` | — | Content to reveal |

## Examples

### Basic slide up

```svelte
<script>
  import { Reveal } from '@rokkit/ui'
</script>

<Reveal>
  <p>This slides up when scrolled into view.</p>
</Reveal>
```

### Staggered children

```svelte
<Reveal stagger={100} direction="up">
  <div>Card 1</div>
  <div>Card 2</div>
  <div>Card 3</div>
</Reveal>
```
Each child animates with an additional 100ms delay: 0ms, 100ms, 200ms.

### Fade only (no slide)

```svelte
<Reveal direction="none" duration={800}>
  <section>Hero content</section>
</Reveal>
```

### Repeat on re-entry

```svelte
<Reveal once={false} threshold={0.3}>
  <div>Animates every time it enters the viewport</div>
</Reveal>
```

## Notes

- Respects `prefers-reduced-motion` — skips animation, immediately shows content.
- CSS hooks: `[data-reveal]` for initial hidden state; `[data-reveal-visible]` added when element intersects.
- Requires theme CSS for `data-reveal` transitions (from `@rokkit/themes/base`).
- For action-level use (without component wrapper), use `use:reveal` from `@rokkit/actions`.
