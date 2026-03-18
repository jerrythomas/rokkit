# Whitelabeling

> How to replace every Rokkit visual default — color, shape, icons, and typography —
> without touching component source code.

---

## What Whitelabeling Means Here

A whitelabeled Rokkit application shares no recognizable visual identity with the
defaults. Buttons, inputs, dropdowns, and data components all render in the host brand's
visual language. The component contract (data attributes, props, events) is untouched.

Four independent replacement axes cover the full visual surface:

```
┌──────────────────────────────────────────────────────────────┐
│  1. Skin         — brand color palette                       │
│     data-palette="brand-name" on <html>                      │
├──────────────────────────────────────────────────────────────┤
│  2. Style        — component shapes and decoration           │
│     data-style="brand" on <html>                             │
├──────────────────────────────────────────────────────────────┤
│  3. Icons        — default icon strings                      │
│     @rokkit/core defaultStateIcons override                  │
├──────────────────────────────────────────────────────────────┤
│  4. Typography   — font family custom properties             │
│     --font-sans, --font-mono, --font-heading override        │
└──────────────────────────────────────────────────────────────┘
```

All four axes are independent. A brand that accepts Rokkit's default shapes but needs
custom colors only needs axis 1. A brand replacing everything touches all four.

---

## Axis 1: Custom Skin

A skin binds semantic color roles (`primary`, `surface`, `success`, etc.) to a concrete
Tailwind/UnoCSS color scale.

### 1. Register the skin shortcut

In the application's `uno.config.ts`:

```typescript
import { Theme } from '@rokkit/themes'
import { predefinedSkins } from '@rokkit/core'

const theme = new Theme()

export default defineConfig({
  shortcuts: [
    // Built-in skins
    ...Object.entries(predefinedSkins).map(([name, mapping]) => [
      name,
      theme.getPalette(mapping ?? undefined)
    ]),

    // Custom brand skin
    [
      'skin-acme-brand',
      theme.getPalette({
        primary: 'cyan',
        secondary: 'violet',
        surface: 'slate',
        accent: 'sky',
        success: 'green',
        warning: 'amber',
        error: 'red',
        info: 'blue'
      })
    ],

    // z-indexed shortcuts for each role
    ...theme.getShortcuts('surface'),
    ...theme.getShortcuts('primary'),
    ...theme.getShortcuts('secondary'),
    ...theme.getShortcuts('accent')
  ]
})
```

### 2. Add the CSS mapping

In the application stylesheet (not inside `@rokkit/themes`):

```css
[data-palette='skin-acme-brand'] {
  @apply skin-acme-brand;
}
```

### 3. Activate

```typescript
import { vibe } from '@rokkit/states'

vibe.palette = 'skin-acme-brand'
```

### Semantic Color Token Slots

| Role        | Purpose                              |
| ----------- | ------------------------------------ |
| `primary`   | Interactive elements, brand emphasis |
| `secondary` | Accents, secondary brand color       |
| `surface`   | Backgrounds, cards, neutral surfaces |
| `accent`    | Hover highlights, focus rings        |
| `success`   | Positive states                      |
| `warning`   | Caution states                       |
| `error`     | Errors, destructive actions          |
| `info`      | Informational messages               |

Each role maps to a z-indexed shortcut set: `bg-primary-z1` through `bg-primary-z10`,
and equivalent `text-` and `border-` variants. Light and dark mode are automatic — see
`09-theming.md` for the z-index resolution table.

---

## Axis 2: Custom Style

A style variant controls component shapes, shadows, border-radius, and decorative
properties. It is a set of CSS files that target Rokkit's data attribute contract.

### Style file structure

```
brand-theme/
  src/
    button.css     ← [data-button] rules
    input.css      ← [data-input] rules
    list.css       ← [data-list], [data-list-item] rules
    select.css     ← [data-select] rules
    card.css       ← [data-card] rules
    ...
  index.css        ← imports all component files
```

### Writing a style variant

Target data attributes exactly as the built-in styles do. Never use component class names
or internal Svelte structure — the data attribute contract is the stable API.

