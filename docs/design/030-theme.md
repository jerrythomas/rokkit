# Theme System Design

> Architecture and implementation details for Rokkit's theming system

## Overview

Rokkit's theme system provides flexible, scalable customization through:
- **Theme Class**: Central utility for palettes, semantic colors, and shortcuts
- **Skin System**: Bundled palette and style rules for easy theme switching
- **z-indexed Color Scale**: Semantic color shortcuts that auto-adapt to dark/light modes
- **Data Attributes**: Component styling via `data-*` attributes

## Architecture

### Theme Class (`@rokkit/themes`)

The `Theme` class is the central utility for managing palettes, semantic color roles, and style shortcuts.

```javascript
import { Theme, iconShortcuts, defaultIcons } from '@rokkit/themes'

const theme = new Theme()
```

### Key API Methods

| Method | Purpose |
|--------|---------|
| `getShortcuts(role)` | Generate semantic color shortcuts for a role |
| `getPalette(config)` | Create palette configuration |
| `getColorRules(config)` | Generate UnoCSS color rules |

## Semantic Color System (z1-z10)

Instead of traditional shortcuts like `bg-surface-300`, Rokkit uses a z-indexed scale:

- `bg-surface-z1` through `bg-surface-z10`
- `bg-primary-z1` through `bg-primary-z10`
- Similar for all semantic roles

### Z-Index Mapping

| Shortcut | Light Mode | Dark Mode |
|----------|-----------|-----------|
| `bg-surface-z1` | bg-surface-50 | bg-surface-950 |
| `bg-surface-z2` | bg-surface-100 | bg-surface-900 |
| `bg-surface-z3` | bg-surface-200 | bg-surface-800 |
| `bg-surface-z4` | bg-surface-300 | bg-surface-700 |
| `bg-surface-z5` | bg-surface-500 | bg-surface-600 |
| `bg-surface-z6` | bg-surface-600 | bg-surface-500 |
| `bg-surface-z7` | bg-surface-700 | bg-surface-300 |
| `bg-surface-z8` | bg-surface-800 | bg-surface-200 |
| `bg-surface-z9` | bg-surface-900 | bg-surface-100 |
| `bg-surface-z10` | bg-surface-950 | bg-surface-50 |

This mapping ensures UI adapts seamlessly between modes.

## Semantic Color Roles

Available for backgrounds, text, borders:

- `primary` - Primary brand color
- `secondary` - Secondary brand color
- `neutral/surface` - Backgrounds and surfaces
- `success` - Success states
- `warning` - Warning states
- `error/danger` - Error states
- `info` - Informational states
- `accent` - Accent color

## Built-in Style Paradigms

### Three Theme Variants

1. **rokkit**: Default data-driven style with distinctive aesthetics
2. **material**: Material Design inspired with elevation and surface cues
3. **minimal**: Clean, understated look for content focus

### Theme Files

Located in `packages/themes/src/`:
- `base.css` - Foundation styles
- `palette.css` - Color palette definitions
- `rokkit.css` - Rokkit theme
- `minimal.css` - Minimal theme
- `material.css` - Material theme

## Skin System

Skins define the color palette for the entire application by mapping semantic color roles (primary, secondary, surface, etc.) to concrete color scales.

### Predefined Skins

Predefined skins are defined in `@rokkit/core/src/skins.js` and exported from `@rokkit/core`:

```javascript
import { predefinedSkins, defaultSkin } from '@rokkit/core'

// predefinedSkins is a Record<skinName, mappingOverrides | null>
// null means use defaultThemeMapping (orange/pink/slate — the Rokkit brand default)
export const predefinedSkins = {
  'skin-vibrant-orange': null,       // orange primary, pink secondary, slate surface
  'skin-sea-green':    { primary: 'teal', secondary: 'green', surface: 'zinc', accent: 'sky', danger: 'rose', error: 'rose', success: 'lime', warning: 'amber' },
  'skin-deep-blue':    { primary: 'blue', secondary: 'indigo', surface: 'slate', accent: 'cyan' },
  'skin-royal-purple': { primary: 'violet', secondary: 'purple', surface: 'slate', accent: 'pink' },
  'skin-rose-gold':    { primary: 'rose', secondary: 'amber', surface: 'stone', accent: 'orange' },
}

export const defaultSkin = 'skin-vibrant-orange'
```

### Skin Naming Convention

All skin names use the `skin-` prefix to avoid conflicts with CSS reserved words (e.g., `default` is a reserved keyword) and to namespace skins in the UnoCSS shortcut registry.

### UnoCSS Shortcut Generation

Generate shortcuts from predefined skins in `uno.config.ts`:

```typescript
import { predefinedSkins, defaultSkin } from '@rokkit/core'

shortcuts: [
  ...Object.entries(predefinedSkins).map(([name, mapping]) =>
    [name, theme.getPalette(mapping ?? undefined)]
  ),
  ...theme.getShortcuts('surface'),
  ...theme.getShortcuts('primary'),
  // ...
]
```

### Applying Skins at Runtime — `data-palette`

Skins are applied via the `data-palette` attribute on the `<html>` element, following the same pattern as `data-mode` (dark/light) and `data-style` (component theme variant):

