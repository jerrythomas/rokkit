# Chart Package — Technical Design

> Design for `@rokkit/chart` — SVG data visualization, animated time series, sparklines, brewer, and export.
>
> Implements: `docs/requirements/020-chart.md`

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Consumer Code                        │
│  <AnimatedChart data timeField>                          │
│    <BarChart x y fill pattern color exportable />        │
│  </AnimatedChart>                                        │
└──────────┬──────────────────────────────┬────────────────┘
           │                              │
    ┌──────▼──────┐              ┌────────▼────────┐
    │ AnimatedChart│              │  Static Charts   │
    │  (wrapper)  │              │  Bar, Line, Area │
    │             │              │  Scatter, Pie    │
    │ • rollup    │──current──►  │  Sparkline       │
    │ • tween     │   frame      │                  │
    │ • timeline  │              │ • ChartBrewer    │
    │ • controls  │              │ • SVG rendering  │
    └─────────────┘              │ • Pattern defs   │
                                 │ • Export utils   │
                                 └──────────────────┘
                                          │
                    ┌─────────────────────┼─────────────────────┐
                    │                     │                     │
            ┌───────▼──────┐    ┌────────▼───────┐   ┌────────▼───────┐
            │ @rokkit/data │    │   Patterns      │   │   Palette      │
            │ rollup.js    │    │   Symbols        │   │   palette.json │
            │ groupByKeys  │    │   Textures       │   │   Swatch       │
            │ fillAligned  │    │   (SVG defs)     │   │   Brewer       │
            └──────────────┘    └─────────────────┘   └────────────────┘
```

---

## 2. Module Structure

### 2.1 Package Exports

```
@rokkit/chart
├── Plot                    # Current composable namespace (Root, Axis, Bar, Grid, Legend)
├── BarChart                # NEW — standalone bar chart component
├── LineChart               # NEW — standalone line chart component
├── AreaChart               # NEW — standalone area chart component
├── ScatterPlot             # NEW — standalone scatter plot component
├── PieChart                # NEW — standalone pie/donut chart component
├── Sparkline               # NEW — compact inline chart component
├── AnimatedChart           # NEW — time-series animation wrapper
├── TimelineControls        # NEW — play/pause/scrub/speed UI
├── ChartBrewer             # Enhanced — field mapping → visual channels
├── ChartExporter           # NEW — SVG/PNG/animated SVG export utilities
├── patterns                # Existing — SVG pattern components
├── symbols                 # Existing — SVG symbol shapes
├── palette                 # Existing palette.json — 21 colors × 11 shades
└── swatch                  # Migrated — patterns + symbols + palette registry
```

### 2.2 File Layout

```
packages/chart/src/
├── index.js                        # Re-exports
├── charts/
│   ├── BarChart.svelte             # Standalone bar chart
│   ├── LineChart.svelte            # Standalone line chart
│   ├── AreaChart.svelte            # Standalone area chart
│   ├── ScatterPlot.svelte          # Standalone scatter plot
│   ├── PieChart.svelte             # Standalone pie/donut chart
│   └── Sparkline.svelte            # Compact inline chart
├── animation/
│   ├── AnimatedChart.svelte        # Time-series wrapper
│   ├── TimelineControls.svelte     # Play/pause/scrub UI
│   ├── keyframe-store.svelte.js    # Tweened keyframe state management
│   └── timer.svelte.js             # Animation timer (elapsed → frame index)
├── export/
│   ├── ChartExporter.svelte        # Export toolbar component
│   ├── svg-export.js               # SVG serialization + inline styles
│   ├── raster-export.js            # SVG → Canvas → PNG/JPEG
│   └── animated-svg-export.js      # Keyframes → SMIL animated SVG
├── lib/
│   ├── brewing/                    # Existing ChartBrewer engine
│   │   ├── index.svelte.js         # ChartBrewer class
│   │   ├── dimensions.svelte.js
│   │   ├── scales.svelte.js
│   │   ├── bars.svelte.js
│   │   ├── axes.svelte.js
│   │   ├── legends.svelte.js
│   │   ├── brewer.svelte.js        # NEW — visual channel assignment (pattern + color + symbol)
│   │   └── types.js
│   ├── context.js
│   └── utils.js
├── patterns/                       # Existing SVG patterns (migrate to Svelte 5)
├── symbols/                        # Existing SVG symbols (migrate to Svelte 5)
├── template/                       # Existing template library
├── Plot/                           # Existing composable namespace
└── palette.json                    # Moved from old_lib/ — 21 colors × 11 shades
```

---

## 3. AnimatedChart — Time-Series Wrapper

### 3.1 Component Interface

```svelte
<script>
  import { AnimatedChart, BarChart } from '@rokkit/chart'

  // Flat data with a time column
  const data = [
    { year: 2020, language: 'JavaScript', pct: 32 },
    { year: 2020, language: 'Python', pct: 28 },
    { year: 2021, language: 'JavaScript', pct: 30 },
    { year: 2021, language: 'Python', pct: 31 },
    // ...
  ]
