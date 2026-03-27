# Chart Preset System

> Design for a user-configurable chart appearance preset: color series, shade mapping, opacity, patterns, symbols, and jitter — integrated with `rokkit.config.js` but kept runtime-separate from the UnoCSS build pipeline.

---

## Problem

Chart appearance is currently hardcoded in three places:

1. **`lib/brewing/palette.json`** — 21 series entries with hardcoded hex values for `fill`/`stroke` per mode. Duplicates `lib/palette.json` without referencing it. Changing chart colors requires editing raw hex.
2. **Geom opacity** — `Area.svelte` uses `opacity ?? 0.6`, `Box.svelte` and `Violin.svelte` hardcode `0.5`. No user control.
3. **`SYMBOL_ORDER` / `PATTERN_ORDER`** — fixed sequences in separate files. No way to change ordering or add entries without forking.

Users cannot customize chart series colors, opacity, or series ordering without patching library internals.

---

## Architecture: separate runtime from build-time

`presetRokkit` (`@rokkit/unocss`) is a **build-time** UnoCSS preset — it generates CSS custom properties and icon shortcuts at build time. Chart colors are **runtime SVG `fill`/`stroke` attribute values** computed from data during rendering. These cannot share the same mechanism.

The right split:

| Concern | Where | When |
|---------|-------|------|
| UI theme colors, dark mode, icon shortcuts | `presetRokkit` → CSS vars | Build time |
| Chart series colors, opacity, symbols, patterns | `ChartProvider` / `createChartPreset()` | Runtime |
| Config source of truth | `rokkit.config.js` (shared file) | Both read from it |

Both read from `rokkit.config.js` but through separate code paths. `@rokkit/chart` never depends on `@rokkit/unocss`.

---

## `rokkit.config.js` — new `chart` section

```js
// rokkit.config.js
export default {
  // existing
  colors: { primary: 'orange', secondary: 'pink', ... },
  themes: ['rokkit'],
  switcher: 'manual',

  // new — optional, has defaults if omitted
  chart: {
    colors: ['blue', 'emerald', 'rose', 'amber', 'violet', 'sky', 'pink', 'teal',
             'orange', 'indigo', 'lime', 'cyan', 'gold', 'lavender'],
    shades: {
      light: { fill: '300', stroke: '700' },
      dark:  { fill: '500', stroke: '200' }
    },
    opacity: {
      area:   0.6,
      box:    0.5,
      violin: 0.5
    },
    patterns: ['diagonal', 'dots', 'triangles', 'hatch', 'lattice', 'swell',
               'checkerboard', 'waves', 'petals'],
    symbols:  ['circle', 'square', 'triangle', 'diamond', 'plus', 'cross', 'star',
               'asterisk', 'heart', 'rounded-square']
  }
}
```

`@rokkit/unocss`'s `loadConfig` already strips unknown keys (`stripUnknownKeys`), so the `chart` key is ignored by the UnoCSS preset — no changes needed there.

---

## `lib/palette.json` as single color source

`lib/brewing/palette.json` (hardcoded hex values) is **deleted**. `assignColors()` in `lib/brewing/colors.js` is rewritten to index into `lib/palette.json` using the preset's shade values:

```js
// lib/brewing/colors.js
import masterPalette from '../palette.json'

export function assignColors(values, mode = 'light', preset = defaultPreset) {
  const { colors, shades } = preset
  const { fill, stroke } = shades[mode]
  return new Map(values.map((v, i) => {
    const colorName = colors[i % colors.length]
    const group = masterPalette[colorName]
    return [v, {
      fill:   group?.[fill]   ?? '#888',
      stroke: group?.[stroke] ?? '#444'
    }]
  }))
}
```

Shade keys are strings (`'300'`, `'700'`) matching `palette.json` keys. Users can override shade indices to shift the contrast ratio or brightness without touching hex values.

---

## `createChartPreset(overrides?)` — public API

```js
import { createChartPreset } from '@rokkit/chart'

// Default — uses built-in values
const preset = createChartPreset()

// Partial override — merges with defaults
const myPreset = createChartPreset({
  colors: ['violet', 'teal', 'rose', 'gold'],
  shades: { light: { fill: '200', stroke: '600' }, dark: { fill: '400', stroke: '200' } },
  opacity: { area: 0.4 }   // only overrides area; box/violin keep defaults
})
```

Merge semantics: all fields are independently overridable; omitted fields fall back to defaults. `opacity` is deep-merged so users can override one geom without touching others.

---

## `ChartProvider` — global preset context

```svelte
<!-- +layout.svelte or +page.svelte -->
<script>
  import { ChartProvider, createChartPreset } from '@rokkit/chart'
  import config from '../rokkit.config.js'

  const preset = createChartPreset(config.chart)
</script>

<ChartProvider {preset}>
  <slot />
</ChartProvider>
```

`ChartProvider` sets a `'chart-preset'` Svelte context. `PlotState` reads the preset from context (falling back to the built-in default if no provider is present). Individual `<Plot>` or chart wrapper components can accept a `preset` prop that overrides the context for that chart only.

**Fallback chain**: `Plot preset prop` → `ChartProvider context` → built-in default. Charts work with zero configuration.

---

## Opacity in geoms

Geoms read opacity from the preset via `PlotState`:

```js
// PlotState.svelte.js
const preset = getContext('chart-preset') ?? defaultPreset

// geoms read from plotState
fill-opacity={options.opacity ?? plotState.preset.opacity.area}
```

`Bar` geom does not use opacity (solid fills). `Area`, `Box`, `Violin` each read their respective key. Users can override per-chart:

```svelte
<AreaChart data={...} x="date" y="value" opacity={0.3} />
```

The `opacity` prop on chart wrappers overrides the preset's geom-level default for that instance.

---

## Symbols: built-in set with user extension

The existing `shapes.json` + `Symbol.svelte` SVG path renderer is kept as-is. Scatter plot symbols need solid-fill, simple geometry to be legible at 6–12px — the current implementation already satisfies this.

The preset controls which symbols are used and in what order:

```js
// default preset
symbols: ['circle', 'square', 'triangle', 'diamond', 'plus', 'cross', 'star',
          'asterisk', 'heart', 'rounded-square']
```

Users can override the order or add custom symbols by passing additional entries to `createChartPreset()`:

```js
const preset = createChartPreset({
  symbols: ['diamond', 'circle', 'square', 'triangle']  // custom order
})
```

**Custom symbols**: users can extend `shapes.json` by registering a custom SVG path under a new name. The path must be a solid-fill geometry designed for 6–12px rendering. No iconify dependency — symbols stay as plain SVG paths inline in the chart bundle.

---

## Bar chart: grouped bars via `fill` channel

`BarChart` is a wrapper on `Plot`. The `Bar` geom has three rendering paths in `geoms/lib/bars.js`:
- `buildHorizontalBars` — triggered when y is band scale + x is continuous
- `buildStackedBars` — triggered when `options.stack === true`
- `buildGroupedBars` — default fallback

**Grouped bars are automatic.** `Plot` aggregates/groups by `x`, `fill`, and `pattern`. When the `fill` channel maps to a field that has two or more distinct values per x category, `buildGroupedBars` produces side-by-side bars automatically — no separate `group` prop needed.

```svelte
<!-- Grouped bars — just pass fill pointing to a categorical field -->
<BarChart data={sales} x="quarter" y="revenue" fill="region" />

<!-- Stacked bars — explicit opt-in -->
<BarChart data={sales} x="quarter" y="revenue" fill="region" stack />
```

No changes to `BarChart.svelte` are required for grouped bar support. The `fill` prop is already the correct channel for both color encoding and the automatic grouping it produces.

---

## Jitter on `Point` / `ScatterPlot`

Jitter adds seeded random offsets to prevent overplotting — especially useful when overlaying a scatter/jitter plot on a `BoxPlot`.

```svelte
<!-- ScatterPlot.svelte -->
<ScatterPlot
  data={mpg}
  x="class"
  y="hwy"
  jitter={{ width: 0.3, height: 0 }}
/>

<!-- Or overlay on a BoxPlot -->
<Plot {data} x="class" y="hwy">
  <Box />
  <Point jitter={{ width: 0.25 }} size={4} opacity={0.5} />
</Plot>
```

`jitter.width` and `jitter.height` are relative to band width (0–1). For continuous axes, a pixel value is used. The offset is seeded by row index for stable re-renders.

Implementation in `buildPoints()` (`lib/brewing/marks/points.js`):

```js
function jitterOffset(i, range, seed = 1) {
  // lcg pseudo-random: stable per-index, no external dep
  const r = ((i * 1664525 + 1013904223 + seed) >>> 0) / 0xFFFFFFFF
  return (r - 0.5) * range
}
```

---

## `rokkit init` chart prompt

`init.js` gets an optional chart config step (skippable):

```
? Include chart configuration? (Y/n)
? Chart color set: (default series / warm / cool / custom)
? Shade contrast: standard (300/700) / high (200/800) / soft (400/600)
```

Writes the `chart` section into `rokkit.config.js`. Users who skip get no `chart` key → built-in defaults apply automatically.

---

## Delivery order

1. **`createChartPreset()` + default preset** — pure JS, no Svelte, testable in isolation
2. **Delete `brewing/palette.json`** — rewrite `assignColors()` to use shade-mapping
3. **Opacity to preset** — remove hardcoded values from `Area`, `Box`, `Violin`
4. **`ChartProvider`** — Svelte context component; `PlotState` reads preset from it
5. **Jitter on `Point`** — `jitter` option in `buildPoints()`; expose on `ScatterPlot`
6. **`rokkit init` chart prompt** — optional step in existing wizard

Steps 1–4 are the core; 5–6 are independent and can ship separately.

Note: `BarChart` grouped bars require no changes — grouping is automatic when `fill` maps to a multi-value field. `Symbol.svelte` requires no changes — users extend by adding entries to `shapes.json`.

---

## Files affected

| File | Change |
|------|--------|
| `packages/chart/src/lib/brewing/palette.json` | **Delete** |
| `packages/chart/src/lib/brewing/colors.js` | Rewrite `assignColors()` to use shade mapping |
| `packages/chart/src/lib/preset.js` | **New** — `defaultPreset`, `createChartPreset()` |
| `packages/chart/src/ChartProvider.svelte` | **New** — context provider |
| `packages/chart/src/PlotState.svelte.js` | Read preset from `'chart-preset'` context |
| `packages/chart/src/geoms/Area.svelte` | Read `plotState.preset.opacity.area` |
| `packages/chart/src/geoms/Box.svelte` | Read `plotState.preset.opacity.box` |
| `packages/chart/src/geoms/Violin.svelte` | Read `plotState.preset.opacity.violin` |
| `packages/chart/src/geoms/Point.svelte` | Add `jitter` option |
| `packages/chart/src/lib/brewing/marks/points.js` | Add `jitterOffset()` helper |
| `packages/chart/src/index.js` | Export `ChartProvider`, `createChartPreset` |
| `packages/cli/src/init.js` | Add optional chart config step |
| `docs/design/17-chart-preset.md` | This document |
