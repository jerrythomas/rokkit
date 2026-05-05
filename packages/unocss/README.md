# @rokkit/unocss

UnoCSS preset for Rokkit — one-line setup for colors, icons, shortcuts, and dark mode.

## Install

```sh
npm install @rokkit/unocss unocss
# or
bun add @rokkit/unocss unocss
```

## Overview

`@rokkit/unocss` provides a single UnoCSS preset that wires up everything Rokkit needs:

- Semantic color tokens mapped to CSS variables via `--rk-*` custom properties
- Icon collections from `@rokkit/icons` (ui, solid, light, twotone variants)
- `skin-*` shortcuts for component theming
- Font family definitions (mono, heading, sans, body)
- Dark mode via `[data-mode="dark"]` attribute selector (not class-based)
- Svelte file extractor for `.svelte` source scanning
- SVG background pattern utilities via `presetBackgrounds()`

## Setup

Add the preset to your `uno.config.ts`:

```ts
import { defineConfig } from 'unocss'
import { presetRokkit } from '@rokkit/unocss'

export default defineConfig({
  presets: [presetRokkit()]
})
```

That is all that is required. The preset includes `presetWind3`, `presetIcons`, `presetTypography`, and the Svelte extractor.

### With custom theme colors

Pass a color mapping to override the default semantic palette:

```ts
import { presetRokkit } from '@rokkit/unocss'

export default defineConfig({
  presets: [
    presetRokkit({
      colors: {
        primary: 'indigo',
        secondary: 'violet',
        surface: 'zinc'       // same palette flipped for dark mode automatically
      }
    })
  ]
})
```

Colors are referenced by palette name (e.g. Tailwind color names). The preset generates CSS variable-backed scale utilities like `bg-primary-z5`, `text-secondary-z8`, etc.

### Dual-palette dark mode (separate light/dark palettes)

When a single palette can't serve both light and dark mode well, specify separate palettes per mode:

```ts
presetRokkit({
  palettes: {
    kami: { 50: '0.985 0.005 85', /* … */ 950: '0.170 0.010 50' },  // warm paper tones
    sumi: { 50: '0.975 0.008 85', /* … */ 950: '0.170 0.010 50' }   // ink tones (dark bg)
  },
  colors: {
    surface: { light: 'kami', dark: 'sumi' },  // ← dual-palette syntax
    primary: 'shu'                              // ← simple (z-flip applies)
  },
  colorSpace: 'oklch'
})
```

- **Simple string** (`'kami'`) — one palette, shade scale flips automatically in `[data-mode="dark"]` via `base.css` z-tokens.
- **`{ light, dark }` object** — rokkit generates explicit `[data-mode="dark"] { --color-surface-*: sumiValues }` vars so the z-flip uses the correct dark-specific shades.

### Named skins

`colors` defines the **default** colormap. `skins` define **named alternative** colormaps that can be activated at runtime:

```ts
presetRokkit({
  colors: { surface: { light: 'kami', dark: 'sumi' }, primary: 'shu' },
  skins: {
    ocean:   { surface: 'slate', primary: 'sky',    secondary: 'teal' },
    vibrant: { surface: 'zinc',  primary: 'violet', secondary: 'purple' }
  }
})
```

Each skin generates a `skin-{name}` CSS class. Skins support the same dual-palette `{ light, dark }` syntax as `colors` — the light palette is used for the scoped CSS variable overrides.

### Background patterns

```ts
import { presetRokkit, presetBackgrounds } from '@rokkit/unocss'

export default defineConfig({
  presets: [presetRokkit(), presetBackgrounds()]
})
```

Import the pattern base CSS in your app:

```css
@import '@rokkit/unocss/patterns.css';
```

## Dark mode

Dark mode is driven by the `data-mode` attribute on the `<html>` element, not a CSS class. Set `data-mode="dark"` to activate the dark theme and `data-mode="light"` (or omit) for light mode.

Use `@rokkit/app`'s `ColorModeManager` to manage this automatically with OS preference sync.

## API

| Export                   | Description                                                                |
| ------------------------ | -------------------------------------------------------------------------- |
| `presetRokkit(options?)` | Full UnoCSS preset for Rokkit — colors, icons, shortcuts, dark mode, fonts |
| `presetBackgrounds()`    | SVG background pattern utilities                                           |
| `loadConfig(options?)`   | Load and merge Rokkit config from project config file                      |

### `presetRokkit` options

| Option        | Type                                                        | Description                                                                                                     |
| ------------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `colors`      | `Record<string, string \| { light?: string, dark?: string }>` | Semantic role → palette name. String = auto z-flip; `{ light, dark }` = separate palettes per mode.          |
| `palettes`    | `Record<string, Record<string, string>>`                    | Custom palette definitions with shade values (50–950). Names usable in `colors` and `skins`.                   |
| `skins`       | `Record<string, Record<string, string \| { light?, dark? }>>` | Named colormaps (same syntax as `colors`). Each generates a `skin-{name}` CSS class.                         |
| `colorSpace`  | `'rgb' \| 'hsl' \| 'oklch'`                                | Color space for CSS variable values. Use `'oklch'` with bare component strings (`'0.58 0.15 35'`).             |
| `icons`       | `Record<string, string>`                                    | Additional icon collection paths                                                                                |

---

Part of [Rokkit](https://github.com/jerrythomas/rokkit) — a Svelte 5 component library and design system.
