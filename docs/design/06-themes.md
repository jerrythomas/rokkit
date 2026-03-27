# Theme System Design

**Status:** Complete
**Last updated:** 2026-03-27

This document covers the complete theme architecture: CSS layer separation, color token system, dark mode, density, skin/whitelabeling, the `vibe` store, and the build pipeline.

---

## Overview

The theme system has three orthogonal axes, all written as `data-*` attributes on any ancestor element (typically `<body>`):

| Attribute | Values | Controls |
|-----------|--------|----------|
| `data-style` | `rokkit`, `minimal`, `material`, `frosted`, `shadcn`, `daisy-ui`, `bits-ui`, `carbon`, `ant-design`, `grada-ui` | Visual personality |
| `data-mode` | `light`, `dark` | Light/dark color mapping |
| `data-density` | `compact`, `comfortable`, `cozy` | Spatial rhythm (spacing, font size, icon size) |

A fourth attribute `data-direction` (`ltr` / `rtl`) is tracked by the `vibe` store for future i18n use but is not yet consumed by CSS.

All axes are independent. Any combination is valid:

```html
<body data-style="minimal" data-mode="dark" data-density="compact">
```

---

## CSS Layer Architecture

### Two-Layer Separation

Every component has two CSS files:

```
packages/themes/src/
  base/<component>.css       ← structural: layout, padding, flex, border-radius
  <theme>/<component>.css    ← visual: colors, gradients, shadows, blur
```

**Base styles** are unconditional — they apply to all themes. They use data attributes for structural variants (`data-size`, `data-variant`, `data-orientation`) but never colors.

**Theme styles** are scoped to `[data-style='<theme>']` ancestor selectors. They use `@apply` directives with semantic token classes (`bg-surface-z2`, `text-primary-z6`, etc.) that UnoCSS expands at build time.

### Build Pipeline

The build script (`packages/themes/build.mjs`) produces separate output files per theme:

```
dist/base.css      — structural styles + CSS variable defaults (palette)
dist/rokkit.css    — gradients + glowing borders
dist/minimal.css   — clean + subtle
dist/material.css  — elevation + shadows
dist/frosted.css   — frosted glass + blur
dist/shadcn.css    — flat borders + ring focus
dist/daisy-ui.css  — rounded-full + bold fills
dist/bits-ui.css   — rounded-lg + shadow-sm
dist/carbon.css    — square + bottom-border inputs
dist/ant-design.css — thin borders + dense layout
dist/grada-ui.css  — coral/purple gradient identity
dist/index.css     — full bundle (all themes concatenated)
```

**Build steps:**

1. `resolveImports()` — inlines all `@import` chains into a single string
2. `processCSS()` — runs UnoCSS `transformerDirectives` to expand `@apply` into real CSS, resolving semantic shortcuts (z-levels, skin tokens) against the active `Theme` instance
3. `fixModeSelectors()` — post-processes dark mode rules (see Dark Mode section)
4. Output written to `dist/`

---

## Color Token System

### Skin (Color Palette)

A "skin" is a mapping of semantic role names to actual color palettes. The `Theme` class in `@rokkit/core` manages this.

**Semantic roles:**

| Role | Used for |
|------|----------|
| `surface` | Backgrounds, borders, text |
| `primary` | Brand accent, primary actions |
| `secondary` | Secondary accent |
| `accent` | Tertiary/highlight |
| `success` / `warning` / `danger` / `error` / `info` | Semantic states |

Each role maps to a Tailwind color palette (e.g., `primary → blue`, `surface → zinc`). The default skin uses:

```js
DEFAULT_THEME_MAPPING = {
  surface: 'zinc',
  primary: 'blue',
  secondary: 'violet',
  accent: 'cyan',
  success: 'green',
  warning: 'amber',
  danger: 'red',
  error: 'red',
  info: 'sky'
}
```

The CLI `rokkit init` lets users remap roles to different palettes, and `rokkit skin create` scaffolds a custom skin config.

### Z-Level Tokens (Semantic Shades)

Rather than referencing raw shade numbers (`bg-zinc-700`), components use **z-level shortcuts** that automatically resolve to the correct shade for light and dark mode:

```
bg-surface-z0   → very dark (in dark mode)  / very light (in light mode)
bg-surface-z1   → darker surface
bg-surface-z2   → default surface
bg-surface-z3   → elevated surface
...
bg-surface-z10  → highest contrast
```

Analogous tokens exist for `primary`, `secondary`, `accent`, and semantic roles.

**How they work:** `Theme.getShortcuts('surface')` generates UnoCSS shortcuts that map `bg-surface-z3` → `bg-zinc-600 dark:bg-zinc-400` (the exact shade indices depend on the `TONE_MAP` for that role). These shortcuts are registered when the build runs, so `@apply bg-surface-z3` in theme CSS expands correctly.

### Dark Mode Mechanics

Dark mode is controlled by `data-mode` attributes, not `prefers-color-scheme`. UnoCSS is configured with:

```js
dark: {
  light: '[data-mode="light"]',
  dark: '[data-mode="dark"]'
}
```

This means `@apply dark:bg-zinc-400` compiles to:

```css
[data-mode="dark"] .rule { background: ... }
```

**Compound selector fix:** When `data-mode` and `data-style` are on the same element (`<body data-mode="dark" data-style="rokkit">`), UnoCSS generates descendant selectors that don't match. The `fixModeSelectors()` post-processor adds compound forms:

```css
/* Generated by UnoCSS */
[data-mode="dark"] [data-style="rokkit"] [data-button] { ... }

/* Added by fixModeSelectors */
[data-mode="dark"][data-style="rokkit"] [data-button] { ... }
```

Both forms are kept so either placement of the attributes works.

### On-Color Tokens

When text sits on a colored background, use these tokens for legible contrast:

```
text-on-primary    → text-surface-50
text-on-secondary  → text-surface-50
text-on-info       → text-surface-50
text-on-success    → text-surface-50
text-on-warning    → text-surface-50
text-on-error      → text-surface-50
text-on-surface    → text-surface-50
```

These are registered as static shortcuts in `build.mjs`.

---

## Density System

Density is a CSS custom property scale that all components inherit via cascade. It is not a theme-level concern — it works independently of `data-style`.

### Tokens

Set on `:root` (comfortable default) and overridden by `[data-density='*']` selectors:

```
--density-spacing-xs / sm / md / lg / xl    — spacing scale
--density-font-size-sm / base / lg          — type scale
--density-line-height                       — line height
--density-icon-size                         — icon dimensions
--density-border-width                      — border thickness
--density-radius-base                       — border-radius
```

### Scale

| Token | compact | comfortable (default) | cozy |
|-------|---------|----------------------|------|
| `--density-spacing-md` | 0.5rem | 0.75rem | 1rem |
| `--density-font-size-base` | 0.8125rem | 0.875rem | 1rem |
| `--density-icon-size` | 1rem | 1.25rem | 1.5rem |
| `--density-radius-base` | `--radius-sm` | `--radius-md` | `--radius-lg` |

### Component Usage

Components consume density tokens in their **base CSS** for their default/medium size variant. Explicit `data-size='sm'` / `data-size='lg'` variants remain hardcoded as an independent axis:

```css
/* Base CSS — responds to density */
[data-button]:not([data-size]) {
  height: calc(var(--density-icon-size) + var(--density-spacing-sm) * 2);
  font-size: var(--density-font-size-base);
}

/* Explicit size override — ignores density */
[data-button][data-size='sm'] {
  height: 1.75rem;
  font-size: 0.75rem;
}
```

### Placement

`data-density` can be placed on any container. Children inherit automatically:

```html
<!-- App-wide density -->
<body data-density="compact">

<!-- Section-level override -->
<div data-density="cozy">
  <!-- Items here are cozy, rest of app is compact -->
</div>
```

---

## Vibe Store

`vibe` is the singleton reactive state manager for the current theme configuration. It lives in `@rokkit/states`.

```js
import { vibe } from '@rokkit/states'

vibe.style = 'minimal'      // change theme
vibe.mode = 'light'         // switch mode
vibe.density = 'compact'    // change density
vibe.direction = 'rtl'      // set text direction

vibe.load('app-theme')      // restore from localStorage
vibe.save('app-theme')      // persist to localStorage
vibe.update({ style, mode, density, direction })  // batch update
```

