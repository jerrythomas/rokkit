# Named Tokens — Dark Mode Inversion Gap

**Date:** 2026-05-20 (updated 2026-05-21)
**Status:** Backlog — partial fix in place; deeper issue remains

## Status today

- Top-level `skin:` (dual-palette) is now present in `demo/rokkit.config.js`.
- The runtime preset correctly emits a `[data-mode="dark"]` block for named tokens.
- The demo's runtime `applySkin` now writes dual-palette overrides via a managed `<style>` element (`koan-skin-overrides`).
- The previous compat workaround in `demo/src/lib/koan/compat.css` (which produced a circular reference against the preset's z-alias direction) has been removed.

So the preset emit is correctly *structurally* dual-palette. **Visually, dark mode is still wrong** because of an inversion mismatch described below.

## The remaining problem

The named-token shade map (`packages/core/src/named-tokens.ts`):

| Named slot     | Shade |
| -------------- | ----- |
| `paper`        | 50    |
| `paper-soft`   | 100   |
| `paper-mute`   | 200   |
| `paper-edge`   | 400   |
| `ink`          | 900   |
| `ink-mute`     | 700   |
| `ink-soft`     | 500   |
| `ink-faint`    | 300   |

That mapping is applied regardless of mode. In **light** mode with `kami` palette (50 = lightest, 900 = darkest) that's correct:
- `--paper`  = kami.50  = lightest (canvas) ✓
- `--ink`    = kami.900 = darkest (text)   ✓

In **dark** mode with `sumi` palette — and `sumi` as currently defined uses the **same direction** as kami (50 = lightest, 900 = darkest) — the preset emits:
- `--paper`  = sumi.50  = very light → wrong, dark mode needs a dark canvas
- `--ink`    = sumi.900 = very dark  → wrong, dark mode needs light text

## Root cause

The named-token system implicitly assumes that **shade index = semantic role**, so the same shade key must mean the same semantic value across modes. Both `paper` and `ink` use a fixed shade key.

For that to work, the dark-side palette has to be defined with **inverted indices**:

```
// Current sumi (wrong direction for the named-token system)
sumi: {
  50:  '0.975 0.008 85',  // lightest — but in dark mode "paper" wants the DARKEST
  900: '0.210 0.012 50'   // darkest  — but in dark mode "ink"   wants the LIGHTEST
}

// What sumi needs to be — index = semantic role identical to kami
sumi: {
  50:  '0.170 0.010 50',  // shade 50 = canvas → darkest in dark mode
  100: '0.210 0.012 50',
  ...
  900: '0.940 0.008 85'   // shade 900 = ink → lightest in dark mode
}
```

The comment in the current `sumi` palette block even hints at this:

> "Designed as a two-pole scale: the 'light' end (50–400) holds warm paper whites for dark-mode text, and the 'dark' end (500–950) holds sumi-ink tones for dark-mode backgrounds. **The z-flip in base.css then maps z0→950 (ink bg) and z9→100 (primary text) automatically.**"

So the palette was designed for the **z-flip** model: same palette indices in both modes, but the z-aliases flip direction. That worked when components were authored against `--color-*-z*`. The trimmed-vocab named tokens skip the z-alias layer and read shade indices directly — which makes them assume identical conventions in both palettes.

## Two ways to fix

### Option A — invert the dark palette definitions (preferred)

Rewrite `sumi` (and any other "dark-target" palette) so that shade 50 is the **darkest** and shade 900 is the **lightest**. This keeps the named-token shade map mode-agnostic and is the spec's stated intent.

Pros:
- No changes to `@rokkit/core` or the preset.
- Same `kami → sumi` mapping shape; just sumi values change.
- Z-aliases continue to flip correctly because they reference the same indices.

Cons:
- Breaking change for any code that reads sumi shades directly by index.
- The comment in sumi's own definition becomes correct (currently it's already half-right).

### Option B — make the shade map mode-aware in the preset

Teach the preset to use *different* shade indices per mode for "inverted" roles (`surface`, `ink`, …). E.g.:

```
NAMED_TOKEN_SHADE_MAP_DARK: {
  'paper':       950,  // was 50
  'paper-soft':  900,  // was 100
  'paper-mute':  800,  // was 200
  ...
}
```

Pros:
- Works with any palette defined "normally" (50 light → 900 dark).
- No palette data changes.

Cons:
- New parallel constant; preset emit gets more conditional.
- Doesn't match the "same shade = same semantic" spec intent.

## Recommended path

Option A. Invert `sumi` and any other intentionally-dark palette so the trimmed-vocab assumption holds. Add a Vitest fixture that asserts both modes resolve `--paper` to a low-lightness oklch value and `--ink` to a high-lightness oklch value, to catch this kind of inversion regression.

## Out of scope

- Changing the named-token vocabulary itself.
- Migrating `@rokkit/themes/base.css` (the package's pre-built CSS uses the default single-palette skin and has no dark named block — that's the original investigation noted in the prior revision of this file; the runtime preset now does the right thing for dual-palette consumers).
