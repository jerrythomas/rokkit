# Theme System Expansion Design

**Date:** 2026-03-20
**Status:** Approved

---

## Overview

Two related additions to the Rokkit theme system:

1. **Five new built-in themes** — `daisy-ui`, `shadcn`, `bits-ui`, `carbon`, `ant-design` — each matching a popular component library's visual identity while using Rokkit's color token architecture.
2. **Custom `palettes` field** in `rokkit.config.js` — allows users to define named palettes with custom color values (hex, hsl, oklch, or any valid CSS color), extending the color names available to the `colors` mapping.

---

## 1. Five New Themes

### Motivation

Rokkit's component HTML is already unstyled and uses `data-*` hooks. The theme CSS is a pure appearance layer. Adding new themes costs nothing architecturally — each theme is ~22 CSS files implementing the same token contract.

Each new theme answers the question: "What would this library look like if it used Rokkit's component model?"

### Visual Style Per Theme

| Theme          | Border Radius             | Borders                           | Focus Style                  | Feel              |
| -------------- | ------------------------- | --------------------------------- | ---------------------------- | ----------------- |
| **shadcn**     | `rounded-md`              | `border-surface-z3` flat          | `ring-2 ring-offset-2`       | Clean, minimal    |
| **daisy-ui**   | `rounded-full` buttons    | Bold fills, solid colors          | `outline-2 outline-offset-2` | Playful, colorful |
| **bits-ui**    | `rounded-lg`              | `shadow-sm` + subtle border       | Soft ring                    | Polished, premium |
| **carbon**     | `rounded-none` everywhere | Bottom-border inputs `border-b-2` | Square, heavy fill           | Dense, enterprise |
| **ant-design** | `rounded` (4px)           | Thin 1px borders                  | `shadow-md` dropdowns        | Clean, enterprise |

### Architecture

Each theme is a CSS file per component (e.g. `packages/themes/src/shadcn/Button.css`) that uses Rokkit's CSS custom properties:

```css
/* packages/themes/src/shadcn/Button.css */
[data-style='shadcn'] [data-component='button'] {
  border-radius: var(--radius-md);
  border: 1px solid var(--color-surface-z3);
  background: transparent;
  /* ... */
}
```

All color references use semantic tokens (`--color-primary-500`, `--color-surface-z1`, etc.) so themes respond automatically to skin switching.

### Build Integration

- Add theme folders under `packages/themes/src/`
- Update `packages/themes/build.mjs` to include new themes
- Update `packages/themes/package.json` exports
- Add themes to `packages/cli/src/init.js` theme picker
- Add themes to `KNOWN_THEMES` in `packages/cli/src/doctor.js`

---

## 2. Custom `palettes` Field

### Motivation

Currently users can only remap semantic colors (`primary`, `surface`, etc.) to UnoCSS preset-mini palette names (e.g. `primary: 'blue'`). There is no way to use custom brand colors like `#0f4c81` or `oklch(65% 0.2 240)`.

### Design

A new `palettes` field in `rokkit.config.js` lets users define named palettes with custom shades. These palette names become available to the `colors` mapping:

```js
// rokkit.config.js
export default {
  palettes: {
    brand: {
      50: 'oklch(97% 0.01 250)',
      100: 'oklch(93% 0.03 250)',
      200: 'oklch(87% 0.06 250)',
      300: 'oklch(79% 0.10 250)',
      400: 'oklch(70% 0.14 250)',
      500: 'oklch(60% 0.18 250)',
      600: 'oklch(50% 0.16 250)',
      700: 'oklch(41% 0.14 250)',
      800: 'oklch(33% 0.11 250)',
      900: 'oklch(25% 0.08 250)',
      950: 'oklch(18% 0.05 250)'
    }
  },
  colors: {
    primary: 'brand', // reference the custom palette
    surface: 'zinc' // still works with UnoCSS palettes
  }
}
```

### Color Format Support

Palette shade values accept **any valid CSS color string**:

- Hex: `'#0f4c81'`
- HSL: `'hsl(210 83% 27%)'`
- OKLCH: `'oklch(65% 0.2 240)'`
- Named: `'rebeccapurple'`

These values flow directly into CSS custom properties (e.g. `--color-primary-500: oklch(60% 0.18 250)`), so the browser handles color interpretation. No conversion is needed.

### Implementation

**`packages/unocss/src/config.js`** — Add `palettes` to `DEFAULT_CONFIG`:

```js
export const DEFAULT_CONFIG = {
  palettes: {},
  colors: { primary: 'violet', secondary: 'pink', accent: 'sky', surface: 'slate' }
  // ...
}
```

**`packages/unocss/src/preset.ts`** — Merge custom palettes before constructing `Theme`:

```ts
import { defaultColors } from '@rokkit/core'

export function presetRokkit(options = {}): Preset {
  const config = loadConfig(options)
  const mergedColors = { ...defaultColors, ...config.palettes }
  const theme = new Theme({ colors: mergedColors, mapping: config.colors })
  // ...
}
```

**`@rokkit/core` `Theme` class** — Already accepts `{ colors, mapping }`. No changes needed if custom palettes are full shade objects. Partial shades (only defining `500`) could be supported later.

### What Does NOT Change

- Existing `colors` config (semantic name → palette name) is unchanged
- UnoCSS preset-mini palette names (`blue`, `violet`, `zinc`, etc.) continue to work
- The `shark` extra palette from `@rokkit/core/colors/extra.json` continues to work

---

## 3. Verification: All-Themes Playground Page

A single route in the site (`/themes` or `/mockups/themes`) shows all components across all themes side-by-side. This makes it easy to visually inspect theme output during development.

**Implementation:** Svelte page at `site/src/routes/themes/+page.svelte` (or under mockups). Uses `data-style` switcher on individual sections to display multiple themes simultaneously — no routing needed.

---

## Summary of Changes

| Area              | Files                                                                   | Notes                              |
| ----------------- | ----------------------------------------------------------------------- | ---------------------------------- |
| New themes (5)    | `packages/themes/src/{shadcn,daisy-ui,bits-ui,carbon,ant-design}/*.css` | ~22 files × 5 themes               |
| Build             | `packages/themes/build.mjs`, `package.json` exports                     | Extend existing pattern            |
| CLI init          | `packages/cli/src/init.js`, `doctor.js`                                 | Add to theme picker + KNOWN_THEMES |
| Palettes config   | `packages/unocss/src/config.js`, `preset.ts`                            | Small change                       |
| Tests             | `packages/unocss/spec/*.spec.js`                                        | Cover palettes merging             |
| Verification page | `site/src/routes/themes/+page.svelte`                                   | New mockup page                    |