</script>

<AnimatedChart
  {data}
  timeField="year"
  categoryField="language"
  duration={400}
  autoplay={false}
  loop={false}
  speed={1}
>
  <BarChart x="language" y="pct" fill="language" pattern="language" />
</AnimatedChart>
```

### 3.2 Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `any[]` | required | Flat data array with time + category columns |
| `timeField` | `string` | required | Field to group keyframes by (e.g., "year", "date") |
| `categoryField` | `string` | `undefined` | Field to align across frames |
| `duration` | `number` | `400` | Milliseconds per keyframe transition |
| `autoplay` | `boolean` | `false` | Start playing on mount |
| `loop` | `boolean` | `false` | Loop back to start when finished |
| `speed` | `number` | `1` | Playback speed multiplier |
| `interpolate` | `boolean` | `true` | Tween between keyframes (vs. snap) |
| `showControls` | `boolean` | `true` | Render timeline controls |
| `currentTime` | `unknown` | `$bindable` | Current time value (bindable for external control) |

### 3.3 Internal Architecture

```
AnimatedChart.svelte
│
├── 1. Rollup Phase (on data change)
│   │  Uses @rokkit/data rollup functions:
│   │  groupDataByKeys(data, [timeField], aggregators)
│   │  fillAlignedData(grouped, config, alignGenerator)
│   │
│   └── Produces: keyframes = Map<timeValue, categoryData[]>
│                  timeValues = sorted array of distinct time values
│
├── 2. Keyframe Store (reactive)
│   │  $state: currentIndex = 0
│   │  $derived: currentTimeValue = timeValues[currentIndex]
│   │  tweenedData = tweened(keyframes.get(currentTimeValue), { duration })
│   │
│   └── On index change: tweenedData.set(keyframes.get(newTimeValue))
│
├── 3. Timer (animation loop)
│   │  Uses requestAnimationFrame
│   │  Tracks elapsed time
│   │  elapsed / (duration / speed) → currentIndex
│   │
│   └── Controls: play(), pause(), reset(), step(±1), seek(index)
│
├── 4. Context Provider
│   │  setContext('animated-chart', {
│   │    data: tweenedData,      // current interpolated frame
│   │    timeValue: currentTimeValue,
│   │    playing, duration, speed
│   │  })
│   │
│   └── Child chart reads context for its data source
│
└── 5. Render
    ├── <TimelineControls> (if showControls)
    ├── <slot /> (child chart component)
    └── <time label> (current time value display)
```

### 3.4 Tweened Store for Object Arrays

Svelte's `tweened()` interpolates numbers by default. For chart race data (arrays of objects), we need custom interpolation:

```javascript
// keyframe-store.svelte.js

import { tweened } from 'svelte/motion'
import { cubicOut } from 'svelte/easing'

/**
 * Creates a tweened store that interpolates arrays of objects.
 * Each object must have a stable identity key and numeric fields to interpolate.
 */
