# Zen-Sumi Theme — Design Spec

**Goal:** Create a zen-sumi theme for @rokkit/ui components that matches the demo app's calligraphic, paper-and-ink visual language. Build in `packages/themes/src/zen-sumi/`, promote to the themes package build.

## Identity

Minimal, calligraphic, paper-and-ink. No gradients, no shadows, no glow. Hairline borders, paper surfaces, shu (vermillion) accents. Typography-forward with kanji literal icon support.

## Color Strategy (Standard Pipeline + OKLCH)

Zen-sumi uses the **same semantic token pipeline** as every other rokkit theme — no special-case tokens. The `Theme` class in `@rokkit/core` already supports `colorSpace: 'oklch'`.

1. Define zen-sumi OKLCH palettes as shade scales (50-950) — `kami` (paper tones), `shu` (vermillion), `jade` (green), `kohaku` (amber)
2. Register as custom `palettes` in the rokkit config
3. Map to semantics: `surface → kami`, `primary → shu`, `secondary → jade`, `accent → kohaku`
4. Set `colorSpace: 'oklch'` in config
5. Theme CSS uses standard `@apply` with `primary-z5`, `surface-z2`, etc.

This means zen-sumi is recolorable via skins, uses the same shortcuts as other themes, and gets full OKLCH precision.

### Dark mode
The z-scale automatically flips for dark mode (`z0=light→dark, z10=dark→light`). The OKLCH palettes are designed so the shade scale works in both directions.

## OKLCH Palettes

Each palette defines shades 50-950 in OKLCH. These values are the zen-sumi aesthetic translated to a standard shade scale.

### Kami (paper/surface) — warm neutral
| Shade | OKLCH | Role |
|-------|-------|------|
| 50 | `0.985 0.005 85` | Lightest paper |
| 100 | `0.975 0.008 85` | Primary paper (was `--paper`) |
| 200 | `0.955 0.010 85` | Elevated surface (was `--paper-2`) |
| 300 | `0.920 0.012 85` | Active/hover (was `--paper-3`) |
| 400 | `0.850 0.010 70` | Muted border |
| 500 | `0.750 0.008 50` | Disabled text (was `--sumi-4`) |
| 600 | `0.580 0.010 50` | Muted text (was `--sumi-3`) |
| 700 | `0.380 0.012 50` | Secondary text (was `--sumi-2`) |
| 800 | `0.280 0.012 50` | Strong text |
| 900 | `0.220 0.012 50` | Primary text (was `--sumi`) |
| 950 | `0.170 0.010 50` | Dark paper bg |

### Shu (vermillion/primary)
| Shade | OKLCH | Role |
|-------|-------|------|
| 50 | `0.970 0.020 35` | Lightest tint |
| 100 | `0.940 0.040 35` | Soft background |
| 200 | `0.880 0.070 35` | Light accent |
| 300 | `0.800 0.100 35` | Medium accent |
| 400 | `0.700 0.130 35` | Strong accent |
| 500 | `0.580 0.150 35` | Primary shu (was `--shu`) |
| 600 | `0.500 0.140 35` | Darker accent |
| 700 | `0.420 0.120 35` | Deep accent |
| 800 | `0.350 0.100 35` | Very dark |
| 900 | `0.280 0.080 35` | Near-black accent |
| 950 | `0.220 0.060 35` | Darkest |

### Jade (green/secondary)
| Shade | OKLCH | Role |
|-------|-------|------|
| 50 | `0.970 0.015 160` | Lightest tint |
| 100 | `0.940 0.030 160` | Soft background |
| 200 | `0.880 0.050 160` | Light |
| 300 | `0.800 0.065 160` | Medium |
| 400 | `0.720 0.075 160` | Strong |
| 500 | `0.620 0.080 160` | Primary jade (was `--jade`) |
| 600 | `0.540 0.075 160` | Darker |
| 700 | `0.460 0.065 160` | Deep |
| 800 | `0.380 0.055 160` | Very dark |
| 900 | `0.300 0.045 160` | Near-black |
| 950 | `0.240 0.035 160` | Darkest |

### Kohaku (amber/accent)
| Shade | OKLCH | Role |
|-------|-------|------|
| 50 | `0.980 0.020 75` | Lightest tint |
| 100 | `0.950 0.040 75` | Soft background |
| 200 | `0.900 0.070 75` | Light |
| 300 | `0.850 0.095 75` | Medium |
| 400 | `0.790 0.110 75` | Strong |
| 500 | `0.720 0.120 75` | Primary kohaku (was `--amber`) |
| 600 | `0.640 0.110 75` | Darker |
| 700 | `0.560 0.095 75` | Deep |
| 800 | `0.470 0.080 75` | Very dark |
| 900 | `0.380 0.065 75` | Near-black |
| 950 | `0.300 0.050 75` | Darkest |

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

