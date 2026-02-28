# @rokkit/icons

> Categorized icon sets in Iconify JSON format with multiple visual styles.

## Position in Dependency Hierarchy
**Depends on**: @rokkit/cli (build)
**Depended on by**: UI applications via UnoCSS icon preset

## Exports (JSON Bundles)

| Export Path | File | Icons | Description |
|-------------|------|-------|-------------|
| `.` (default) | `lib/base.json` | ~160+ | Base icon set (outline/stroke) |
| `./ui.json` | `lib/base.json` | ~160+ | Alias for base bundle |
| `./light.json` | `lib/light.json` | ~5 | Light-weight variant |
| `./solid.json` | `lib/solid.json` | ~12 | Solid/filled style |
| `./twotone.json` | `lib/twotone.json` | ~4 | Two-tone style |
| `./components.json` | `lib/components.json` | ~50 | Component reference icons |
| `./auth.json` | `lib/auth.json` | ~13 | Auth provider icons (Apple, GitHub, Google, etc.) |
| `./app.json` | `lib/app.json` | ~35 | Application icons (calendar, chart, alert, etc.) |
| `./utils` | `src/convert.js` | — | Icon SVG→JSON conversion utilities |

## JSON Format (Iconify)

```json
{
  "prefix": "base",
  "icons": {
    "icon-name": {
      "body": "<svg path data using currentColor>",
      "width": 24,
      "height": 24
    }
  }
}
```

## Base Icon Categories

Actions, alerts, alignment, arrows, badges, UI components (accordion, checkbox, folder, menu, selector, sort), format, status (error, info, success, warning), theme (dark, light, palette), trends

## Build

```bash
bun run build  # Uses @rokkit/cli to generate JSON from SVG source
```