export function createKeyframeStore(initial, options = {}) {
  const { duration = 400, easing = cubicOut } = options

  return tweened(initial, {
    duration,
    easing,
    interpolate: (from, to) => (t) => {
      // Merge arrays by identity key
      return to.map((toItem) => {
        const fromItem = from.find(f => f._key === toItem._key) ?? toItem
        const result = { ...toItem }
        // Interpolate all numeric fields
        for (const key of Object.keys(toItem)) {
          if (typeof toItem[key] === 'number' && typeof fromItem[key] === 'number') {
            result[key] = fromItem[key] + (toItem[key] - fromItem[key]) * t
          }
        }
        return result
      })
    }
  })
}
```

### 3.5 Rank Computation

For bar chart races, bars are ranked by value each frame:

```javascript
function computeRanks(data, valueField) {
  const sorted = [...data].sort((a, b) => b[valueField] - a[valueField])
  return sorted.map((item, index) => ({ ...item, _rank: index }))
}
```

The `_rank` field is numeric and gets interpolated by the tweened store, creating smooth vertical repositioning of bars as rankings change.

---

## 4. Timeline Controls

### 4.1 Component

```svelte
<!-- TimelineControls.svelte -->
<script>
  /** @type {{ playing: boolean, currentIndex: number, totalFrames: number, speed: number, currentLabel: string }} */
  let { playing, currentIndex, totalFrames, speed, currentLabel,
        onplay, onpause, onreset, onstep, onseek, onspeedchange } = $props()
</script>

<div class="chart-timeline" role="group" aria-label="Animation controls">
  <!-- Play/Pause -->
  <button onclick={playing ? onpause : onplay} aria-label={playing ? 'Pause' : 'Play'}>
    <span class={playing ? 'i-lucide:pause' : 'i-lucide:play'} />
  </button>

  <!-- Step back -->
  <button onclick={() => onstep(-1)} disabled={currentIndex === 0} aria-label="Previous frame">
    <span class="i-lucide:skip-back" />
  </button>

  <!-- Scrub slider -->
  <input
    type="range"
    min={0}
    max={totalFrames - 1}
    value={currentIndex}
    oninput={(e) => onseek(+e.target.value)}
    aria-label="Timeline position"
    aria-valuetext={currentLabel}
  />

  <!-- Step forward -->
  <button onclick={() => onstep(1)} disabled={currentIndex >= totalFrames - 1} aria-label="Next frame">
    <span class="i-lucide:skip-forward" />
  </button>

  <!-- Reset -->
  <button onclick={onreset} aria-label="Reset to beginning">
    <span class="i-lucide:rotate-ccw" />
  </button>

  <!-- Speed -->
  <select value={speed} onchange={(e) => onspeedchange(+e.target.value)} aria-label="Playback speed">
    <option value={0.5}>0.5×</option>
    <option value={1}>1×</option>
    <option value={2}>2×</option>
    <option value={4}>4×</option>
  </select>

  <!-- Current time label -->
  <span class="chart-timeline-label">{currentLabel}</span>
</div>
```

### 4.2 Manual vs. Automatic Mode

The timeline supports two modes seamlessly:

- **Automatic (play)**: timer advances `currentIndex` based on elapsed time
- **Manual (scrub)**: user drags slider, which pauses playback and sets `currentIndex` directly

Switching from scrub back to play resumes from the current position.

---

## 5. Brewer — Visual Channel Assignment

### 5.1 Purpose

The Brewer maps data values to visual properties (color, pattern, symbol), ensuring unique, accessible combinations for each distinct value.

### 5.2 Interface

```javascript
// lib/brewing/brewer.svelte.js

export class VisualBrewer {
  /**
   * @param {Object} config
   * @param {any[]} config.data - Data array
   * @param {Object} config.fields - Field mappings { fill, pattern, color, symbol }
   * @param {Object} config.palette - Color palette (palette.json)
   * @param {string} config.theme - 'light' | 'dark'
   */
  constructor(config) { ... }

  /** @returns {Map<unknown, { pattern: string, patternComponent: Component, fillShade: string, strokeShade: string }>} */
  getFillMap() { ... }

  /** @returns {Map<unknown, { colorName: string, shade: string, hex: string }>} */
  getColorMap() { ... }

  /** @returns {Map<unknown, { symbol: string, symbolPath: string }>} */
  getSymbolMap() { ... }

  /** Generates <defs> pattern definitions for all assigned patterns */
  getPatternDefs() { ... }
}
```

### 5.3 Assignment Algorithm

```
Input: data, fields { fill: 'region', pattern: 'region', color: 'product' }

1. Extract distinct values for each field:
   fillValues    = unique(data.map(d => d[fields.fill]))     → ['North', 'South', 'East']
   patternValues = unique(data.map(d => d[fields.pattern]))  → ['North', 'South', 'East']
   colorValues   = unique(data.map(d => d[fields.color]))    → ['Widget', 'Gadget']

