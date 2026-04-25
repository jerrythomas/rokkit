# Zen-Sumi Theme Specification

> 禅墨 — The aesthetic of ink on paper. Restraint as luxury.

---

## Design Philosophy

Zen-sumi draws from Japanese ink painting (sumi-e) and wabi-sabi aesthetics.
The design language values:

- **Restraint** — Hierarchy through typography and spacing, not color. The default palette uses a single accent (shu/vermillion), but any color palette can be applied via skins — the *treatment* (ink wash, no shadows, hairline borders) is what makes zen-sumi, not the specific colors.
- **Ma (間)** — Generous negative space. Content breathes.
- **Notan (濃淡)** — Light-dark harmony. Four grays from paper to ink.
- **Mono no aware** — Subtle, contemplative interactions. No flashy animations.

---

## Color Palette

> **Palette ≠ Theme.** Zen-sumi is defined by its *treatment* — the way it renders
> components (ink wash backgrounds, no shadows, hairline borders, generous Ma spacing).
> The colors below are the **default palette** (kami/shu/hisui/kohaku). Users can swap
> the entire palette via skins while retaining the zen-sumi aesthetic. A zen-sumi app
> with indigo accent and cool gray surface is still zen-sumi.

### Default Light Mode

| Token | Name | OKLCH | Hex (approx) | Usage |
|-------|------|-------|--------------|-------|
| surface-z0 | Kami (paper) | `oklch(0.975 0.008 85)` | #f5f3ee | Main background |
| surface-z1 | | `oklch(0.955 0.010 85)` | #ece9e2 | Cards, sidebar bg |
| surface-z2 | | `oklch(0.920 0.012 85)` | #ddd9d0 | Inset areas, inputs |
| surface-z3 | Paper edge | `oklch(0.880 0.015 85)` | #cec9be | Borders, dividers |
| text-z10 | Sumi (ink) | `oklch(0.220 0.012 50)` | #2c2926 | Primary text |
| text-z8 | | `oklch(0.380 0.012 50)` | #524e49 | Secondary text |
| text-z6 | | `oklch(0.580 0.010 50)` | #8a867f | Tertiary/labels |
| text-z4 | | `oklch(0.750 0.008 50)` | #b8b4ad | Disabled/faint |
| primary | Shu (朱) | `oklch(0.580 0.150 35)` | #c44d2a | Primary accent |
| success | Hisui (翡翠) | `oklch(0.620 0.080 160)` | #3d8c6e | Positive states |
| warning | Kohaku (琥珀) | `oklch(0.720 0.120 75)` | #c09030 | Warning/caution |

### Dark Mode

Invert the surface scale (dark paper, light ink) while keeping accent colors
at similar perceived lightness:

| Token | OKLCH |
|-------|-------|
| surface-z0 | `oklch(0.170 0.010 85)` |
| surface-z1 | `oklch(0.210 0.012 85)` |
| surface-z2 | `oklch(0.250 0.014 85)` |
| surface-z3 | `oklch(0.300 0.015 85)` |
| text-z10 | `oklch(0.950 0.008 85)` |
| primary (shu) | `oklch(0.650 0.140 35)` |
| success (hisui) | `oklch(0.680 0.075 160)` |
| warning (kohaku) | `oklch(0.760 0.110 75)` |

### Mapping to Rokkit Semantic Colors

