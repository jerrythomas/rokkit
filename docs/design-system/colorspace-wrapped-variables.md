# Colorspace-Wrapped CSS Variables

> **Status:** Backlog
> **Created:** 2026-05-11

## Problem

CSS custom properties for the z-scale (`--color-surface-z3`, `--color-primary-z5`, etc.) currently store **bare channel values**:

```css
/* colorSpace: 'rgb' */
--color-surface-z3: 2, 6, 23;

/* colorSpace: 'oklch' */
--color-surface-z3: 0.92 0.012 85;
```

This means `var(--color-surface-z3)` is never a valid CSS color on its own. It only works when wrapped by a UnoCSS utility class (`@apply bg-surface-z3`) which adds the function wrapper. Raw CSS usage in `background:`, `border-color:`, `box-shadow`, or `color-mix()` requires knowing the active color space — which breaks the theme/skin separation principle.

## Proposal

Store complete, colorspace-wrapped values in the CSS variables:

```css
/* colorSpace: 'rgb' */
--color-surface-z3: rgb(2, 6, 23);

/* colorSpace: 'oklch' */
--color-surface-z3: oklch(0.92 0.012 85);
```

Config input remains bare values — the `Theme` class / UnoCSS preset wraps them during generation.

## Benefits

- `var(--color-surface-z3)` works anywhere in raw CSS — no `@apply` required
- `color-mix(in oklch, var(--color-surface-z3) 30%, transparent)` just works
- `box-shadow: 0 0 0 2px var(--color-primary-z5)` just works
- Pseudo-elements (`::before`, `::-webkit-slider-thumb`) can use variables directly
- Theme CSS becomes color-space agnostic — no hardcoded `oklch()` or `rgba()` wrappers
- Base structural CSS can use color without `@apply` dependency

## Impact

- **`@rokkit/core` Theme class**: `getPalette()`, `getZScaleCSS()`, `mapVariant()` need to emit wrapped values
- **`@rokkit/unocss` preset**: Shortcut generation (`bg-surface-z3`, `text-primary-z5`) needs to parse wrapped values for alpha modifier support (`bg-surface-z3/50`)
- **Alpha/opacity utilities**: Currently rely on bare channels + `/` syntax (`oklch(L C H / alpha)`). With wrapped values, alpha modifiers need a different approach — likely `color-mix(in oklch, var(--color-X) P%, transparent)` or the CSS `color()` function
- **Breaking change**: Any consumer using `rgba(var(--color-X))` or `oklch(var(--color-X) / alpha)` patterns directly

## Open Questions

- How to handle alpha/opacity modifiers with wrapped values? `color-mix` vs CSS relative color syntax (`oklch(from var(--x) l c h / 0.5)`)
- Should we keep bare-channel variables alongside wrapped ones for backward compat during migration?