2. Assign patterns (cycle through pattern library):
   'North' → Dots
   'South' → CrossHatch
   'East'  → Waves

3. Assign colors from palette (cycle through palette colors):
   'Widget' → blue
   'Gadget' → rose

4. Select shades based on theme:
   Light mode: fill=blue-200, stroke=blue-600
   Dark mode:  fill=blue-700, stroke=blue-300

5. Build pattern <defs> with assigned colors:
   <pattern id="chart-pattern-north">
     <rect fill="blue-200" />
     <Dots stroke="blue-600" />
   </pattern>
```

### 5.4 Shade Selection Strategy

Using the palette's 11 shades (50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950):

```javascript
const SHADE_MAP = {
  light: {
    fill:       [200, 300, 100, 400],  // Background fills — light, distinct
    stroke:     [600, 700, 500],        // Pattern lines, borders — dark, visible
    text:       [800, 900],             // Labels — high contrast
    grid:       [100, 200],             // Grid lines — subtle
    axis:       [600, 700]              // Axis lines + text
  },
  dark: {
    fill:       [700, 800, 600, 900],
    stroke:     [300, 200, 400],
    text:       [100, 50],
    grid:       [800, 900],
    axis:       [300, 400]
  }
}
```

When multiple series share the same fill field, each gets a different color from the palette. When they share the same pattern field, each gets a different pattern. The brewer ensures no two series have the same color+pattern combination.

### 5.5 Custom Patterns, Symbols & Palette Extension

Users can extend the built-in registries with custom definitions. The VisualBrewer merges custom entries with built-ins before assignment.

#### 5.5.1 Pattern Registry

```javascript
// lib/brewing/registry.svelte.js

import * as builtInPatterns from '../../patterns'
import { namedShapes } from '../../symbols/constants'
import palette from '../../palette.json'

/**
 * Merged registry of patterns, symbols, and palette colors.
 * Custom entries override built-ins on name collision.
 */
export function createRegistry(custom = {}) {
  const {
    patterns: customPatterns = [],
    symbols: customSymbols = [],
    palette: customPalette = {}
  } = custom

  // --- Patterns ---
  // Built-in: { name: 'Dots', component: DotsComponent }
  const patternMap = new Map(
    Object.entries(builtInPatterns).map(([name, component]) => [name, { component, type: 'component' }])
  )
  // Custom: component-based or SVG path shorthand
  for (const pat of customPatterns) {
    if (pat.component) {
      patternMap.set(pat.name, { component: pat.component, type: 'component', defaults: pat.defaults })
    } else if (pat.path) {
      patternMap.set(pat.name, { path: pat.path, type: 'path', size: pat.size ?? 10, ...pat })
    }
  }

  // --- Symbols ---
  const symbolMap = new Map(
    Object.entries(namedShapes).map(([name, pathFn]) => [name, { pathFn, type: 'builtin' }])
  )
  for (const sym of customSymbols) {
    if (sym.component) {
      symbolMap.set(sym.name, { component: sym.component, type: 'component' })
    } else if (sym.path) {
      symbolMap.set(sym.name, { path: sym.path, type: 'path' })
    }
  }

  // --- Palette ---
  const mergedPalette = { ...palette, ...customPalette }

  return { patternMap, symbolMap, palette: mergedPalette }
}
```

#### 5.5.2 Custom Pattern Component Contract

A custom pattern component must accept these props and render SVG primitives that tile within a `size × size` viewport:

```svelte
<!-- Example: ChevronPattern.svelte -->
<script>
  let { size = 10, fill = 'currentColor', stroke = 'currentColor', thickness = 1 } = $props()
  let mid = $derived(size / 2)
</script>

<polyline
  points="{0},{mid} {mid},{0} {size},{mid}"
  fill="none"
  {stroke}
  stroke-width={thickness}
/>
<polyline
  points="{0},{size} {mid},{mid} {size},{size}"
  fill="none"
  {stroke}
  stroke-width={thickness}
