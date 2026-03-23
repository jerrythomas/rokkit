# Plot Architecture Design

> Date: 2026-03-23
> Supersedes: `2026-03-22-chart-system-design.md` (earlier chart system — this is the full redesign)
> Related issues: #121 Hexbin, #122 Heatmap, #123 Candlestick, #124 Waterfall, #125 Ribbon, #126 Continuous color scales

---

## Goal

Redesign `@rokkit/chart` around a composable `Plot` system that:
- Extracts shared concerns (axis, grid, legend, brewer) out of individual chart components
- Supports overlaying multiple geoms on shared axes
- Supports a serializable `PlotSpec` JSON schema for AI/backend-driven charts
- Supports Facet plots (data split into panels in a CSS grid)
- Supports Animated/Race plots (frames over time)
- Supports CrossFilter linked interaction (dc.js-style)
- Is open for extension via a helpers pattern (custom stats, formatters, geoms)

Backwards compatibility is **not required**. Thin wrappers for specific use cases are fine.

---

## Section 1: Architecture Overview

### Two entry points, one rendering path

```
Declarative API              Spec API
<Plot x="month" y="revenue"> <Plot spec={...} helpers={...} />
  <Bar stat="sum" />
</Plot>
        ↓                           ↓
              normalize()
                  ↓
             PlotState
         (reactive, in context)
                  ↓
    ┌─────────────────────────────┐
    │  Grid  Axis  Geoms  Legend  │
    └─────────────────────────────┘
```

Both entry points normalize to the same `PlotState` before rendering. One rendering path, two entry points.

### Component tree

```
Plot.svelte                  ← orchestrator: owns PlotState, sets context
  Grid.svelte                ← horizontal/vertical grid lines
  [geoms in order]           ← Bar, Line, Area, Point, Box, Violin, Arc
  Axis.svelte (x)            ← x-axis, position derived from scale + axisOrigin
  Axis.svelte (y)            ← y-axis
  Legend.svelte              ← adapts to discrete/sequential/diverging color scale
  Title.svelte               ← optional chart title
```

### File structure

```
packages/chart/src/
  Plot.svelte                ← orchestrator
  PlotSpec.js                ← TypeScript types + JSON schema
  PlotState.svelte.js        ← reactive state class (scales, stat pipeline, color)
  FacetPlot.svelte           ← data split into CSS grid panels
  AnimatedPlot.svelte        ← frames over time (TBD — Section 6)
  geoms/                     ← pure render components
    Bar.svelte
    Line.svelte
    Area.svelte
    Point.svelte
    Box.svelte
    Violin.svelte
    Arc.svelte
  plot/                      ← shared infrastructure
    Axis.svelte
    Grid.svelte
    Legend.svelte
    Title.svelte
  charts/                    ← thin wrappers for specific use cases (not compat shims)
    BarChart.svelte
    LineChart.svelte
    ... etc
  patterns/                  ← unchanged
  symbols/                   ← unchanged
```

---

## Section 2: PlotSpec — Serializable JSON Schema

`PlotSpec` is fully serializable — no functions, no components, no imports. A spec is just data: `JSON.stringify`-able, storable, sendable over a network. Analogous to `FormSchema` in the forms system.

