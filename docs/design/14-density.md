# Density System

> How Rokkit scales spatial rhythm across compact, default, and comfortable modes using
> CSS custom properties and a single inheritable data attribute.

---

## Overview

Density controls how much space components occupy. Three modes ship:

| Mode          | Use case                                          |
| ------------- | ------------------------------------------------- |
| `compact`     | Data-dense UIs: tables, data grids, admin panels  |
| `default`     | General-purpose applications (the baseline)       |
| `comfortable` | Reading-focused UIs: documentation, content pages |

Density is set by placing `data-density` on any container element. All descendants
inherit the active density through CSS custom property cascade — no JavaScript, no
context API, no prop drilling.

```html
<!-- Entire app -->
<html data-density="compact">
  <!-- Just one section -->
  <section data-density="comfortable">
    <!-- components here render in comfortable mode -->
  </section>
</html>
```

---

## Fourth Theming Axis

Density is the fourth axis alongside skin, mode, and style:

```
┌──────────────────────────────────────────────┐
│  Skin layer    (data-palette)                │
│  Mode layer    (data-mode)                   │
│  Style layer   (data-style)                  │
├──────────────────────────────────────────────┤
│  Density layer (data-density)                │
│  Controls spatial rhythm: spacing, font      │
│  size, line height, icon size, border width. │
└──────────────────────────────────────────────┘
```

The `vibe` store holds the active density value. The `themable` action writes
`data-density` to the `<html>` element alongside `data-style` and `data-mode`:

```javascript
// vibe store — @rokkit/states/vibe.svelte.js
export const vibe = $state({
  style: 'rokkit',
  palette: 'skin-vibrant-orange',
  mode: 'light',
  density: 'default', // ← fourth axis
  direction: 'ltr'
})
```

---

## CSS Custom Property Scale

Each density mode sets a baseline set of CSS custom properties. Components read these
properties rather than hardcoding spacing values.

```css
/* base density tokens — packages/themes/src/base/density.css */

:root,
[data-density='default'] {
  --density-spacing-base: 1rem;
  --density-spacing-xs: 0.25rem;
  --density-spacing-sm: 0.5rem;
  --density-spacing-md: 0.75rem;
  --density-spacing-lg: 1rem;
  --density-spacing-xl: 1.5rem;

  --density-font-size-base: 0.875rem;
  --density-font-size-sm: 0.75rem;
  --density-font-size-lg: 1rem;

  --density-line-height: 1.5;
  --density-icon-size: 1.25rem;
  --density-border-width: 1px;
  --density-radius-base: var(--radius-md);
}

[data-density='compact'] {
  --density-spacing-base: 0.75rem;
  --density-spacing-xs: 0.125rem;
  --density-spacing-sm: 0.25rem;
  --density-spacing-md: 0.5rem;
  --density-spacing-lg: 0.75rem;
  --density-spacing-xl: 1rem;

  --density-font-size-base: 0.8125rem;
  --density-font-size-sm: 0.6875rem;
  --density-font-size-lg: 0.9375rem;

  --density-line-height: 1.375;
  --density-icon-size: 1rem;
  --density-border-width: 1px;
  --density-radius-base: var(--radius-sm);
}

[data-density='comfortable'] {
  --density-spacing-base: 1.25rem;
  --density-spacing-xs: 0.375rem;
  --density-spacing-sm: 0.625rem;
  --density-spacing-md: 1rem;
  --density-spacing-lg: 1.25rem;
  --density-spacing-xl: 2rem;

  --density-font-size-base: 1rem;
  --density-font-size-sm: 0.875rem;
  --density-font-size-lg: 1.125rem;

  --density-line-height: 1.75;
  --density-icon-size: 1.5rem;
  --density-border-width: 1px;
  --density-radius-base: var(--radius-lg);
}
```

---

## How Components Read Density

Components consume density tokens through the same `var()` chain used for colors.
Component CSS lives in the layout layer (`base/`) which applies to all style variants.

```css
/* packages/themes/src/base/list.css */
[data-list-item] {
  padding-block: var(--density-spacing-sm);
  padding-inline: var(--density-spacing-md);
  font-size: var(--density-font-size-base);
  line-height: var(--density-line-height);
  min-height: calc(var(--density-icon-size) + var(--density-spacing-md) * 2);
}

/* packages/themes/src/base/input.css */
[data-input] {
  padding-block: var(--density-spacing-sm);
  padding-inline: var(--density-spacing-md);
  font-size: var(--density-font-size-base);
  border-width: var(--density-border-width);
  border-radius: var(--density-radius-base);
}
```

No component reads `data-density` directly in its Svelte template. The density context
is purely a CSS concern.

---

## Inheritance and Scope

Because `data-density` sets CSS custom properties, descendant elements inherit them
through normal CSS cascade. A nested element with its own `data-density` overrides for
its subtree:

```
<html data-density="compact">          ← app default: compact
  <main>
    <aside data-density="default">     ← sidebar reverts to default
      <nav>...</nav>
    </aside>
    <article data-density="comfortable"> ← reading area uses comfortable
      <p>...</p>
    </article>
  </main>
</html>
```

This requires no Svelte context or prop propagation. CSS handles it entirely.

---

## Mixing Density with the Style Layer

Density tokens are set in the `base/` layout layer and are style-agnostic. Style variant
CSS (rokkit, material, minimal) may add density-sensitive visual properties if needed,
but structural spacing always comes from density tokens.

A style variant that wants to add more pronounced shadows in comfortable mode:

```css
/* packages/themes/src/rokkit/card.css */
[data-density='comfortable'] [data-card] {
  box-shadow: var(--shadow-lg);
}
```

This is an exception pattern. The primary density contract is spacing and typography —
not visual decoration.

---

## Svelte Component Contract

Components pass `density` as a data attribute where the value may need to influence
non-CSS behavior (e.g., virtualized list row height calculation). Reading from the DOM
attribute rather than a prop keeps the contract consistent with CSS:

```svelte
<script>
  // Only needed when JS must read density (e.g. virtual list row heights)
  let { density = 'default', ...props } = $props()
</script>

<div data-list data-density={density}>...</div>
```

For layout-only concerns, components omit the prop entirely and let CSS handle it
through the inherited custom properties.

---

## Density and the `themable` Action

`themable` writes `data-density` to `svelte:body` from the `vibe` store:

```svelte
<!-- App.svelte -->
<svelte:body use:themable />
```

To change density at runtime:

```typescript
import { vibe } from '@rokkit/states'

vibe.density = 'compact'
// themable action syncs data-density="compact" to the body element
```
