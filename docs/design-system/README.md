# Rokkit Design Token System

> A generic, color-space-agnostic design token architecture for building configurable,
> themeable component libraries. Supports multiple styles, densities, color palettes,
> dark/light mode, and roundedness — all from a single configuration.

---

## Table of Contents

1. [Philosophy](#1-philosophy)
2. [Token Architecture](#2-token-architecture)
3. [Color System](#3-color-system)
4. [Density & Layout](#4-density--layout)
5. [Typography](#5-typography)
6. [Roundedness](#6-roundedness)
7. [Component Styles](#7-component-styles)
8. [Theme Factory (Hybrid)](#8-theme-factory-hybrid)
9. [Theme Anatomy](#9-theme-anatomy)
10. [Data Attribute Contract](#10-data-attribute-contract)
11. [Configuration Surface](#11-configuration-surface)

---

## 1. Philosophy

### Principles

- **Configure, don't customize** — Most apps need the same structure with different colors.
  A theme is a configuration of tokens, not a rewrite of CSS.
- **Layers, not overrides** — Base structure (layout) is separate from visual treatment (style).
  Changing a style never breaks layout; changing density never breaks color.
- **Color-space agnostic** — Tokens store raw values. The system wraps them for RGB, HSL,
  or OKLCH at build time. Users choose their color space; themes handle the rest.
- **Nullable semantics** — Not every brand needs 10 distinct colors. Unset tokens inherit
  from their logical parent (tertiary → primary, danger → error, etc.).
- **Independent axes** — Style, density, mode, palette, and roundedness are orthogonal.
  Any combination works without theme-specific overrides.

### Japanese Vocabulary (zen-sumi reference)

The zen-sumi theme uses Japanese aesthetic vocabulary as its design language:

| Term | Kanji | Meaning | Maps to |
|------|-------|---------|---------|
| Sumi | 墨 | Ink | Text/foreground |
| Kami | 紙 | Paper | Surface/background |
| Shu | 朱 | Vermillion | Primary accent |
| Ma | 間 | Negative space | Spacing/padding |
| Notan | 濃淡 | Light-dark balance | z-scale system |
| Wabi-sabi | 侘寂 | Beauty in restraint | Minimal aesthetic |

This vocabulary is specific to zen-sumi. The generic token system uses clear English names.

---

## 2. Token Architecture

### Three Layers

```
┌─────────────────────────────────────────────────────┐
│  Layer 3: Component Tokens                          │
│  --button-bg, --input-border, --card-shadow         │
│  (derived from semantic tokens, set per-theme)      │
├─────────────────────────────────────────────────────┤
│  Layer 2: Semantic Tokens                           │
│  --color-primary-z5, --density-spacing-md           │
│  (mapped from primitives via z-scale/density axis)  │
├─────────────────────────────────────────────────────┤
│  Layer 1: Primitive Tokens                          │
│  --color-primary-500, --font-sans, --radius-md      │
│  (raw values: hex/rgb/oklch, px/rem, font stacks)   │
└─────────────────────────────────────────────────────┘
```

**Layer 1 — Primitives**: Raw color shades (50–950), font stacks, spacing base units,
radius values. Never referenced directly by components.

**Layer 2 — Semantic**: Named aliases that adapt to context.
`--color-primary-z5` resolves to shade 500 in light mode, 500 in dark mode (inverted
for other zones). Density tokens like `--density-spacing-md` change based on
`data-density`. These are the tokens components reference.

**Layer 3 — Component**: Optional per-theme overrides for specific component parts.
`--button-bg` might map to `--color-primary-z5` in most themes but to a gradient
in rokkit. Most themes skip this layer entirely — semantic tokens are sufficient.

### Token Namespacing

```
--color-{variant}-{shade}     Primitive   --color-primary-500
--color-{variant}-{zone}      Semantic    --color-primary-z5
--density-{category}-{size}   Semantic    --density-spacing-md
--radius-{size}               Primitive   --radius-md
--font-{role}                 Primitive   --font-sans
--{component}-{property}      Component   --button-bg
```

---

## 3. Color System

### 3.1 Semantic Colors (10 variants)

| Variant | Role | Default Palette | Fallback |
|---------|------|-----------------|----------|
| **surface** | Backgrounds, containers, borders | slate | — |
| **primary** | Brand, CTAs, main interactive | orange | — |
| **secondary** | Supporting brand, gradients | pink | → primary |
| **tertiary** | Tertiary brand, subtle accents | — (null) | → primary |
| **accent** | Highlights, links, decorative | sky | → primary |
| **success** | Positive states, confirmations | green | — |
| **warning** | Caution, attention needed | yellow | — |
| **danger** | Destructive actions, severity | red | — |
| **error** | Validation errors, failures | red | → danger |
| **info** | Informational, neutral emphasis | cyan | — |

### 3.2 Color Groups

**Branding** (configurable per-app):
`primary`, `secondary`, `tertiary`, `accent`, `surface`

**Status** (rarely changed):
`success`, `warning`, `danger`, `error`, `info`

### 3.3 Nullable / Default Semantics

When a color is not provided, it inherits from its logical parent:

```javascript
// User provides:
{ primary: 'indigo', surface: 'zinc' }

// System resolves:
{
  surface: 'zinc',
  primary: 'indigo',
  secondary: 'indigo',    // ← inherited from primary
  tertiary: 'indigo',     // ← inherited from primary
  accent: 'indigo',       // ← inherited from primary
  success: 'green',       // ← default
  warning: 'yellow',      // ← default
  danger: 'red',          // ← default
  error: 'red',           // ← inherited from danger
  info: 'cyan'            // ← default
}
```

**Inheritance chain:**
```
tertiary  → primary
secondary → primary (if not set)
accent    → primary (if not set)
error     → danger  (if not set)
```

This lets users create monotone themes by only specifying `primary` + `surface`.

### 3.4 Shade Scale

Each variant has 11 shades following Tailwind's scale:

```
50  100  200  300  400  500  600  700  800  900  950
```

### 3.5 Zone Scale (z0–z10)

Semantic aliases that auto-invert for dark mode:

| Zone | Light shade | Dark shade | Usage |
|------|-------------|------------|-------|
| z0 | 50 | 950 | Lightest background |
| z1 | 100 | 900 | Subtle background |
| z2 | 200 | 800 | Hover states, cards |
| z3 | 300 | 700 | Borders, dividers |
| z4 | 400 | 600 | Placeholder text |
| z5 | 500 | 500 | Midtone (buttons, icons) |
| z6 | 600 | 400 | Strong text |
| z7 | 700 | 300 | Headings |
| z8 | 800 | 200 | Primary text |
| z9 | 900 | 100 | Heavy emphasis |
| z10 | 950 | 50 | Maximum contrast |

### 3.6 Color Space Support

The system stores **raw component values** and wraps them per color space:

```css
/* RGB (default) */
--color-primary-500: 249, 115, 22;
/* Usage: rgba(var(--color-primary-500), 1) */

/* HSL */
--color-primary-500: 25 95% 53%;
/* Usage: hsl(var(--color-primary-500) / 1) */

/* OKLCH */
--color-primary-500: 0.7 0.18 55;
/* Usage: oklch(var(--color-primary-500) / 1) */
```

The `Theme` class accepts a `colorSpace` parameter and generates the correct wrapper
functions for UnoCSS utilities.

### 3.7 On-color Contrast

For text on colored backgrounds:

```
text-on-{variant}        → High contrast (always light text on z5+ bg)
text-on-{variant}-muted  → Slightly subdued but readable
text-on-surface          → Inverts for dark mode surface backgrounds
```

---

## 4. Density & Layout

### 4.1 Density Axis

Three named densities, set via `data-density` attribute:

| Density | Base | XS | SM | MD | LG | XL | Icon | Line-height |
|---------|------|----|----|----|----|----|------|-------------|
| **compact** | 0.75rem | 0.125rem | 0.25rem | 0.5rem | 0.75rem | 1rem | 1rem | 1.375 |
| **comfortable** | 1rem | 0.25rem | 0.5rem | 0.75rem | 1rem | 1.5rem | 1.25rem | 1.5 |
| **cozy** | 1.25rem | 0.375rem | 0.625rem | 1rem | 1.25rem | 2rem | 1.5rem | 1.75 |

Applied via CSS custom properties that inherit through the DOM.

### 4.2 Layout Tokens

For page-level structure (sidebar width, header height, content area):

```css
:root {
  /* Layout regions */
  --layout-sidebar-width: 260px;
  --layout-sidebar-collapsed: 64px;
  --layout-header-height: 56px;
  --layout-content-max-width: 1280px;

  /* Section spacing */
  --layout-section-gap: 2rem;
  --layout-section-padding: 1.5rem;

  /* Content area */
  --layout-content-padding: 2rem;
  --layout-card-gap: 1rem;
}
```

### 4.3 Grid System

12-column CSS grid with density-aware gutters:

```css
.grid-layout {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--density-spacing-md);
}
```

Sidebar + main layout:
```css
.app-layout {
  display: grid;
  grid-template-columns: var(--layout-sidebar-width) 1fr;
  min-height: 100dvh;
}
```

---

## 5. Typography

### 5.1 Font Roles

| Role | CSS Variable | Default | Usage |
|------|-------------|---------|-------|
| **display** | `--font-display` | System serif | Hero text, large headings |
| **sans** | `--font-sans` | Inter, system-ui | UI text, body, labels |
| **mono** | `--font-mono` | JetBrains Mono | Code, data, paths |

### 5.2 Size Scale

Follows a modular scale. Sizes adapt to density:

```css
--text-xs:   0.75rem;    /* 12px — metadata, labels */
--text-sm:   0.8125rem;  /* 13px — secondary text */
--text-base: 0.875rem;   /* 14px — body text */
--text-md:   1rem;       /* 16px — emphasized body */
--text-lg:   1.125rem;   /* 18px — section headers */
--text-xl:   1.5rem;     /* 24px — page titles */
--text-2xl:  2rem;       /* 32px — hero text */
```

### 5.3 Weight Scale

```
300 — light      (display, large text)
400 — regular    (body text)
500 — medium     (labels, nav items)
600 — semibold   (headings, emphasis)
700 — bold       (strong emphasis, rarely used)
```

---

## 6. Roundedness

### 6.1 Independent Axis

Roundedness is decoupled from density. Set via `data-radius` or CSS custom properties:

| Preset | SM | MD | LG | XL | FULL |
|--------|----|----|----|----|------|
| **sharp** | 0 | 2px | 2px | 4px | 4px |
| **soft** | 2px | 4px | 6px | 8px | 10px |
| **rounded** | 4px | 6px | 8px | 12px | 16px |
| **pill** | 9999px | 9999px | 9999px | 9999px | 9999px |

### 6.2 Component-Aware Radius

Not all components use the same radius level:

```css
:root {
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-full: 9999px;
}

/* Components reference the appropriate level */
[data-button]    { border-radius: var(--radius-md); }
[data-card]      { border-radius: var(--radius-lg); }
[data-input]     { border-radius: var(--radius-md); }
[data-badge]     { border-radius: var(--radius-full); }
[data-dropdown]  { border-radius: var(--radius-lg); }
```

Changing `--radius-md` from `0.375rem` to `0` makes all buttons and inputs sharp
while cards retain their own radius level.

---

## 7. Component Styles

### 7.1 Input Variants

| Variant | Description | Visual |
|---------|-------------|--------|
| **outline** | Border all around, transparent bg | Standard form input |
| **filled** | Tinted background, subtle border | Material-style filled |
| **underline** | Bottom border only, no bg | Minimal style |
| **ghost** | No border, no bg until focus | Ultra-minimal |

### 7.2 Button Variants

| Variant | Description |
|---------|-------------|
| **default** | Filled background (solid or gradient per theme) |
| **outline** | Border + transparent background |
| **ghost** | No border, text only, hover reveals bg |
| **link** | Text only, underline on hover |

### 7.3 Highlight / CTA Styles

These vary **per theme** and represent the primary visual differentiator:

| Theme | CTA Style | Input Focus | Highlight |
|-------|-----------|-------------|-----------|
| **rokkit** | Gradient (primary → secondary) | Gradient border | Gradient bg |
| **minimal** | Flat underline | Underline thickens | Border-left accent |
| **material** | Elevation + shadow | Border + fill | Tonal container |
| **frosted** | Glass + blur + shine | Glass border | Glass overlay |
| **zen-sumi** | Shu (vermillion) accent | Subtle border darken | Ink wash (bg tint) |

### 7.4 Gradient Border Pattern

For themes that use gradient borders (rokkit, zen-sumi on some elements):

```html
<!-- Standardized wrapper pattern -->
<div data-gradient-border>
  <div data-gradient-border-inner>
    <!-- content -->
  </div>
</div>
```

CSS:
```css
[data-gradient-border] {
  padding: 1px;  /* border width */
  border-radius: var(--radius-md);
  background: linear-gradient(to right, var(--from), var(--to));
}
[data-gradient-border-inner] {
  background: var(--surface-bg);
  border-radius: calc(var(--radius-md) - 1px);
}
```

Themes that don't use gradient borders simply set `[data-gradient-border]` to
`background: transparent; border: 1px solid var(--border-color)`.

---

## 8. Theme Factory (Hybrid)

### 8.1 Architecture

```
┌──────────────────────┐     ┌─────────────────────┐
│  Theme Config (JS)   │     │  Visual CSS Files    │
│                      │     │                      │
│  colors, density,    │────▶│  [data-style='x']    │
│  radius, typography  │     │  per-component CSS   │
│                      │     │  with @apply          │
│  Generates:          │     │                      │
│  • CSS variables     │     │  Consumes:           │
│  • UnoCSS shortcuts  │     │  • CSS variables     │
│  • z-scale aliases   │     │  • UnoCSS utilities  │
│  • skin presets      │     │                      │
└──────────────────────┘     └─────────────────────┘
        JS / Build time              CSS / Build time
```

**JS factory** handles: color palette generation, z-scale mapping, density tokens,
radius presets, font declarations, skin presets, nullable inheritance resolution.

**CSS files** handle: per-component visual styling (gradients, shadows, blur, borders),
hover/focus/active states, transitions, animations, theme-specific layout tweaks.

### 8.2 Theme Config Interface

```typescript
interface ThemeConfig {
  // Color palette mapping (semantic → palette name)
  colors: {
    surface?: string;    // e.g., 'slate', 'zinc', 'neutral'
    primary?: string;    // e.g., 'orange', 'indigo', 'blue'
    secondary?: string;  // nullable → inherits from primary
    tertiary?: string;   // nullable → inherits from primary
    accent?: string;     // nullable → inherits from primary
    success?: string;
    warning?: string;
    danger?: string;
    error?: string;      // nullable → inherits from danger
    info?: string;
  };

  // Custom color palettes (name → shade map)
  palettes?: Record<string, Record<number, string>>;

  // Color space for CSS variable values
  colorSpace?: 'rgb' | 'hsl' | 'oklch';

  // Density default
  density?: 'compact' | 'comfortable' | 'cozy';

  // Roundedness preset
  radius?: 'sharp' | 'soft' | 'rounded' | 'pill'
         | Record<string, string>;

  // Typography
  typography?: {
    display?: string;
    sans?: string;
    mono?: string;
  };

  // Named palette presets for runtime switching
  skins?: Record<string, Partial<ThemeConfig['colors']>>;

  // Active themes to include in build
  themes?: string[];
}
```

### 8.3 Nullable Resolution

```typescript
function resolveColors(input: Partial<ColorMapping>): ColorMapping {
  const resolved = { ...STATUS_DEFAULTS, ...input };

  // Inheritance chain
  resolved.secondary ??= resolved.primary;
  resolved.tertiary  ??= resolved.primary;
  resolved.accent    ??= resolved.primary;
  resolved.error     ??= resolved.danger;

  return resolved;
}
```

### 8.4 Build Output

The factory produces:

1. **CSS custom properties** (preflight) — injected into `:root`
2. **UnoCSS shortcuts** — `bg-primary-z5`, `text-on-surface`, `skin-ocean`
3. **z-scale CSS** — `:root` + `[data-mode="dark"]` blocks
4. **Density CSS** — `[data-density]` blocks
5. **Radius CSS** — `--radius-*` variables

---

## 9. Theme Anatomy

### 9.1 File Structure

```
packages/themes/src/
├── base/                   ← Structural layout (no color)
│   ├── index.css
│   ├── density.css
│   ├── button.css
│   ├── input.css
│   └── ...
├── palette.css             ← Default color variables
├── {theme-name}/           ← Visual treatment
│   ├── index.css
│   ├── button.css
│   ├── input.css
│   ├── list.css
│   └── ...
└── index.css               ← Bundle entry
```

### 9.2 Theme CSS Pattern

Each theme's component file follows this pattern:

```css
/* src/{theme}/button.css */

/* Default (filled) button */
[data-style='{theme}'] [data-button][data-variant='primary'] {
  /* Theme-specific visual treatment using semantic tokens */
}

/* Outline variant */
[data-style='{theme}'] [data-button][data-style='outline'][data-variant='primary'] {
  /* ... */
}

/* Hover, focus, active states */
[data-style='{theme}'] [data-button][data-variant='primary']:hover {
  /* ... */
}
```

### 9.3 Adding a New Theme — Checklist

1. Create `src/{name}/` directory
2. Create `index.css` importing all component files
3. Write component CSS files with `[data-style='{name}']` selectors
4. Add build entry in `build.mjs`
5. Add export in `package.json`
6. Add to `src/index.css` bundle
7. Run `bun run build` and verify

---

## 10. Data Attribute Contract

Components emit data attributes that themes target:

### Global Axes
| Attribute | Values | Set on |
|-----------|--------|--------|
| `data-style` | Theme name: `rokkit`, `minimal`, `zen-sumi` | Container/root |
| `data-mode` | `light`, `dark` | `<html>` |
| `data-density` | `compact`, `comfortable`, `cozy` | Container/root |
| `data-radius` | `sharp`, `soft`, `rounded`, `pill` | Container/root |

### Component Attributes
| Attribute | Values | Component |
|-----------|--------|-----------|
| `data-button` | (present) | Button |
| `data-variant` | `primary`, `secondary`, `accent`, `danger`, etc. | Any colored component |
| `data-size` | `sm`, `md`, `lg` | Button, Input |
| `data-icon-only` | (present) | Button |
| `data-disabled` | (present) | Any interactive |
| `data-input-root` | (present) | Input wrapper |
| `data-field-root` | (present) | Field wrapper |
| `data-list` | (present) | List |
| `data-list-item` | (present) | List item |
| `data-gradient-border` | (present) | Gradient border wrapper |
| `data-item-icon` | (present) | Item icon (CSS class-based) |
| `data-item-icon-literal` | (present) | Item icon (text/kanji literal) |

### Icon Rendering: CSS Class vs Literal

Components support two icon modes:

- **CSS class icons** (default): `icon: 'i-lucide:home'` → `<span class="i-lucide:home">`
- **Literal icons** (new): `icon: '聴'` → `<span data-item-icon-literal>聴</span>`

Detection: values starting with `i-` or containing `:` are CSS class icons.
Everything else (single characters, kanji, emoji) is rendered as text content.

The `data-item-icon-literal` attribute lets themes apply different styling
(serif font for kanji, larger size, different alignment) to literal icons.

---

## 11. Configuration Surface

### 11.1 rokkit.config.js (App-level)

```javascript
export default {
  // Color mapping
  colors: {
    surface: 'zinc',
    primary: 'indigo',
    secondary: 'violet',
    // tertiary, accent, error: null → inherited
  },

  // Custom palettes
  palettes: {
    sumi: { 50: '#f7f5f0', 500: '#3a3a38', 950: '#1a1917' }
  },

  // Color space
  colorSpace: 'oklch',

  // Skins for runtime switching
  skins: {
    default: { surface: 'zinc', primary: 'indigo' },
    warm:    { surface: 'stone', primary: 'amber' },
    cool:    { surface: 'slate', primary: 'sky' },
  },

  // Active themes
  themes: ['rokkit', 'zen-sumi'],

  // Typography
  typography: {
    display: "'Fraunces', serif",
    sans: "'Inter', system-ui, sans-serif",
    mono: "'JetBrains Mono', monospace",
  },

  // Roundedness
  radius: 'soft',

  // Default density
  density: 'comfortable',

  // Icons
  icons: {
    app: '@rokkit/icons/app.json',
    glyph: '@rokkit/icons/glyph.json',
  },

  // Theme switcher UI
  switcher: 'full',
  storageKey: 'app-theme',
}
```

### 11.2 Runtime API

```javascript
import { vibeStore } from '@rokkit/ui';

// Switch theme
vibeStore.style = 'zen-sumi';

// Switch mode
vibeStore.mode = 'dark';

// Switch density
vibeStore.density = 'compact';

// Switch skin (color palette)
vibeStore.skin = 'warm';

// Switch radius
vibeStore.radius = 'pill';
```

All changes are live — the store updates `data-*` attributes on the root element,
and CSS selectors react immediately.
