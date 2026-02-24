# Presentation Effect Components

> Requirements for visual effect wrapper components and Svelte actions.

## 1. Overview

Effect components are wrapper components that add visual presentation effects to their children. They follow the pattern `<Effect><Child /></Effect>`. Effect actions are Svelte `use:` directives that add behavior to any element.

## 2. Components

### 2.1 Existing (Migrated)

| Component | Effect | Status |
|-----------|--------|--------|
| `Tilt` | 3D tilt on hover/mouse movement | Migrated — uses native `lerp()`, no d3 |
| `Shine` | Glossy shine effect via SVG specular lighting | Migrated — pointer tracking, no d3 |

### 2.2 Planned — Wrapper Components

| Component | Effect | Priority |
|-----------|--------|----------|
| `Reveal` | Scroll-triggered entry animations (fade up, slide in, scale) | High |
| `Glow` | Animated glow/shadow effect around children | Medium |
| `FloatingBubbles` | Decorative animated floating particles over a gradient background | Medium |
| `Parallax` | Parallax scroll — content moves at different speed than scroll | Low |

### 2.3 Planned — Svelte Actions

| Action | Effect | Priority |
|--------|--------|----------|
| `use:reveal` | Lightweight scroll-triggered reveal (IntersectionObserver-based) | High |
| `use:hoverLift` | Hover lift effect (translateY + shadow elevation) | High |
| `use:magnetic` | Subtle magnetic attraction toward cursor on hover | Medium |
| `use:ripple` | CSS-only click ripple effect (material style) | Medium |

## 3. Usage Patterns

### 3.1 Wrapper Components

```svelte
<Tilt intensity={0.5}>
  <Shine>
    <Card>Content</Card>
  </Shine>
</Tilt>

<Reveal direction="up" delay={200} stagger={100}>
  <div>Fades in when scrolled into view</div>
</Reveal>
```

### 3.2 Actions

```svelte
<div use:reveal={{ direction: 'up', delay: 200 }}>
  Fades in when scrolled into view
</div>

<button use:hoverLift>Lifts on hover</button>

<div use:magnetic={{ strength: 0.3 }}>
  Subtly follows cursor
</div>
```

## 4. Common Interface

All effect **wrapper components** should accept:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `intensity` | `number` | `1` | Effect strength (0–1) |
| `disabled` | `boolean` | `false` | Disable the effect |
| `class` | `string` | `''` | CSS classes |
| `children` | `Snippet` | — | Child content |

All effects should respect `prefers-reduced-motion: reduce` — disable or minimize animations when the user's OS preference is set.

## 5. Reveal — Scroll-Triggered Entry Animations

The most impactful effect from the reference site. Elements animate into view as the user scrolls down the page.

### 5.1 Component Props (Reveal)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `direction` | `'up' \| 'down' \| 'left' \| 'right' \| 'none'` | `'up'` | Slide direction |
| `distance` | `string` | `'1.5rem'` | Slide distance (CSS unit) |
| `duration` | `number` | `600` | Animation duration (ms) |
| `delay` | `number` | `0` | Delay before animation starts (ms) |
| `stagger` | `number` | `0` | Delay increment per direct child (ms) — for staggered reveals |
| `once` | `boolean` | `true` | Only animate once (vs every time element enters viewport) |
| `threshold` | `number` | `0.1` | IntersectionObserver threshold |
| `easing` | `string` | `'cubic-bezier(0.4, 0, 0.2, 1)'` | CSS easing function |

### 5.2 Action Parameters (use:reveal)

Same parameters as component props, passed as an object:

```svelte
<div use:reveal={{ direction: 'left', delay: 100, duration: 500 }}>
```

### 5.3 Implementation

Uses IntersectionObserver to detect when element enters viewport, then applies CSS animation:

```css
[data-reveal] {
  opacity: 0;
  transition: opacity var(--reveal-duration) var(--reveal-easing),
              translate var(--reveal-duration) var(--reveal-easing);
}

[data-reveal="up"]    { translate: 0 var(--reveal-distance); }
[data-reveal="down"]  { translate: 0 calc(-1 * var(--reveal-distance)); }
[data-reveal="left"]  { translate: var(--reveal-distance) 0; }
[data-reveal="right"] { translate: calc(-1 * var(--reveal-distance)) 0; }

[data-reveal-visible] {
  opacity: 1;
  translate: 0 0;
}
```

### 5.4 Staggered Children

When `stagger` > 0 on the Reveal component, each direct child gets an incremental `transition-delay`:

```svelte
<Reveal stagger={100}>
  <Card>...</Card>  <!-- delay: 0ms -->
  <Card>...</Card>  <!-- delay: 100ms -->
  <Card>...</Card>  <!-- delay: 200ms -->
</Reveal>
```

## 6. HoverLift — Hover Elevation Effect

A lightweight action that adds a "lift" effect on hover: subtle upward translation + elevated shadow.

### 6.1 Action Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `distance` | `string` | `'-0.25rem'` | Translate distance on hover |
| `shadow` | `string` | `'0 10px 25px -5px rgba(0,0,0,0.1)'` | Box shadow on hover |
| `duration` | `number` | `200` | Transition duration (ms) |

### 6.2 Implementation

Sets `transition` on mount, applies `transform` + `box-shadow` on mouseenter, resets on mouseleave.

## 7. Magnetic — Cursor Attraction Effect

Subtle effect where an element shifts slightly toward the cursor when hovered. Creates a magnetic, alive-feeling interaction.

### 7.1 Action Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `strength` | `number` | `0.3` | Maximum displacement as fraction of element size (0–1) |
| `duration` | `number` | `300` | Transition duration for return to center (ms) |

### 7.2 Implementation

On mousemove within the element, calculate cursor offset from center and translate the element proportionally. On mouseleave, transition back to original position.

## 8. Ripple — Click Ripple Effect

Material-design inspired click ripple. Adds a circular expanding ripple from the click point.

### 8.1 Action Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `color` | `string` | `'currentColor'` | Ripple color |
| `opacity` | `number` | `0.15` | Ripple opacity |
| `duration` | `number` | `500` | Ripple animation duration (ms) |

### 8.2 Implementation

On click, appends a `<span>` at click coordinates with CSS animation that scales from 0 and fades out. Removes the span after animation completes. Uses `overflow: hidden` on the host element.

## 9. Glow — Animated Glow Effect

Wrapper component that adds an animated glowing shadow around its children.

### 9.1 Additional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `color` | `string` | `'var(--primary-500)'` | Glow color |
| `radius` | `number` | `20` | Glow spread (px) |
| `pulse` | `boolean` | `false` | Whether glow pulses |
| `pulseDuration` | `number` | `2000` | Pulse cycle duration (ms) |

### 9.2 Implementation

Uses `box-shadow` with animated opacity/spread. When `pulse` is true, uses CSS `@keyframes` for continuous pulsing.

## 10. FloatingBubbles — Decorative Particle Effect

Renders semi-transparent floating circles over a container. Useful for hero sections and CTAs.

### 10.1 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | `10` | Number of bubbles |
| `colors` | `string[]` | `['currentColor']` | Bubble colors |
| `minSize` | `number` | `0.75` | Minimum bubble size (rem) |
| `maxSize` | `number` | `2.25` | Maximum bubble size (rem) |
| `opacity` | `number` | `0.15` | Bubble base opacity |
| `speed` | `number` | `1` | Animation speed multiplier |

### 10.2 Implementation

Generates `count` absolutely-positioned `<span>` elements with randomized position, size, and animation delay. Each bubble has a CSS animation that translates Y/X and scales in an infinite loop.

## 11. SectionDivider — Animated Decorative Divider

A decorative section divider with sequenced animation: lines draw in from edges, then dots pop in at center.

