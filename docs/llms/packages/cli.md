# @rokkit/cli

> Command-line tool for icon bundling and SVG optimization.

## Position in Dependency Hierarchy
**Depends on**: @iconify/tools, @iconify/types, @mdi/svg, sade, ramda
**Depended on by**: @rokkit/icons (build pipeline)

## CLI Commands

| Command | Options | Description |
|---------|---------|-------------|
| `rokkit bundle` | `-c config`, `-i input`, `-o output` | Bundle SVG icons into Iconify JSON files |
| `rokkit build` | `-c config`, `-i input`, `-o output` | Build complete Iconify JSON packages |

```bash
rokkit bundle -i src -o build --config config.json
```

## Module Exports

| Export | Signature | Description |
|--------|-----------|-------------|
| `cleanAndOptimizeIcon(svg, color)` | Clean and optimize SVG using SVGO |
| `processIcons(iconSet, color)` | Process all icons in a set |
| `bundle(folder, options)` | Convert icon folder into JSON bundle |

## SVG Pipeline

1. Import SVG files from directory
2. Validate and clean markup (`cleanupSVG`)
3. Normalize colors to `currentColor` (`parseColors`)
4. Optimize with SVGO (`runSVGO`)
5. Export as Iconify JSON

## Config Format

```json
{
  "light": {
    "prefix": "light",
    "color": false
  },
  "auth": {
    "prefix": "auth",
    "color": true
  }
}
```

`color: true` preserves original SVG colors; `false` normalizes to `currentColor`.
