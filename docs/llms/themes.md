# @rokkit/themes

> CSS theme system with 4 design variants for @rokkit/ui components.

## Position in Dependency Hierarchy
**Depends on**: (CSS only, no JS dependencies)
**Depended on by**: all @rokkit/ui consumers

## Exports (CSS)

| Export Path | Description |
|-------------|-------------|
| `.` (default) | Complete bundle: base + all 4 themes |
| `./base` | Structural styles only (no visual theme) |
| `./base/*` | Per-component base styles |
| `./rokkit` | Default theme — gradients and borders |
| `./rokkit/*` | Per-component rokkit styles |
| `./minimal` | Clean, subtle theme |
| `./minimal/*` | Per-component minimal styles |
| `./material` | Material Design — elevation and shadows |
| `./material/*` | Per-component material styles |
| `./glass` | Glassmorphism — blur and transparency |
| `./glass/*` | Per-component glass styles |

## Theme Variants

| Theme | Attribute | Character |
|-------|-----------|-----------|
| Rokkit | (default, no attribute) | Gradients, solid borders, custom colors |
| Minimal | `data-style="minimal"` | Subtle borders, minimal weight, monochromatic |
| Material | `data-style="material"` | Elevation shadows, responsive ripples, angular |
| Glass | `data-style="glass"` | Backdrop blur, semi-transparent, frosted |

## Base Components (~21 files)

button, input, select, toggle, list, menu, toolbar, tabs, floating-action, tree, item, connector, tilt, shine, breadcrumbs, card, progress, carousel, pill, rating, index (aggregator)

## Usage

```html
<!-- Theme via data-style attribute -->
<div data-style="minimal">
  <!-- All @rokkit/ui components inherit this theme -->
</div>
```

```css
/* Selective import */
@import '@rokkit/themes/base/button.css';
@import '@rokkit/themes/minimal/button.css';
```

## Design Tokens

Each theme provides CSS custom properties for: primary/secondary/success/warning/danger colors, text colors, border styles, shadow definitions, spacing scale.