All treatments use semantic z-scale tokens (`surface-z2`, `primary-z5`, etc.) via `@apply`. These auto-flip for dark mode.

### Button (`button.css`)
- **Default**: `@apply bg-surface-z9 text-surface-z0`. Ink-dark fill, paper text
- **Outline**: `@apply border-surface-z4 text-surface-z9`. Transparent bg, hairline border
- **Ghost**: `@apply text-surface-z9`. Hover: `@apply bg-surface-z2`
- **Primary variant**: `@apply bg-primary-z5 text-on-primary`. Shu fill
- Hover on filled: `opacity: 0.85`. Hover on ghost/outline: `@apply bg-surface-z2`
- Border-radius: `var(--density-radius-base)`

### Input (`input.css`)
- `@apply bg-surface-z1 border-surface-z4`. Subtle paper bg, hairline border
- Focus: `@apply border-surface-z6`. Stronger border, no gradient
- Error: `@apply border-danger-z5`
- Disabled: `opacity: 0.5`

### List (`list.css`)
- Items: transparent bg, `@apply text-surface-z7`
- Hover: `@apply bg-surface-z2`
- Active: `@apply bg-surface-z1 text-surface-z9`
- Selected icon: `@apply text-primary-z5`
- Group labels: `font-size: 0.6875rem; text-transform: uppercase; @apply text-surface-z5`
- Literal icons: `font-family: var(--font-kanji)` on `[data-item-icon-literal]`

### Card (`card.css`)
- `@apply bg-surface-z1 border-surface-z3`. No shadow, flat
- Header: `@apply border-b-surface-z2`

### Tabs (`tabs.css`)
- Active: `@apply bg-surface-z9 text-surface-z0`. Pill-style
- Inactive: `@apply text-surface-z6`

### Table (`table.css`)
- Header: `@apply text-surface-z6`. Uppercase, small, semibold
- Rows: `@apply border-b-surface-z2`
- Data: mono font

### Badge (`badge.css`)
- Primary: `@apply bg-primary-z5 text-on-primary`
- Success: `@apply bg-success-z5 text-on-success`
- Warning: `@apply bg-accent-z5 text-on-accent`
- Default: `@apply bg-surface-z2 text-surface-z7`

### Stepper (`stepper.css`)
- Completed: `@apply bg-primary-z5 border-primary-z5 text-on-primary`
- Active: `@apply border-primary-z5 text-primary-z5`
- Pending: `@apply border-surface-z5 text-surface-z5`
- Connector completed: `@apply bg-primary-z5`
- Connector pending: `@apply bg-surface-z2`

### Dropdown (`dropdown.css`)
- Container: `@apply bg-surface-z0 border-surface-z3`
- Options: `@apply text-surface-z7`
- Hover: `@apply bg-surface-z1`
- Selected: `@apply text-primary-z5`

### Toolbar (`toolbar.css`)
- `@apply bg-surface-z1 border-b-surface-z3`

### Menu (`menu.css`)
- Container: `@apply bg-surface-z0 border-surface-z3`
- Hover: `@apply bg-surface-z1`
- Active: `@apply text-primary-z5`

## Build Integration

- Add `zen-sumi` to `packages/themes/build.mjs` theme list
- Add `dist/zen-sumi.css` export to `packages/themes/package.json`
- Add `@import './zen-sumi/index.css'` to `packages/themes/src/index.css`
- Demo imports via `@import '@rokkit/themes/zen-sumi.css'` in `demo/src/app.css`

## Config Integration

The zen-sumi palettes are registered in `demo/rokkit.config.js`:

```javascript
export default {
  palettes: {
    kami: { 50: '...', 100: '...', /* shade scale */ },
    shu:  { 50: '...', 100: '...', /* shade scale */ },
    jade: { 50: '...', 100: '...', /* shade scale */ },
    kohaku: { 50: '...', 100: '...', /* shade scale */ },
  },
  colors: {
    surface: 'kami',
    primary: 'shu',
    secondary: 'jade',
    accent: 'kohaku',
    // tertiary, success, warning, danger, error, info from defaults or overrides
  },
  colorSpace: 'oklch',
  // ...rest of config
}
```

This replaces the hardcoded OKLCH tokens in `demo/src/app.css`. The existing `--paper`, `--sumi`, `--shu` custom properties in app.css can be gradually removed as the demo migrates to rokkit components in Phase 6.

## Verification

- Apply `data-style="zen-sumi"` to demo app root
- Visual comparison against current demo screenshots
- All rokkit components should match the demo's zen-sumi aesthetic
- Dark mode toggle should work correctly
- No regressions in other themes
