# Styles Guidelines: Theme/Layout Separation & Data-Attribute Usage

## Overview

This document defines the conventions for separating theme and layout styles, and for using data-attributes as styling hooks in the Rokkit UI library. Adhering to these guidelines ensures maintainable, scalable, and themeable component styling across the codebase.

---

## 1. Theme vs. Layout: Separation of Concerns

### Theme Styles (`rokkit/`)

- **Purpose:** Control colors, gradients, shadows, border colors, and other visual tokens that define the "look and feel" of a theme.
- **Location:** `packages/themes/src/rokkit/`
- **Examples:**
  - Background and text colors
  - Gradients
  - Border colors
  - Focus/active/hover color states
  - Error, warning, success, info color states
  - Disabled state colors

### Layout Styles (`base/`)

- **Purpose:** Define structure, spacing, sizing, flex/grid, and other layout-related properties that are consistent regardless of theme.
- **Location:** `packages/themes/src/base/`
- **Examples:**
  - Padding and margin
  - Flexbox/grid structure
  - Border radius and width (if not theme-specific)
  - Element alignment and positioning
  - Responsive breakpoints
  - Minimum/maximum sizes

---

## 2. Data-Attribute Usage

### Why Use Data-Attributes?

- **Decouples styling from markup:** Avoids reliance on tag names or class names that may change.
- **Enables theming:** Data-attributes provide stable hooks for both theme and layout layers.
- **Improves maintainability:** Makes it clear which elements are intended for styling and which are not.

### Naming Convention

- Use the pattern: `data-[component]-[element]`
  - Example: `data-field-root`, `data-field`, `data-message`
- For stateful or variant attributes, use: `data-[component]-[state]`
  - Example: `data-field-disabled`, `data-field-state="fail"`

### Selector Examples

- `[data-field-root]` — main input field container
- `[data-field-disabled]` — disabled state
- `[data-field-state="fail"]` — error state
- `[data-field]` — input wrapper
- `[data-message]` — validation or helper message
- `[data-description]` — description text

---

## 3. Implementation Guidelines

### General Rules

- **Never style by tag name or generic class** in theme/layout CSS. Always use data-attributes.
- **Do not mix theme and layout styles** in the same file. If a property could be either, prefer layout unless it is clearly theme-driven (e.g., color).
- **All new components must use data-attributes** for styling hooks.

### Theme File (`rokkit/input.css`) Example

```css
[data-style='rokkit'] [data-field-root] {
  /* Theme-specific: colors, gradients, border color */
  @apply bg-surface-z2 border-surface-z3 text-surface-z8;
}
[data-style='rokkit'] [data-field-root][data-field-disabled] {
  @apply bg-surface-z3 text-surface-z5 cursor-not-allowed;
}
[data-style='rokkit'] [data-field-root][data-field-state='fail'] {
  @apply bg-error border-error text-error;
}
[data-style='rokkit'] [data-message] {
  @apply text-error bg-error/10;
}
```

### Layout File (`base/input.css`) Example

```css
[data-field-root] {
  /* Layout: spacing, structure, radius */
  @apply flex flex-col gap-1 p-2 rounded-md border;
}
[data-field] {
  @apply flex items-center gap-2;
}
[data-message] {
  @apply mt-1 text-xs;
}
```

---

## 4. Migration Checklist

- [ ] Replace all `rk-` tag selectors with `[data-*]` attribute selectors.
- [ ] Move color, gradient, and theme tokens to `rokkit/`.
- [ ] Move spacing, flex, and structure to `base/`.
- [ ] Ensure all states (error, disabled, etc.) are handled via data-attributes.
- [ ] Test with both default and custom themes for visual consistency.

---

## 5. Accessibility & Responsiveness

- Always ensure focus, hover, and active states are visible and themeable.
- Use data-attributes for ARIA and accessibility-related styling as needed.
- Responsive layout adjustments should be in `base/`, while responsive color changes go in `rokkit/`.

---

## 6. Best Practices

- **Be explicit:** Prefer `[data-field-root][data-field-disabled]` over ambiguous selectors.
- **Be consistent:** Use the same attribute names across all components for similar roles.
- **Document exceptions:** If a style must break these rules, document the reason in the file.

---

## 7. References

- See `InputField.svelte` for canonical data-attribute usage.
- See `rokkit/input.css` and `base/input.css` for implementation patterns.
- For further questions, consult the project maintainers or open a discussion in the repo.

---