```css
/* brand-theme/src/button.css */
[data-style='brand'] [data-button] {
  border-radius: 2px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--color-primary-z5);
  color: var(--color-surface-z1);
  border: none;
  padding-block: var(--density-spacing-sm);
  padding-inline: var(--density-spacing-lg);
  transition: background 150ms ease;
}

[data-style='brand'] [data-button]:hover {
  background: var(--color-primary-z6);
}

[data-style='brand'] [data-button][data-variant='outlined'] {
  background: transparent;
  border: 1px solid var(--color-primary-z5);
  color: var(--color-primary-z7);
}
```

### Activate

```typescript
import { vibe } from '@rokkit/states'

vibe.style = 'brand'
```

Import the brand theme CSS before activating. The `data-style="brand"` selector ensures
it only applies when the style is active.

---

## Axis 3: Icon Override

Rokkit components use string-based icon identifiers from `defaultStateIcons` in
`@rokkit/core`. These identifiers are passed to the icon rendering layer and can be
replaced wholesale.

```typescript
// @rokkit/core/src/icons.ts
export const defaultStateIcons = {
  select: {
    open: 'chevron-down',
    clear: 'x',
    loading: 'loader'
  },
  tree: {
    expand: 'chevron-right',
    collapse: 'chevron-down',
    leaf: 'file'
  },
  pagination: {
    previous: 'chevron-left',
    next: 'chevron-right',
    first: 'chevron-double-left',
    last: 'chevron-double-right'
  },
  sort: {
    ascending: 'arrow-up',
    descending: 'arrow-down',
    unsorted: 'arrows-up-down'
  },
  status: {
    success: 'check-circle',
    warning: 'alert-triangle',
    error: 'alert-circle',
    info: 'info'
  }
}
```

Override at application startup before any components mount:

```typescript
import { defaultStateIcons } from '@rokkit/core'

Object.assign(defaultStateIcons.select, {
  open: 'caret-down', // Phosphor icon name
  clear: 'x-circle'
})

Object.assign(defaultStateIcons.status, {
  success: 'check-fat',
  error: 'warning-octagon'
})
```

The icon name strings map to whatever icon system the application uses (Iconify,
Phosphor, Lucide, inline SVG). The icon renderer component in `@rokkit/ui` resolves
these names to actual icon output — replace the renderer if switching icon systems
entirely.

---

## Axis 4: Typography

Font families are CSS custom properties on `:root`. Override them in the application
stylesheet:

```css
/* application.css — loaded after rokkit base CSS */
:root {
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --font-heading: 'Cal Sans', 'Inter', sans-serif;
}
```

All theme CSS references these variables. No component CSS hardcodes font-family names.

Load fonts before or alongside these overrides:

```html
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
/>
```

---

## Complete Whitelabel Checklist

A fully whitelabeled integration requires:

```
□ Skin     — custom skin registered in uno.config.ts and CSS mapping added
□ Style    — custom style CSS authored for all components in use
□ Icons    — defaultStateIcons overridden at app startup
□ Fonts    — --font-sans, --font-mono, --font-heading overridden in CSS
□ Activate — vibe.palette, vibe.style set on mount
```

Nothing in `@rokkit/ui`, `@rokkit/states`, or `@rokkit/core` needs modification.

---

## CLI Scaffolding (Planned)

Two generators are planned to accelerate whitelabel setup:

```bash
# Generates a skin starter file with all color role slots
npx rokkit generate skin --name acme-brand --primary cyan --surface slate

# Generates a style starter file with all data-attribute selectors stubbed
npx rokkit generate style --name brand
```

The `generate skin` command outputs a `uno.config.ts` snippet and the CSS mapping rule.
The `generate style` command outputs a directory of empty CSS files, one per component,
with the correct `[data-style='brand'] [data-*]` selectors pre-populated from the
current data attribute contract.

Until the CLI ships, use the built-in `rokkit` style source in
`packages/themes/src/rokkit/` as the reference template for custom style authoring.
