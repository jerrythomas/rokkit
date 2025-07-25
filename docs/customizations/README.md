# Rokkit UI Customization Overview

Rokkit UI is designed for powerful, scalable, and consistent customization across your entire application. The core of this system is the `Theme` class, which provides a unified API for configuring palettes, semantic color shortcuts, skins, and more—all integrated with UnoCSS for compile-time performance.

This README covers:

- How to use and configure the `Theme` class
- Key API methods: `getShortcuts`, `getPalette`, `getColorRules`
- Practical examples from `uno.config.js`
- References to icons, styles, and colors documentation

---

## The `Theme` Class

The `Theme` class (from `@rokkit/themes`) is the central utility for managing palettes, semantic color roles, and style shortcuts in Rokkit UI.

### Key Features

- **Palette management:** Define and switch between color schemes for primary, secondary, neutral, etc.
- **Semantic color shortcuts:** Automatically generate UnoCSS shortcuts for backgrounds, text, borders, etc., using a z-indexed scale (`z1`–`z10`).
- **Skin system:** Bundle palette and style rules for easy theme switching.
- **Consistent API:** All components and styles use the same semantic roles and shortcut conventions.

---

## Configuring Theme in UnoCSS

Below is a practical example from `sites/learn/uno.config.js` showing how to configure and use the `Theme` class:

```js
import { Theme, iconShortcuts, defaultIcons } from '@rokkit/themes'

const theme = new Theme()

export default defineConfig({
  shortcuts: [
    // Skin shortcuts: bundle palette and style rules
    ['skin-default', theme.getPalette({ neutral: 'shark' })],
    ['skin-vibrant', theme.getPalette({ primary: 'blue', secondary: 'purple' })],
    [
      'skin-seaweed',
      theme.getPalette({
        primary: 'sky',
        secondary: 'green',
        accent: 'blue',
        danger: 'rose',
        success: 'lime',
        neutral: 'zinc',
        warning: 'amber',
        info: 'indigo'
      })
    ],

    // Semantic color shortcuts for each role
    ...theme.getShortcuts('neutral'),
    ...theme.getShortcuts('primary'),
    ...theme.getShortcuts('secondary'),
    ...theme.getShortcuts('info'),

    // Icon shortcuts
    ...Object.entries(iconShortcuts(defaultIcons, 'i-rokkit')),

    // Text color shortcuts for contrast
    ['text-on-primary', 'text-surface-50'],
    ['text-on-secondary', 'text-surface-50'],
    ['text-on-info', 'text-surface-50'],
    ['text-on-success', 'text-surface-50'],
    ['text-on-warning', 'text-surface-50'],
    ['text-on-error', 'text-surface-50']
  ],
  theme: {
    colors: theme.getColorRules({ neutral: 'shark' }),
    fontFamily: {
      mono: ['Victor Mono', 'monospace'],
      heading: ['Open Sans', 'sans-serif'],
      sans: ['Overpass', 'ui-serif', 'sans-serif'],
      body: ['Open Sans', '-apple-system', 'system-ui', 'Segoe-UI', 'ui-serif', 'sans-serif']
    }
```

---

## Further Reading

For detailed guides on customizing specific aspects of Rokkit UI, see:

- [Icons Customization](./icons.md)
- [Styles & Skins](./styles.md)
- [Colors & Palettes](./colors.md)

These documents provide in-depth examples and best practices for each customization area.