```javascript
// zen-sumi color configuration
{
  colorSpace: 'oklch',
  colors: {
    surface: 'kami',     // Custom warm-neutral palette
    primary: 'shu',      // Vermillion
    // secondary: null   → inherits shu (monotone)
    // tertiary: null    → inherits shu
    // accent: null      → inherits shu
    success: 'hisui',    // Jade green
    warning: 'kohaku',   // Amber
    danger: 'shu',       // Same vermillion for danger
    // error: null       → inherits danger
    info: 'kami',        // Neutral — info isn't flashy in zen
  },
  palettes: {
    kami: {
      50:  'oklch(0.975 0.008 85)',
      100: 'oklch(0.955 0.010 85)',
      200: 'oklch(0.920 0.012 85)',
      300: 'oklch(0.880 0.015 85)',
      400: 'oklch(0.750 0.008 50)',
      500: 'oklch(0.580 0.010 50)',
      600: 'oklch(0.450 0.012 50)',
      700: 'oklch(0.380 0.012 50)',
      800: 'oklch(0.300 0.012 50)',
      900: 'oklch(0.220 0.012 50)',
      950: 'oklch(0.170 0.010 85)',
    },
    shu: {
      50:  'oklch(0.960 0.020 35)',
      100: 'oklch(0.920 0.040 35)',
      200: 'oklch(0.860 0.070 35)',
      300: 'oklch(0.780 0.100 35)',
      400: 'oklch(0.680 0.130 35)',
      500: 'oklch(0.580 0.150 35)',
      600: 'oklch(0.500 0.140 35)',
      700: 'oklch(0.420 0.120 35)',
      800: 'oklch(0.350 0.100 35)',
      900: 'oklch(0.280 0.080 35)',
      950: 'oklch(0.220 0.060 35)',
    },
    hisui: {
      50:  'oklch(0.960 0.015 160)',
      100: 'oklch(0.920 0.030 160)',
      200: 'oklch(0.860 0.050 160)',
      300: 'oklch(0.780 0.065 160)',
      400: 'oklch(0.700 0.075 160)',
      500: 'oklch(0.620 0.080 160)',
      600: 'oklch(0.540 0.075 160)',
      700: 'oklch(0.460 0.065 160)',
      800: 'oklch(0.380 0.055 160)',
      900: 'oklch(0.300 0.045 160)',
      950: 'oklch(0.240 0.035 160)',
    },
    kohaku: {
      50:  'oklch(0.970 0.020 75)',
      100: 'oklch(0.940 0.040 75)',
      200: 'oklch(0.890 0.070 75)',
      300: 'oklch(0.830 0.095 75)',
      400: 'oklch(0.780 0.110 75)',
      500: 'oklch(0.720 0.120 75)',
      600: 'oklch(0.640 0.110 75)',
      700: 'oklch(0.560 0.095 75)',
      800: 'oklch(0.480 0.080 75)',
      900: 'oklch(0.400 0.065 75)',
      950: 'oklch(0.320 0.050 75)',
    },
  }
}
```

---

## Typography

| Role | Font | Fallback | Usage |
|------|------|----------|-------|
| Display | Fraunces | Georgia, serif | Hero text, large headings |
| UI | Inter | system-ui, sans-serif | Body, labels, buttons |
| Mono | JetBrains Mono | monospace | Code, data, paths |
| Kanji | Yu Mincho | Hiragino Mincho ProN, serif | Decorative characters |

### Text Sizing (zen-sumi specific)

Slightly smaller than default — the aesthetic is compact and considered:

| Role | Size | Weight |
|------|------|--------|
| Hero | 36px | 300 (Fraunces) |
| Page title | 24px | 500 (Inter) |
| Section header | 15px | 600 (Inter) |
| Body | 13px | 400 (Inter) |
| Secondary | 11.5px | 400 (Inter) |
| Metadata | 10px | 500 (Inter) |
| Tiny label | 9px | 500 (Inter, uppercase) |

---

## Spacing (Ma 間)

Zen-sumi uses the **comfortable** density by default but with generous section spacing:

```css
[data-style='zen-sumi'] {
  --layout-section-gap: 2.5rem;       /* 40px between sections */
  --layout-section-padding: 1.75rem;  /* 28px inside sections */
  --layout-content-padding: 2rem;     /* 32px main content */
  --layout-card-gap: 0.75rem;         /* 12px between cards */
}
```

---

## Roundedness

Zen-sumi uses the **soft** radius preset:

```css
[data-style='zen-sumi'] {
  --radius-sm: 0.125rem;  /* 2px */
  --radius-md: 0.375rem;  /* 6px */
  --radius-lg: 0.625rem;  /* 10px */
  --radius-xl: 0.75rem;   /* 12px */
}
```

---

## Component Treatments

### Buttons

| Variant | Treatment |
|---------|-----------|
| Default (filled) | Sumi (ink) background, kami (paper) text. No gradient. |
| Outline | Ink-line border (sumi with transparency), transparent bg |
| Ghost | No border, sumi-2 text, hover: paper-3 bg |
| CTA | Shu (vermillion) background, paper text |

```css
/* Primary filled */
[data-style='zen-sumi'] [data-button][data-variant='primary'] {
  background: var(--color-surface-z9);
  color: var(--color-surface-z0);
  border: none;
}

/* CTA / accent */
[data-style='zen-sumi'] [data-button][data-variant='accent'] {
  background: var(--color-primary-z5);
  color: var(--color-surface-z0);
}
```

### Inputs

| Variant | Treatment |
|---------|-----------|
| Outline | Hairline border (paper-edge), paper-2 bg |
| Focus | Border darkens to sumi-3, no glow/shadow |
| Error | Border becomes shu |

Zen-sumi inputs are calm — no gradient borders, no glowing focus rings.
Just subtle border darkening on focus.

### Lists / Sidebar Navigation

