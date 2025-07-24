# Color & Palette Customization in Rokkit

Rokkit’s color system is designed for semantic clarity, flexibility, and easy theming across your entire application. The latest approach uses a **z-indexed scale** for neutral and semantic colors, making it simple to adapt your UI for both light and dark modes.

---

## Semantic Color System: z1–z10

Instead of traditional shortcuts like `bg-neutral-base` or `bg-neutral-inset`, Rokkit now uses a numbered scale for each color role:

- `bg-neutral-z1` through `bg-neutral-z10`
- `bg-primary-z1` through `bg-primary-z10`
- ...and so on for secondary, success, warning, error, info, etc.

### What do z1–z10 mean?

Each `z` value maps to a specific shade in your palette. For example, for neutral colors:

| Shortcut         | Light Mode         | Dark Mode         |
|------------------|-------------------|-------------------|
| bg-neutral-z1    | bg-neutral-50     | bg-neutral-950    |
| bg-neutral-z2    | bg-neutral-100    | bg-neutral-900    |
| bg-neutral-z3    | bg-neutral-200    | bg-neutral-800    |
| bg-neutral-z4    | bg-neutral-300    | bg-neutral-700    |
| bg-neutral-z5    | bg-neutral-500    | bg-neutral-600    |
| bg-neutral-z6    | bg-neutral-600    | bg-neutral-500    |
| bg-neutral-z7    | bg-neutral-700    | bg-neutral-300    |
| bg-neutral-z8    | bg-neutral-800    | bg-neutral-200    |
| bg-neutral-z9    | bg-neutral-900    | bg-neutral-100    |
| bg-neutral-z10   | bg-neutral-950    | bg-neutral-50     |

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

This automatically generates all the semantic shortcuts (`bg-neutral-z1`, `bg-neutral-z2`, ..., `bg-neutral-z10`) according to your palette and tone mapping.

---

## Usage Example

```svelte
<div class="bg-neutral-z1 text-neutral-z10">
  <p>This uses the lightest neutral background and darkest neutral text in light mode.</p>
</div>
```

Switching to dark mode (e.g., by setting `[data-mode="dark"]` on your root element) will automatically invert the mapping, so `bg-neutral-z1` becomes the darkest shade.

---

## Semantic Roles

You can use the z-indexed scale for any semantic color role:

- `bg-primary-z1` ... `bg-primary-z10`
- `bg-secondary-z1` ... `bg-secondary-z10`
- `bg-success-z1` ... `bg-success-z10`
- `bg-warning-z1` ... `bg-warning-z10`
- `bg-error-z1` ... `bg-error-z10`
- `bg-info-z1` ... `bg-info-z10`
- `text-neutral-z1` ... `text-neutral-z10`
- `border-neutral-z1` ... `border-neutral-z10`
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