/>
```

The chart wraps this in a `<pattern>` element — the custom component never renders its own `<pattern>` wrapper.

#### 5.5.3 SVG Path Shorthand for Patterns

For simple patterns that are just a stroked path, no component is needed:

```javascript
customPatterns={[
  {
    name: 'diagonal-lines',
    path: 'M0,10 L10,0 M-2,2 L2,-2 M8,12 L12,8',
    size: 10,
    stroke: 'currentColor',
    strokeWidth: 1
  }
]}
```

The brewer renders this as:

```xml
<pattern id="chart-pat-diagonal-lines" width="10" height="10" patternUnits="userSpaceOnUse">
  <rect width="10" height="10" fill="{assignedFillColor}" />
  <path d="M0,10 L10,0 M-2,2 L2,-2 M8,12 L12,8" stroke="{assignedStrokeColor}" stroke-width="1" fill="none" />
</pattern>
```

#### 5.5.4 Custom Symbol Component Contract

A custom symbol component receives positioning props and renders a single SVG mark:

```svelte
<!-- Example: HexagonSymbol.svelte -->
<script>
  let { x = 0, y = 0, size = 10, fill = 'currentColor', stroke = 'none' } = $props()
  let r = $derived(size / 2)
  // Regular hexagon vertices
  let points = $derived(
    Array.from({ length: 6 }, (_, i) => {
      const angle = (Math.PI / 3) * i - Math.PI / 2
      return `${x + r * Math.cos(angle)},${y + r * Math.sin(angle)}`
    }).join(' ')
  )
</script>

<polygon {points} {fill} {stroke} />
```

#### 5.5.5 SVG Path Shorthand for Symbols

```javascript
customSymbols={[
  {
    name: 'star',
    path: 'M5,0 L6.2,3.8 L10,3.8 L7,6.2 L8.2,10 L5,7.5 L1.8,10 L3,6.2 L0,3.8 L3.8,3.8 Z'
  }
]}
```

Path-based symbols are rendered via `<path>` with `transform="translate(x,y) scale(size/10)"`.

#### 5.5.6 Precedence & Assignment Order

1. VisualBrewer builds the merged registry (built-in + custom)
2. Assignment iterates the registry in order: built-in patterns first (most visually distinct), then custom patterns
3. If a custom name matches a built-in name, the custom definition replaces it — this lets users override a built-in pattern's appearance while keeping its position in the assignment order
4. Custom palette colors are appended after built-in colors in assignment order

---

## 6. Sparkline Design

### 6.1 Component

```svelte
<!-- Sparkline.svelte -->
<script>
  /** @type {import('./types').SparklineProps} */
  let {
    data,
    type = 'line',
    value,
    unit,
    summary,
    trend,
    width = 200,
    height = 60,
    color = 'currentColor',
    fillColor,
    showAxis = false,
    class: className,
    ...restProps
  } = $props()
</script>

