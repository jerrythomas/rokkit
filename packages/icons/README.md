# @rokkit/icons

Minimal icon set for Rokkit applications, bundled as Iconify JSON.

## Install

```bash
bun add @rokkit/icons
# or
npm install @rokkit/icons
```

No runtime dependencies.

## Overview

`@rokkit/icons` ships a curated set of SVG icons as Iconify-compatible JSON bundles. Each bundle is available as a named subpath export.

| Subpath | Collection | Description |
|---------|------------|-------------|
| `@rokkit/icons` (default) | `rokkit-ui` | Base UI icons — navigation, actions, states |
| `@rokkit/icons/ui.json` | `rokkit-ui` | Same as default |
| `@rokkit/icons/light.json` | `rokkit-light` | Outlined lightweight icons |
| `@rokkit/icons/solid.json` | `rokkit-solid` | Solid filled icons |
| `@rokkit/icons/twotone.json` | `rokkit-twotone` | Two-tone icons |
| `@rokkit/icons/components.json` | `rokkit-components` | Component-specific icons |
| `@rokkit/icons/auth.json` | `rokkit-auth` | Authentication icons (login, logout, user) |
| `@rokkit/icons/app.json` | `rokkit-app` | Application icons |

## Usage

### With `@rokkit/unocss` (recommended)

Icons are available automatically when using `presetRokkit()`. Reference them as UnoCSS utility classes:

```html
<span class="i-rokkit-ui:menu"></span>
<span class="i-rokkit-solid:check"></span>
<span class="i-rokkit-light:close"></span>
<span class="i-rokkit-auth:login"></span>
```

### With UnoCSS directly

```ts
// uno.config.ts
import { defineConfig, presetIcons } from 'unocss'
import uiIcons from '@rokkit/icons/ui.json'
import solidIcons from '@rokkit/icons/solid.json'

export default defineConfig({
  presets: [
    presetIcons({
      collections: {
        'rokkit-ui': () => uiIcons,
        'rokkit-solid': () => solidIcons
      }
    })
  ]
})
```

### With Iconify runtime

```js
import { addCollection } from '@iconify/svelte'
import uiIcons from '@rokkit/icons/ui.json'
import authIcons from '@rokkit/icons/auth.json'

addCollection(uiIcons)
addCollection(authIcons)
```

```svelte
<script>
  import { Icon } from '@iconify/svelte'
</script>

<Icon icon="rokkit-ui:menu" />
<Icon icon="rokkit-auth:login" />
```

### Direct import (framework-agnostic)

Each bundle is a standard Iconify JSON file. Import and use it with any Iconify-compatible tooling:

```js
import icons from '@rokkit/icons/solid.json'

// icons.prefix  → "rokkit-solid"
// icons.icons   → { "check": { body: "..." }, ... }
```

## Building Custom Icon Sets

Use `@rokkit/cli` to bundle your own SVG folders into Iconify JSON in the same format:

```bash
bunx @rokkit/cli bundle -i ./my-icons -o ./lib
```

---

Part of [Rokkit](https://github.com/jerrythomas/rokkit) — a Svelte 5 component library and design system.
