# @rokkit/themes

Theme styles for `@rokkit/ui` headless components.

## Architecture

This package follows a **headless component + themed styles** pattern:

- **Components** (`@rokkit/ui`) - Provide structure, behavior, and accessibility via data attributes
- **Themes** (`@rokkit/themes`) - Provide visual styling that targets those data attributes

### Directory Structure

```
src/
├── base/           # Structural styles (layout, positioning)
│   ├── index.css   # All base styles
│   └── menu.css    # Menu structural styles
├── rokkit/         # Default theme (gradients + borders)
│   ├── index.css   # All rokkit theme styles
│   └── menu.css    # Menu themed styles
├── minimal/        # Clean + subtle theme
├── material/       # Elevation + shadows theme
├── glass/          # Blur + transparency theme
└── index.css       # Main entry (imports base + all themes)
```

## Usage

### Full Theme (base + all themes)

```ts
import '@rokkit/themes'
```

### Base Only (for custom theming)

```ts
import '@rokkit/themes/base'
```

### Rokkit Theme Only

```ts
import '@rokkit/themes/rokkit'
```

### Individual Component Styles

```ts
import '@rokkit/themes/base/menu.css'
import '@rokkit/themes/rokkit/menu.css'
```

## Data Attributes

Components use semantic data attributes for styling hooks:

### Common Attributes

| Attribute       | Values           | Description    |
| --------------- | ---------------- | -------------- |
| `data-size`     | `sm`, `md`, `lg` | Size variant   |
| `data-disabled` | `true`           | Disabled state |
| `data-align`    | `left`, `right`  | Alignment      |

### Menu-Specific Attributes

| Attribute               | Description             |
| ----------------------- | ----------------------- |
| `data-menu`             | Menu container          |
| `data-menu-trigger`     | Trigger button          |
| `data-menu-dropdown`    | Dropdown panel          |
| `data-menu-item`        | Menu item               |
| `data-menu-item-custom` | Custom snippet wrapper  |
| `data-menu-group`       | Group container         |
| `data-menu-group-label` | Group header            |
| `data-menu-divider`     | Divider line            |
| `data-menu-open`        | Open state on container |

## Theme Scoping

Rokkit is the default theme — its styles apply without any wrapper.

Other themes are scoped with `data-style` to allow switching:

```html
<div data-style="minimal">
  <!-- Components here use minimal theme -->
</div>
```

For global application, set on the root element:

```html
<html data-style="material"></html>
```

## Creating Custom Themes

1. Copy `src/rokkit/` to `src/my-theme/`
2. Modify styles using same data attribute selectors
3. Wrap selectors with `[data-style='my-theme']` scope
4. Import your theme alongside or instead of rokkit

## CSS Custom Properties

Themes use semantic CSS custom properties for consistency:

```css
/* Surface colors (backgrounds) */
--surface-z0 through --surface-z10

/* Text colors */
--text-primary, --text-secondary, --text-muted

/* Interactive colors */
--primary, --primary-hover, --primary-active

/* State colors */
--success, --warning, --error, --info
```
