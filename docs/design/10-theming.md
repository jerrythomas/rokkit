# Theming System Design

> How Rokkit's visual layer is structured: the three independent axes of skin, style, and
> mode, and the CSS architecture that connects them to components.

---

## 1. Architecture Overview

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
│  Selects light or dark values from   │
│  each scale via z-index inversion.   │
│  e.g. dark: z1=darkest, z10=lightest │
├──────────────────────────────────────┤
│  Style layer  (data-style)           │
│  Controls component shape, shadow,   │
│  border-radius, spacing personality. │
│  e.g. rokkit | material | minimal    │
└──────────────────────────────────────┘
```

---

## 2. Z-Index Semantic Color Scale

Instead of referencing concrete shade numbers (e.g., `slate-200`), theme CSS uses
semantic z-indexed references: `bg-surface-z1` through `bg-surface-z10`.

The z-index maps to different concrete shades depending on the active mode:

| Shortcut | Light Mode | Dark Mode | Semantic meaning |
|----------|-----------|-----------|-----------------|
| `z1` | shade-50 | shade-950 | Background, lowest surface |
| `z2` | shade-100 | shade-900 | Card, panel background |
| `z3` | shade-200 | shade-800 | Subtle elevation |
| `z4` | shade-300 | shade-700 | Input backgrounds |
| `z5` | shade-500 | shade-600 | Mid-range (borders) |
| `z6` | shade-600 | shade-500 | Inverse mid-range |
| `z7` | shade-700 | shade-300 | Elevated text |
| `z8` | shade-800 | shade-200 | Secondary text |
| `z9` | shade-900 | shade-100 | Primary text |
| `z10` | shade-950 | shade-50 | Maximum contrast |

This mapping means a theme file written once is automatically correct in both light and dark
mode. There is no need for `@media (prefers-color-scheme)` blocks or `.dark` selectors in
theme CSS — swapping `data-mode` swaps the underlying z-index resolution.

```css
/* This rule works correctly in both light and dark mode */
[data-list-item][data-active] {
  background-color: var(--color-primary-z2);
  color: var(--color-primary-z9);
}
```

---

## 3. Semantic Color Roles

The skin layer maps eight semantic roles to color scales. Theme CSS uses these roles via
CSS custom properties — never direct Tailwind color names.

| Role | Purpose | Example mapping |
|------|---------|----------------|
| `primary` | Brand primary, interactive elements | orange, teal, blue |
| `secondary` | Brand secondary, accents | pink, green, indigo |
| `surface` / `neutral` | Backgrounds, cards, surfaces | slate, zinc, stone |
| `accent` | Highlight, hover emphasis | sky, cyan, pink |
| `success` | Positive state, confirmation | green, lime |
| `warning` | Caution state | amber, yellow |
| `error` / `danger` | Error state, destructive actions | red, rose |
| `info` | Informational messages | blue, sky |

Each role generates a full z-indexed shortcut set (`bg-{role}-z1` through `bg-{role}-z10`,
and equivalent `text-` and `border-` variants).

---

## 4. Three Built-In Style Variants

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

## 5. Skin System

A skin binds a set of semantic color roles to concrete color scales. All skins are defined
in `@rokkit/core/src/skins.js` and exported as `predefinedSkins`.

### Predefined Skins

```javascript
export const predefinedSkins = {
  'skin-vibrant-orange': null,          // default: orange/pink/slate
  'skin-sea-green':    { primary: 'teal',   secondary: 'green',  surface: 'zinc',  accent: 'sky'  },
  'skin-deep-blue':    { primary: 'blue',   secondary: 'indigo', surface: 'slate', accent: 'cyan' },
  'skin-royal-purple': { primary: 'violet', secondary: 'purple', surface: 'slate', accent: 'pink' },
  'skin-rose-gold':    { primary: 'rose',   secondary: 'amber',  surface: 'stone', accent: 'orange' },
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
  ...Object.entries(predefinedSkins).map(([name, mapping]) =>
    [name, theme.getPalette(mapping ?? undefined)]
  ),
  ...theme.getShortcuts('surface'),
  ...theme.getShortcuts('primary'),
  ...theme.getShortcuts('secondary'),
  // ... other roles
]
```

`theme.getPalette(mapping)` returns a UnoCSS utility string that sets all CSS custom
properties for that skin's color roles. `theme.getShortcuts(role)` returns the z-indexed
shortcut rules for that role.

### Runtime Skin Switching via `data-palette`

`palette.css` maps `data-palette` attribute values to the corresponding skin shortcuts:

```css
@layer base {
  :root:not([data-palette]),
  [data-palette="skin-vibrant-orange"] { @apply skin-vibrant-orange; }
  [data-palette="skin-sea-green"]      { @apply skin-sea-green; }
  [data-palette="skin-deep-blue"]      { @apply skin-deep-blue; }
  [data-palette="skin-royal-purple"]   { @apply skin-royal-purple; }
  [data-palette="skin-rose-gold"]      { @apply skin-rose-gold; }
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
['skin-my-brand', theme.getPalette({ primary: 'emerald', secondary: 'cyan', surface: 'gray' })]
```

2. Add the CSS rule in the application's stylesheet (not in `palette.css`):
```css
[data-palette="skin-my-brand"] { @apply skin-my-brand; }
```

3. Activate it:
```typescript
setPalette('skin-my-brand')
```

---

## 6. CSS Custom Property Architecture

The skin shortcut expands into CSS custom property assignments. These properties are the
interface between the skin layer and theme CSS:

```css
/* What @apply skin-sea-green expands to (simplified) */
:root {
  --color-primary-50:  /* teal-50 */;
  --color-primary-100: /* teal-100 */;
  /* ... through 950 */
  --color-surface-50:  /* zinc-50 */;
  /* ... through 950 */
  /* ... all roles */
}
```

Theme CSS never references `teal-500` or `zinc-200` directly. It references
`var(--color-primary-z4)` which resolves through the z-index → shade mapping and then
through the custom property. The full resolution chain:

```
[data-list-item][data-active] { background: var(--color-primary-z2) }
  → z2 maps to shade-100 in light, shade-900 in dark
  → var(--color-primary-100) in light mode
  → teal-100 in the sea-green skin
```

---

## 7. How Components Consume Theme Tokens

Components never import or reference CSS. They annotate the DOM with data attributes.
Theme CSS files target those attributes and apply visual styles.

```svelte
<!-- Component template (no CSS, no style block) -->
<div
  data-list
  data-density={density}
>
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
  background: var(--color-surface-z1);
  border: 1px solid var(--color-surface-z4);
  border-radius: var(--radius-md);
}

