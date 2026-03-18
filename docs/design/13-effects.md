# Effects and Animation

> How Rokkit delivers motion: purposeful Svelte actions that augment components with
> scroll-triggered, hover, and interaction effects, all authored against a single
> `prefers-reduced-motion` contract.

---

## Philosophy

Animation in Rokkit is additive and optional. Components are fully functional without
any effects applied. Effects are Svelte actions applied at the call site — the component
author does not own them, the consumer does.

Two guiding rules:

1. **Purposeful** — every animated property communicates something (depth, selection,
   loading state). Decorative animation that adds no meaning is not included.
2. **Reduced-motion first** — every effect that produces motion checks
   `prefers-reduced-motion: reduce` and either removes motion entirely or substitutes a
   static equivalent (e.g. fade without translate).

---

## Existing Action-Based Effects

Five effects ship in `@rokkit/actions`. Each is a Svelte `use:` action.

### `use:reveal`

Scroll-triggered fade-in. Observes the element with `IntersectionObserver` and adds
`data-revealed` when the element enters the viewport.

```svelte
<section use:reveal={{ threshold: 0.2, delay: 100 }}>
  <!-- fades in when scrolled into view -->
</section>
```

CSS drives the animation:

```css
[data-reveal] {
  opacity: 0;
  translate: 0 1rem;
  transition:
    opacity var(--reveal-duration, 400ms) ease,
    translate var(--reveal-duration, 400ms) ease;
  transition-delay: var(--reveal-delay, 0ms);
}

[data-reveal][data-revealed] {
  opacity: 1;
  translate: 0 0;
}

@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    transition: opacity var(--reveal-duration, 400ms) ease;
    translate: 0 0;
  }
}
```

### `use:shine`

Hover shimmer effect. Tracks pointer position and moves a gradient overlay to follow the
cursor, giving a surface-reflection appearance.

```svelte
<button use:shine>Click</button>
```

The action writes `--shine-x` and `--shine-y` CSS custom properties as inline styles on
`pointermove`, and sets `data-shine-active` on `pointerenter`/`pointerleave`.

```css
[data-shine] {
  position: relative;
  overflow: hidden;
}

[data-shine]::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at calc(var(--shine-x, 50%) * 1px) calc(var(--shine-y, 50%) * 1px),
    var(--shine-color, rgb(255 255 255 / 0.12)) 0%,
    transparent 60%
  );
  opacity: 0;
  transition: opacity var(--shine-duration, 200ms);
  pointer-events: none;
}

[data-shine][data-shine-active]::before {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  [data-shine]::before {
    display: none;
  }
}
```

### `use:tilt`

3D perspective tilt following the pointer within the element bounds. Writes
`--tilt-x` and `--tilt-y` as inline CSS custom properties and applies a CSS transform.

```svelte
<div use:tilt={{ max: 8, perspective: 600 }}>
  <img src="card.jpg" />
</div>
```

```css
[data-tilt] {
  transform: perspective(var(--tilt-perspective, 600px)) rotateX(calc(var(--tilt-x, 0) * 1deg))
    rotateY(calc(var(--tilt-y, 0) * 1deg));
  transition: transform var(--tilt-return-duration, 300ms) ease;
  will-change: transform;
}

@media (prefers-reduced-motion: reduce) {
  [data-tilt] {
    transform: none;
    transition: none;
  }
}
```

### `use:ripple`

Material-style click ripple. On `pointerdown`, the action injects a `<span>` with a
`data-ripple` attribute positioned at the click coordinates, then removes it after the
animation completes.

```svelte
<button use:ripple>Submit</button>
```

```css
[data-ripple-host] {
  position: relative;
  overflow: hidden;
}

[data-ripple] {
  position: absolute;
  border-radius: 50%;
  background: var(--ripple-color, rgb(255 255 255 / 0.3));
  transform: scale(0);
  animation: ripple-expand var(--ripple-duration, 500ms) ease-out forwards;
  pointer-events: none;
}

@keyframes ripple-expand {
  to {
    transform: scale(4);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-ripple] {
    animation: none;
  }
}
```

### `use:hoverLift`

Adds a subtle upward translate and shadow increase on hover, conveying elevation change.

```svelte
<div use:hoverLift>Card content</div>
```

```css
[data-hover-lift] {
  transition:
    translate var(--lift-duration, 150ms) ease,
    box-shadow var(--lift-duration, 150ms) ease;
}

[data-hover-lift]:hover {
  translate: 0 calc(var(--lift-amount, -3) * 1px);
  box-shadow: var(--lift-shadow, 0 8px 24px rgb(0 0 0 / 0.15));
}

@media (prefers-reduced-motion: reduce) {
  [data-hover-lift]:hover {
    translate: 0;
  }
}
```

---

## CSS Custom Property Configuration

Every effect exposes its tunable parameters as CSS custom properties. Consumers can
override per-element or per-section without touching the action options:

```css
/* Slower reveals for a landing page hero section */
.hero {
  --reveal-duration: 700ms;
  --reveal-delay: 150ms;
}

/* Subtle tilt for a card grid */
.card-grid [data-tilt] {
  --tilt-perspective: 1000px;
}
```

This approach keeps JavaScript action options as structural/behavioral parameters
(thresholds, boolean toggles) while CSS handles all timing and visual magnitude.

---

## Data Attribute Contract

Actions communicate state by setting `data-*` attributes on the host element. CSS
targets those attributes. This follows the same contract used by all other Rokkit
components.

```
┌──────────────────────────────────────────────┐
│  use:reveal → data-reveal, data-revealed     │
│  use:shine  → data-shine, data-shine-active  │
│  use:tilt   → data-tilt                      │
│  use:ripple → data-ripple-host               │
│  use:hoverLift → data-hover-lift             │
└──────────────────────────────────────────────┘
```

No inline style manipulation except for positional values that cannot be expressed
as discrete CSS states (`--shine-x`, `--tilt-x`, etc.).

---

## Planned: Transition System

Component mount/unmount transitions are not yet standardized. The planned approach:

- Svelte `transition:` directives remain in component source for now.
- A future `TransitionPreset` system will allow the active `data-style` to opt into
  named transition profiles: `fade`, `slide`, `scale`, `none`.
- The `vibe` store gains a `transition` field; the `themable` action writes
  `data-transition` to the html element; CSS `@starting-style` rules provide the
  enter/exit animations per component per transition preset.

Page transitions between SvelteKit routes will be implemented as a separate
`use:pageTransition` action on the `<main>` element.

---

## Accessibility Contract

All effects must satisfy the following:

| Requirement                         | Implementation                                   |
| ----------------------------------- | ------------------------------------------------ |
| Respect `prefers-reduced-motion`    | CSS media query removes translate/scale/rotation |
| No layout shift from animation      | Use `translate`, not `margin`/`top`/`left`       |
| No focus loss from DOM manipulation | Ripple spans injected outside focus tree         |
| No infinite/looping animation       | All animations fire once and stop                |

The `use:reveal` action performs the `prefers-reduced-motion` check in JavaScript as
well, skipping the `IntersectionObserver` setup entirely when motion is reduced —
elements are revealed immediately without transition.
