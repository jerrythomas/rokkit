# Color & Palette Customization in Rokkit

Rokkit’s color system is designed for semantic clarity, flexibility, and easy theming across your entire application. The latest approach uses a **z-indexed scale** for neutral and semantic colors, making it simple to adapt your UI for both light and dark modes.

---

## Semantic Color System: z1–z10

Instead of traditional shortcuts like `bg-surface-300` or `bg-surface-100`, Rokkit now uses a numbered scale for each color role:

- `bg-surface-z0` through `bg-surface-z10`
- `bg-primary-z1` through `bg-primary-z10`
- ...and so on for secondary, success, warning, error, info, etc.

### What do z1–z10 mean?

Each `z` value maps to a specific shade in your palette. For example, for neutral colors:

| Shortcut         | Light Mode         | Dark Mode         |
|------------------|-------------------|-------------------|
| bg-surface-z1    | bg-surface-50     | bg-surface-950    |
| bg-surface-z2    | bg-surface-100    | bg-surface-900    |
| bg-surface-z3    | bg-surface-200    | bg-surface-800    |
| bg-surface-z4    | bg-surface-300    | bg-surface-700    |
| bg-surface-z5    | bg-surface-500    | bg-surface-600    |
| bg-surface-z6    | bg-surface-600    | bg-surface-500    |
| bg-surface-z7    | bg-surface-700    | bg-surface-300    |
| bg-surface-z8    | bg-surface-800    | bg-surface-200    |
| bg-surface-z9    | bg-surface-900    | bg-surface-100    |
| bg-surface-z10   | bg-surface-950    | bg-surface-50     |

This mapping ensures that your UI adapts seamlessly between light and dark modes, with the lowest index (`z1`) always representing the lightest shade in light mode and the darkest in dark mode, and vice versa for `z10`.

---

## How to Define Semantic Color Shortcuts

**Recommended:**
Use the helper function from your theme system, as shown in `uno.config.js`:

```js
shortcuts: [
  ...theme.getShortcuts('neutral'),
  ...theme.getShortcuts('primary'),
  ...theme.getShortcuts('secondary'),
  ...theme.getShortcuts('info'),
  // etc.
]
```

This automatically generates all the semantic shortcuts (`bg-surface-z1`, `bg-surface-z2`, ..., `bg-surface-z10`) according to your palette and tone mapping.

---

## Usage Example

```svelte
<div class="bg-surface-z1 text-surface-z10">
  <p>This uses the lightest neutral background and darkest neutral text in light mode.</p>
</div>
```

Switching to dark mode (e.g., by setting `[data-mode="dark"]` on your root element) will automatically invert the mapping, so `bg-surface-z1` becomes the darkest shade.

---

## Semantic Roles

You can use the z-indexed scale for any semantic color role:

- `bg-primary-z1` ... `bg-primary-z10`
- `bg-secondary-z1` ... `bg-secondary-z10`
- `bg-success-z1` ... `bg-success-z10`
- `bg-warning-z1` ... `bg-warning-z10`
- `bg-error-z1` ... `bg-error-z10`
- `bg-info-z1` ... `bg-info-z10`
- `text-surface-z1` ... `text-surface-z10`
- `border-surface-z1` ... `border-surface-z10`
- ...and so on

This system applies to backgrounds, text, borders, and any other CSS property that supports color.

---

## Dark & Light Modes

Rokkit supports both light and dark modes via data attributes:

```js
const themeConfig = {
  dark: {
    light: '[data-mode="light"]',
    dark: '[data-mode="dark"]'
  }
}
```

Switch modes by toggling the attribute on your root element. All z-indexed color shortcuts will adapt automatically.

---

## Summary

- **Use theme.getShortcuts(role):** Generates semantic color shortcuts for your palette.
- **z1–z10 scale:** Numbered shortcuts for semantic color roles, ensuring clarity and adaptability.
- **Automatic dark/light adaptation:** The mapping inverts for dark mode, so your UI always looks balanced.
- **Consistent API:** All components and styles use the same color system.
- **Extensible:** Easily add new semantic roles or extend palettes for your brand.

For more details on customizing icons and styles, see the [icons](./icons.md) and [styles](./styles.md) documentation.