### 11.1 Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dotCount` | `number` | `3` | Number of center dots |
| `duration` | `number` | `800` | Line draw-in duration (ms) |
| `delay` | `number` | `200` | Initial delay before animation |
| `class` | `string` | `''` | CSS classes |

### 11.2 Implementation

Uses IntersectionObserver to trigger on scroll. Lines use `scaleX: 0 → 1` with `transform-origin` from edges. Dots pop in with staggered delay after lines complete.

```css
[data-section-divider-line] {
  transform: scaleX(0);
  transition: transform var(--sd-duration) ease-out;
}
[data-section-divider-line][data-visible] { transform: scaleX(1); }
[data-section-divider-dot] {
  transform: scale(0);
  opacity: 0;
  transition: transform 0.4s ease-out, opacity 0.4s ease-out;
}
```

## 12. GradientText — Gradient Text Utility

A lightweight wrapper or CSS utility that applies gradient color to text content.

### 12.1 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `from` | `string` | `'var(--primary-500)'` | Gradient start color |
| `to` | `string` | `'var(--accent-500)'` | Gradient end color |
| `direction` | `string` | `'135deg'` | Gradient angle |
| `children` | `Snippet` | — | Text content |

### 12.2 Implementation

Could be a component or CSS utility class. Uses `background: linear-gradient(...)`, `background-clip: text`, `-webkit-text-fill-color: transparent`.

```css
[data-gradient-text] {
  background: linear-gradient(var(--gt-direction), var(--gt-from), var(--gt-to));
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

## 13. BackgroundOrbs — Decorative Blurred Circles

Absolute-positioned blurred gradient circles for hero section backgrounds.

### 13.1 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `count` | `number` | `2` | Number of orbs |
| `colors` | `string[]` | theme-derived | Gradient colors |
| `blur` | `string` | `'3rem'` | Blur amount |
| `opacity` | `number` | `0.2` | Orb opacity |
| `size` | `string` | `'20rem'` | Orb diameter |

### 13.2 Implementation

Renders absolute-positioned `<div>` elements with `border-radius: 9999px`, `filter: blur(...)`, gradient backgrounds. Positions are randomized or configurable. Container must have `position: relative; overflow: hidden`.

## 14. Additional Archived Components

| Component | Description | Archive |
|-----------|-------------|---------|
| `GraphPaper` | Grid background with configurable units/thickness | `archive/ui/src/GraphPaper.svelte` |
| `Fillable` | Markdown text with fillable options | `archive/ui/src/Fillable.svelte` — uses `marked` |

## 15. CSS Utility Animations

Reusable CSS animations to include in the base theme (available to any component):

```css
/* Float — gentle vertical bobbing */
@keyframes rk-float {
  0%, 100% { translate: 0 0; }
  50%      { translate: 0 -0.375rem; }
}

/* Shimmer — opacity pulse */
@keyframes rk-shimmer {
  0%, 100% { opacity: 0.5; }
  50%      { opacity: 1; }
}

/* Pulse glow — shadow pulse */
@keyframes rk-pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 var(--glow-color, rgba(var(--primary-500), 0.1)); }
  50%      { box-shadow: 0 0 1.25rem 0 var(--glow-color, rgba(var(--primary-500), 0.2)); }
}
```

## 16. Dependencies

- No external animation libraries — all effects use CSS transitions/animations + vanilla JS (IntersectionObserver, pointer events)
- `@rokkit/core` `id()` for unique IDs (Shine filter IDs)
- `@rokkit/actions` for action packaging (reveal, hoverLift, magnetic, ripple)

## 17. `prefers-reduced-motion` Support

All effects must respect the user's motion preference:

```css
@media (prefers-reduced-motion: reduce) {
  [data-reveal] { transition-duration: 0ms !important; opacity: 1 !important; translate: 0 !important; }
  [data-tilt], [data-shine] { /* disable transforms */ }
}
```

Actions should check `window.matchMedia('(prefers-reduced-motion: reduce)')` and skip animations when matched.
