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

Skins bundle palette and style rules for easy switching:

```javascript
shortcuts: [
  ['skin-default', theme.getPalette({ neutral: 'shark' })],
  ['skin-vibrant', theme.getPalette({ primary: 'blue', secondary: 'purple' })],
  ['skin-seaweed', theme.getPalette({
    primary: 'sky',
    secondary: 'green',
    accent: 'blue',
    danger: 'rose',
    success: 'lime',
    neutral: 'zinc',
    warning: 'amber',
    info: 'indigo'
  })]
]
```

Usage:
```svelte
<div class="skin-seaweed">
  <Button>Seaweed Button</Button>
</div>
```

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