```typescript
interface PlotSpec {
  // Data
  data: Record<string, unknown>[]

  // Chart-level channels (inherited by all geoms unless overridden)
  x?: string
  y?: string
  color?: string
  fill?: string
  size?: string
  symbol?: string
  pattern?: string
  theta?: string               // Arc geom only

  // Display names — resolved by caller (i18n lives outside Plot)
  // Pass already-translated strings; Plot never resolves translations itself
  labels?: Record<string, string>   // { cty: 'City MPG', hwy: 'Highway MPG' }

  // Axis
  xDomain?: unknown[]          // explicit domain override
  yDomain?: number[]
  xLabel?: string              // axis label (falls back to labels[x])
  yLabel?: string
  axisOrigin?: [number, number] // where axes cross — default: domain min (edge-pinned)
                                // [0, 0] → quadrant mode (future)

  // Color scale
  colorScale?: 'categorical' | 'sequential' | 'diverging'  // inferred if omitted
  colorScheme?: string         // 'greens' | 'blues' | 'rdbu' | theme default
  colorMidpoint?: number       // for diverging — default 0
  colorDomain?: unknown[]      // explicit [min, max] or [min, mid, max]

  // Geom layers (rendered bottom to top)
  geoms: GeomSpec[]

  // Facet
  facet?: {
    by: string                 // field to split on
    cols?: number              // columns in grid (default: auto ~3)
    scales?: 'fixed' | 'free' | 'free_x' | 'free_y'  // default: 'fixed'
  }

  // Animation (see Section 6)
  animate?: { by: string; duration?: number }

  // Display
  grid?: boolean               // default: true
  legend?: boolean             // default: false
  tooltip?: boolean            // enable tooltip; render fn provided in helpers
  title?: string
  width?: number               // default: 600
  height?: number              // default: 400
  mode?: 'light' | 'dark'
}

interface GeomSpec {
  type: string                 // built-in or helpers.geoms key — open string, not enum
  x?: string                  // channel overrides (merge with Plot-level)
  y?: string
  color?: string
  fill?: string
  size?: string
  symbol?: string
  pattern?: string
  stat?: string                // built-in or helpers.stats key
  options?: Record<string, unknown>  // geom-specific: { stack, innerRadius, ... }
}
```

### i18n contract

`labels` contains **resolved display strings** — the caller is responsible for i18n:

```js
// With Paraglide (or any i18n system)
import { m } from '$lib/paraglide/messages'

const spec = {
  data: carData,
  x: 'cty', y: 'hwy',
  labels: { cty: m.field_cty(), hwy: m.field_hwy() }
}
```

If the user switches language, the parent recomputes `labels` and passes new strings — Plot re-renders. No i18n logic inside Plot.

For backend/AI-driven specs, the backend resolves labels for the user's locale before sending.

---

## Section 3: PlotState — Scale Sharing and Data Pipeline

### Data pipeline

```
raw data
  → [per-geom stat transform]     groups by non-value channels, aggregates value channels
  → post-stat data per geom
  → [union of all post-stat data → shared scales]
  → [marks rendered per geom]
```

For facets: stat runs within each panel's data slice.
For animation: stat runs within each frame's data slice.

### PlotState class

```js
class PlotState {
  #geoms = $state([])

  // Scales — built from union of all geom post-stat data
  xScale = $derived(buildScale(unionDomains(this.#geoms, 'x'), [0, innerWidth]))
  yScale = $derived(buildScale(unionDomains(this.#geoms, 'y'), [innerHeight, 0]))
  colorScale = $derived(buildColorScale(this.#colorConfig))

  // Axis crossing — default: domain min (edge-pinned)
  // Set axisOrigin=[0,0] for quadrant mode (future)
  axisOrigin = $state([undefined, undefined])
  xAxisY = $derived(this.yScale(this.axisOrigin[1] ?? this.yDomain[0]))
  yAxisX = $derived(this.xScale(this.axisOrigin[0] ?? this.xDomain[0]))

  // Helpers
  label(field)          // returns labels[field] ?? field
  resolve(stat, field)  // built-in → helpers.stats lookup → identity fallback

  registerGeom(config)  // called by each geom on mount
  geomData(id)          // returns post-stat rows for this geom
}
```

### Scale-sharing rules

- **Default**: auto-union all geom y-fields → single shared y-scale (comparable overlay)
- **Explicit domain**: `yDomain: [0, 100]` in spec → overrides computed domain
- **Dual y-axis**: `options: { yAxis: 'right' }` on a geom → registers `yScale2` (opt-in only)

### Orientation — no `horizontal` prop

Orientation is **inferred from scale types**, not declared:

```
x = band/ordinal, y = continuous  →  vertical  (column chart, standard violin)
y = band/ordinal, x = continuous  →  horizontal (bar chart, horizontal box)
both continuous                   →  no orientation (scatter, line, area)
```

Swapping `x` and `y` channel assignments is the mechanism. No `horizontal` prop anywhere.

```js
// Vertical bar
{ data, x: 'region', y: 'revenue', geoms: [{ type: 'bar' }] }

// Horizontal bar — just swap
{ data, x: 'revenue', y: 'region', geoms: [{ type: 'bar' }] }
```

