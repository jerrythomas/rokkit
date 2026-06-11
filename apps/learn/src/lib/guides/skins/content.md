# Skins

A **skin** is a named palette mapping that swaps the color roles
(`surface`, `ink`, `primary`, `accent`, …) used across every component
without changing the visual personality set by `data-style`. Skins,
styles, and modes are three orthogonal dimensions:

| Dimension    | Drives                                                              | Default   |
| ------------ | ------------------------------------------------------------------- | --------- |
| `data-style` | Visual character (`rokkit`, `minimal`, `material`, `frosted`, `zen-sumi`) | `rokkit`  |
| `data-skin`  | Palette mapping (roles → colors)                                    | `default` |
| `data-mode`  | Light / dark                                                        | `dark`    |

**Skin vs style vs mode:**

- `data-style` picks the visual personality — gradients, shadows, border
  radius, transitions.
- `data-skin` swaps the color palette within that personality. The same
  `rokkit` style can wear an `ocean` skin or a `rose` skin and look
  completely different in hue while keeping the same chrome.
- `data-mode` flips between light and dark tones. Both variants are baked
  into each skin's CSS block.

All three are data attributes, typically set on `<html>`, and propagate
by CSS inheritance. Flipping any one re-skins the entire app instantly —
no rebuild required.

```html
<html data-style="rokkit" data-skin="ocean" data-mode="dark"></html>
```

## Built-in skins

Rokkit ships five built-in skins:

| Name      | Surface  | Primary  | Accent   |
| --------- | -------- | -------- | -------- |
| `default` | kami/sumi (dual-palette) | shu | shu |
| `ocean`   | slate    | sky      | teal     |
| `violet`  | zinc     | violet   | indigo   |
| `rose`    | stone    | rose     | orange   |
| `emerald` | slate    | emerald  | cyan     |

They are exported from `@rokkit/unocss` as `BUILTIN_SKINS` and are
available with no extra config.

## The `data-skin` CSS mechanism

For every skin other than `default`, `presetRokkit` emits CSS preflight
blocks:

```css
/* light block */
[data-skin='ocean'] { --paper: oklch(…); --primary: oklch(…); … }

/* dark block — only for skins with a dual-palette role */
[data-mode='dark'][data-skin='ocean'] { --paper: oklch(…); … }
```

`data-skin='default'` is not emitted as an explicit selector — the
`:root` preflight already provides those values.

The attribute can be placed anywhere in the tree. Setting it on `<html>`
or `<body>` makes it app-wide; a `<div data-skin='violet'>` scopes it to
that subtree.

## Runtime switching

### 1. Set `vibe.allowedSkins` early

Set `vibe.allowedSkins` before `themable` runs so that any persisted or
programmatic skin value is accepted:

```javascript
import { vibe } from '@rokkit/states'

vibe.allowedSkins = ['default', 'ocean', 'violet', 'rose', 'emerald']
```

### 2. Wire `themable` to the root

The `themable` action writes `data-skin` (along with `data-style`,
`data-mode`, `data-density`) in a single reactive `$effect`:

```svelte
<!-- src/routes/+layout.svelte -->
<script>
  import { themable } from '@rokkit/actions'
  import { vibe } from '@rokkit/states'

  vibe.allowedSkins = ['default', 'ocean', 'violet', 'rose', 'emerald']
</script>

<svelte:body use:themable={{ theme: vibe, storageKey: 'app-theme' }} />
```

`themable` also persists the active skin to `localStorage` and restores
it on reload.

### 3. Switch programmatically

```javascript
vibe.skin = 'ocean'   // must be in vibe.allowedSkins
```

The setter silently rejects values not in `allowedSkins` and no-ops
when the new value matches the current skin.

### 4. Use `SkinSwitcherToggle`

`@rokkit/app` provides a ready-made toggle:

```svelte
<script>
  import { SkinSwitcherToggle } from '@rokkit/app'
</script>

<SkinSwitcherToggle />
```

It reads available options from `vibe.allowedSkins` by default and
writes back to `vibe.skin` on selection.

Custom options with labels:

```svelte
<SkinSwitcherToggle
  skins={['default', 'ocean', 'violet']}
  labels={{ default: 'Zen', ocean: 'Ocean', violet: 'Violet' }}
  showLabels
  size="md"
/>
```

## Defining custom skins

Add a `skins:` map to `rokkit.config.js`. The keys become skin names;
values use the same role vocabulary as `colors:`.

```javascript
// rokkit.config.js — single-palette skins
export default {
  colors: {
    surface: 'slate', ink: 'slate', primary: 'orange', accent: 'sky'
  },
  skins: {
    ocean:   { surface: 'slate',  ink: 'slate',  primary: 'sky',    accent: 'teal'   },
    violet:  { surface: 'zinc',   ink: 'zinc',   primary: 'violet', accent: 'indigo' }
  }
}
```

For a role that should use a different palette per mode, use `{ light, dark }`:

```javascript
// rokkit.config.js — dual-palette skin
export default {
  palettes: {
    kami: { 50: '0.985 0.005 85', /* … */ 950: '0.170 0.010 50' },
    sumi: { 50: '0.170 0.010 50', /* … */ 950: '0.975 0.008 85' }
  },
  skins: {
    zen: {
      surface: { light: 'kami', dark: 'sumi' },
      ink:     { light: 'kami', dark: 'sumi' },
      primary: 'shu'
    }
  }
}
```

Consumer skins merge on top of the built-in skins — you can override a
built-in entry by reusing its name.

## Dynamic skins with `skinnable`

Use `skinnable` from `@rokkit/actions` when the skin is not pre-baked at
build time — for example a server-configured palette or a user-generated
color scheme:

```svelte
<script>
  import { skinnable } from '@rokkit/actions'

  // Could come from an API, user preference, etc.
  const palette = { '--primary': 'oklch(0.62 0.15 35)', '--accent': 'oklch(0.65 0.12 160)' }
</script>

<div use:skinnable={palette}>
  <!-- Components inside inherit the overridden tokens -->
</div>
```

`skinnable` accepts `Record<string, string>` (CSS var name → value) and
is reactive — if the object changes, all properties are re-applied.

**When to choose which:**

| Need | Approach |
| --- | --- |
| Named app-wide skin (build-time) | `skins:` config + `vibe.skin` |
| Toggle between named skins | `<SkinSwitcherToggle>` |
| Section-scoped static skin | `data-skin='name'` on a container |
| Dynamic / server-generated colors | `use:skinnable={{ '--primary': '…' }}` |

## SSR flash prevention

The `themeHook` from `@rokkit/unocss/hooks` injects a pre-paint script
that also restores a persisted `skin` value before first render:

```typescript
// src/hooks.server.ts
import { themeHook } from '@rokkit/unocss/hooks'

export const handle = themeHook({
  storageKey: 'app-theme',
  defaultMode: 'system'
})
```

See [Theming & Design](/guides/theming) for the full SSR setup.