[data-list-item] {
  color: var(--color-surface-z9);
  padding: 0.5rem 0.75rem;
}

[data-list-item][data-active] {
  background: var(--color-primary-z2);
  color: var(--color-primary-z9);
}

[data-list-item][data-focused] {
  outline: 2px solid var(--color-primary-z6);
  outline-offset: -2px;
}

[data-list-item][data-disabled] {
  opacity: 0.5;
  pointer-events: none;
}

[data-list][data-density="compact"] [data-list-item] {
  padding: 0.25rem 0.5rem;
}
```

This contract is what makes themes fully decoupled from components. A theme can be written
against the attribute contract without access to component source. A component can be
restructured internally without breaking themes as long as the attribute contract is
preserved.

---

## 8. The `themable` Action

The `themable` action (from `@rokkit/actions`) applies `data-style`, `data-mode`, and
`data-density` to the host element from the reactive `vibe` store in `@rokkit/states`:

```javascript
// vibe store — @rokkit/states/vibe.svelte.js
export const vibe = $state({
  style: 'rokkit',     // 'rokkit' | 'material' | 'minimal'
  palette: 'skin-vibrant-orange',
  mode: 'light',       // 'light' | 'dark'
  direction: 'ltr'     // auto-detected from document.documentElement.lang
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