<div class="sparkline {className}" {...restProps}>
  {#if value != null}
    <div class="sparkline-stat">
      {#if trend}
        <span class="sparkline-trend" data-trend={trend}>
          <span class={trend === 'up' ? 'i-lucide:trending-up' : trend === 'down' ? 'i-lucide:trending-down' : 'i-lucide:minus'} />
        </span>
      {/if}
      <span class="sparkline-value">{value}</span>
      {#if unit}<span class="sparkline-unit">{unit}</span>{/if}
    </div>
  {/if}

  <svg {width} {height} viewBox="0 0 {width} {height}" role="img" aria-label={summary || 'Sparkline chart'}>
    {#if type === 'line'}
      <SparklineLine {data} {width} {height} {color} fill={fillColor} />
    {:else if type === 'bar'}
      <SparklineBar {data} {width} {height} {color} />
    {:else if type === 'area'}
      <SparklineArea {data} {width} {height} {color} fill={fillColor} />
    {/if}
  </svg>

  {#if summary}
    <p class="sparkline-summary">{summary}</p>
  {/if}
</div>
```

### 6.2 SVG Rendering (no axes, no labels)

Sparklines compute inline scales without ChartBrewer:

```javascript
function sparklineScale(data, width, height, padding = 2) {
  const values = data.map(d => typeof d === 'number' ? d : d.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  return {
    x: (i) => padding + (i / (values.length - 1)) * (width - padding * 2),
    y: (v) => height - padding - ((v - min) / range) * (height - padding * 2),
    values
  }
}
```

---

## 7. SVG Export

### 7.1 Static Export (`svg-export.js`)

```javascript
/**
 * Serializes a chart SVG element to a downloadable SVG string.
 * Inlines computed CSS styles and embeds pattern <defs>.
 */
export function exportSvg(svgElement, filename = 'chart.svg') {
  // 1. Clone the SVG element
  const clone = svgElement.cloneNode(true)

  // 2. Inline computed styles on all elements
  inlineStyles(clone, svgElement)

  // 3. Set xmlns for standalone SVG
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink')

  // 4. Serialize
  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(clone)

  // 5. Download
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  downloadBlob(blob, filename)
}
```

### 7.2 Raster Export (`raster-export.js`)

```javascript
/**
 * Converts chart SVG to PNG or JPEG via Canvas.
 */
export async function exportRaster(svgElement, format = 'png', scale = 2, filename) {
  const svgString = new XMLSerializer().serializeToString(svgElement)
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml' })
  const url = URL.createObjectURL(svgBlob)

  const img = new Image()
  img.src = url

  await new Promise((resolve) => { img.onload = resolve })

  const canvas = document.createElement('canvas')
  canvas.width = svgElement.clientWidth * scale
  canvas.height = svgElement.clientHeight * scale
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)
  ctx.drawImage(img, 0, 0)

  URL.revokeObjectURL(url)

  const mimeType = format === 'jpeg' ? 'image/jpeg' : 'image/png'
  canvas.toBlob((blob) => {
    downloadBlob(blob, filename || `chart.${format}`)
  }, mimeType, format === 'jpeg' ? 0.92 : undefined)
}
```

### 7.3 Animated SVG Export (`animated-svg-export.js`)

```javascript
/**
 * Generates a standalone animated SVG using SMIL <animate> elements.
 *
 * For each bar/element, generates:
 *   <animate attributeName="width" values="v1;v2;v3" keyTimes="0;0.5;1" dur="Xs" />
 *   <animate attributeName="y"     values="y1;y2;y3" keyTimes="0;0.5;1" dur="Xs" />
 */
export function exportAnimatedSvg(chartElement, keyframes, options = {}) {
  const {
    duration = keyframes.length * 0.4,  // total animation duration in seconds
    repeatCount = 'indefinite',
    filename = 'animated-chart.svg'
  } = options

  // 1. Build base SVG structure (defs, axes, labels)
  // 2. For each data series, collect values across all keyframes
  // 3. Generate <animate> elements with semicolon-separated values
  // 4. Compute keyTimes as evenly spaced 0→1
  // 5. Serialize and download

  const totalDur = `${duration}s`
  const keyTimes = keyframes.map((_, i) => (i / (keyframes.length - 1)).toFixed(4)).join(';')

  // ... build SVG with SMIL animations
}
```

**SMIL animation structure per bar:**

```xml
<g>
  <rect x="0" width="100" height="30">
    <animate attributeName="width"
             values="100;150;120;200"
             keyTimes="0;0.333;0.667;1"
             dur="4s"
             repeatCount="indefinite"
             fill="freeze" />
    <animate attributeName="y"
             values="0;30;0;60"
             keyTimes="0;0.333;0.667;1"
             dur="4s"
             repeatCount="indefinite"
             fill="freeze" />
  </rect>
  <text>
    <animate attributeName="y" ... />
    <!-- Text content updates via <set> elements at keyTimes -->
  </text>
</g>
```

---

## 8. Chart Component Base Pattern

All chart types follow the same structural pattern:

### 8.1 Common Props

```typescript
interface BaseChartProps {
  data: any[]
  width?: number
  height?: number
  margin?: { top: number, right: number, bottom: number, left: number }
  responsive?: boolean          // Use ResizeObserver (default true)
  exportable?: boolean          // Show export toolbar
  exportPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'external'
  accessible?: boolean          // Enable pattern dual-coding (default true)
  theme?: 'light' | 'dark' | 'auto'
  class?: string
}

interface BarChartProps extends BaseChartProps {
  x: string                     // Category field
  y: string                     // Value field
  fill?: string                 // Field for pattern assignment
  pattern?: string              // Field for pattern type assignment
  color?: string                // Field for color assignment
  orientation?: 'vertical' | 'horizontal'
  sorted?: boolean              // Sort bars by value
  barCount?: number             // Max bars to show (for race charts)
}

interface SparklineProps {
  data: number[] | { value: number, label?: string }[]
  type?: 'line' | 'bar' | 'area'
  value?: string | number
  unit?: string
  summary?: string
  trend?: 'up' | 'down' | 'flat'
  width?: number
  height?: number
  color?: string
  fillColor?: string
  showAxis?: boolean
  class?: string
}
```

### 8.2 SVG Structure

All charts render inside a single `<svg>` with this structure:

```xml
<svg class="rokkit-chart" data-chart data-theme="light|dark"
     width="600" height="400" viewBox="0 0 600 400"
     role="img" aria-label="Chart description">
  <title>Chart Title</title>
  <desc>Detailed description for screen readers</desc>

  <!-- Pattern definitions -->
  <defs>
    <pattern id="chart-pat-0">...</pattern>
    <pattern id="chart-pat-1">...</pattern>
  </defs>

  <!-- Chart area (translated by margin) -->
  <g class="chart-area" transform="translate(50, 20)">
    <!-- Grid (bottom layer) -->
    <g class="chart-grid">
      <line ... />
    </g>

    <!-- Data marks (middle layer) -->
    <g class="chart-marks">
      <rect fill="url(#chart-pat-0)" ... />
    </g>

    <!-- Axes (top layer) -->
    <g class="chart-x-axis">...</g>
    <g class="chart-y-axis">...</g>
  </g>

  <!-- Legend (outside chart area) -->
  <g class="chart-legend" transform="translate(...)">...</g>
</svg>

<!-- Export toolbar (HTML, positioned over SVG) -->
<div class="chart-export-toolbar">...</div>
```

---

## 9. Data Integration with @rokkit/data

### 9.1 Rollup for Animation Keyframes

The AnimatedChart uses `@rokkit/data` rollup functions to transform flat data into aligned keyframes:

```javascript
import { groupDataByKeys, fillAlignedData, getAlignGenerator } from '@rokkit/data'

function buildKeyframes(data, timeField, categoryField, valueField) {
  // 1. Group by time field
  const grouped = groupDataByKeys(data, [timeField], [{
    mapper: (row) => row,
    reducers: [{ field: '_items', formula: (arr) => arr }]
  }])

  // 2. Sort by time value
  grouped.sort((a, b) => a[timeField] < b[timeField] ? -1 : 1)

  // 3. Collect all category values across all frames
  const allCategories = [...new Set(data.map(d => d[categoryField]))]

  // 4. Align: fill missing categories with zero values per frame
  const keyframes = grouped.map(frame => {
    const items = frame._items
    const aligned = allCategories.map(cat => {
      const existing = items.find(item => item[categoryField] === cat)
      return existing ?? { [categoryField]: cat, [valueField]: 0, _filled: true }
    })
    return { time: frame[timeField], data: aligned }
  })

  return keyframes
}
```

### 9.2 Rollup Configuration

For consumers who want more control, AnimatedChart accepts a `rollup` prop:

```svelte
<AnimatedChart
  {data}
  timeField="month"
  rollup={{
    groupBy: ['month'],
    summaries: [{
      mapper: (row) => row.revenue,
      reducers: [
        { field: 'totalRevenue', formula: (arr) => arr.reduce((a, b) => a + b, 0) },
        { field: 'avgRevenue', formula: (arr) => arr.reduce((a, b) => a + b, 0) / arr.length }
      ]
    }],
    alignBy: ['category']
  }}
>
  <BarChart x="category" y="totalRevenue" />
</AnimatedChart>
```

---

## 10. Pattern System Migration (Svelte 4 → 5)

### 10.1 Current State

All 9 pattern components + Symbol + Texture are Svelte 4 (`export let`, `$:` reactive). Listed in backlog #58.

### 10.2 Migration Pattern

```svelte
<!-- Before (Svelte 4) -->
<script>
  export let size = 10
  export let fill = 'currentColor'
  export let stroke = 'currentColor'
  $: r = size / 4
</script>

<!-- After (Svelte 5) -->
<script>
  let { size = 10, fill = 'currentColor', stroke = 'currentColor' } = $props()
  let r = $derived(size / 4)
</script>
```

### 10.3 Pattern Registration

Patterns register themselves in SVG `<defs>` via the `DefinePatterns` component (or directly by ChartBrewer):

```svelte
<!-- ChartBrewer generates pattern defs automatically -->
<defs>
  {#each brewer.getPatternDefs() as pat}
    <pattern id={pat.id} patternUnits="userSpaceOnUse" width={pat.size} height={pat.size}>
      <rect width={pat.size} height={pat.size} fill={pat.fillColor} />
      <svelte:component this={pat.component} size={pat.size} fill={pat.fillColor} stroke={pat.strokeColor} />
    </pattern>
  {/each}
</defs>
```

---

## 11. Theme CSS

### 11.1 Base Theme

```css
/* packages/themes/src/base/chart.css */

[data-chart] {
  --chart-bg: var(--surface-1, #ffffff);
  --chart-text: var(--text-1, #1a1a2e);
  --chart-text-muted: var(--text-2, #6b7280);
  --chart-grid: var(--border-1, #e5e7eb);
  --chart-axis: var(--text-2, #4b5563);
}

.chart-timeline {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
}

.chart-timeline input[type="range"] {
  flex: 1;
}

.chart-export-toolbar {
  position: absolute;
  display: flex;
  gap: 0.25rem;
  opacity: 0;
  transition: opacity 150ms ease;
}

[data-chart]:hover .chart-export-toolbar,
.chart-export-toolbar:focus-within {
  opacity: 1;
}

.sparkline {
  display: inline-flex;
  flex-direction: column;
  gap: 0.25rem;
}

.sparkline-stat {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
  font-weight: 600;
}

.sparkline-trend[data-trend="up"] { color: var(--color-success, #22c55e); }
.sparkline-trend[data-trend="down"] { color: var(--color-danger, #ef4444); }
.sparkline-trend[data-trend="flat"] { color: var(--chart-text-muted); }

.sparkline-summary {
  font-size: 0.875rem;
  color: var(--chart-text-muted);
}
```

---

## 12. Implementation Phases

### Phase 1 — Foundation & Static Charts
- [ ] Migrate all pattern/symbol/texture components to Svelte 5 (backlog #58 chart subset)
- [ ] Move `palette.json` from `old_lib/` to `src/`
- [ ] Create `VisualBrewer` class (pattern + color + symbol assignment)
- [ ] Create `Sparkline` component (line, bar, area)
- [ ] Create `ChartExporter` (static SVG + PNG export)
- [ ] Base chart CSS

### Phase 2 — Chart Type Components
- [ ] `BarChart` standalone component (wraps Plot.Root + Plot.Bar + axes + legend)
- [ ] `LineChart` standalone component
- [ ] `AreaChart` standalone component
- [ ] `ScatterPlot` standalone component
- [ ] `PieChart` standalone component
- [ ] Unit tests for each chart type

### Phase 3 — Animation
- [ ] `AnimatedChart` wrapper with keyframe store
- [ ] `TimelineControls` component (play/pause/scrub/speed)
- [ ] Timer system (requestAnimationFrame-based)
- [ ] Custom array-of-objects tweened interpolator
- [ ] Rank computation for bar chart races
- [ ] Integration with `@rokkit/data` rollup
- [ ] `prefers-reduced-motion` support (show final frame)

### Phase 4 — Animated Export & Polish
- [ ] Animated SVG export (SMIL `<animate>` generation)
- [ ] Raster export improvements (resolution, background)
- [ ] Accessibility audit (ARIA, keyboard, screen reader)
- [ ] Playground pages for all chart types
- [ ] Learn site stories

### Phase 5 — Advanced Features
- [ ] Grouped/stacked bar charts
- [ ] Multi-series line/area charts
- [ ] Canvas fallback for large scatter plots
- [ ] Custom easing functions for animations
- [ ] Remove `ramda` dependency (backlog #23)
- [ ] Remove `bits-ui` dependency (backlog #25)

---

## 13. Cross-References

- Requirements: `docs/requirements/020-chart.md`
- Existing chart code: `packages/chart/src/`
- Data rollup: `packages/data/src/rollup.js`
- Pattern library: `packages/chart/src/patterns/`
- Palette: `packages/chart/src/old_lib/palette.json`
- Brewer: `packages/chart/src/old_lib/brewer.js`
- Backlog #23 (ramda removal): `agents/backlog.md`
- Backlog #25 (bits-ui removal): `agents/backlog.md`
- Backlog #58 (Svelte 4→5 migration): `agents/backlog.md`
- FitTrack sparkline reference: fitness `docs/requirements/06-analytics-and-sharing.md`
- FitTrack card rendering: fitness `docs/design/09-analytics-and-sharing.md`
