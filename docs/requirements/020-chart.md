# Chart Component Requirements

> Requirements for the `@rokkit/chart` package — data visualization, animation, accessibility, and export.

---

## 1. Overview

The `@rokkit/chart` package provides SVG-based data visualization components. All charts render inside an `<svg>` container (not HTML elements). The package supports static charts, animated time-series charts ("chart races"), sparkline mini-charts, accessible pattern fills, and SVG/image export.

### 1.1 Current Architecture

```
Plot (composable namespace)
├── Plot.Root     — SVG container with scales, responsive sizing
├── Plot.Axis     — X/Y axis rendering
├── Plot.Bar      — Bar chart marks
├── Plot.Grid     — Background grid lines
└── Plot.Legend    — Discrete/continuous legend

ChartBrewer       — Orchestrates scales, bars, axes, legends from data + field mappings
Patterns          — SVG fill patterns (Brick, Circles, CrossHatch, Dots, Waves, etc.)
Symbols           — SVG marker shapes (circle, rounded-square, named paths)
Texture           — SVG pattern wrapper
```

### 1.2 Existing Assets

| Asset | Location | Status |
|-------|----------|--------|
| Pattern components (9 types) | `src/patterns/` | Svelte 4, functional |
| Symbol components | `src/symbols/` | Svelte 4, functional |
| Template pattern library (JSON-based) | `src/template/` | Svelte 4, functional |
| Color palette (21 colors × 11 shades) | `src/old_lib/palette.json` | Tailwind-style shade ramp (50–950) |
| Swatch store (patterns + symbols + palette) | `src/old_lib/swatch.js` | Svelte 4 store, needs migration |
| Brewer (fill pattern assignment) | `src/old_lib/brewer.js` | Maps data values → pattern + color combos |
| ChartBrewer (scale/layout engine) | `src/lib/brewing/` | Svelte 5 `.svelte.js`, current |
| Rollup functions | `@rokkit/data` `rollup.js` | Groups + aligns data for time series |

---

## 2. Chart Types

### 2.1 Bar Chart

Horizontal or vertical bars. Supports grouped and stacked variants.

- Single series: one bar per category
- Grouped: multiple bars per category (side-by-side)
- Stacked: bars stacked per category
- Sorted: bars ordered by value (rank)

### 2.2 Line Chart

Continuous line connecting data points.

- Single or multiple series
- Optional area fill under the line
- Smoothing (monotone cubic interpolation) option

### 2.3 Area Chart

Filled area between a line and the baseline.

- Stacked area for multiple series
- Gradient fill support

### 2.4 Scatter Plot

Individual data points plotted by x/y coordinates.

- Uses symbols from the symbol library (circle, square, triangle, diamond, etc.)
- Size encoding (bubble chart variant)
- Pattern fill on symbols for accessibility

### 2.5 Pie / Donut Chart

Proportional segments of a whole.

- Donut variant with configurable inner radius
- Pattern fills per segment
- Label positioning (inside, outside, callout lines)

### 2.6 Sparkline

Minimal inline chart — compact, no axes, no legend. Designed for dashboard cards and inline metrics.

- **Line sparkline**: miniature line chart
- **Bar sparkline**: miniature bar chart
- **Area sparkline**: miniature area fill
- **Metric sparkline**: single headline number + trend indicator + optional mini chart + short summary text

#### 2.6.1 Sparkline Anatomy

```
┌─────────────────────────────────┐
│  ▲ 15 lbs                      │  ← headline stat (value + unit)
│  Bench press up in 8 weeks     │  ← summary text (optional)
│  ╱╲  ╱╲╱╲  ╱                   │  ← mini chart (line/bar/area)
│     ╲╱                          │
└─────────────────────────────────┘
```

#### 2.6.2 Sparkline Props

