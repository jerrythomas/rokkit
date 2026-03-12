# @rokkit/app

App-level controls for Rokkit applications — color mode management and theme switching.

## Install

```sh
npm install @rokkit/app
# or
bun add @rokkit/app
```

## Overview

`@rokkit/app` provides the application-level plumbing for Rokkit projects:

- **`ColorModeManager`** — reactive class that tracks `system` / `light` / `dark` mode, resolves `system` to the actual OS preference, and syncs to the active theme target
- **`ThemeSwitcherToggle`** — Svelte component for a three-way light/dark/system toggle
- **`resolveMode`** — utility to resolve `'system'` to `'light'` or `'dark'` via `matchMedia`

Works directly with `@rokkit/unocss` dark mode: `ColorModeManager` sets `data-mode` on the `<html>` element, which the UnoCSS preset uses as its dark mode selector.

Requires Svelte 5.

## Usage

### ColorModeManager

`ColorModeManager` is a Svelte 5 reactive class (`$state` internals). Instantiate it with a theme target — typically the `vibe` singleton from `@rokkit/states`.

```js
import { ColorModeManager } from '@rokkit/app'
import { vibe } from '@rokkit/states'

const modeManager = new ColorModeManager(vibe)

// Read current mode
console.log(modeManager.mode)      // 'system' | 'light' | 'dark'
console.log(modeManager.resolved)  // 'light' | 'dark'

// Change mode
modeManager.mode = 'dark'
modeManager.mode = 'system'  // will re-resolve from OS preference
```

### Listening for OS preference changes

Call `listen()` inside `onMount` or a `$effect.root`. It returns a cleanup function.

```svelte
<script>
  import { onMount } from 'svelte'
  import { ColorModeManager } from '@rokkit/app'
  import { vibe } from '@rokkit/states'

  const modeManager = new ColorModeManager(vibe)

  onMount(() => {
    return modeManager.listen()  // returns cleanup fn, called on destroy
  })
</script>
```

When `mode` is `'system'`, the manager automatically updates `resolved` whenever the OS preference changes.

### ThemeSwitcherToggle

Drop-in Svelte component that renders a three-way toggle (light / dark / system). Pass the `ColorModeManager` instance as a prop.

```svelte
<script>
  import { ThemeSwitcherToggle, ColorModeManager } from '@rokkit/app'
  import { vibe } from '@rokkit/states'

  const modeManager = new ColorModeManager(vibe)
</script>

<ThemeSwitcherToggle {modeManager} />
```

### resolveMode utility

```js
import { resolveMode } from '@rokkit/app'

resolveMode('system')  // 'light' or 'dark' based on OS preference
resolveMode('dark')    // 'dark'
resolveMode('light')   // 'light'
```

## API

| Export | Description |
|--------|-------------|
| `ColorModeManager` | Reactive class for tracking and resolving color mode |
| `ThemeSwitcherToggle` | Svelte component — three-way light/dark/system toggle |
| `resolveMode(mode)` | Resolve `'system'` to actual `'light'` \| `'dark'` |
| `ColorMode` | Type: `'system' \| 'light' \| 'dark'` |
| `ResolvedMode` | Type: `'light' \| 'dark'` |

### ColorModeManager members

| Member | Type | Description |
|--------|------|-------------|
| `mode` | `ColorMode` (get/set) | Current three-way mode selection |
| `resolved` | `ResolvedMode` (get) | Actual light or dark value |
| `listen()` | `() => () => void` | Start OS preference listener; returns cleanup fn |

---

Part of [Rokkit](https://github.com/jerrythomas/rokkit) — a Svelte 5 component library and design system.
