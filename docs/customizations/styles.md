# Style Customization in Rokkit

Rokkit UI provides a flexible, data-driven approach to styling your components. Instead of locking you into a single look or requiring convoluted overrides, Rokkit empowers you to define, extend, and switch between multiple style paradigms with ease.

---

## Built-in Style Paradigms

Rokkit ships with three foundational style paradigms:

- **rokkit**: The default, data-driven style focused on clarity and composability.
- **material**: Inspired by Material Design, offering familiar elevation and surface cues.
- **minimal**: A clean, understated look for maximum content focus.

You can use these out-of-the-box or extend them to create your own custom style systems.

---

## Skin Shortcuts

Rokkit leverages UnoCSS shortcuts to define "skins"—named style sets that bundle palette, spacing, and other visual rules. This makes it easy to switch themes or support multiple branded experiences.

**Example: Defining Skins in UnoCSS**

```js
shortcuts: [
  ['skin-default', theme.getPalette({ primary: 'orange', neutral: 'shark' })],
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
  ]
  // ...add more skins as needed
]
```

**Usage Example:**

```svelte
<div class="skin-seaweed">
  <Button>Seaweed Button</Button>
</div>
```

Switching the skin class instantly updates the look and feel of all nested components.

---

## Spacing Modes

Rokkit supports three global spacing modes to control padding and margin density:

- `compact`: Minimal padding/margins for dense layouts.
- `comfortable`: Default spacing for balanced layouts.
- `cozy`: Extra padding/margins for relaxed, spacious layouts.

Spacing can be set globally or overridden per component for granular control.

---

## Component-Level Variants

Each component supports style variants for further customization:

- `default`: Standard appearance.
- `filled`: Opaque backgrounds for emphasis.
- `outlined`: Border-only style for subtlety.

Variants can be combined with skins and spacing modes for a wide range of visual outcomes.

---

## Extending Styles

To create your own style system, simply define new UnoCSS shortcuts, palettes, and variants. Rokkit’s architecture ensures that your customizations are consistent and easy to maintain across all components.

---

## Summary

- **Multiple style paradigms**: Choose or extend rokkit, material, minimal, or your own.
- **Skin shortcuts**: Bundle palette and style rules for easy switching.
- **Spacing and variants**: Control density and appearance at both global and component levels.
- **Composable and maintainable**: Rokkit’s style system is designed for scale and flexibility.

For more on customizing colors and icons, see the [colors](./colors.md) and [icons](./icons.md) documentation.
