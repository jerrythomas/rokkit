# Colorspace-Wrapped CSS Variables

> **Status:** Done — the z-scale layer was removed entirely (drop-legacy-z-scale effort, 2026-06).
> Named tokens (`--paper`, `--primary`, `--ink-mute`, …) are complete, colorspace-wrapped values.
> **Created:** 2026-05-11

## Problem (historical)

The old z-scale CSS custom properties stored **bare channel values**:

```css
/* colorSpace: 'rgb' — OLD (no longer emitted) */
--old-surface-z3: 2, 6, 23;

/* colorSpace: 'oklch' — OLD (no longer emitted) */
--old-surface-z3: 0.92 0.012 85;
```

This made `var(--old-surface-z3)` invalid as a standalone CSS color — it only worked
inside a UnoCSS utility class that added the function wrapper. Raw CSS usage in
`background:`, `border-color:`, `box-shadow`, or `color-mix()` required knowing the active
color space, which broke theme/skin separation.

## Resolution

The z-scale layer was removed. Named tokens (`--paper`, `--primary`, `--ink-mute`, etc.)
emit **complete, colorspace-wrapped values** — e.g. `--paper: oklch(0.985 0.005 85)` or
`--primary: rgb(232, 85, 43)`. They work everywhere in raw CSS:

```css
/* current — named tokens are complete colors */
background-color: var(--paper-soft);
color: var(--ink);
box-shadow: 0 0 0 2px var(--focus-ring);
color-mix(in oklch, var(--primary) 30%, transparent);
```

See `docs/llms/index.txt` for the full named-token vocabulary.