| State | Treatment |
|-------|-----------|
| Default | Transparent bg, sumi-2 text |
| Hover | Paper-3 bg |
| Selected/Active | Paper bg (lighter), sumi text, shu kanji icon |
| Group header | Sumi-3 text, uppercase, smaller font |

Grid layout per item: `auto 1fr auto` (icon + label + badge)

### Cards

| State | Treatment |
|-------|-----------|
| Default | Paper-2 bg, hairline border |
| Hover | Paper-3 bg |
| Active | Paper bg, border darkens |

No shadows. Depth conveyed through background tone variation only.

### Tabs

| State | Treatment |
|-------|-----------|
| Inactive | Transparent, sumi-3 text |
| Active | Sumi bg, paper text |
| Hover | Paper-3 bg |

Pill-style tabs (small radius) with clear active/inactive contrast.

### Tables

| Element | Treatment |
|---------|-----------|
| Header | Sumi-4 text, uppercase, smaller font, no bg |
| Row | Transparent bg, hairline bottom border |
| Row hover | Paper-2 bg |
| Mono data | JetBrains Mono, sumi-3 color |

---

## Special Elements

### Kanji / Literal Icons

The mockup uses kanji characters (観, 聴, 具, etc.) as icons throughout — sidebar nav,
cards, hero sections. These are **text glyphs**, not SVG/CSS icons.

**Problem**: Rokkit components render icons as `<span class={iconName}>` where UnoCSS
generates the glyph via CSS `mask-image`. Kanji characters need to render as actual
text content inside the span: `<span>聴</span>`.

**Required change to @rokkit/ui**: Icon rendering in `ItemContent.svelte` (and all
components that render icons) needs to detect whether the icon value is:
- A **CSS class** (starts with `i-` or matches UnoCSS icon pattern) → render as class
- A **literal character/string** (1–2 chars, no `i-` prefix) → render as text content

Proposed implementation:

```svelte
<!-- ItemContent.svelte icon rendering -->
{#if isIconClass(proxy.get('icon'))}
  <span data-item-icon class={proxy.get('icon')} aria-hidden="true"></span>
{:else}
  <span data-item-icon data-item-icon-literal aria-hidden="true">{proxy.get('icon')}</span>
{/if}
```

```typescript
// Utility — shared across all components
export function isIconClass(value: string): boolean {
  return value.startsWith('i-') || value.includes(':')
}
```

The `data-item-icon-literal` attribute lets themes style literal icons differently
(font family, size, color) from CSS class icons:

```css
[data-item-icon-literal] {
  font-family: "Yu Mincho", "Hiragino Mincho ProN", serif;
  font-size: 1.25em;
  text-align: center;
  width: var(--density-icon-size);
}
```

This change applies globally to all components: List, Tree, Menu, Select, Tabs, etc.
Sized 18–20px for nav icons, up to 96px for hero sections.
Color: primary-z5 for active, surface-z6 for inactive.

### Sparklines

Thin line charts with shu stroke:
```css
stroke-width: 1.25px;
stroke-linecap: round;
stroke: var(--color-primary-z5);
```

### Enso Ring (arc gauge)

SVG circular progress with sumi brush texture:
- Stroke-width: 8px
- SVG filter: feTurbulence + feDisplacementMap for ink-brush effect
- Size: 80–120px

### Status Indicators

| Status | Color | Icon style |
|--------|-------|------------|
| Positive | Hisui (jade) | Filled dot |
| Warning | Kohaku (amber) | Filled dot |
| Negative | Shu (vermillion) | Filled dot |
| Neutral | Sumi-3 (gray) | Empty circle |

---

## Dark Mode

Dark mode inverts surface (dark paper) while keeping accent colors perceptually
similar. The zen aesthetic works particularly well in dark mode — dark paper
with light ink and vermillion accents evokes traditional Japanese calligraphy.

Key adjustments:
- Shu accent becomes slightly lighter for readability
- Borders become more subtle (lower opacity)
- Card backgrounds use surface-z1 (slightly lighter than bg)
- Shadows are eliminated entirely (zen-sumi never uses shadows)

---

## Skins (Palette Variants)

Zen-sumi supports palette switching while maintaining the aesthetic:

```javascript
skins: {
  // Default: warm neutral + vermillion
  default: { surface: 'kami', primary: 'shu' },

  // Indigo ink: cool neutral + indigo accent
  indigo: { surface: 'slate', primary: 'indigo' },

  // Forest: warm neutral + jade accent
  forest: { surface: 'kami', primary: 'hisui' },

  // Night: dark surface + amber accent
  night: { surface: 'zinc', primary: 'kohaku' },
}
```

The CSS treatment remains identical — only the color values change through
CSS custom property updates.
