# Zen-Sumi Theme — Design Spec

**Goal:** Create a zen-sumi theme for @rokkit/ui components that matches the demo app's calligraphic, paper-and-ink visual language. Build in `packages/themes/src/zen-sumi/`, promote to the themes package build.

## Identity

Minimal, calligraphic, paper-and-ink. No gradients, no shadows, no glow. Hairline borders, paper surfaces, shu (vermillion) accents. Typography-forward with kanji literal icon support.

## Color Strategy (Hybrid)

- **Structural properties** (spacing, borders, radius): Generic design tokens (`--density-*`, `--radius-*`, `--layout-*`)
- **Color properties**: Direct OKLCH zen-sumi tokens (`--paper`, `--sumi`, `--shu`, `--jade`, `--amber`)
- **Dark mode**: Token values swap via `[data-mode='dark']` (already defined in demo's app.css)
- **Future**: Color standardization into the semantic pipeline deferred to Phase 7

## Token Palette

### Light Mode
| Token | Value | Role |
|-------|-------|------|
| `--paper` | `oklch(0.975 0.008 85)` | Primary surface |
| `--paper-2` | `oklch(0.955 0.010 85)` | Elevated surface |
| `--paper-3` | `oklch(0.920 0.012 85)` | Active/hover surface |
| `--sumi` | `oklch(0.220 0.012 50)` | Primary text |
| `--sumi-2` | `oklch(0.380 0.012 50)` | Secondary text |
| `--sumi-3` | `oklch(0.580 0.010 50)` | Muted text |
| `--sumi-4` | `oklch(0.750 0.008 50)` | Disabled text |
| `--shu` | `oklch(0.580 0.150 35)` | Primary accent (vermillion) |
| `--jade` | `oklch(0.620 0.080 160)` | Success/positive accent |
| `--amber` | `oklch(0.720 0.120 75)` | Warning accent |
| `--paper-edge` | `oklch(0.22 0.012 50 / 0.08)` | Border color |

### Borders
| Token | Value | Usage |
|-------|-------|-------|
| `--hairline` | `1px solid var(--paper-edge)` | Subtle separators |
| `--border-card` | `1px solid var(--paper-edge)` | Card/panel edges |
| `--border-input` | `1px solid oklch(0.22 0.012 50 / 0.12)` | Form inputs |
| `--border-focus` | `1px solid var(--sumi-3)` | Focused inputs |
| `--ink-line` | `1px solid oklch(0.22 0.012 50 / 0.06)` | Faint dividers |

## File Structure

```
packages/themes/src/zen-sumi/
├── index.css         (imports tokens + all component files)
├── tokens.css        (zen-sumi OKLCH palette, light + dark)
├── button.css
├── input.css
├── list.css
├── card.css
├── tabs.css
├── table.css
├── badge.css
├── stepper.css
├── dropdown.css
├── toolbar.css
└── menu.css
```

Selector format: `[data-style='zen-sumi'] [data-component] { ... }`

## Component Treatments

### Button (`button.css`)
- **Default**: `background: var(--sumi); color: var(--paper); border: none`
- **Outline**: `background: transparent; border: var(--border-card); color: var(--sumi)`
- **Ghost**: `background: transparent; border: none; color: var(--sumi)`. Hover: `background: var(--paper-2)`
- **CTA/Primary variant**: `background: var(--shu); color: var(--paper)`
- Hover: `opacity: 0.85` on filled buttons, `background: var(--paper-2)` on ghost/outline
- Border-radius: `var(--density-radius-base)`

### Input (`input.css`)
- `background: var(--paper-2); border: var(--border-input)`
- Focus: `border: var(--border-focus)`. No gradient border — plain hairline
- Error state: `border-color: var(--shu)`
- Disabled: `opacity: 0.5; background: var(--paper-3)`

### List (`list.css`)
- Items: transparent background, `color: var(--sumi-2)`
- Hover: `background: var(--paper-3)`
- Active: `background: var(--paper-2); color: var(--sumi)`
- Selected: `color: var(--shu)` on icon
- Group labels: `font-size: 0.6875rem; text-transform: uppercase; color: var(--sumi-4)`
- Literal icons: `font-family: var(--font-kanji)` on `[data-item-icon-literal]`

### Card (`card.css`)
- `background: var(--paper-2); border: var(--border-card)`
- No shadow. Flat panels
- Header: slightly bolder text, `border-bottom: var(--ink-line)`

### Tabs (`tabs.css`)
- Active tab: `background: var(--sumi); color: var(--paper); border-radius: var(--density-radius-base)`
- Inactive: `color: var(--sumi-3); background: transparent`
- Pill-style appearance

### Table (`table.css`)
- Header: `color: var(--sumi-3); font-weight: 600; text-transform: uppercase; font-size: 0.6875rem`
- Rows: `border-bottom: var(--ink-line)`
- Data cells: mono font for numeric columns

### Badge (`badge.css`)
- Shu variant: `background: var(--shu); color: var(--paper)`
- Jade variant: `background: var(--jade); color: var(--paper)`
- Amber variant: `background: var(--amber); color: var(--paper)`
- Default: `background: var(--paper-3); color: var(--sumi-2)`

### Stepper (`stepper.css`)
- Completed: `background: var(--shu); border-color: var(--shu); color: var(--paper)`
- Active: `border-color: var(--shu); color: var(--shu)`
- Pending: `border-color: var(--sumi-4); color: var(--sumi-4)`
- Connector completed: `background: var(--shu)`
- Connector pending: `background: var(--paper-3)`

### Dropdown (`dropdown.css`)
- Container: `background: var(--paper); border: var(--border-card)`
- Options: transparent bg, `color: var(--sumi-2)`
- Hover: `background: var(--paper-2)`
- Selected: `color: var(--shu)` accent indicator

### Toolbar (`toolbar.css`)
- `background: var(--paper-2); border-bottom: var(--hairline)`
- Buttons inherit ghost styling

### Menu (`menu.css`)
- Same pattern as dropdown: `--paper` bg, `--border-card` border
- Item hover: `--paper-2`
- Active: `--shu` text accent

## Build Integration

- Add `zen-sumi` to `packages/themes/build.mjs` theme list
- Add `dist/zen-sumi.css` export to `packages/themes/package.json`
- Add `@import './zen-sumi/index.css'` to `packages/themes/src/index.css`
- Demo imports via `@import '@rokkit/themes/zen-sumi.css'` in `demo/src/app.css`

## Token Migration

When promoted, move zen-sumi tokens from `demo/src/app.css` into `packages/themes/src/zen-sumi/tokens.css`. The demo's `app.css` then imports from the package instead of defining tokens inline.

## Verification

- Apply `data-style="zen-sumi"` to demo app root
- Visual comparison against current demo screenshots
- All rokkit components should match the demo's zen-sumi aesthetic
- Dark mode toggle should work correctly
- No regressions in other themes
