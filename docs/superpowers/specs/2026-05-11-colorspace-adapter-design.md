# ColorSpace Adapter — Design Spec

> **Date:** 2026-05-11
> **Status:** Draft
> **Scope:** `@rokkit/core` color pipeline refactor + `@rokkit/unocss` alpha support + `@rokkit/themes` build

## Problem

CSS custom properties store bare channel values (`249,115,22` or `0.58 0.15 35`). This means `var(--color-primary-z5)` is never a valid CSS color — it only works inside UnoCSS `@apply` utilities which inject the color-space function wrapper. Raw CSS usage in `background:`, `border-color:`, `box-shadow:`, `color-mix()`, or pseudo-elements requires knowing the active color space and manually wrapping, which breaks the theme/skin separation principle.

Color-space logic is scattered across 5 locations in `@rokkit/core`: `modifiers`, `COLOR_SPACE_WRAPPERS`, `colorToRgb`, `hexToComponents`, and individual `hex2*` functions.

## Solution

1. Store **wrapped** color values in CSS variables: `--color-primary-500: rgb(249, 115, 22)`
2. Consolidate all color-space logic into a **strategy pattern** with per-space adapter classes
3. Use `color-mix()` for alpha/opacity modifiers instead of bare-channel injection

## Architecture

### ColorSpace class hierarchy

```
ColorSpace (base)            — abstract interface + static factory
├── RgbColorSpace            — rgb(r, g, b)
├── HslColorSpace            — hsl(H S% L%)
└── OklchColorSpace          — oklch(L C H)
```

### File: `packages/core/src/color-space.js`

```js
class ColorSpace {
  /** Factory — returns adapter for the given space name */
  static create(space = 'rgb') { ... }

  /** Color-space name: 'rgb' | 'hsl' | 'oklch' */
  get name() { }

  /** CSS color-mix interpolation space: 'srgb' | 'srgb' | 'oklch' */
  get mixSpace() { }

  /**
   * Convert any input to a wrapped CSS color in this adapter's color space.
   *
   * The config's colorSpace declares the INPUT format of palette values.
   * Hex values (#rrggbb) are always RGB and get converted to the target space.
   * Bare channel strings are assumed to already be in this adapter's space.
   *
   * Detection and handling:
   *   - Hex '#ff0000' → convert to adapter's space → wrap: 'oklch(0.63 0.26 29)'
   *   - Bare channels '0.63 0.26 29' → already in space → wrap: 'oklch(0.63 0.26 29)'
   *   - Already wrapped 'oklch(...)' → pass through
   *   - Non-string → pass through unchanged
   *
   * @param {unknown} value
   * @returns {unknown}
   */
  wrap(value) { }

  /**
   * Generate a UnoCSS-compatible color value from a CSS variable name.
   * Used by Theme.getColorRules() for theme.colors.
   *
   * For full opacity: var(--color-x)
   * With alpha placeholder: color-mix(in <mixSpace>, var(--color-x) <alpha-value>%, transparent)
   *
   * UnoCSS replaces <alpha-value> with actual percentage at build time.
   *
   * @param {string} varName — e.g. '--color-primary-500'
   * @returns {string}
   */
  themeColor(varName) { }
}
```

### Adapter implementations

**RgbColorSpace:**
- `wrap('#ff0000')` → `rgb(255, 0, 0)`
- `wrap('255,0,0')` → `rgb(255, 0, 0)` (bare comma-separated → wrap)
- `mixSpace` → `'srgb'`
- Hex conversion: reuses existing `hex2rgb` logic (becomes private method)

**HslColorSpace:**
- `wrap('#ff0000')` → `hsl(0 100% 50%)`
- `wrap('0 100% 50%')` → `hsl(0 100% 50%)` (bare space-separated → wrap)
- `mixSpace` → `'srgb'`
- Hex conversion: reuses existing `hex2hsl` logic

**OklchColorSpace:**
- `wrap('#ff0000')` → `oklch(0.63 0.26 29.23)`
- `wrap('0.63 0.26 29')` → `oklch(0.63 0.26 29)` (bare → wrap)
- `mixSpace` → `'oklch'`
- Hex conversion: reuses existing `hex2oklch` logic

### Detection of "already wrapped" input

A value is already wrapped if it starts with the adapter's function name followed by `(`. Pass through unchanged.

