# Theming System

> How Rokkit's visual layer is structured: the three independent axes of skin, style, and
> mode, and the CSS architecture that connects them to components.

---

## Architecture Overview

Every Rokkit component is unstyled by default. Visual appearance is entirely determined by
three independent axes, each controlled by a data attribute on the `<html>` element:

```
<html
  data-palette="skin-sea-green"   ← Skin: which colors
  data-mode="dark"                ← Mode: light or dark
  data-style="rokkit"             ← Style: component personality
>
```

These three axes are independent. Switching the skin changes the color palette without
affecting component shapes or spacing. Switching the mode inverts lightness without
changing hue or style. Switching the style changes component geometry and decoration
without changing the palette.

```
┌──────────────────────────────────────┐
│  Skin layer  (data-palette)          │
│  Maps semantic color roles to        │
│  concrete Tailwind/UnoCSS scales.    │
│  e.g. primary=teal, surface=zinc     │
├──────────────────────────────────────┤
│  Mode layer  (data-mode)             │
│  Selects light or dark named-token   │
│  values for the active skin role.    │
│  e.g. --paper flips dark in dark mode│
├──────────────────────────────────────┤
│  Style layer  (data-style)           │
│  Controls component shape, shadow,   │
│  border-radius, spacing personality. │
│  e.g. rokkit | material | minimal    │
└──────────────────────────────────────┘
```

---

## Named-Token Color Vocabulary

Instead of referencing concrete shade numbers (e.g., `slate-200`), theme CSS and utility
classes use semantic named tokens that flip automatically between light and dark mode.

| Group   | Tokens                                              | Semantic meaning                         |
| ------- | --------------------------------------------------- | ---------------------------------------- |
| Surface | `paper` · `paper-soft` · `paper-mute` · `paper-edge` | canvas · card bg · subdued panel · border |
| Text    | `ink` · `ink-mute` · `ink-soft` · `ink-faint`      | body · secondary · placeholder · disabled |
| Primary | `primary` · `on-primary`                            | CTA fill · text on a primary fill        |
| Accent  | `accent` · `accent-soft`                            | accent fill · tinted accent bg           |
| Status  | `success`/`-soft`, `warning`/`-soft`, `danger`/`-soft`, `error`/`-soft`, `info`/`-soft` | solid / tinted callout |
| Misc    | `focus-ring` · `shadow-tint`                        | focus ring · shadow color                |

A theme file written once is correct in both light and dark mode — swapping `data-mode`
redefines the token values without any `@media` blocks or `.dark` selectors.

```css
/* This rule works correctly in both light and dark mode */
[data-list-item][data-active] {
  background-color: var(--primary);
  color: var(--on-primary);
}
```

For chart / data-viz work requiring the full shade ladder, use `tokens: 'extended'` in
`rokkit.config.js` — this emits `--color-{role}-{shade}` vars (50–950) per role.

---

## Semantic Color Roles

The skin layer maps eight semantic roles to color scales. Theme CSS uses these roles via
CSS custom properties — never direct Tailwind color names.

| Role                  | Purpose                             | Example mapping     |
| --------------------- | ----------------------------------- | ------------------- |
| `primary`             | Brand primary, interactive elements | orange, teal, blue  |
| `secondary`           | Brand secondary, accents            | pink, green, indigo |
| `surface` / `neutral` | Backgrounds, cards, surfaces        | slate, zinc, stone  |
| `accent`              | Highlight, hover emphasis           | sky, cyan, pink     |
| `success`             | Positive state, confirmation        | green, lime         |
| `warning`             | Caution state                       | amber, yellow       |
| `error` / `danger`    | Error state, destructive actions    | red, rose           |
| `info`                | Informational messages              | blue, sky           |

Each role feeds into the named-token vocabulary (e.g. `surface` → `paper`/`ink`, `primary` → `primary`/`on-primary`). Use `tokens: 'extended'` to also emit the full 11-shade ladder per role for charts and data-viz.

---

## Three Built-In Style Variants

The `data-style` attribute selects the component visual personality. Three variants ship
with Rokkit:

**`rokkit`** — the default. Distinctive aesthetics with gradient borders, pronounced
elevation, and characteristic Rokkit visual identity.

**`material`** — Material Design-inspired. Elevation through box shadows, filled surfaces,
and contained-style inputs. Familiar to Google ecosystem users.

**`minimal`** — Clean and understated. Reduced shadows, thinner borders, maximum
content focus. Appropriate for documentation sites and content-heavy applications.

Style variant CSS lives in:

```
packages/themes/src/
  rokkit/      — rokkit style CSS per component
  material/    — material style CSS per component
  minimal/     — minimal style CSS per component
  base/        — layout CSS shared across all styles
```

