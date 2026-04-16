# @rokkit/themes

Pre-built CSS themes for `@rokkit/ui` components.

## Install

```sh
npm install @rokkit/themes
# or
bun add @rokkit/themes
```

## Overview

`@rokkit/themes` provides visual styles for `@rokkit/ui` components. Components in `@rokkit/ui` are unstyled by default — themes layer on top without requiring changes to component markup. Styles target semantic `data-*` attributes that components emit (e.g. `[data-button]`, `[data-list-item]`).

Available themes:

| Theme        | Description                                                          |
| ------------ | -------------------------------------------------------------------- |
| `rokkit`     | Default — gradients and glowing borders                              |
| `minimal`    | Clean and subtle                                                     |
| `material`   | Elevation and shadows                                                |
| `frosted`    | Frosted glass and blur                                               |
| `shadcn`     | Flat borders and ring focus                                          |
| `daisy-ui`   | Rounded-full and bold fills                                          |
| `bits-ui`    | Rounded-lg and shadow-sm                                             |
| `carbon`     | Square corners and bottom-border inputs                              |
| `ant-design` | Thin borders and dense layout                                        |
| `grada-ui`   | Coral/purple gradient identity                                       |
| `base`       | Structural styles only (layout and positioning, no visual treatment) |

## Usage

### Full bundle (base + all themes)

```css
@import '@rokkit/themes';
```

Or in JavaScript/TypeScript:

```js
import '@rokkit/themes'
```

### Single theme

```css
@import '@rokkit/themes/rokkit.css';
/* or */
@import '@rokkit/themes/minimal.css';
/* or */
@import '@rokkit/themes/material.css';
/* or */
@import '@rokkit/themes/frosted.css';
```

### Base structural styles only

```css
@import '@rokkit/themes/base';
```

Useful when writing a fully custom theme — imports layout and positioning rules without any visual styling.

### Individual component styles

```css
@import '@rokkit/themes/base/button.css';
@import '@rokkit/themes/rokkit/button.css';
```

## Theme scoping

The `rokkit` theme is the default and applies without any wrapper element.

Other themes are scoped using the `data-style` attribute:

```html
<!-- Apply minimal theme to a section -->
<div data-style="minimal">
  <!-- @rokkit/ui components here use the minimal theme -->
</div>

<!-- Apply a theme globally -->
<html data-style="material"></html>
```

Switching themes at runtime is a matter of updating the `data-style` attribute.

## Custom themes

To build your own theme:

1. Import `@rokkit/themes/base` for structural styles.
2. Write CSS targeting the same `data-*` attribute selectors used by the built-in themes.
3. Scope your selectors with `[data-style='my-theme']` to enable runtime switching.

Component attribute hooks follow the pattern `[data-style='my-theme'] [data-button]`, `[data-style='my-theme'] [data-list-item]`, etc.

## Architecture

```
src/
  base/        -- Structural styles (layout, spacing, positioning)
  rokkit/      -- Default theme (gradients + borders)
  minimal/     -- Clean + subtle theme
  material/    -- Elevation + shadows theme
  frosted/     -- Frosted glass + blur theme
  shadcn/      -- Flat borders + ring focus theme
  daisy-ui/    -- Rounded-full + bold fills theme
  bits-ui/     -- Rounded-lg + shadow-sm theme
  carbon/      -- Square + bottom-border inputs theme
  ant-design/  -- Thin borders + dense layout theme
  grada-ui/    -- Coral/purple gradient identity theme
  index.css    -- Full bundle entry point
```

---

Part of [Rokkit](https://github.com/jerrythomas/rokkit) — a Svelte 5 component library and design system.