**Validation:** setters silently ignore invalid values. Only values from the allowed list are accepted (`VALID_MODES`, `VALID_DENSITIES`, `VALID_DIRECTIONS`). For `style`, the allowed list is configurable via `vibe.allowedStyles`.

**Color customization:** `vibe.colorMap` accepts a partial role-to-palette mapping override. `vibe.colors` accepts custom color definitions. Both are used to build the live `palette` that the `themable` action writes to CSS variables.

---

## `themable` Action

The `use:themable` Svelte action connects `vibe` state to the DOM:

```svelte
<body use:themable={{ theme: vibe, storageKey: 'my-app-theme' }}>
```

**What it does:**
1. On mount: calls `vibe.load(storageKey)` to restore persisted preferences
2. Writes `dataset.style`, `dataset.mode`, `dataset.density` reactively via `$effect`
3. Listens for `storage` events to sync across tabs
4. Saves on every change via `$effect` → `vibe.save(storageKey)`

Components never read `vibe` directly for styling — they rely on `data-*` attributes and CSS cascade.

---

## Theme Selector Scoping

All theme CSS rules follow this selector pattern:

```css
[data-style='rokkit'] [data-component] { ... }
```

This means:
- The theme ancestor (`data-style`) can be any element, not just `<body>`
- Multiple themes can coexist on the same page by nesting containers
- Components with no ancestor `data-style` receive only base structural styles

### Component Variant Selectors

Components expose their own variant axes via `data-*` attributes:

```css
/* Button style variants */
[data-button][data-style='outline'] { ... }
[data-button][data-style='ghost'] { ... }

/* Color variants */
[data-button][data-variant='primary'] { ... }
[data-button][data-variant='danger'] { ... }

/* Size */
[data-button][data-size='sm'] { ... }
[data-button][data-size='lg'] { ... }
```

These are **component-level** `data-style` attributes, distinct from the **theme-level** `data-style` on the ancestor container. They don't conflict because they live on the component element itself vs. an ancestor.

---

## Adding a New Theme

1. Create `packages/themes/src/<name>/index.css` importing per-component files
2. Create component CSS files under `packages/themes/src/<name>/` scoped to `[data-style='<name>']`
3. Add entry to the build loop in `build.mjs`:
   ```js
   ['<name>', 'description of visual personality'],
   ```
4. Add to the `allThemes` bundle array in `build.mjs`
5. Run `cd packages/themes && bun run build`
6. Register in CLI via `packages/cli/src/skin.js` if it should appear in `rokkit init`

### Theme CSS Patterns

See `agents/design-patterns.md` or the `edit-theme` skill for patterns for each theme style (rokkit gradients, minimal borders, material elevation, frosted glass).

Key rules:
- **Every theme rule must include `bg-none`** where it competes with a rokkit gradient rule — prevents bleed-through
- Hover states: use `border-l-secondary-z4` accent for minimal, `bg-surface-z3` elevation for material
- Selected states: use `from-primary-z5 to-secondary-z5` gradient for rokkit, `border-l-primary-z4` border for minimal
- Dark mode: handled automatically by z-level shortcuts; no manual dark: variants needed

---

## File Reference

| Path | Purpose |
|------|---------|
| `packages/themes/src/base/` | Structural CSS per component |
| `packages/themes/src/<theme>/` | Visual CSS per component, per theme |
| `packages/themes/src/palette.css` | CSS variable defaults (`skin-default` shortcut) |
| `packages/themes/src/base/density.css` | Density CSS custom properties |
| `packages/themes/build.mjs` | Build script — UnoCSS compilation + dark mode fix |
| `packages/themes/dist/` | Compiled output (gitignored) |
| `packages/core/src/theme.ts` | `Theme` class — color rules, shortcuts, skin generation |
| `packages/states/src/vibe.svelte.js` | `vibe` singleton — reactive theme state |
| `packages/actions/src/themable.svelte.js` | `use:themable` — writes vibe state to DOM attributes |