A value is bare channels if it's a string that doesn't start with a known CSS function and doesn't start with `#`. Wrap it directly.

### Theme class changes

```js
// Before
constructor({ colorSpace = 'rgb', ... }) {
  this.#colorSpace = colorSpace
}

// After
constructor({ colorSpace = 'rgb', ... }) {
  this.#adapter = ColorSpace.create(colorSpace)
}
```

**getPalette()** — uses `adapter.wrap(value)` instead of `colorToRgb(value, space)`
```js
// Before: '--color-primary-500': '249,115,22'
// After:  '--color-primary-500': 'rgb(249, 115, 22)'
```

**getColorRules()** — uses `adapter.themeColor(varName)` instead of `COLOR_SPACE_WRAPPERS`
```js
// Before: { 500: 'rgba(var(--color-primary-500),<alpha-value>)' }
// After:  { 500: 'color-mix(in srgb, var(--color-primary-500) <alpha-value>%, transparent)' }
```

**getZScaleCSS()** — unchanged (pure var aliases, no color-space knowledge needed)

**getShortcuts()** — unchanged (maps z-scale names to numeric shade names)

### Deleted code

These are removed from `theme.ts`:
- `modifiers` object
- `COLOR_SPACE_WRAPPERS` object
- `shadesOf()` function (or refactored to use adapter)

These are removed from `utils.js` (moved into adapter classes as private methods):
- `hex2rgb()`, `hex2hsl()`, `hex2oklch()` — become private in their adapters
- `hexToComponents()` — replaced by `adapter.wrap()`
- `colorToRgb()` — replaced by `adapter.wrap()`

These remain in `utils.js` (used elsewhere):
- `oklch2hex()` — reverse conversion, used by chart/swatch
- `hex2rgb` — keep as named export for backward compat if used externally, but mark deprecated

### UnoCSS alpha support

Current: UnoCSS sees `rgba(var(--x),<alpha-value>)` and replaces `<alpha-value>` with the opacity.

New: UnoCSS sees `color-mix(in srgb, var(--x) <alpha-value>%, transparent)` and replaces `<alpha-value>` with the percentage.

The `<alpha-value>` placeholder is a UnoCSS convention. We need to verify that UnoCSS replaces it inside `color-mix()` the same way it does inside `rgba()`. If not, we use a custom rule.

**Fallback if UnoCSS doesn't replace inside color-mix:** Define a custom UnoCSS rule that matches `bg-primary-500/50` and generates the `color-mix` output directly. The semantic shortcuts already handle z-scale → numeric shade mapping, so the rule only needs to intercept the numeric shade + opacity pattern.

### themes/build.mjs changes

The build creates a `Theme` with default colorSpace. No changes needed — the Theme class handles everything via the adapter.

### Breaking changes

- CSS variable values change from bare channels to wrapped colors
- Any consumer using `rgba(var(--color-x))` or `oklch(var(--color-x) / alpha)` directly breaks
- The `shadesOf()` export API changes (or is removed)
- `colorToRgb` and `hexToComponents` exports are removed

The `@rokkit/themes` CSS files were already migrated to `@apply` utilities in the Phase 7 cleanup, so they are unaffected. The zen-sumi `oklch(var(--color-x) / 1)` patterns in focus rings need updating to just `var(--color-x)`.

## Test plan

1. Unit tests for each ColorSpace adapter: `wrap()` with hex, bare channels, already-wrapped, non-string inputs
2. Unit tests for `themeColor()`: verify color-mix output format
3. Update existing `theme.spec.js`: palette values are now wrapped, color rules use color-mix
4. Update `utils.spec.js`: remove tests for deleted functions, add adapter tests
5. Integration: `bun run build` for themes package — verify compiled CSS uses wrapped values
6. Integration: `bun run test:ci` — all 3321+ tests pass
7. Visual: verify playground renders correctly with wrapped variables

## Scope check

This spec covers:
- New `color-space.js` module with 3 adapter classes
- Theme class refactor to use adapter
- Removal of scattered color-space functions
- Updated tests
- themes/build.mjs compatibility

This spec does NOT cover:
- Updating zen-sumi `oklch(var(...) / 1)` focus ring patterns (separate cleanup)
- Chart package color handling (uses `oklch2hex` which is unrelated)