### Quadrant-aware axis (future — issue to be filed)

`Axis` position is derived from `axisOrigin`, not hardcoded to chart edge. Edge-pinned is the default (axisOrigin = domain min). Setting `axisOrigin: [0, 0]` produces axes crossing at the data origin — quadrant mode.

**Do not bake in assumptions that axes always live at chart edges.** The architecture must keep axis position as a derived value from scale + origin.

### Color scale types

| Type | When | Legend |
|------|------|--------|
| `categorical` | color field is string/enum | swatches |
| `sequential` | color field is numeric, one direction | gradient bar |
| `diverging` | color field is numeric + `colorMidpoint` set | gradient bar with midpoint |

Inferred from data if `colorScale` not specified in spec. Full override via `helpers.colorScale`.

See issue #126 for implementation. Each theme must ship sequential and diverging color ramps alongside categorical palettes.

---

## Section 4: Geom Layer — Pure Render Components

Each geom is a **pure render component**: reads post-stat data and scales from `PlotState` context, renders SVG elements, nothing else.

### Contract

- **Receives**: `id` (to fetch own post-stat data), channel props, geom-specific options
- **Reads from context**: scales, helpers, `label()` resolver
- **Renders**: SVG elements only — no `<g>` transform (Plot handles canvas offset), no axis, no legend
- **Never**: builds scales, reads raw data, renders infrastructure

### Built-in geoms

| Geom | Scale types | SVG output | Notable options |
|------|-------------|-----------|-----------------|
| `Bar` | x=band or y=band | `<rect>` per group | `stack` |
| `Line` | both continuous | `<path>` per series | `curve` |
| `Area` | both continuous | `<path>` filled per series | `curve`, `stack` |
| `Point` | both continuous | `<circle>` or `<Shape>` | `symbol` |
| `Box` | x=band, y=continuous | `<rect>` + `<line>` | — |
| `Violin` | x=band, y=continuous | `<path>` (KDE) | — |
| `Arc` | theta channel | `<path>` per slice | `innerRadius` (0=pie, 0–1=donut ratio) |

`Arc` is the special case — uses `theta` channel instead of x/y. `PlotState` detects a pure `theta` mapping and skips x/y scale building.

### Stat resolution

```
stat string on GeomSpec
  → is built-in? ('identity'|'count'|'sum'|'mean'|'median'|'min'|'max')
      → use internal implementation
  → matches helpers.stats key?
      → call that function
  → unknown?
      → warn + fall back to 'identity'
```

Built-in stats group by all non-value channels (x, color, fill, symbol, pattern) and aggregate value channels (y, size). The grouping key is **inferred**, never specified explicitly.

### Open geom registry

`type` in `GeomSpec` is a plain `string`, not a closed enum. Custom geoms registered in `helpers.geoms`:

```js
const helpers = { geoms: { hexbin: HexbinComponent } }
<Plot {spec} {helpers} />
```

Custom geom components follow the same context contract as built-ins.