Every component has two CSS files per style: a layout file (in `base/`) for structural
properties (flex, grid, sizing, spacing) and a skin file (per style variant) for visual
properties (color, shadow, border-radius, transitions). This separation ensures layout
does not break when switching styles.

---

## Skin System

A skin binds a set of semantic color roles to concrete color scales. All skins are defined
in `@rokkit/core/src/skins.js` and exported as `predefinedSkins`.

### Predefined Skins

```javascript
export const predefinedSkins = {
  'skin-vibrant-orange': null, // default: orange/pink/slate
  'skin-sea-green': { primary: 'teal', secondary: 'green', surface: 'zinc', accent: 'sky' },
  'skin-deep-blue': { primary: 'blue', secondary: 'indigo', surface: 'slate', accent: 'cyan' },
  'skin-royal-purple': { primary: 'violet', secondary: 'purple', surface: 'slate', accent: 'pink' },
  'skin-rose-gold': { primary: 'rose', secondary: 'amber', surface: 'stone', accent: 'orange' }
}

export const defaultSkin = 'skin-vibrant-orange'
```

All skin names use the `skin-` prefix to avoid conflicts with CSS reserved words and to
namespace them in the UnoCSS shortcut registry.

### UnoCSS Shortcut Generation

Each skin entry becomes a UnoCSS shortcut in the application's `uno.config.ts`:

```typescript
import { Theme } from '@rokkit/themes'
import { predefinedSkins } from '@rokkit/core'

const theme = new Theme()

shortcuts: [
  ...Object.entries(predefinedSkins).map(([name, mapping]) => [
    name,
    theme.getPalette(mapping ?? undefined)
  ]),
  ...theme.getShortcuts('surface'),
  ...theme.getShortcuts('primary'),
  ...theme.getShortcuts('secondary')
  // ... other roles
]
```

`theme.getPalette(mapping)` returns a UnoCSS utility string that sets all CSS custom
properties for that skin's color roles. `theme.getShortcuts(role)` returns the on-color
contrast shortcut rules for that role (e.g. `text-on-primary`).

### Runtime Skin Switching via `data-palette`

`palette.css` maps `data-palette` attribute values to the corresponding skin shortcuts:

```css
@layer base {
  :root:not([data-palette]),
  [data-palette='skin-vibrant-orange'] {
    @apply skin-vibrant-orange;
  }
  [data-palette='skin-sea-green'] {
    @apply skin-sea-green;
  }
  [data-palette='skin-deep-blue'] {
    @apply skin-deep-blue;
  }
  [data-palette='skin-royal-purple'] {
    @apply skin-royal-purple;
  }
  [data-palette='skin-rose-gold'] {
    @apply skin-rose-gold;
  }
}
```

Switching the active skin at runtime:

```typescript
// palette.svelte.ts
import { defaultSkin } from '@rokkit/core'

let palette = $state(defaultSkin)

export function setPalette(name: string) {
  palette = name
  document.documentElement.setAttribute('data-palette', name)
}
```

### Adding a Custom Skin

1. Register a shortcut in the application's `uno.config.ts`:

```typescript
;['skin-my-brand', theme.getPalette({ primary: 'emerald', secondary: 'cyan', surface: 'gray' })]
```

2. Add the CSS rule in the application's stylesheet (not in `palette.css`):

```css
[data-palette='skin-my-brand'] {
  @apply skin-my-brand;
}
```

3. Activate it:

```typescript
setPalette('skin-my-brand')
```

---

## CSS Custom Property Architecture

The skin shortcut expands into CSS custom property assignments. These properties are the
interface between the skin layer and theme CSS:

```css
/* What @apply skin-sea-green expands to (simplified) */
:root {
  --primary: /* teal-500 */;
  --on-primary: /* near-black or near-white by contrast */;
  --paper: /* zinc-50 */;
  --paper-soft: /* zinc-100 */;
  --paper-mute: /* zinc-200 */;
  --paper-edge: /* zinc-300 */;
  --ink: /* zinc-900 */;
  /* ... other named tokens */
}
[data-mode="dark"] {
  --paper: /* zinc-950 */;
  /* ... dark values for each token */
}
```

Theme CSS never references `teal-500` or `zinc-200` directly. It references
named tokens such as `var(--primary)` or `var(--paper)`, which resolve to the correct
complete color value for the active skin and mode. The full resolution chain:

```
[data-list-item][data-active] { background: var(--primary); color: var(--on-primary) }
  → --primary resolves to teal-500 in the sea-green skin
  → --on-primary resolves to near-white (auto-selected for contrast)
```

---

## How Components Consume Theme Tokens

Components never import or reference CSS. They annotate the DOM with data attributes.
Theme CSS files target those attributes and apply visual styles.

