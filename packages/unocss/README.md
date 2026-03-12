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
        surface: 'zinc'
      }
    })
  ]
})
```

Colors are referenced by palette name (e.g. Tailwind color names). The preset generates CSS variable-backed scale utilities like `bg-primary-z5`, `text-secondary-z8`, etc.

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

| Export | Description |
|--------|-------------|
| `presetRokkit(options?)` | Full UnoCSS preset for Rokkit — colors, icons, shortcuts, dark mode, fonts |
| `presetBackgrounds()` | SVG background pattern utilities |
| `loadConfig(options?)` | Load and merge Rokkit config from project config file |

### `presetRokkit` options

| Option | Type | Description |
|--------|------|-------------|
| `colors` | `Record<string, string>` | Override semantic color → palette mappings |
| `skins` | `Record<string, object>` | Additional `skin-*` shortcut definitions |
| `icons` | `Record<string, string>` | Additional icon collection paths |

---

Part of [Rokkit](https://github.com/jerrythomas/rokkit) — a Svelte 5 component library and design system.