Future built-in candidates (filed as issues):
- `hexbin` — 2D density (#121)
- `heatmap` — matrix cells, x=band y=band (#122)
- `candlestick` — OHLC financial (#123)
- `waterfall` — sequential running-total bars (#124)
- `ribbon` — flow/Sankey between categorical axes (#125)

---

## Section 5: Helpers — Extending Plot with Functions

`PlotSpec` is JSON-safe. All function-based extensions go in `PlotHelpers`, passed separately.

```typescript
type BuiltinStat = 'identity' | 'count' | 'sum' | 'mean' | 'median' | 'min' | 'max'
type StatFn      = (values: unknown[]) => unknown
type FormatFn    = (v: unknown) => string
type TooltipFn   = (d: Record<string, unknown>) => string

interface PlotHelpers {
  stats?:      Record<string, StatFn>         // extends built-in stat names
  format?:     Record<string, FormatFn>       // field → tick/label formatter
  tooltip?:    TooltipFn                      // custom tooltip renderer
  geoms?:      Record<string, SvelteComponent> // custom geom components
  colorScale?: unknown                         // d3 scale override for color
}
```

### Resolution pattern (same for all extension points)

```
string name → built-in implementation
           → helpers[name] if provided
           → warn + sensible fallback
```

### Spec + helpers split

```js
// spec.json — AI/backend generates this, all strings
{
  data: salesData,
  x: 'month', y: 'revenue', color: 'region',
  geoms: [
    { type: 'bar',     stat: 'sum' },
    { type: 'line',    stat: 'mean' },
    { type: 'hexbin',  options: { radius: 20 } }  // custom geom name
  ],
  tooltip: true
}

// helpers — app provides functions
const helpers = {
  stats:   { weighted_mean: (vals) => weightedMean(vals) },
  format:  { revenue: (v) => `$${(v/1000).toFixed(0)}K` },
  tooltip: (d) => `${d.region}: ${fmt.currency(d.revenue)}`,
  geoms:   { hexbin: HexbinComponent }
}

<Plot {spec} {helpers} />
```

---

## Section 6: Facets

A facet splits the dataset into panels by a field value, renders each as a mini-Plot in a CSS grid. Panels share scales by default so they are comparable.

### Spec

```typescript
facet?: {
  by: string      // field to split on
  cols?: number   // columns (default: auto ~3)
  scales?: 'fixed' | 'free' | 'free_x' | 'free_y'  // default: 'fixed'
}
```

### Data pipeline with facets

```
raw data
  → split by facet.by → frames: [{ key, rows }]
  → shared scales from FULL dataset (fixed) or per-frame (free)
  → per frame: stat transform → marks → render
```

Stat runs **within each frame independently**. `stat: 'sum'` on a bar geom aggregates West's data separately from East's data.

### Missing values → gaps, not crashes

Domains always derived from the full dataset regardless of `scales` mode. If a panel has no data for a category, the geom simply doesn't render for that position — gap in the chart. The axis still shows all categories (alignment preserved). No reordering, no error.

```
Full data:  Jan Feb Mar Apr
West:       Jan  ·  Mar Apr    ← gap at Feb, x-axis unchanged
East:       Jan Feb Mar  ·     ← gap at Apr
```

### Layout

```svelte
<!-- FacetPlot.svelte -->
<div data-facet-grid style="grid-template-columns: repeat({cols}, 1fr)">
  {#each frames as frame (frame.key)}
    <div data-facet-panel>
      <div data-facet-label>{frame.key}</div>
      <PlotPanel data={frame.rows} {sharedScales} {spec} {helpers} />
    </div>
  {/each}
</div>
```

Axis display in facet grids:
- Y-axis: leftmost column only
- X-axis: bottom row only
- Legend: single shared legend outside the grid
- Panel title: facet field value above each panel

---

## Section 7: Animation / Race Plot

Scales computed from **full dataset across all frames** before animation starts — axis never rescales mid-animation.

### Spec

```typescript
animate?: {
  by: string         // field defining frames — e.g. 'year'
  duration?: number  // ms per frame transition (default: 500)
  loop?: boolean     // restart after last frame (default: false)
}
```

### Pipeline

```
full data
  → extract ordered frames by animate.by field
  → normalize frames: fill missing combinations with 0 (so tweening works smoothly)
  → compute shared scales from FULL data — static throughout animation
  → per frame: stat transform → marks
  → tween between frames: each geom interpolates position + size
```

Stat runs within each frame — `stat: 'sum'` aggregates 2019 data independently from 2020.

### AnimatedPlot.svelte

Handles frame management and owns timeline state. Renders a `Plot` with the current tweened frame data plus timeline controls below the chart.

Timeline controls:
- Play / pause
- Scrub slider (current frame position)
- Speed selector
- Frame label (shows current `animate.by` value — e.g. "2019")

`prefers-reduced-motion` → skip tweening, jump directly to each frame.

### Bar chart race

Animation + per-frame sorting. Bars are keyed by item (country, product, etc.). Each frame re-ranks items by value. Tweened `y`/`height` (or `x`/`width` for horizontal) animate the position swap smoothly.

Scale is fixed to full-data max — a bar reaching the right/top edge always means "global maximum across all frames".

---

## Section 8: CrossFilter — Linked Interactive Charts

dc.js-style linked interaction: multiple charts share a filter context. Interacting with one chart filters all others. Filtered-out marks receive `data-dimmed` attribute (already in the data attribute system).

### CrossFilter context

`CrossFilter` component wraps multiple Plots and provides shared filter state:

```svelte
<CrossFilter bind:filters>
  <Plot data={sales} x="region" y="revenue">
    <Bar filterable />       <!-- click → filters region dimension -->
  </Plot>
  <Plot data={sales} x="month" y="revenue">
    <Line />                 <!-- shows filtered data passively -->
  </Plot>
  <Plot data={sales} x="price" y="units">
    <Point brush />          <!-- drag → filters continuous range -->
  </Plot>
</CrossFilter>
```

For spec API, `crossfilter` passed in helpers:

```js
const cf = createCrossFilter()
<Plot {spec} helpers={{ ...helpers, crossfilter: cf }} />
```

### Filter state

```typescript
type FilterState = Map<string, Set<unknown> | [number, number]>
// field → Set of selected category values (click)
//       → [min, max] range (brush)
```

Reactive — all Plots in the CrossFilter context re-render when any dimension's filter changes.

### Filter interaction types

| Prop on geom | Interaction | Filter type |
|---|---|---|
| `filterable` | click mark | categorical: toggle value in/out of Set |
| `brush` | drag on axis/canvas | continuous: set [min, max] range |

### Geoms as filter controls (dc.js philosophy)

A geom with `filterable` IS a filter control — no separate widget needed. The same `Bar` that displays revenue by region becomes a region filter when `filterable` is set.

Thin wrapper controls for common patterns:

```svelte
<!-- compact filterable bar chart sized for sidebar/filter panel use -->
<FilterBar data={sales} field="region" {crossfilter} />

<!-- range slider backed by actual data distribution -->
<FilterSlider data={sales} field="price" {crossfilter} />
```

These are thin wrappers — a `FilterBar` is a small `Plot` with a `Bar filterable` geom; `FilterSlider` is a small `Plot` with a `Point brush` geom on a single axis.

### Dimming vs hiding

Default: filtered-out marks get `data-dimmed` attribute — visible but de-emphasized (opacity 0.15 via theme CSS). This preserves context (you can still see the full shape of the data).

Optional: `mode="hide"` on CrossFilter hides filtered-out marks entirely.

---

## Section 9: Testing Strategy

> **TBD** — to be designed before implementation begins.

---

## Key Design Decisions Log

| Decision | Rationale |
|----------|-----------|
| `horizontal` prop dropped — use scale-type detection | Line/area have no meaningful horizontal mode; orientation falls out of which axis is band vs continuous |
| `labels` is resolved strings, not i18n keys | Plot is i18n-agnostic; caller resolves translations (Paraglide, i18next, backend) |
| `stat` on GeomSpec, runs within facet/animation frame | Enables per-geom aggregation; multiple stats on same canvas (bars=sum, line=mean) |
| `type` is open string, not enum | Custom geoms via helpers.geoms without forking the library |
| Spec + helpers split | Spec travels over wire (AI/backend-safe); functions stay in app |
| Axis position derived from axisOrigin | Keeps quadrant-aware axis as natural extension, not a retrofit |
| Color scale inferred from field type | Sequential/diverging for numeric fields, categorical for string fields |
| Facet missing values → gaps | Preserve ordering and alignment across panels; no crashes on sparse data |
| Animation scales from full data | Axis never rescales mid-animation — global max applies across all frames |
| Frame normalization | Missing combinations filled with 0 so tweening interpolates smoothly |
| Geoms as filter controls | `filterable`/`brush` props on geoms make them interactive filters — no separate widget needed |
| Dimming over hiding (CrossFilter default) | Preserves data context; filtered-out marks visible at low opacity rather than removed |
| Backwards compatibility not required | Thin wrappers for specific use cases are fine; not compat shims |

---

## Out of Scope (issues filed)

- Hexbin geom — #121
- Heatmap geom — #122
- Candlestick geom — #123
- Waterfall geom — #124
- Ribbon geom — #125
- Continuous color scales (sequential/diverging) — #126
- Quadrant-aware axis — issue to be filed
