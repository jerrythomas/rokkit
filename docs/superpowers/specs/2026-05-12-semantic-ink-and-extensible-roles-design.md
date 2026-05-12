# Semantic Ink & Extensible Color Roles

**Date:** 2026-05-12
**Status:** Design approved, pending implementation plan

## Problem

Rokkit's semantic color system has 10 fixed roles (surface, primary, secondary, etc.) with no dedicated text/foreground role. Zen-sumi uses `surface` for both backgrounds and text via z-scale contrast (`bg-surface-z1 text-surface-z9`), which works but conflates two distinct concerns. Users cannot introduce their own semantic vocabulary (e.g., `paper`, `canvas`, `annotation`) or override role names to match their mental model.

## Design Goals

1. **Ink role** — a first-class semantic role for text/foreground, complementary to surface
2. **Extensible custom roles** — users can define arbitrary semantic colors beyond the built-in set
3. **Role aliasing** — users can rename core roles to match their vocabulary (e.g., `surface: { alias: 'paper' }`)
4. **Generalized dual-palette** — any role can have separate light/dark palettes (not just surface)
5. **Source-level theme compilation** — themes ship as source CSS, compiled by the consumer's UnoCSS, so aliased variable names appear clean in the final output
6. **Inverted z-scale for ink** — `ink-zN` always complements `surface-zN` at the same z-level

## Config Schema

Three value shapes for skin role definitions:

```js
// rokkit.config.js
skins: {
  default: {
    // String — single palette for both modes
    primary: 'shu',

    // Dual object — per-mode palettes (works on ANY role)
    surface: { light: 'kami', dark: 'sumi' },
    ink:     { light: 'sumi', dark: 'kami' },

    // Alias object — resolves to another role's CSS variables
    paper: { alias: 'surface' },

    // Custom roles — user-defined, gets full z-scale + shortcuts
    canvas:     'stone',
    annotation: 'amber',
  }
}
```

### Alias Semantics

Aliases let users work in their own vocabulary while Rokkit components work in theirs.

**Forward alias** (`paper: { alias: 'surface' }`): `bg-paper-z5` resolves to the same CSS variables as `bg-surface-z5`. The user gets a convenience name.

**Reverse alias** (`surface: { alias: 'paper' }`): The user defines `paper` as the real palette. Core role `surface` becomes an alias — Rokkit's internal `@apply bg-surface-z1` resolves through paper's color rules at build time. The compiled CSS contains only `var(--color-paper-*)`. Zero trace of `surface` in the shipped bundle.

This enables users to fully own their vocabulary:

```js
skins: {
  default: {
    paper:   { light: 'kami', dark: 'sumi' },  // real palette
    ink:     { light: 'sumi', dark: 'kami' },  // real palette
    surface: { alias: 'paper' },                // Rokkit internals → paper
    primary: 'shu',
  }
}
```

```html
<!-- User's app code — their vocabulary -->
<div class="bg-paper-z1 text-ink-z1">High contrast</div>
```

```css
/* Rokkit theme source — unchanged */
[data-style='zen-sumi'] [data-card] {
  @apply bg-surface-z1 text-surface-z8 border-surface-z2;
}

/* After consumer's UnoCSS compiles it — only paper variables */
[data-style='zen-sumi'] [data-card] {
  background-color: var(--color-paper-100);
  color: var(--color-paper-800);
  border-color: var(--color-paper-200);
}
```

## Ink: Inverted Surface

Ink's z-scale runs in the opposite direction from surface. This is automatic — not a user config option.

| z-level | surface (light) | ink (light) | Contrast pair |
|---------|----------------|-------------|---------------|
| z0      | shade 50       | shade 950   | max contrast  |
| z1      | shade 100      | shade 900   | high contrast |
| z3      | shade 300      | shade 700   | medium        |
| z5      | shade 500      | shade 500   | equal weight  |
| z7      | shade 700      | shade 300   | medium (inv)  |
| z9      | shade 900      | shade 100   | high (inv)    |

In dark mode, both flip — the complementary relationship is preserved.

**Default palette:** ink inherits surface's palette (inverted z-scale). The system generates its own `--color-ink-*` CSS variables populated from surface's palette values — so switching to a custom ink palette later doesn't change any variable names. Out of the box, `text-ink-z1` on `bg-surface-z1` uses opposite ends of the same palette.

**Custom palette:** user provides a distinct ink palette (e.g., cool gray ink on warm paper). The inverted z-scale still applies. The palette itself follows standard shade ordering (50=lightest, 950=darkest) — the system handles the inversion.

```css
/* Generated CSS — light mode */
:root {
  --color-surface-z1: var(--color-surface-100);  /* light bg */
  --color-ink-z1:     var(--color-ink-900);      /* dark text */
}

/* Dark mode — both flip, contrast preserved */
[data-mode="dark"] {
  --color-surface-z1: var(--color-surface-900);  /* dark bg */
  --color-ink-z1:     var(--color-ink-100);      /* light text */
}
```

