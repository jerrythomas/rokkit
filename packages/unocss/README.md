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

Colors are referenced by palette name (e.g. Tailwind color names). The preset emits the named-token vocabulary (`bg-paper`, `text-ink`, `bg-primary`, `text-on-primary`, `*-soft`); the z-scale utilities (`bg-primary-z5`, `text-surface-z8`) remain as a back-compat layer pointing at the named tokens.

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

### Icons

`presetRokkit()` ships with three icon collections registered out of the box:

| Collection prefix | Source                          | Use case                         |
| ----------------- | ------------------------------- | -------------------------------- |
| `i-rokkit:*`      | `@rokkit/icons/ui.json`         | curated minimal UI icon set      |
| `i-semantic:*`    | `@rokkit/icons/semantic.json`   | role-named icons (`folder-opened`, `action-copy`, `doc-svelte`, …) |
| `i-glyph:*`       | `@rokkit/icons/glyph.json`      | full Solar-glyph mapping         |

Every name in `DEFAULT_ICONS` is also registered as a **bare-name UnoCSS shortcut** that expands to `i-semantic:{name}` and is auto-safelisted. So you can write `class="folder-opened"` directly — no prefix, no manual safelist entry. Components in `@rokkit/ui` use this idiom (Tree, Dropdown, BreadCrumbs, CodeBlock, CodeGroup…).

```html
<span class="folder-opened" aria-hidden="true"></span>  <!-- ✓ resolves -->
<span class="i-semantic:folder-opened"></span>          <!-- ✓ equivalent, explicit -->
<span class="i-glyph:folder-opened-outline"></span>     <!-- ✓ outline variant from glyph -->
```

#### Adding your own icons

Register additional icon collections via the rokkit config's `icons` map. Keys become the UnoCSS collection prefix:

```js
// rokkit.config.js
export default {
  icons: {
    lucide: '@iconify-json/lucide/icons.json',
    mybrand: './static/icons/mybrand.json'
  }
}
```

Reference them as `i-lucide:home` / `i-mybrand:logo`.

#### Adding bare-name shortcuts (your own glyphs)

Use `icons.overrides` to add bare-name shortcuts on top of `DEFAULT_ICONS`. Keys are the bare class name; values are the full utility expression. Override keys are auto-safelisted.

```js
// rokkit.config.js
export default {
  icons: {
    lucide: '@iconify-json/lucide/icons.json',
    overrides: {
      'brand-logo': 'i-mybrand:logo',
      'doc-svelte': 'i-lucide:flame',          // override the default semantic mapping
      'pizza':       'i-fluent-emoji:pizza'     // add a brand-new bare name
    }
  }
}
```

Then write `class="brand-logo"`, `class="pizza"` directly in templates. Component-internal icons (Tree's `folder-opened`, CodeGroup's `doc-svelte`, etc.) automatically pick up the override.

#### Variant style

```js
icons: {
  style: 'outline'  // appends '-outline' to every default shortcut target
                    // → 'folder-opened' resolves to 'i-semantic:folder-opened-outline'
}
```

Other values match the Solar-bundle variants: `'solid'`, `'duotone-outline'`. Omit for the default (filled-duotone) variant.

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

## Token modes

By default, the preset emits a trimmed 24-name token vocabulary:

| Group        | Tokens                                                              |
| ------------ | ------------------------------------------------------------------- |
| Surface      | `--paper`, `--paper-soft`, `--paper-mute`, `--paper-edge`           |
| Ink          | `--ink`, `--ink-mute`, `--ink-soft`, `--ink-faint`                  |
| Primary      | `--primary`, `--on-primary`                                         |
| Accent       | `--accent`, `--accent-soft`                                         |
| Status       | `--success` / `-soft`, `--warning` / `-soft`, `--danger` / `-soft`, `--error` / `-soft`, `--info` / `-soft` |
| Misc         | `--focus-ring`, `--shadow-tint`                                     |

Ink ladder semantics: `ink` = primary text, `ink-mute` = secondary,
`ink-soft` = placeholder, `ink-faint` = disabled. Paper ladder:
`paper` = canvas, `paper-soft` = card bg, `paper-mute` = subdued panel,
`paper-edge` = hairline border tone. `*-soft` companions are the tinted-
bg variant for status callouts and accent chips.

Palette values are inlined — no `--color-{role}-{shade}` indirection.
The `--color-{role}-z{0..10}` aliases are kept as a back-compat layer
pointing at the named tokens, so existing code using `bg-surface-z3`
etc. continues to work.

For chart / data-viz needs that genuinely require the full 11-shade
ladder, opt into extended mode:

```js
// uno.config.js
export default defineConfig({
  presets: [
    presetRokkit({
      tokens: 'extended'                       // full palette per role
    })
  ]
})
```

### Named-layer Uno shortcuts

The named tokens auto-emit Uno shortcuts for the common color
properties:

| Token            | Shortcuts                                   |
| ---------------- | ------------------------------------------- |
| `paper`, `paper-*` | `bg-paper`, `text-paper`, `border-paper`, … |
| `ink`, `ink-*`     | `bg-ink`, `text-ink-mute`, …                |
| `primary`        | `bg-primary`, `text-primary`, `fill-primary`, … |
| `on-primary`     | `text-on-primary` (only)                    |
| `accent`, `accent-soft` | `bg-accent`, `bg-accent-soft`, …       |
| status (`success`, `warning`, `danger`, `error`, `info`) | full prefix set incl. `-soft` |
| `focus-ring`     | `ring-focus-ring`, `border-focus-ring` (only) |
| `shadow-tint`    | (no shortcuts — used in box-shadow expressions) |

The same `buildNamedShortcuts()` helper is also exported from
`@rokkit/unocss`, so themes-build pipelines (e.g.
`@rokkit/themes/build.mjs`) can opt into the same vocabulary when
compiling component CSS that uses `@apply bg-paper-mute` etc.

## Custom tokens

For app-level CSS vars that components never read but the app needs
(canvas backgrounds, mockup chrome, etc.), use the `custom` block:

```js
export default defineConfig({
  presets: [
    presetRokkit({
      custom: {
        canvas:        'kami.50',                              // palette ref
        'canvas-grid': '#d4d4d4',                              // raw value
        'canvas-bleed': { light: 'kami.100', dark: 'sumi.900' } // mode-aware
      }
    })
  ]
})
```

**Resolution rules:**
- `'palette.shade'` strings resolve via the same `colorSpace` adapter
  as named tokens.
- Plain strings pass through verbatim (oklch / rgb / hex / `var(...)`).
- `{ light, dark }` selects the mode-appropriate side; missing sides
  fall back to the other.

**Shortcuts:** Color-valued custom tokens auto-emit `bg-{name}`,
`text-{name}`, `border-{name}`, `fill-{name}`, and `stroke-{name}`.
Non-color tokens (sizes, durations) emit only the CSS var. The
`ring-` prefix is reserved for tokens whose name ends in `-ring`
(e.g., `'glow-ring'` → `ring-glow-ring`).

**Reserved names:** Custom token names that collide with the named
vocabulary (`paper`, `ink-mute`, `on-primary`, etc.) throw at
config-load time — override those via the skin palette mapping,
not via `custom`.

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