```svelte
<!-- Component template (no CSS, no style block) -->
<div data-list data-density={density}>
  {#each flatView as node}
    <div
      data-list-item
      data-path={node.key}
      data-active={node.isSelected || undefined}
      data-focused={node.isFocused || undefined}
      data-disabled={node.proxy.disabled || undefined}
      data-level={node.level}
    >
      ...
    </div>
  {/each}
</div>
```

```css
/* Theme CSS file — packages/themes/src/rokkit/list.css */
[data-list] {
  background: var(--paper-soft);
  border: 1px solid var(--paper-edge);
  border-radius: var(--radius-md);
}

[data-list-item] {
  color: var(--ink);
  padding: 0.5rem 0.75rem;
}

[data-list-item][data-active] {
  background: var(--primary);
  color: var(--on-primary);
}

[data-list-item][data-focused] {
  outline: 2px solid var(--focus-ring);
  outline-offset: -2px;
}

[data-list-item][data-disabled] {
  opacity: 0.5;
  pointer-events: none;
}

[data-list][data-density='compact'] [data-list-item] {
  padding: 0.25rem 0.5rem;
}
```

This contract is what makes themes fully decoupled from components. A theme can be written
against the attribute contract without access to component source. A component can be
restructured internally without breaking themes as long as the attribute contract is
preserved.

---

## The `themable` Action

The `themable` action (from `@rokkit/actions`) applies `data-style`, `data-mode`, and
`data-density` to the host element from the reactive `vibe` store in `@rokkit/states`:

```javascript
// vibe store — @rokkit/states/vibe.svelte.js
export const vibe = $state({
  style: 'rokkit', // 'rokkit' | 'material' | 'minimal'
  palette: 'skin-vibrant-orange',
  mode: 'light', // 'light' | 'dark'
  direction: 'ltr' // auto-detected from document.documentElement.lang
})
```

Applied to the application root:

```svelte
<html use:themable>
  <!-- All descendants inherit the active theme via attribute selectors -->
</html>
```

The `themable` action optionally persists theme state to `localStorage` and listens for
`storage` events to sync the active theme across browser tabs.

---

## Fixed-Mode Regions: `lockMode` and `LockMode`

A subtree can be pinned to a fixed color mode regardless of the document mode. This enables
"dark islands" inside light pages, or "light islands" inside dark pages — both rendering
with correct token values and correct `@rokkit/themes` component CSS.

### Architectural change: symmetric light selector

Prior to v1.2.1, the `@rokkit/unocss` preset emitted light token vars under `:root` only:

```css
/* old — a nested data-mode="light" element couldn't re-assert these */
:root { --paper: …; --ink: …; }
[data-mode="dark"] { --paper: …; --ink: …; }
```

From v1.2.1, light vars are emitted under `:root, [data-mode="light"]`:

```css
/* new — light-locking works bidirectionally */
:root, [data-mode="light"] { --paper: …; --ink: …; }
[data-mode="dark"] { --paper: …; --ink: …; }
```

This makes `data-mode` a nestable attribute: setting it on any element (not only `<html>`)
establishes a new mode context for its descendants. Dark already worked because
`[data-mode="dark"]` was always a standalone selector; the change adds the same capability
for light.

### `lockMode` action (`@rokkit/actions`)

```svelte
<section use:lockMode={'dark'}>
  <!-- Always dark, regardless of document mode -->
</section>
```

On mount, `lockMode(node, mode)`:
1. Copies `data-style`, `data-skin`, and `data-density` from `document.documentElement`
   onto the element — making it a self-contained theme context.
2. Forces `data-mode` to the locked value.
3. Installs a `MutationObserver` on the root that re-syncs style/skin/density when the root
   changes (e.g. the user switches style or skin at runtime). The mode stays pinned.
4. Disconnects the observer on element destroy.

The mode is fixed at the value passed at mount time. It does not react to prop changes —
re-mount to change the mode.

### `LockMode` component (`@rokkit/ui`)

The component is the recommended way to use `lockMode` in most cases. It statically renders
`data-mode` for a correct SSR first paint:

```svelte
<script>
  import { LockMode } from '@rokkit/ui'
</script>

<LockMode mode="dark">
  <!-- always-dark content -->
</LockMode>
```

Rendered HTML (server): `<div data-mode="dark">…</div>`

On hydration, the `lockMode` action is applied, mirroring style/skin/density from the root.

### What changes per mode

Both token vars (`--paper`, `--ink`, `--accent-soft`, …) and `@rokkit/themes` component CSS
(which matches on `[data-mode]` and `[data-style]` both present on the region) re-evaluate
inside the locked region, so component appearance is fully correct — not just token colors.
The component renders `data-mode` statically and `lockMode` mirrors `data-style` onto the
same element, so both attributes the themes CSS needs land together on the wrapper.