```html
<html data-mode="dark" data-palette="skin-sea-green" data-style="rokkit">
```

Switching the palette at runtime:

```typescript
// palette.svelte.ts — mirrors mode.svelte.ts
import { defaultSkin } from '@rokkit/core'

let palette = $state(defaultSkin)

export function initPalette() {
  document.documentElement.setAttribute('data-palette', palette)
}
export function setPalette(name: string) {
  palette = name
  document.documentElement.setAttribute('data-palette', name)
}
export function getPalette() { return palette }
```

### CSS — `palette.css`

`@rokkit/themes/palette.css` maps `data-palette` attribute values to the corresponding UnoCSS skin shortcuts:

```css
@layer base {
  :root {
    --scroll-width: 0.5rem;
    --tab-size: 2;
  }
  /* Fallback: vibrant-orange when no data-palette set */
  :root:not([data-palette]),
  [data-palette="skin-vibrant-orange"] { @apply skin-vibrant-orange; }
  [data-palette="skin-sea-green"]      { @apply skin-sea-green; }
  [data-palette="skin-deep-blue"]      { @apply skin-deep-blue; }
  [data-palette="skin-royal-purple"]   { @apply skin-royal-purple; }
  [data-palette="skin-rose-gold"]      { @apply skin-rose-gold; }
}
```

### Adding a Custom Skin

1. Define the mapping in your app's `uno.config.ts`:
```typescript
shortcuts: [
  ['skin-my-brand', theme.getPalette({ primary: 'emerald', secondary: 'cyan', surface: 'gray' })],
]
```

2. Add the CSS rule (in your app's CSS, not in `palette.css`):
```css
[data-palette="skin-my-brand"] { @apply skin-my-brand; }
```

3. Call `setPalette('skin-my-brand')` to activate it.

## Spacing Modes

Three global spacing modes:

| Mode | Description |
|------|-------------|
| `compact` | Minimal padding/margins for dense layouts |
| `comfortable` | Default balanced spacing |
| `cozy` | Extra padding for relaxed layouts |

## Component Variants

Per-component visual variants:

| Variant | Description |
|---------|-------------|
| `default` | Standard appearance |
| `filled` | Opaque backgrounds for emphasis |
| `outlined` | Border-only style for subtlety |

## Dark/Light Mode Support

Toggle via data attributes:

```html
<html data-mode="dark">
<!-- or -->
<html data-mode="light">
```

Configuration:
```javascript
const themeConfig = {
  dark: {
    light: '[data-mode="light"]',
    dark: '[data-mode="dark"]'
  }
}
```

## Icon System

### Global Icon Customization

```javascript
import { iconShortcuts, defaultIcons } from '@rokkit/themes'

shortcuts: [
  ...Object.entries(iconShortcuts(defaultIcons, 'i-rokkit'))
]
```

### Per-Component Icon Overrides

```javascript
const myIcons = {
  add: 'i-custom:add',
  remove: 'i-custom:remove'
}

<List items={items} icons={myIcons} />
```

### Custom Icon Collections

```javascript
const icons = {
  rokkit: '@rokkit/icons/ui.json',
  solar: '@iconify-json/solar/icons.json'
}

presetIcons({
  collections: {
    ...importIcons(icons)
  }
})
```

## UnoCSS Configuration Example

```javascript
import { Theme, iconShortcuts, defaultIcons } from '@rokkit/themes'

const theme = new Theme()

export default defineConfig({
  shortcuts: [
    // Skins
    ['skin-default', theme.getPalette({ neutral: 'shark' })],
    
    // Semantic shortcuts
    ...theme.getShortcuts('neutral'),
    ...theme.getShortcuts('primary'),
    ...theme.getShortcuts('secondary'),
    
    // Icons
    ...Object.entries(iconShortcuts(defaultIcons, 'i-rokkit')),
    
    // Text contrast
    ['text-on-primary', 'text-surface-50'],
    ['text-on-secondary', 'text-surface-50']
  ],
  theme: {
    colors: theme.getColorRules({ neutral: 'shark' }),
    fontFamily: {
      mono: ['Victor Mono', 'monospace'],
      sans: ['Overpass', 'ui-serif', 'sans-serif']
    }
  }
})
```

## Data Attribute Selectors

Components use data attributes for theming:

```css
/* Component root */
[data-component="list"] { }

/* State */
[data-state="active"] { }
[data-state="disabled"] { }

/* Variant */
[data-variant="filled"] { }
[data-variant="outlined"] { }

/* Size */
[data-size="sm"] { }
[data-size="md"] { }
[data-size="lg"] { }
```

## Implementation Guidelines

### For Theme Developers

1. Use semantic color variables, never hard-coded colors
2. Support both dark and light modes via z-indexed scale
3. Use data attributes for component-specific styles
4. Test all three theme variants (rokkit, minimal, material)

### For Component Developers

1. Apply `data-*` attributes for all interactive states
2. Use semantic shortcuts (`bg-surface-z2`) not direct colors
3. Support theme/mode switching without component changes
4. Ensure sufficient contrast in both modes

## Related Files

- `packages/themes/src/` - Theme CSS files
- `packages/core/src/theme.js` - Theme utilities
- `.rules/guidelines/styles.md` - Styling guidelines