| Prop | Type | Description |
|------|------|-------------|
| `data` | `number[]` or `{value, label}[]` | Series data |
| `type` | `'line' \| 'bar' \| 'area'` | Chart type |
| `value` | `string \| number` | Headline stat |
| `unit` | `string` | Unit label (lbs, %, etc.) |
| `summary` | `string` | Short description |
| `trend` | `'up' \| 'down' \| 'flat'` | Trend indicator |
| `width` | `number` | Chart width (px) |
| `height` | `number` | Chart height (px) |
| `color` | `string` | Line/bar color |
| `fillColor` | `string` | Area fill color |

#### 2.6.3 Sparkline Use Cases

Drawn from [FitTrack analytics requirements](reference: fitness project):

| Card Type | Sparkline | Headline | Summary |
|-----------|-----------|----------|---------|
| Weight journey | Line | "-12 lbs" | "Down 12 lbs since January" |
| Strength PR | Bar (single) | "225 lbs" | "New bench press PR — up 30 lbs in 3 months" |
| Workout streak | Bar | "14 days" | "14-day workout streak — your longest yet!" |
| Weekly consistency | Donut/ring | "83%" | "5 of 6 workouts completed this week" |
| Macro compliance | Stacked bar | "6/7" | "Hit protein target 6 out of 7 days" |
| Measurement change | Line | "-2 in" | "Waist down 2 inches in 8 weeks" |
| Monthly recap | Multi-stat | "22 workouts" | "February: 22 workouts, 3 new PRs, -4 lbs" |

---

## 3. Animated Time Series (Chart Race)

### 3.1 Concept

An animated chart uses time as a third dimension. Data evolves across a timeline, and the chart smoothly transitions between keyframes. The user can play the animation automatically or manually scrub through the timeline.

### 3.2 Reference Implementation