### Designer workflow

Pick a z-level. Apply it to both surface and ink. Done.

```html
<div class="bg-surface-z1 text-ink-z1">High contrast body</div>
<div class="bg-surface-z1 text-ink-z3">Slightly muted</div>
<div class="bg-surface-z1 text-ink-z5">Mid weight caption</div>
```

## Generalized Dual-Palette

Any role can specify separate light/dark palettes. Currently only surface supports this. The system generalizes.

```js
primary: { light: 'shu', dark: 'shu-muted' },  // desaturated in dark
danger:  { light: 'shu', dark: 'kohaku' },      // warm warning in dark
ink:     { light: 'sumi', dark: 'kami' },        // ink ↔ paper swap
```

Each dual-palette role generates its own `[data-mode="dark"]` override block with the alternate palette's shade values.

## Source-Level Theme Distribution

Themes ship as source CSS (`@apply` directives), not pre-compiled dist. The consumer's UnoCSS build is the sole compilation step.

```
themes/src/zen-sumi/button.css    (@apply bg-surface-z1)
       |
consumer imports: import '@rokkit/themes/zen-sumi'
       |
consumer's UnoCSS (presetRokkit() + transformerDirectives)
       |
app bundle                        (var(--color-paper-100))
```

### What changes in the themes package

- `package.json` exports point to `src/`, not `dist/`
- `build.mjs` becomes a dev/test/CI validation tool — confirms CSS compiles, checks for broken `@apply` references
- No `dist/` in the published package

### What consumers need

Nothing new. They already have `presetRokkit()` configured with `transformerDirectives`. Theme source CSS routes through the same pipeline as their app CSS.

## Fallback Chain

```
ink       → surface (inverted z-scale)
tertiary  → primary
secondary → primary
accent    → primary
error     → danger
```

Core roles (surface, primary, secondary, tertiary, accent, success, warning, danger, error, info, ink) always resolve — either via explicit config, fallback, or alias.

Custom roles (canvas, annotation, etc.) are optional — they only exist when defined.

## Validation

1. **Alias target must exist** — build error if alias points to undefined role
2. **No circular aliases** — detected and rejected at config load time
3. **No chained aliases** — aliases must point to a real palette, not another alias
4. **Core roles must resolve** — every core role must have a path to a real palette (config, fallback, or alias)
5. **Contrast warnings** — build-time OKLCH lightness check between ink-zN and surface-zN at key z-levels (z1, z3, z7, z9), warning if below WCAG AA 4.5:1 ratio

## `text-on-*` Coexistence

Ink is the default text palette for body text, headings, labels, captions. `text-on-*` continues to exist for high-contrast text on saturated backgrounds (primary buttons, badges) where ink may not provide sufficient contrast.

## Testing Strategy

### Unit tests (packages/core, packages/unocss)

1. Inverted z-scale generation — ink role produces inverted shade mappings
2. Alias resolution — aliased role generates color rules pointing to target's CSS variables
3. Custom role generation — arbitrary config keys produce full z-scale + shortcuts
4. Fallback chain — undefined ink resolves to surface palette (inverted)
5. Generalized dual-palette — any role with `{ light, dark }` generates mode-specific blocks
6. Validation — circular/chained aliases and missing targets throw at config load
7. Contrast warnings — low-contrast ink/surface pairs emit build warnings

### Integration tests (theme compilation)

8. Source-level compilation — theme `@apply` directives resolve through consumer config with aliases
9. No variable duplication — compiled output with aliases contains zero references to aliased-away names

### E2E tests (visual verification)

10. Ink/surface at matching z-levels — screenshots of z1-on-z1, z5-on-z5, z9-on-z9, light + dark
11. Custom ink palette — zen-sumi with distinct sumi ink renders correctly
12. Cross-theme regression — existing themes unaffected when ink defaults to inverted surface

## Files Affected

| File | Change |
|------|--------|
| `packages/core/src/constants.js` | Add `ink` to `DEFAULT_THEME_MAPPING`, add `COLOR_FALLBACKS.ink` |
| `packages/core/src/theme.ts` | Inverted z-scale for ink in `getZScaleCSS()`, alias resolution in `resolveColors()`, custom role passthrough |
| `packages/unocss/src/preset.ts` | Alias handling in `buildPreflights()`, `buildSemanticShortcuts()`, `buildTheme()` — generate color rules for alias targets |
| `packages/unocss/src/config.js` | Alias/custom role validation in `loadConfig()`, `resolveColormap()` handles alias objects |
| `packages/themes/package.json` | Exports point to `src/` instead of `dist/` |
| `packages/themes/build.mjs` | Becomes validation-only (CI check, not consumer-facing) |
| `demo/rokkit.config.js` | Add `ink` to default skin (zen-sumi: `{ light: 'sumi', dark: 'kami' }`) |
| `packages/themes/src/zen-sumi/*.css` | Migrate text tokens from `text-surface-zN` to `text-ink-zN` where appropriate |