Based on [russellgoldenberg/svelte-bar-chart-race](https://github.com/russellgoldenberg/svelte-bar-chart-race):

- **Keyframes**: array of `[timeLabel, dataArray]` pairs
- **Tweened stores**: Svelte `tweened()` for smooth value + position interpolation
- **Rank tracking**: each data item has a `rank` computed per frame; bars reposition vertically via tweened Y
- **Timer**: elapsed time → keyframe index; play/pause/reset controls
- **Duration**: configurable ms per keyframe (default 300ms)

### 3.3 Rokkit Approach — SVG-Based

Unlike the reference (which uses HTML divs), Rokkit renders all chart races inside `<svg>`:

- Bars are `<rect>` elements with tweened `x`, `y`, `width`, `height`
- Rank reordering via tweened Y positions
- Pattern fills (`url(#pattern-id)`) on bars for accessibility
- Text labels as `<text>` elements following bar positions

### 3.4 Architecture — Base + Wrapper

```
AnimatedChart (wrapper)
├── Rollup layer — groups data by time field, aligns series
├── Tweened store — interpolates between keyframes
├── Timeline controls — play / pause / scrub / step
└── Renders:
    └── Base chart (BarChart, LineChart, etc.)
        └── SVG elements with current frame data
```

**Base chart**: renders a single frame of data. No animation awareness.
**AnimatedChart wrapper**: manages time, produces keyframes, feeds current data to the base chart via tweened store.

### 3.5 Data Flow with @rokkit/data Rollup

```
Raw data (flat array with time field)
    │
    ▼
rollup(data, { groupBy: [timeField], alignBy: [categoryField] })
    │
    ▼
Aligned keyframes: Map<timeValue, categoryData[]>
    │
    ▼
Tweened store switches between keyframes
    │
    ▼
Current frame data → base chart renders
```

The `@rokkit/data` `groupDataByKeys` + `fillAlignedData` + `getAlignGenerator` functions handle:
1. Grouping by the time field (e.g., year, month, date)
2. Aligning categories across all time frames (filling missing entries with zero/default)
3. Applying aggregation reducers (sum, count, avg, etc.)

### 3.6 Timeline Controls

| Control | Description |
|---------|-------------|
| Play/Pause | Toggle automatic playback |
| Step forward/back | Move one keyframe at a time |
| Scrub slider | Drag to any position in timeline |
| Speed control | Adjust playback speed (0.5×, 1×, 2×, 4×) |
| Current label | Display current time value (year, date, etc.) |
| Loop toggle | Restart from beginning when reaching end |

### 3.7 Supported Animated Chart Types

| Chart Type | Animation Behavior |
|------------|-------------------|
| Bar (horizontal) | Bars grow/shrink width, reorder vertically by rank |
| Bar (vertical) | Bars grow/shrink height, reorder horizontally |
| Line | Points move, line redraws smoothly |
| Area | Area boundary shifts |
| Scatter | Points move positions, enter/exit with fade |
| Pie/Donut | Segments resize smoothly |

---

## 4. Data Mapping & Brewer

### 4.1 Field Mapping

Users specify which data fields map to visual channels:

```svelte
<BarChart
  data={salesData}
  x="category"
  y="revenue"
  fill="region"
  pattern="region"
  color="product_line"
/>
```

| Channel | Maps to | Visual |
|---------|---------|--------|
| `x` | X-axis position | Horizontal placement |
| `y` | Y-axis position/length | Bar height, point Y |
| `fill` | Pattern assignment | SVG pattern fill by distinct values |
| `pattern` | Pattern type | Which pattern (Dots, Bricks, etc.) per value |
| `color` | Color assignment | Fill/stroke color from palette per value |
| `size` | Marker size | Bubble/symbol size (scatter only) |
| `label` | Text label | Data labels on marks |

### 4.2 Brewer — Automatic Visual Mapping

The Brewer takes input data and field mappings, and assigns patterns, colors, and symbols to each distinct value:

```javascript
const brewer = new ChartBrewer({
  data: salesData,
  fields: { x: 'category', y: 'revenue', fill: 'region', pattern: 'region', color: 'product_line' }
})

// brewer.getFillMap() → Map<regionValue, { pattern: PatternComponent, color: shade }>
// brewer.getColorMap() → Map<productLine, tailwindColor>
```

### 4.3 Color Palette

Use tailwind-style shade ramps (50–950) from the existing `palette.json` (21 colors):

| Light theme fills | Dark theme fills | Borders/strokes |
|-------------------|------------------|-----------------|
| Shades 100–300 | Shades 700–900 | Shades 500–700 (light), 300–500 (dark) |

**Shade mapping strategy:**
- **Fill colors** (bar fill, area fill): light shades for light mode, dark shades for dark mode
- **Pattern stroke**: contrasting shade within the same color (e.g., fill=blue-200, stroke=blue-600)
- **Border**: one step darker than fill
- **Text labels**: always high contrast against background

### 4.4 Accessible Dual-Coding

Every data series gets both a **color** and a **pattern**, ensuring:
- Color-blind users distinguish series by pattern texture
- Similar colors are differentiated by distinct patterns
- Print (grayscale) remains readable

Pattern assignment order (most distinct first):
1. Dots
2. CrossHatch
3. Waves
4. Brick
5. Triangles
6. Circles
7. Tile
8. OutlineCircles
9. CurvedWave

### 4.5 Custom Patterns & Symbols

Users can extend the built-in pattern and symbol libraries with their own definitions. This supports domain-specific visualizations (e.g., geology patterns, brand textures, industry-standard symbols).

#### 4.5.1 Custom Patterns

A custom pattern is any Svelte component that renders SVG elements inside a `<pattern>` tile:

```svelte
<BarChart {data} x="category" y="value" fill="category"
  customPatterns={[
    { name: 'chevron', component: ChevronPattern },
    { name: 'zigzag', component: ZigzagPattern, defaults: { strokeWidth: 2 } }
  ]}
/>
```

**Pattern component contract:**
- Receives `size`, `fill`, `stroke`, `thickness` props (same as built-in patterns)
- Renders SVG primitives (`<line>`, `<circle>`, `<path>`, `<polygon>`, etc.) that tile within a `size × size` viewport
- No `<pattern>` wrapper — the chart handles that

**SVG path shorthand:**
For simple patterns defined as SVG paths, a `{ name, path, ... }` object can be used without a full Svelte component:

```javascript
customPatterns={[
  { name: 'diagonal', path: 'M0,0 L10,10', stroke: 'currentColor', strokeWidth: 1, size: 10 }
]}
```

#### 4.5.2 Custom Symbols

Symbols for scatter plots and legends can be extended the same way:

```svelte
<ScatterPlot {data} x="weight" y="height" symbol="species"
  customSymbols={[
    { name: 'star', path: 'M5,0 L6.2,3.8 L10,3.8 L7,6.2 L8.2,10 L5,7.5 L1.8,10 L3,6.2 L0,3.8 L3.8,3.8 Z' },
    { name: 'hexagon', component: HexagonSymbol }
  ]}
/>
```

**Symbol component contract:**
- Receives `x`, `y`, `size`, `fill`, `stroke` props
- Renders a single SVG element centered at `(x, y)` fitting within `size × size`

#### 4.5.3 Registry & Precedence

Custom patterns/symbols are merged with the built-in registry. If a custom name collides with a built-in name, the custom definition takes precedence (override). The brewer assigns from the combined registry in order: built-in first, then custom (unless overrides replace built-ins).

#### 4.5.4 Palette Extension

Users can extend the color palette with additional named colors and shade ramps:

```svelte
<BarChart {data}
  customPalette={{
    brand: { 50: '#f0f9ff', 100: '#e0f2fe', ..., 950: '#082f49' },
    coral: { 50: '#fff7ed', 100: '#ffedd5', ..., 950: '#431407' }
  }}
/>
```

Custom palette colors are appended to the built-in palette and participate in brewer assignment.

---

## 5. SVG Export & Download

### 5.1 Static SVG Download

Every chart exposes a "Download SVG" action:

```svelte
<BarChart {data} x="category" y="revenue" exportable>
  <!-- renders download button in chart toolbar -->
</BarChart>
```

**Implementation:**
1. Serialize the chart's `<svg>` DOM to string (`XMLSerializer`)
2. Inline all CSS styles (computed styles → inline `style` attributes)
3. Embed pattern `<defs>` in the exported SVG
4. Create a `Blob` with MIME type `image/svg+xml`
5. Trigger download via `<a>` click with `URL.createObjectURL`

### 5.2 PNG/JPEG Export

Convert SVG to raster via:
1. Render SVG to `<canvas>` using `Image` element with SVG data URI
2. `canvas.toBlob()` for PNG/JPEG
3. Trigger download

### 5.3 Animated SVG Export

For animated charts, export as an animated SVG using SMIL or CSS animations:

1. Capture all keyframes as SVG snapshots
2. Generate `<animate>` or `<animateTransform>` elements for bar positions/sizes
3. Embed timeline as SVG animation with `begin`, `dur`, `values`, `keyTimes`
4. Result: a standalone `.svg` file that plays the animation when opened in a browser

**Limitations:**
- SMIL animations may not render in all contexts (e.g., embedded in `<img>` tags)
- File size grows with keyframe count
- Alternative: export as a series of SVG frames or as a GIF/video (future consideration)

### 5.4 Export Toolbar

Charts with `exportable` prop render a toolbar with:

| Button | Action |
|--------|--------|
| Download SVG | Static SVG file |
| Download PNG | Raster image |
| Download Animated SVG | (animated charts only) SVG with SMIL animations |

The toolbar can be positioned via `exportPosition` prop (`'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'external'`). With `'external'`, the export actions are exposed as bindable functions for the consumer to wire into their own UI.

---

## 6. Scatter Plot Symbols

### 6.1 Current Symbol Library

From `src/symbols/constants/shapes.json` — SVG path-based named shapes.

### 6.2 Efficiency Concerns

For scatter plots with many data points (hundreds/thousands):

- **`<use>` elements**: define each symbol once in `<defs>`, reference via `<use>` with position attributes — avoids duplicating path data
- **Canvas fallback**: for 10,000+ points, consider hybrid SVG/Canvas where the scatter layer renders on `<canvas>` overlaid inside the SVG container
- **Level-of-detail**: at high zoom, render full symbols; at low zoom, render simple circles

### 6.3 Symbol Assignment

Symbols are assigned per distinct value of the `symbol` field mapping, cycling through the available shapes. Combined with color + pattern, this provides triple-coding for accessibility.

---

## 7. Theme Integration

### 7.1 Light/Dark Mode

Charts respect the current theme's light/dark mode via CSS custom properties:

```css
/* base/chart.css */
[data-chart] {
  --chart-bg: var(--surface-1);
  --chart-text: var(--text-1);
  --chart-grid: var(--border-1);
  --chart-axis: var(--text-2);
}
```

### 7.2 Color Palette Shades

The palette provides 11 shades per color (50–950), following Tailwind conventions. The chart system selects appropriate shades based on the current theme:

| Context | Light mode shade | Dark mode shade |
|---------|-----------------|-----------------|
| Bar fill | 300–400 | 600–700 |
| Pattern stroke | 600–700 | 300–400 |
| Bar border | 500 | 500 |
| Axis text | 700 | 300 |
| Grid lines | 200 | 800 |

---

## 8. Responsive Behavior

- Charts use `ResizeObserver` on the container (existing in `Plot.Root`)
- Maintain aspect ratio or fill container (configurable)
- Recalculate scales, tick density, label placement on resize
- Sparklines are fixed-size (no responsive recalculation)

---

## 9. Accessibility

### 9.1 Visual Accessibility

- Pattern + color dual-coding (§4.4)
- Symbol differentiation for scatter plots
- High-contrast theme variant
- `prefers-reduced-motion`: disable animations, show final state

### 9.2 Screen Reader

- `role="img"` on chart SVG with `aria-label` describing the chart
- `<title>` and `<desc>` elements in SVG
- Data table alternative: option to render an accessible `<table>` alongside the chart
- ARIA live region for animated charts announcing current time value

### 9.3 Keyboard

- Tab into chart toolbar (export buttons)
- For interactive charts: arrow keys to navigate data points, Enter to select
- Timeline controls: standard button keyboard interaction

---

## 10. Dependencies

### 10.1 Current

| Dependency | Purpose | Status |
|-----------|---------|--------|
| `d3-array` | Data manipulation | Keep |
| `d3-axis` | Axis rendering | Keep |
| `d3-scale` | Scale calculations | Keep |
| `d3-scale-chromatic` | Color schemes | Review — may replace with palette.json |
| `d3-selection` | DOM manipulation | Review — may remove with Svelte rendering |
| `d3-transition` | Animations | Review — may replace with Svelte tweened |
| `bits-ui` | Unknown usage | Remove (backlog #25) |
| `ramda` | Utility functions | Remove (backlog #23) |

### 10.2 Target

Minimize D3 surface: keep `d3-scale` for mathematical scaling, use Svelte's `tweened`/`spring` for animation, render SVG directly in Svelte templates.

---

## 11. API Summary

### 11.1 Static Charts

```svelte
<BarChart data={[...]} x="category" y="value" fill="group" exportable />
<LineChart data={[...]} x="date" y="value" series="metric" />
<ScatterPlot data={[...]} x="weight" y="height" symbol="species" />
<PieChart data={[...]} value="count" label="category" />
<Sparkline data={[1,2,3,5,4,6]} type="line" value="+42%" summary="Revenue up" />
```

### 11.2 Animated Charts

```svelte
<AnimatedChart data={timeSeriesData} timeField="year" duration={400}>
  <BarChart x="category" y="value" fill="category" />
</AnimatedChart>
```

### 11.3 Export

```svelte
<BarChart {data} exportable exportPosition="top-right" />

<!-- Or programmatic -->
<BarChart {data} bind:exportSvg bind:exportPng />
<button onclick={exportSvg}>Download</button>
```

---

## 12. Cross-References

- Design doc: `docs/design/020-chart.md`
- Data package (rollup): `packages/data/src/rollup.js`
- Existing chart code: `packages/chart/src/`
- Pattern library: `packages/chart/src/patterns/`
- Symbol library: `packages/chart/src/symbols/`
- Palette: `packages/chart/src/old_lib/palette.json`
- Brewer: `packages/chart/src/old_lib/brewer.js`
- FitTrack sparkline reference: fitness project `docs/requirements/06-analytics-and-sharing.md`
