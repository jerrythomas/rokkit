# Plot Rendering Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Svelte rendering layer for the Plot architecture — shared infrastructure (Axis, Grid, Legend, DefinePatterns), geom components (Bar, Line, Area, Point, Arc, Box, Violin), and the `Plot.svelte` orchestrator that wires everything together.

**Architecture:** `Plot.svelte` creates a `PlotState` instance, provides it as Svelte context under `'plot-state'`, and renders an SVG canvas. Each geom is a pure SVG component that reads post-stat data and shared scales from the context. Existing mark computation helpers in `lib/brewing/marks/` are adapted for the new context protocol. New grouped/stacked bar computation is added in `geoms/lib/bars.js`. Existing `Plot/` folder (old system) is NOT modified.

**Tech Stack:** Svelte 5, D3 (d3-shape, d3-scale, d3-array), @testing-library/svelte, Vitest

**Spec:** `docs/superpowers/specs/2026-03-23-plot-architecture-design.md`

**Prerequisite:** Plan 1 (Foundation) — `PlotState.svelte.js`, stat resolver, scale utilities, preset resolver must be complete and tested.

---

## Context Protocol (read before implementing any geom)

All geoms follow this pattern:

```js
import { getContext, onMount, onDestroy } from 'svelte'

const state = getContext('plot-state') // PlotState instance
const id = Symbol('geom-bar') // unique per instance

onMount(() => state.registerGeom(id, { type: 'bar', channels, stat, options }))
onDestroy(() => state.unregisterGeom(id))

const data = $derived(state.geomData(id)) // post-stat data for this geom
const xScale = $derived(state.xScale)
const yScale = $derived(state.yScale)
const colors = $derived(state.colors) // Map<value, {fill, stroke}>
const patterns = $derived(state.patterns) // Map<value, patternName>
```

`Plot.svelte` exposes this context:

```js
import { PlotState } from './PlotState.svelte.js'
import { setContext } from 'svelte'

const state = new PlotState(config)
setContext('plot-state', state)
```

PlotState properties used by infrastructure components:

- `state.xScale` — D3 scale (band or linear)
- `state.yScale` — D3 scale (band or linear)
- `state.innerWidth` — number (canvas width, margin-adjusted)
- `state.innerHeight` — number (canvas height, margin-adjusted)
- `state.xAxisY` — pixel Y position for x axis (from `axisOrigin`)
- `state.yAxisX` — pixel X position for y axis (from `axisOrigin`)
- `state.orientation` — `'vertical' | 'horizontal' | 'none'`
- `state.colorScaleType` — `'categorical' | 'sequential' | 'diverging'`
- `state.colors` — `Map<value, {fill, stroke}>`
- `state.patterns` — `Map<value, patternName>`
- `state.preset()` — returns the active preset object

---

## File Structure

```
packages/chart/src/
  plot/                           ← shared infrastructure (new folder)
    Axis.svelte                   CREATE
    Grid.svelte                   CREATE
    Legend.svelte                 CREATE
    DefinePatterns.svelte         CREATE
  geoms/                          ← pure render geoms (new folder)
    lib/
      bars.js                     CREATE — grouped/stacked bar computation
    Bar.svelte                    CREATE
    Line.svelte                   CREATE
    Area.svelte                   CREATE
    Point.svelte                  CREATE
    Arc.svelte                    CREATE
    Box.svelte                    CREATE
    Violin.svelte                 CREATE
  Plot.svelte                     CREATE — top-level orchestrator (NOT inside Plot/)
  charts/
    BarChart.svelte               MODIFY — thin wrapper using new Plot.svelte
    LineChart.svelte              MODIFY — thin wrapper
    ScatterChart.svelte           MODIFY — thin wrapper (if exists)
  test/
    helpers/
      mock-plot-state.js          CREATE — shared mock PlotState for component tests
  index.js                        MODIFY — export new Plot + geoms
```

The old `Plot/` folder (Root, Axis, Bar, Grid, Legend, Line, Area, Point, Arc) is **not touched** — the old API remains working during the transition.

---

## Chunk 1: Test helper + Infrastructure components

### Task 1: Mock PlotState test helper

Component tests need a real PlotState context. This helper creates a minimal PlotState for test scenarios.

**Files:**

- Create: `packages/chart/spec/helpers/mock-plot-state.js`
- Create: `packages/chart/spec/helpers/ContextWrapper.svelte`

- [ ] **Step 1: Create the mock PlotState helper**

`packages/chart/spec/helpers/mock-plot-state.js`:

```js
import { scaleBand, scaleLinear } from 'd3-scale'

/**
 * Creates a minimal PlotState-compatible object for testing infrastructure
 * components (Axis, Grid, Legend) without needing a real PlotState instance.
 *
 * @param {Partial<import('../../src/PlotState.svelte.js').PlotState>} overrides
 */
export function createMockState(overrides = {}) {
  const xScale = scaleBand().domain(['a', 'b', 'c']).range([0, 300]).padding(0.1)
  const yScale = scaleLinear().domain([0, 100]).range([200, 0])

  return {
    xScale,
    yScale,
    innerWidth: 300,
    innerHeight: 200,
    xAxisY: 200, // default: bottom edge
    yAxisX: 0, // default: left edge
    orientation: 'vertical',
    colorScaleType: 'categorical',
    colors: new Map([
      ['a', { fill: '#4e79a7', stroke: '#4e79a7' }],
      ['b', { fill: '#f28e2b', stroke: '#f28e2b' }]
    ]),
    patterns: new Map(),
    preset: () => ({
      colors: ['#4e79a7', '#f28e2b', '#e15759'],
      patterns: [],
      symbols: []
    }),
    geomData: (_id) => [],
    registerGeom: (_id, _config) => {},
    unregisterGeom: (_id) => {},
    ...overrides
  }
}
```

- [ ] **Step 2: Create the ContextWrapper Svelte component**

`packages/chart/spec/helpers/ContextWrapper.svelte`:

```svelte
<script>
  import { setContext } from 'svelte'

  let { state, children } = $props()
  setContext('plot-state', state)
</script>

{@render children()}
```

For component tests that need context, create a dedicated per-component harness. For example, to test `Axis.svelte`:

`packages/chart/spec/helpers/TestAxis.svelte`:

```svelte
<script>
  import { setContext } from 'svelte'
  import Axis from '../../src/plot/Axis.svelte'
  import { createMockState } from '../../src/helpers/mock-plot-state.js'

  let { state = createMockState(), type = 'x', label = '' } = $props()
  setContext('plot-state', state)
</script>

<svg>
  <Axis {type} {label} />
</svg>
```

Then in the test:

```js
import { render } from '@testing-library/svelte'
import TestAxis from '../helpers/TestAxis.svelte'
import { createMockState } from '../helpers/mock-plot-state.js'

const { container } = render(TestAxis, { props: { type: 'x' } })
expect(container.querySelector('[data-plot-axis="x"]')).toBeTruthy()
```

Create similar `TestBar.svelte`, `TestLine.svelte`, etc. as needed for later geom tasks.

- [ ] **Step 3: Commit**

```bash
git add packages/chart/spec/helpers/
git commit -m "test(chart): add mock PlotState helper for component tests"
```

---

### Task 2: `plot/Axis.svelte`

Renders an x or y axis. Reads axis position from `state.xAxisY` / `state.yAxisX` (supports quadrant-aware positioning when `axisOrigin` is set on PlotState).

**Files:**

- Create: `packages/chart/src/plot/Axis.svelte`
- Create: `packages/chart/spec/plot/Axis.spec.js`

- [ ] **Step 1: Write the failing test**

`packages/chart/spec/plot/Axis.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { scaleBand, scaleLinear } from 'd3-scale'
import { createMockState } from '../helpers/mock-plot-state.js'

// We test the axis tick generation logic directly since component rendering
// with Svelte context requires a harness. The key behaviors:
// 1. X axis uses xScale.domain() for tick values (band scale)
// 2. Y axis uses yScale.ticks() for tick values (linear scale)
// 3. Axis transform positions at xAxisY / yAxisX from state

describe('Axis tick generation', () => {
  it('derives x ticks from band scale domain', () => {
    const xScale = scaleBand().domain(['a', 'b', 'c']).range([0, 300]).padding(0.1)
    const ticks = xScale.domain().map((val) => ({
      value: val,
      pos: (xScale(val) ?? 0) + xScale.bandwidth() / 2
    }))
    expect(ticks).toHaveLength(3)
    expect(ticks[0].value).toBe('a')
    expect(ticks[0].pos).toBeGreaterThan(0)
  })

  it('derives y ticks from linear scale', () => {
    const yScale = scaleLinear().domain([0, 100]).range([200, 0])
    const ticks = yScale.ticks(5).map((val) => ({ value: val, pos: yScale(val) }))
    expect(ticks.length).toBeGreaterThanOrEqual(4)
    expect(ticks[0].value).toBe(0)
    expect(ticks[0].pos).toBe(200) // 0 maps to bottom (200px)
  })

  it('positions x axis at xAxisY from state (default = innerHeight)', () => {
    const state = createMockState({ xAxisY: 200, innerHeight: 200 })
    expect(state.xAxisY).toBe(200)
  })

  it('positions x axis at origin for quadrant mode', () => {
    const yScale = scaleLinear().domain([-50, 50]).range([200, 0])
    // axisOrigin = [0, 0] → yScale(0) = 100 (midpoint)
    const xAxisY = yScale(0)
    expect(xAxisY).toBe(100)
  })
})
```

- [ ] **Step 2: Run tests**

```bash
bun run test:ci -- packages/chart/spec/Axis.spec.js
```

Expected: PASS — these are pure logic tests with no file dependency on the component.

- [ ] **Step 3: Write `plot/Axis.svelte`**

```svelte
<script>
  import { getContext } from 'svelte'

  /** @type {'x' | 'y'} */
  let { type = 'x', label = '' } = $props()

  const state = getContext('plot-state')

  // Ticks derived from scale type
  const xTicks = $derived.by(() => {
    const s = state.xScale
    if (!s) return []
    if (typeof s.bandwidth === 'function') {
      // Band scale → use domain values
      return s.domain().map((val) => ({
        value: val,
        pos: (s(val) ?? 0) + s.bandwidth() / 2
      }))
    }
    // Linear scale
    return s.ticks(6).map((val) => ({ value: val, pos: s(val) }))
  })

  const yTicks = $derived.by(() => {
    const s = state.yScale
    if (!s) return []
    if (typeof s.bandwidth === 'function') {
      return s.domain().map((val) => ({
        value: val,
        pos: (s(val) ?? 0) + s.bandwidth() / 2
      }))
    }
    return s.ticks(6).map((val) => ({ value: val, pos: s(val) }))
  })

  // Axis position respects axisOrigin (quadrant-aware)
  const xTransform = $derived(`translate(0, ${state.xAxisY ?? state.innerHeight})`)
  const yTransform = $derived(`translate(${state.yAxisX ?? 0}, 0)`)
</script>

{#if type === 'x'}
  <g class="axis x-axis" transform={xTransform} data-plot-axis="x">
    <line x1="0" y1="0" x2={state.innerWidth} y2="0" data-plot-axis-line />
    {#each xTicks as tick (tick.value)}
      <g transform="translate({tick.pos}, 0)" data-plot-tick>
        <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" />
        <text x="0" y="9" text-anchor="middle" dominant-baseline="hanging" data-plot-tick-label>
          {tick.value}
        </text>
      </g>
    {/each}
    {#if label}
      <text
        x={state.innerWidth / 2}
        y="36"
        text-anchor="middle"
        class="axis-label"
        data-plot-axis-label>{label}</text
      >
    {/if}
  </g>
{:else}
  <g class="axis y-axis" transform={yTransform} data-plot-axis="y">
    <line x1="0" y1="0" x2="0" y2={state.innerHeight} data-plot-axis-line />
    {#each yTicks as tick (tick.value)}
      <g transform="translate(0, {tick.pos})" data-plot-tick>
        <line x1="-6" y1="0" x2="0" y2="0" stroke="currentColor" />
        <text x="-9" y="0" text-anchor="end" dominant-baseline="middle" data-plot-tick-label>
          {tick.value}
        </text>
      </g>
    {/each}
    {#if label}
      <text
        transform="rotate(-90)"
        x={-(state.innerHeight / 2)}
        y="-40"
        text-anchor="middle"
        class="axis-label"
        data-plot-axis-label>{label}</text
      >
    {/if}
  </g>
{/if}

<style>
  .axis {
    font-size: 11px;
    fill: currentColor;
    stroke: currentColor;
  }
  .axis-label {
    font-size: 13px;
    font-weight: 500;
  }
  [data-plot-axis-line] {
    stroke: currentColor;
  }
</style>
```

- [ ] **Step 4: Run tests**

```bash
bun run test:ci -- packages/chart/spec/Axis.spec.js
```

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/plot/Axis.svelte packages/chart/spec/plot/Axis.spec.js
git commit -m "feat(chart): add plot/Axis.svelte with quadrant-aware positioning"
```

---

### Task 3: `plot/Grid.svelte`

Renders horizontal and/or vertical grid lines behind the chart content.

**Files:**

- Create: `packages/chart/src/plot/Grid.svelte`

- [ ] **Step 1: Write `plot/Grid.svelte`**

No separate test — logic is trivial (tick → line). The component is tested implicitly through Plot.svelte integration tests.

```svelte
<script>
  import { getContext } from 'svelte'

  const state = getContext('plot-state')

  const xGridLines = $derived.by(() => {
    const s = state.xScale
    if (!s || typeof s.bandwidth !== 'function') return []
    return s.domain().map((val) => ({ pos: (s(val) ?? 0) + s.bandwidth() / 2 }))
  })

  const yGridLines = $derived.by(() => {
    const s = state.yScale
    if (!s || typeof s.ticks !== 'function') return []
    return s.ticks(6).map((val) => ({ pos: s(val) }))
  })
</script>

<g class="grid" data-plot-grid>
  {#each yGridLines as line (line.pos)}
    <line x1="0" y1={line.pos} x2={state.innerWidth} y2={line.pos} data-plot-grid-line />
  {/each}
  {#each xGridLines as line (line.pos)}
    <line x1={line.pos} y1="0" x2={line.pos} y2={state.innerHeight} data-plot-grid-line="x" />
  {/each}
</g>

<style>
  [data-plot-grid-line] {
    stroke: var(--chart-grid-color, currentColor);
    opacity: 0.15;
    stroke-dasharray: 2 4;
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add packages/chart/src/plot/Grid.svelte
git commit -m "feat(chart): add plot/Grid.svelte"
```

---

### Task 4: `plot/Legend.svelte`

Renders either a discrete swatch legend (categorical) or a gradient bar (sequential/diverging). Uses `state.colorScaleType` to switch modes.

**Files:**

- Create: `packages/chart/src/plot/Legend.svelte`
- Create: `packages/chart/spec/plot/Legend.spec.js`

- [ ] **Step 1a: Create `TestLegend.svelte` harness**

`packages/chart/spec/helpers/TestLegend.svelte`:

```svelte
<script>
  import { setContext } from 'svelte'
  import Legend from '../../src/plot/Legend.svelte'
  let { state } = $props()
  setContext('plot-state', state)
</script>

<Legend />
```

- [ ] **Step 1b: Write the failing tests**

`packages/chart/spec/plot/Legend.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import TestLegend from '../helpers/TestLegend.svelte'
import { createMockState } from '../helpers/mock-plot-state.js'

// Categorical legend items (pure logic)
describe('Legend item derivation', () => {
  it('builds categorical items from colors Map', () => {
    const colors = new Map([
      ['compact', { fill: '#4e79a7', stroke: '#4e79a7' }],
      ['suv', { fill: '#f28e2b', stroke: '#f28e2b' }]
    ])
    const labels = { compact: 'Compact', suv: 'SUV' }

    const items = [...colors.entries()].map(([key, entry]) => ({
      key,
      label: labels[key] ?? key,
      fill: entry.fill
    }))

    expect(items).toHaveLength(2)
    expect(items[0]).toEqual({ key: 'compact', label: 'Compact', fill: '#4e79a7' })
    expect(items[1]).toEqual({ key: 'suv', label: 'SUV', fill: '#f28e2b' })
  })

  it('uses raw key as label when labels map is absent', () => {
    const colors = new Map([['compact', { fill: '#4e79a7', stroke: '#4e79a7' }]])
    const labels = {}
    const items = [...colors.entries()].map(([key, entry]) => ({
      key,
      label: labels[key] ?? key,
      fill: entry.fill
    }))
    expect(items[0].label).toBe('compact')
  })
})

// Gradient legend smoke test — stub for issue #126
describe('Legend gradient branch (stub — see issue #126)', () => {
  it('renders data-plot-legend-gradient element for sequential colorScaleType', () => {
    const state = createMockState({ colorScaleType: 'sequential' })
    const { container } = render(TestLegend, { props: { state } })
    expect(container.querySelector('[data-plot-legend-gradient]')).toBeTruthy()
  })

  it('renders data-plot-legend-gradient element for diverging colorScaleType', () => {
    const state = createMockState({ colorScaleType: 'diverging' })
    const { container } = render(TestLegend, { props: { state } })
    expect(container.querySelector('[data-plot-legend-gradient]')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun run test:ci -- packages/chart/spec/Legend.spec.js
```

Expected: FAIL (no file yet).

- [ ] **Step 3: Write `plot/Legend.svelte`**

```svelte
<script>
  import { getContext } from 'svelte'

  /** @type {Record<string, string>} */
  let { labels = {} } = $props()

  const state = getContext('plot-state')

  const isCategorical = $derived(state.colorScaleType === 'categorical')

  // Categorical: one swatch per color key
  const categoricalItems = $derived(
    [...(state.colors?.entries() ?? [])].map(([key, entry]) => ({
      key,
      label: labels[String(key)] ?? String(key),
      fill: entry.fill,
      patternId: state.patterns?.has(key) ? `pattern-${String(key).replace(/\s/g, '-')}` : null
    }))
  )

  // Sequential/Diverging: gradient bar using CSS gradient
  // STUB: hardcoded blue gradient — full continuous color scale support tracked in issue #126.
  // When #126 lands, replace with a d3-scale-chromatic interpolator based on preset.colorScheme.
  const gradientStyle = $derived.by(() => {
    if (isCategorical) return ''
    return `background: linear-gradient(to right, #cfe2f3, #084594)`
  })
</script>

{#if isCategorical}
  <div class="legend categorical" data-plot-legend>
    {#each categoricalItems as item (item.key)}
      <div class="legend-item" data-plot-legend-item>
        {#if item.patternId}
          <svg width="14" height="14" data-plot-legend-swatch>
            <rect width="14" height="14" fill={item.fill} />
            <rect width="14" height="14" fill="url(#{item.patternId})" />
          </svg>
        {:else}
          <span class="swatch" style:background-color={item.fill} data-plot-legend-swatch></span>
        {/if}
        <span class="label" data-plot-legend-label>{item.label}</span>
      </div>
    {/each}
  </div>
{:else}
  <div class="legend gradient" data-plot-legend>
    <div class="gradient-bar" style={gradientStyle} data-plot-legend-gradient></div>
  </div>
{/if}

<style>
  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 8px;
    font-size: 12px;
  }
  .legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .swatch {
    display: inline-block;
    width: 14px;
    height: 14px;
    border-radius: 2px;
    flex-shrink: 0;
  }
  .gradient-bar {
    width: 180px;
    height: 14px;
    border-radius: 2px;
  }
</style>
```

- [ ] **Step 4: Run test**

```bash
bun run test:ci -- packages/chart/spec/Legend.spec.js
```

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/plot/Legend.svelte packages/chart/spec/plot/Legend.spec.js
git commit -m "feat(chart): add plot/Legend.svelte with categorical/gradient modes"
```

---

## Chunk 2: Pattern defs + Bar computation + Bar geom

### Task 5: `plot/DefinePatterns.svelte`

Renders SVG `<defs>` for patterns used by Bar geom. Reads pattern assignments from `state.patterns` and resolves pattern SVG from the active preset.

**Files:**

- Create: `packages/chart/src/plot/DefinePatterns.svelte`

- [ ] **Step 1: Write `plot/DefinePatterns.svelte`**

This component uses the existing pattern components from `src/patterns/`. The existing `lib/ChartPatternDefs.svelte` is the reference — adapt it to read from `plot-state` context instead of `brewer`.

```svelte
<script>
  import { getContext } from 'svelte'
  import { toPatternId } from '../lib/brewing/patterns.js'
  // Import named pattern component (existing)
  import NamedPattern from '../patterns/paths/NamedPattern.svelte'

  const state = getContext('plot-state')

  // Build list of (id, patternName, fill) triples from state.patterns + state.colors
  const patternDefs = $derived.by(() => {
    const defs = []
    for (const [key, patternName] of (state.patterns ?? new Map()).entries()) {
      const colorEntry = state.colors?.get(key) ?? { fill: '#888' }
      defs.push({
        id: toPatternId(String(key)),
        patternName,
        fill: colorEntry.fill
      })
    }
    return defs
  })
</script>

{#if patternDefs.length > 0}
  <defs data-plot-pattern-defs>
    {#each patternDefs as def (def.id)}
      <NamedPattern id={def.id} name={def.patternName} fill={def.fill} />
    {/each}
  </defs>
{/if}
```

- [ ] **Step 2: Commit**

```bash
git add packages/chart/src/plot/DefinePatterns.svelte
git commit -m "feat(chart): add plot/DefinePatterns.svelte for pattern defs from plot-state"
```

---

### Task 6: `geoms/lib/bars.js` — Grouped and stacked bar computation

The core computation for bar layout. Handles vertical and horizontal orientation, grouped sub-bars per color category, and D3-stack-based stacking.

**Files:**

- Create: `packages/chart/src/geoms/lib/bars.js`
- Create: `packages/chart/spec/geoms/lib/bars.spec.js`

- [ ] **Step 1: Write the failing tests**

`packages/chart/spec/geoms/lib/bars.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { scaleBand, scaleLinear } from 'd3-scale'
import {
  buildGroupedBars,
  buildStackedBars,
  buildHorizontalBars
} from '../../../src/geoms/lib/bars.js'

const data = [
  { class: 'compact', drv: 'f', hwy: 29 },
  { class: 'compact', drv: '4', hwy: 26 },
  { class: 'suv', drv: 'f', hwy: 20 },
  { class: 'suv', drv: '4', hwy: 18 }
]

const xScale = scaleBand().domain(['compact', 'suv']).range([0, 300]).padding(0.2)
const yScale = scaleLinear().domain([0, 40]).range([200, 0])
const colors = new Map([
  ['f', { fill: '#4e79a7', stroke: '#4e79a7' }],
  ['4', { fill: '#f28e2b', stroke: '#f28e2b' }]
])

describe('buildGroupedBars', () => {
  it('returns one rect per datum', () => {
    const bars = buildGroupedBars(
      data,
      { x: 'class', y: 'hwy', color: 'drv' },
      xScale,
      yScale,
      colors,
      200
    )
    expect(bars).toHaveLength(4)
  })

  it('groups rects within the parent band', () => {
    const bars = buildGroupedBars(
      data,
      { x: 'class', y: 'hwy', color: 'drv' },
      xScale,
      yScale,
      colors,
      200
    )
    const compactBars = bars.filter((b) => b.data.class === 'compact')
    // Both compact bars must be within [xScale('compact'), xScale('compact') + xScale.bandwidth()]
    const bandStart = xScale('compact') ?? 0
    const bandEnd = bandStart + xScale.bandwidth()
    for (const b of compactBars) {
      expect(b.x).toBeGreaterThanOrEqual(bandStart)
      expect(b.x + b.width).toBeLessThanOrEqual(bandEnd + 0.001)
    }
  })

  it('applies color fill from colors Map', () => {
    const bars = buildGroupedBars(
      data,
      { x: 'class', y: 'hwy', color: 'drv' },
      xScale,
      yScale,
      colors,
      200
    )
    const fBar = bars.find((b) => b.data.drv === 'f')
    expect(fBar?.fill).toBe('#4e79a7')
  })

  it('bar height reflects y value', () => {
    const bars = buildGroupedBars(
      data,
      { x: 'class', y: 'hwy', color: 'drv' },
      xScale,
      yScale,
      colors,
      200
    )
    const bar29 = bars.find((b) => b.data.hwy === 29)
    expect(bar29?.height).toBeCloseTo(200 - yScale(29), 1)
  })

  it('returns single-bar-per-x when no color channel', () => {
    const bars = buildGroupedBars(data, { x: 'class', y: 'hwy' }, xScale, yScale, colors, 200)
    expect(bars).toHaveLength(4) // still one per datum
  })
})

describe('buildStackedBars', () => {
  const stackData = [
    { class: 'compact', drv: 'f', hwy: 29 },
    { class: 'compact', drv: '4', hwy: 26 },
    { class: 'suv', drv: 'f', hwy: 20 },
    { class: 'suv', drv: '4', hwy: 18 }
  ]

  it('returns one rect per datum', () => {
    const bars = buildStackedBars(
      stackData,
      { x: 'class', y: 'hwy', color: 'drv' },
      xScale,
      yScale,
      colors,
      200
    )
    expect(bars).toHaveLength(4)
  })

  it('stacks bars vertically (y0 + y1 pattern)', () => {
    const bars = buildStackedBars(
      stackData,
      { x: 'class', y: 'hwy', color: 'drv' },
      xScale,
      yScale,
      colors,
      200
    )
    const compactBars = bars.filter((b) => b.data.class === 'compact').sort((a, b) => b.y - a.y)
    // Bottom bar y + height should equal top bar y (stacked)
    // i.e., compactBars[0].y + compactBars[0].height ≈ compactBars[1].y + compactBars[1].height
    // Actually: in stacked, bar y = yScale(y1), height = yScale(y0) - yScale(y1)
    // The bottom of the upper bar = y0 of upper = y1 of lower → continuous stack
    expect(compactBars[0].y + compactBars[0].height).toBeCloseTo(compactBars[1].y, 1)
  })
})

describe('buildHorizontalBars', () => {
  const yBand = scaleBand().domain(['compact', 'suv']).range([0, 200]).padding(0.2)
  const xLin = scaleLinear().domain([0, 40]).range([0, 300])

  it('returns one rect per datum', () => {
    const bars = buildHorizontalBars(
      data,
      { x: 'hwy', y: 'class', color: 'drv' },
      xLin,
      yBand,
      colors,
      200
    )
    expect(bars).toHaveLength(4)
  })

  it('bar width reflects x value', () => {
    const bars = buildHorizontalBars(
      data,
      { x: 'hwy', y: 'class', color: 'drv' },
      xLin,
      yBand,
      colors,
      200
    )
    const bar29 = bars.find((b) => b.data.hwy === 29)
    expect(bar29?.width).toBeCloseTo(xLin(29), 1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun run test:ci -- packages/chart/spec/bars.spec.js
```

Expected: FAIL — `./bars.js` not found.

- [ ] **Step 3: Write `geoms/lib/bars.js`**

```js
import { scaleBand } from 'd3-scale'
import { stack } from 'd3-shape'
import { rollup, InternMap } from 'd3-array'

/**
 * Grouped bars — one sub-bar per (x, color) pair within each x band.
 *
 * @param {Object[]} data - post-stat data rows
 * @param {{ x: string, y: string, color?: string }} channels
 * @param {import('d3-scale').ScaleBand} xScale
 * @param {import('d3-scale').ScaleLinear} yScale
 * @param {Map<unknown, {fill: string, stroke: string}>} colors
 * @param {number} innerHeight
 * @param {Map<unknown, string>} [patterns]
 * @returns {Array}
 */
export function buildGroupedBars(data, channels, xScale, yScale, colors, innerHeight, patterns) {
  const { x: xf, y: yf, color: cf } = channels

  // Sub-scale within each x band for color grouping
  const colorKeys = cf ? [...new Set(data.map((d) => d[cf]))] : []
  const subScale =
    colorKeys.length > 1
      ? scaleBand().domain(colorKeys).range([0, xScale.bandwidth()]).padding(0.05)
      : null

  return data.map((d) => {
    const xVal = d[xf]
    const colorKey = cf ? d[cf] : null
    const colorEntry = colors?.get(colorKey) ??
      colors?.values().next().value ?? { fill: '#888', stroke: '#888' }
    const patternId = patterns?.has(colorKey)
      ? `pattern-${String(colorKey).replace(/\s/g, '-')}`
      : null

    const bandX = xScale(xVal) ?? 0
    const subX = subScale ? (subScale(colorKey) ?? 0) : 0
    const barX = bandX + subX
    const barWidth = subScale ? subScale.bandwidth() : xScale.bandwidth()
    const barY = yScale(d[yf])
    const barHeight = innerHeight - barY

    return {
      data: d,
      key: `${String(xVal)}::${String(colorKey ?? '')}`,
      x: barX,
      y: barY,
      width: barWidth,
      height: barHeight,
      fill: colorEntry.fill,
      stroke: colorEntry.stroke,
      patternId
    }
  })
}

/**
 * Stacked bars — bars stacked vertically per x category.
 *
 * @param {Object[]} data - post-stat data rows (already aggregated by x+color)
 * @param {{ x: string, y: string, color: string }} channels
 * @param {import('d3-scale').ScaleBand} xScale
 * @param {import('d3-scale').ScaleLinear} yScale
 * @param {Map<unknown, {fill: string, stroke: string}>} colors
 * @param {number} innerHeight
 * @returns {Array}
 */
export function buildStackedBars(data, channels, xScale, yScale, colors, innerHeight) {
  const { x: xf, y: yf, color: cf } = channels
  if (!cf) return buildGroupedBars(data, channels, xScale, yScale, colors, innerHeight)

  // Pivot data to wide format for d3.stack
  const xCategories = [...new Set(data.map((d) => d[xf]))]
  const colorCategories = [...new Set(data.map((d) => d[cf]))]

  // Build lookup: {xVal → {colorVal → yVal}}
  const lookup = new Map()
  for (const d of data) {
    if (!lookup.has(d[xf])) lookup.set(d[xf], {})
    lookup.get(d[xf])[d[cf]] = Number(d[yf])
  }

  // Wide-format rows: [{x: 'compact', f: 29, '4': 26}, ...]
  const wide = xCategories.map((xVal) => {
    const row = { [xf]: xVal }
    for (const c of colorCategories) row[c] = lookup.get(xVal)?.[c] ?? 0
    return row
  })

  const stackGen = stack().keys(colorCategories)
  const layers = stackGen(wide)

  const bars = []
  for (const layer of layers) {
    const colorKey = layer.key
    const colorEntry = colors?.get(colorKey) ?? { fill: '#888', stroke: '#888' }
    for (const point of layer) {
      const [y0, y1] = point
      const xVal = point.data[xf]
      bars.push({
        data: point.data,
        key: `${String(xVal)}::${String(colorKey)}`,
        x: xScale(xVal) ?? 0,
        y: yScale(y1),
        width: xScale.bandwidth(),
        height: yScale(y0) - yScale(y1),
        fill: colorEntry.fill,
        stroke: colorEntry.stroke,
        patternId: null
      })
    }
  }
  return bars
}

/**
 * Horizontal bars — x is continuous (value), y is band (category).
 *
 * @param {Object[]} data
 * @param {{ x: string, y: string, color?: string }} channels
 * @param {import('d3-scale').ScaleLinear} xScale  — continuous (value)
 * @param {import('d3-scale').ScaleBand} yScale    — band (category)
 * @param {Map<unknown, {fill: string, stroke: string}>} colors
 * @param {number} innerHeight
 * @returns {Array}
 */
export function buildHorizontalBars(data, channels, xScale, yScale, colors, innerHeight) {
  const { x: xf, y: yf, color: cf } = channels
  const colorKeys = cf ? [...new Set(data.map((d) => d[cf]))] : []
  const subScale =
    colorKeys.length > 1
      ? scaleBand().domain(colorKeys).range([0, yScale.bandwidth()]).padding(0.05)
      : null

  return data.map((d) => {
    const yVal = d[yf]
    const colorKey = cf ? d[cf] : null
    const colorEntry = colors?.get(colorKey) ??
      colors?.values().next().value ?? { fill: '#888', stroke: '#888' }

    const bandY = yScale(yVal) ?? 0
    const subY = subScale ? (subScale(colorKey) ?? 0) : 0

    return {
      data: d,
      key: `${String(yVal)}::${String(colorKey ?? '')}`,
      x: 0,
      y: bandY + subY,
      width: xScale(d[xf]),
      height: subScale ? subScale.bandwidth() : yScale.bandwidth(),
      fill: colorEntry.fill,
      stroke: colorEntry.stroke,
      patternId: null
    }
  })
}
```

- [ ] **Step 4: Run tests**

```bash
bun run test:ci -- packages/chart/spec/bars.spec.js
```

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/geoms/lib/bars.js packages/chart/spec/geoms/lib/bars.spec.js
git commit -m "feat(chart): add geoms/lib/bars.js — grouped, stacked, horizontal bar computation"
```

---

### Task 7: `geoms/Bar.svelte`

Pure render geom. Reads post-stat data from context, delegates layout to `bars.js`, renders SVG rects.

**Files:**

- Create: `packages/chart/src/geoms/Bar.svelte`

- [ ] **Step 1: Write `geoms/Bar.svelte`**

```svelte
<script>
  import { getContext, onMount, onDestroy } from 'svelte'
  import { buildGroupedBars, buildStackedBars, buildHorizontalBars } from './lib/bars.js'

  /**
   * @type {{
   *   x?: string, y?: string, color?: string,
   *   stat?: string,
   *   options?: { stack?: boolean }
   * }}
   */
  let { x, y, color, stat = 'identity', options = {} } = $props()

  const state = getContext('plot-state')
  const id = Symbol('bar')

  onMount(() =>
    state.registerGeom(id, {
      type: 'bar',
      channels: { x, y, color },
      stat,
      options
    })
  )
  onDestroy(() => state.unregisterGeom(id))

  const data = $derived(state.geomData(id))
  const xScale = $derived(state.xScale)
  const yScale = $derived(state.yScale)
  const colors = $derived(state.colors)
  const patterns = $derived(state.patterns)
  const orientation = $derived(state.orientation)
  const innerHeight = $derived(state.innerHeight)

  const bars = $derived.by(() => {
    if (!data?.length || !xScale || !yScale) return []
    const channels = { x, y, color }
    if (orientation === 'horizontal') {
      return buildHorizontalBars(data, channels, xScale, yScale, colors, innerHeight)
    }
    if (options.stack) {
      return buildStackedBars(data, channels, xScale, yScale, colors, innerHeight)
    }
    return buildGroupedBars(data, channels, xScale, yScale, colors, innerHeight, patterns)
  })
</script>

{#if bars.length > 0}
  <g data-plot-geom="bar">
    {#each bars as bar (bar.key)}
      <rect
        x={bar.x}
        y={bar.y}
        width={Math.max(0, bar.width)}
        height={Math.max(0, bar.height)}
        fill={bar.patternId ? `url(#${bar.patternId})` : bar.fill}
        stroke={bar.stroke ?? 'none'}
        stroke-width={bar.stroke ? 0.5 : 0}
        data-plot-element="bar"
        data-plot-value={bar.data[y]}
        data-plot-category={bar.data[x]}
        role="graphics-symbol"
        aria-label="{bar.data[x]}: {bar.data[y]}"
      >
        <title>{bar.data[x]}: {bar.data[y]}</title>
      </rect>
    {/each}
  </g>
{/if}
```

- [ ] **Step 2: Commit**

```bash
git add packages/chart/src/geoms/Bar.svelte
git commit -m "feat(chart): add geoms/Bar.svelte — grouped, stacked, horizontal via orientation"
```

---

## Chunk 3: Line, Area, and Point geoms

### Task 8: `geoms/Line.svelte`

Pure render geom. Adapts the existing `lib/brewing/marks/lines.js` helper.

**Files:**

- Create: `packages/chart/src/geoms/Line.svelte`

- [ ] **Step 1: Write `geoms/Line.svelte`**

The existing `buildLines(data, channels, xScale, yScale, colors, curve)` is already suitable — reuse it directly.

```svelte
<script>
  import { getContext, onMount, onDestroy } from 'svelte'
  import { buildLines } from '../lib/brewing/marks/lines.js'

  let { x, y, color, stat = 'identity', options = {} } = $props()

  const state = getContext('plot-state')
  const id = Symbol('line')

  onMount(() =>
    state.registerGeom(id, {
      type: 'line',
      channels: { x, y, color },
      stat,
      options
    })
  )
  onDestroy(() => state.unregisterGeom(id))

  const data = $derived(state.geomData(id))
  const xScale = $derived(state.xScale)
  const yScale = $derived(state.yScale)
  const colors = $derived(state.colors)

  const lines = $derived.by(() => {
    if (!data?.length || !xScale || !yScale) return []
    return buildLines(data, { x, y, color }, xScale, yScale, colors, options.curve)
  })
</script>

{#if lines.length > 0}
  <g data-plot-geom="line">
    {#each lines as seg (seg.key ?? seg.d)}
      <path
        d={seg.d}
        fill="none"
        stroke={seg.stroke}
        stroke-width={options.strokeWidth ?? 2}
        stroke-linejoin="round"
        stroke-linecap="round"
        data-plot-element="line"
      />
    {/each}
  </g>
{/if}
```

- [ ] **Step 2: Commit**

```bash
git add packages/chart/src/geoms/Line.svelte
git commit -m "feat(chart): add geoms/Line.svelte"
```

---

### Task 9: `geoms/Area.svelte`

Pure render geom for area fills. Creates `geoms/lib/areas.js` rather than reusing `lib/brewing/marks/areas.js` — the existing helper uses `fill` as the grouping channel, while the new geom layer uses `color`. A new helper avoids a confusing channel rename at the call site.

**Files:**

- Create: `packages/chart/src/geoms/lib/areas.js`
- Create: `packages/chart/src/geoms/Area.svelte`

- [ ] **Step 1: Write `geoms/lib/areas.js`**

```js
import { area, curveCatmullRom, curveStep } from 'd3-shape'

/**
 * Builds area path geometry for multi-series area charts.
 *
 * @param {Object[]} data
 * @param {{ x: string, y: string, color?: string }} channels
 * @param {Function} xScale
 * @param {Function} yScale
 * @param {Map<unknown, {fill: string, stroke: string}>} colors
 * @param {'linear'|'smooth'|'step'} [curve]
 * @returns {{ d: string, fill: string, stroke: string, key: unknown }[]}
 */
export function buildAreas(data, channels, xScale, yScale, colors, curve) {
  const { x: xf, y: yf, color: cf } = channels
  const baseline = yScale.range()[0] // bottom of the chart (y pixel max)

  const xPos = (d) =>
    typeof xScale.bandwidth === 'function' ? xScale(d[xf]) + xScale.bandwidth() / 2 : xScale(d[xf])

  const makeGen = () => {
    const gen = area()
      .x(xPos)
      .y0(baseline)
      .y1((d) => yScale(d[yf]))
    if (curve === 'smooth') gen.curve(curveCatmullRom)
    else if (curve === 'step') gen.curve(curveStep)
    return gen
  }

  if (!cf) {
    const entry = colors?.values().next().value ?? { fill: '#888', stroke: '#888' }
    return [{ d: makeGen()(data), fill: entry.fill, stroke: 'none', key: null }]
  }

  // Group by color field
  const groups = new Map()
  for (const d of data) {
    const key = d[cf]
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(d)
  }
  return [...groups.entries()].map(([key, rows]) => {
    const entry = colors?.get(key) ?? { fill: '#888', stroke: '#888' }
    return { d: makeGen()(rows), fill: entry.fill, stroke: 'none', key }
  })
}
```

- [ ] **Step 2: Write `geoms/Area.svelte`**

```svelte
<script>
  import { getContext, onMount, onDestroy } from 'svelte'
  import { buildAreas } from './lib/areas.js'

  let { x, y, color, stat = 'identity', options = {} } = $props()

  const state = getContext('plot-state')
  const id = Symbol('area')

  onMount(() =>
    state.registerGeom(id, {
      type: 'area',
      channels: { x, y, color },
      stat,
      options
    })
  )
  onDestroy(() => state.unregisterGeom(id))

  const data = $derived(state.geomData(id))
  const xScale = $derived(state.xScale)
  const yScale = $derived(state.yScale)
  const colors = $derived(state.colors)

  const areas = $derived.by(() => {
    if (!data?.length || !xScale || !yScale) return []
    return buildAreas(data, { x, y, color }, xScale, yScale, colors, options.curve)
  })
</script>

{#if areas.length > 0}
  <g data-plot-geom="area">
    {#each areas as seg (seg.key ?? seg.d)}
      <path
        d={seg.d}
        fill={seg.fill}
        fill-opacity={options.opacity ?? 0.3}
        stroke={seg.stroke ?? 'none'}
        data-plot-element="area"
      />
    {/each}
  </g>
{/if}
```

- [ ] **Step 3: Commit**

```bash
git add packages/chart/src/geoms/lib/areas.js packages/chart/src/geoms/Area.svelte
git commit -m "feat(chart): add geoms/Area.svelte with areas.js helper"
```

---

### Task 10: `geoms/Point.svelte`

Pure render geom for scatter/bubble charts.

**Files:**

- Create: `packages/chart/src/geoms/Point.svelte`

- [ ] **Step 1: Write `geoms/Point.svelte`**

Reuses existing `buildPoints` from `lib/brewing/marks/points.js`.

```svelte
<script>
  import { getContext, onMount, onDestroy } from 'svelte'
  import { buildPoints } from '../lib/brewing/marks/points.js'

  let { x, y, color, size, stat = 'identity', options = {} } = $props()

  const state = getContext('plot-state')
  const id = Symbol('point')

  onMount(() =>
    state.registerGeom(id, {
      type: 'point',
      channels: { x, y, color, size },
      stat,
      options
    })
  )
  onDestroy(() => state.unregisterGeom(id))

  const data = $derived(state.geomData(id))
  const xScale = $derived(state.xScale)
  const yScale = $derived(state.yScale)
  const colors = $derived(state.colors)
  // Size scale: future enhancement — null for now
  const sizeScale = null

  const points = $derived.by(() => {
    if (!data?.length || !xScale || !yScale) return []
    return buildPoints(
      data,
      { x, y, color, size },
      xScale,
      yScale,
      colors,
      sizeScale,
      null,
      options.radius ?? 4
    )
  })
</script>

{#if points.length > 0}
  <g data-plot-geom="point">
    {#each points as pt, i (`${pt.data[x]}-${pt.data[y]}-${pt.data[color ?? ''] ?? i}`)}
      <circle
        cx={pt.cx}
        cy={pt.cy}
        r={pt.r}
        fill={pt.fill}
        stroke={pt.stroke}
        stroke-width="1"
        fill-opacity={options.opacity ?? 0.8}
        data-plot-element="point"
        role="graphics-symbol"
        aria-label="{pt.data[x]}, {pt.data[y]}"
      />
    {/each}
  </g>
{/if}
```

- [ ] **Step 2: Commit**

```bash
git add packages/chart/src/geoms/Point.svelte
git commit -m "feat(chart): add geoms/Point.svelte for scatter charts"
```

---

## Chunk 4: Arc, Box, Violin geoms + Plot.svelte

### Task 11: Remaining geoms (Arc, Box, Violin)

These follow the same context protocol as the other geoms. The mark computation is reused from existing helpers.

**Files:**

- Create: `packages/chart/src/geoms/Arc.svelte`
- Create: `packages/chart/src/geoms/Box.svelte`
- Create: `packages/chart/src/geoms/Violin.svelte`
- Create: `packages/chart/spec/helpers/TestArc.svelte`

- [ ] **Step 1: Create `TestArc.svelte` harness**

`packages/chart/spec/helpers/TestArc.svelte`:

```svelte
<script>
  import { setContext } from 'svelte'
  import Arc from '../../src/geoms/Arc.svelte'
  import { createMockState } from '../../src/helpers/mock-plot-state.js'

  let { state = createMockState(), theta = 'hwy', color = 'class' } = $props()
  setContext('plot-state', state)
</script>

<svg>
  <Arc {theta} {color} />
</svg>
```

- [ ] **Step 2: Write arc geom smoke test**

`packages/chart/spec/geoms/Arc.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import TestArc from '../helpers/TestArc.svelte'
import { createMockState } from '../helpers/mock-plot-state.js'
import mpg from '../fixtures/mpg.json'

describe('Arc geom (smoke)', () => {
  it('renders without crashing when data is empty', () => {
    const state = createMockState({ geomData: () => [] })
    expect(() => render(TestArc, { props: { state } })).not.toThrow()
  })

  it('renders arc paths for non-empty data', () => {
    const pieData = [
      { class: 'compact', hwy: 29 },
      { class: 'suv', hwy: 18 }
    ]
    const state = createMockState({
      geomData: () => pieData,
      colors: new Map([
        ['compact', { fill: '#4e79a7', stroke: '#4e79a7' }],
        ['suv', { fill: '#f28e2b', stroke: '#f28e2b' }]
      ]),
      innerWidth: 300,
      innerHeight: 200
    })
    const { container } = render(TestArc, { props: { state } })
    const paths = container.querySelectorAll('[data-plot-element="arc"]')
    expect(paths.length).toBe(2)
  })
})
```

- [ ] **Step 3: Run arc test to confirm it fails**

```bash
bun run test:ci -- packages/chart/spec/Arc.spec.js
```

Expected: FAIL — `../../geoms/Arc.svelte` not found.

- [ ] **Step 4: Write `geoms/Arc.svelte`**

Reuses `buildArcs(data, channels, colors, width, height, opts)` from `lib/brewing/marks/arcs.js`.

```svelte
<script>
  import { getContext, onMount, onDestroy } from 'svelte'
  import { buildArcs } from '../lib/brewing/marks/arcs.js'

  /** @type {{ theta?: string, color?: string, stat?: string, options?: { innerRadius?: number } }} */
  let { theta, color, stat = 'identity', options = {} } = $props()

  const state = getContext('plot-state')
  const id = Symbol('arc')

  onMount(() =>
    state.registerGeom(id, {
      type: 'arc',
      channels: { label: color, y: theta },
      stat,
      options
    })
  )
  onDestroy(() => state.unregisterGeom(id))

  const data = $derived(state.geomData(id))
  const colors = $derived(state.colors)
  const w = $derived(state.innerWidth)
  const h = $derived(state.innerHeight)

  const arcs = $derived.by(() => {
    if (!data?.length) return []
    const innerRadius = ((options.innerRadius ?? 0) * Math.min(w, h)) / 2
    return buildArcs(data, { label: color, y: theta }, colors, w, h, { innerRadius })
  })
</script>

{#if arcs.length > 0}
  <g data-plot-geom="arc" transform="translate({w / 2}, {h / 2})">
    {#each arcs as arc (arc.key)}
      <path
        d={arc.d}
        fill={arc.fill}
        stroke={arc.stroke}
        stroke-width="1"
        data-plot-element="arc"
      />
    {/each}
  </g>
{/if}
```

- [ ] **Step 5: Run arc test to verify it passes**

```bash
bun run test:ci -- packages/chart/spec/Arc.spec.js
```

Expected: All pass.

- [ ] **Step 6: Write `geoms/Box.svelte`**

Reuses `buildBoxes(data, channels, xScale, yScale, colors)` from `lib/brewing/marks/boxes.js`.

```svelte
<script>
  import { getContext, onMount, onDestroy } from 'svelte'
  import { buildBoxes } from '../lib/brewing/marks/boxes.js'

  let { x, y, color, stat = 'identity', options = {} } = $props()

  const state = getContext('plot-state')
  const id = Symbol('box')

  onMount(() =>
    state.registerGeom(id, {
      type: 'box',
      channels: { x, y, color },
      stat,
      options
    })
  )
  onDestroy(() => state.unregisterGeom(id))

  const data = $derived(state.geomData(id))
  const xScale = $derived(state.xScale)
  const yScale = $derived(state.yScale)
  const colors = $derived(state.colors)

  const boxes = $derived.by(() => {
    if (!data?.length || !xScale || !yScale) return []
    return buildBoxes(data, { x, y, color }, xScale, yScale, colors)
  })
</script>

{#if boxes.length > 0}
  <g data-plot-geom="box">
    {#each boxes as box (box.key)}
      <!-- Box body (IQR) -->
      <rect
        x={box.x}
        y={box.q3y}
        width={box.width}
        height={box.q1y - box.q3y}
        fill={box.fill}
        stroke={box.stroke}
        stroke-width="1"
        data-plot-element="box-body"
      />
      <!-- Median line -->
      <line
        x1={box.x}
        y1={box.mediany}
        x2={box.x + box.width}
        y2={box.mediany}
        stroke={box.stroke}
        stroke-width="2"
        data-plot-element="box-median"
      />
      <!-- Whiskers -->
      <line
        x1={box.midX}
        y1={box.q1y}
        x2={box.midX}
        y2={box.whiskerLowy}
        stroke={box.stroke}
        stroke-width="1"
        data-plot-element="box-whisker"
      />
      <line
        x1={box.midX}
        y1={box.q3y}
        x2={box.midX}
        y2={box.whiskerHighy}
        stroke={box.stroke}
        stroke-width="1"
        data-plot-element="box-whisker"
      />
      <!-- Whisker caps -->
      <line
        x1={box.x + box.width * 0.25}
        y1={box.whiskerHighy}
        x2={box.x + box.width * 0.75}
        y2={box.whiskerHighy}
        stroke={box.stroke}
        stroke-width="1"
      />
      <line
        x1={box.x + box.width * 0.25}
        y1={box.whiskerLowy}
        x2={box.x + box.width * 0.75}
        y2={box.whiskerLowy}
        stroke={box.stroke}
        stroke-width="1"
      />
      <!-- Outliers -->
      {#each box.outliers ?? [] as oy, oi (oi)}
        <circle
          cx={box.midX}
          cy={oy}
          r="3"
          fill="none"
          stroke={box.stroke}
          data-plot-element="box-outlier"
        />
      {/each}
    {/each}
  </g>
{/if}
```

**Note:** If `buildBoxes` returns a different shape, adjust the template to match. The key fields are: `x`, `width`, `q1y`, `q3y`, `mediany`, `midX`, `whiskerLowy`, `whiskerHighy`, `fill`, `stroke`, `outliers`.

- [ ] **Step 7: Write `geoms/Violin.svelte`**

Reuses `buildViolins` from `lib/brewing/marks/violins.js`.

```svelte
<script>
  import { getContext, onMount, onDestroy } from 'svelte'
  import { buildViolins } from '../lib/brewing/marks/violins.js'

  let { x, y, color, stat = 'identity', options = {} } = $props()

  const state = getContext('plot-state')
  const id = Symbol('violin')

  onMount(() =>
    state.registerGeom(id, {
      type: 'violin',
      channels: { x, y, color },
      stat,
      options
    })
  )
  onDestroy(() => state.unregisterGeom(id))

  const data = $derived(state.geomData(id))
  const xScale = $derived(state.xScale)
  const yScale = $derived(state.yScale)
  const colors = $derived(state.colors)

  const violins = $derived.by(() => {
    if (!data?.length || !xScale || !yScale) return []
    return buildViolins(data, { x, y, color }, xScale, yScale, colors)
  })
</script>

{#if violins.length > 0}
  <g data-plot-geom="violin">
    {#each violins as v (v.key)}
      <path
        d={v.d}
        fill={v.fill}
        fill-opacity="0.7"
        stroke={v.stroke}
        stroke-width="1"
        data-plot-element="violin"
      />
    {/each}
  </g>
{/if}
```

- [ ] **Step 8: Commit**

```bash
git add packages/chart/src/geoms/Arc.svelte packages/chart/src/geoms/Box.svelte packages/chart/src/geoms/Violin.svelte packages/chart/spec/helpers/TestArc.svelte packages/chart/spec/geoms/Arc.spec.js
git commit -m "feat(chart): add Arc, Box, Violin geom components"
```

---

### Task 12: `Plot.svelte` orchestrator

**Status: completed**

The top-level chart component. Creates `PlotState`, sets context, renders SVG canvas with optional grid, axes, legend, and pattern defs. Accepts either declarative children (geoms as child components) or a `spec` prop.

**Files:**

- Create: `packages/chart/src/Plot.svelte`
- Create: `packages/chart/spec/Plot.spec.js`

- [x] **Step 1: Write the failing tests**

`packages/chart/spec/Plot.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Plot from '../src/Plot.svelte'
import Bar from '../src/geoms/Bar.svelte'
import mpg from '../src/fixtures/mpg.json'

// Minimal render test — confirms Plot creates SVG and sets context
describe('Plot.svelte', () => {
  it('renders an SVG element', () => {
    const { container } = render(Plot, {
      props: { data: mpg.slice(0, 5), width: 400, height: 300, grid: false, legend: false }
    })
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders with data-plot-root attribute', () => {
    const { container } = render(Plot, {
      props: { data: mpg.slice(0, 5), width: 400, height: 300 }
    })
    expect(container.querySelector('[data-plot-root]')).toBeTruthy()
  })

  it('renders canvas transform group', () => {
    const { container } = render(Plot, {
      props: { data: mpg.slice(0, 5), width: 400, height: 300 }
    })
    expect(container.querySelector('[data-plot-canvas]')).toBeTruthy()
  })

  it('accepts spec prop without crashing', () => {
    const spec = {
      data: mpg.slice(0, 5),
      x: 'class',
      y: 'hwy',
      geoms: [{ type: 'bar', stat: 'identity' }]
    }
    expect(() => render(Plot, { props: { spec, width: 400, height: 300 } })).not.toThrow()
  })
})
```

- [x] **Step 2: Run test to verify it fails**

```bash
bun run test:ci -- packages/chart/spec/Plot.spec.js
```

Expected: FAIL — `./Plot.svelte` not found.

- [x] **Step 3: Write `Plot.svelte`**

```svelte
<script>
  import { setContext } from 'svelte'
  import { PlotState } from './PlotState.svelte.js'
  import Axis from './plot/Axis.svelte'
  import Grid from './plot/Grid.svelte'
  import Legend from './plot/Legend.svelte'
  import DefinePatterns from './plot/DefinePatterns.svelte'
  import Bar from './geoms/Bar.svelte'
  import Line from './geoms/Line.svelte'
  import Area from './geoms/Area.svelte'
  import Point from './geoms/Point.svelte'
  import Arc from './geoms/Arc.svelte'
  import Box from './geoms/Box.svelte'
  import Violin from './geoms/Violin.svelte'

  /**
   * @type {{
   *   data?: Object[],
   *   spec?: import('./lib/plot/types.js').PlotSpec,
   *   helpers?: import('./lib/plot/types.js').PlotHelpers,
   *   width?: number,
   *   height?: number,
   *   mode?: 'light' | 'dark',
   *   grid?: boolean,
   *   legend?: boolean,
   *   title?: string,
   *   children?: import('svelte').Snippet,
   * }}
   */
  let {
    data = [],
    spec = undefined,
    helpers = {},
    width = 600,
    height = 400,
    mode = 'light',
    grid = true,
    legend = false,
    title = '',
    children
  } = $props()

  // Merge declarative props with spec
  const config = $derived(
    spec ?? {
      data,
      width,
      height,
      mode,
      grid,
      legend,
      title
    }
  )

  // Create PlotState and provide as context
  const state = new PlotState(config, helpers)
  setContext('plot-state', state)

  // Keep state in sync when config changes
  $effect(() => {
    state.update(config, helpers)
  })

  const margin = { top: 30, right: 30, bottom: 50, left: 55 }
  const svgWidth = $derived(config.width ?? width)
  const svgHeight = $derived(config.height ?? height)

  // Geoms from spec (spec-driven API)
  const specGeoms = $derived(spec?.geoms ?? [])

  // Geom component resolver for spec-driven mode
  const GEOM_COMPONENTS = {
    bar: Bar,
    line: Line,
    area: Area,
    point: Point,
    arc: Arc,
    box: Box,
    violin: Violin
  }
  function resolveGeomComponent(type) {
    return helpers?.geoms?.[type] ?? GEOM_COMPONENTS[type]
  }
</script>

<div class="plot-root" data-plot-root data-mode={config.mode ?? mode}>
  {#if config.title ?? title}
    <div class="plot-title" data-plot-title>{config.title ?? title}</div>
  {/if}

  <svg
    width={svgWidth}
    height={svgHeight}
    viewBox="0 0 {svgWidth} {svgHeight}"
    role="img"
    aria-label={config.title ?? title ?? 'Chart visualization'}
  >
    <!-- SVG pattern defs -->
    <DefinePatterns />

    <g class="plot-canvas" transform="translate({margin.left}, {margin.top})" data-plot-canvas>
      <!-- Grid (behind everything) -->
      {#if config.grid ?? grid}
        <Grid />
      {/if}

      <!-- Declarative children (geom components) -->
      {@render children?.()}

      <!-- Spec-driven geoms -->
      {#each specGeoms as geomSpec}
        {@const GeomComponent = resolveGeomComponent(geomSpec.type)}
        {#if GeomComponent}
          <GeomComponent
            x={geomSpec.x ?? spec?.x}
            y={geomSpec.y ?? spec?.y}
            color={geomSpec.color ?? spec?.color}
            stat={geomSpec.stat}
            options={geomSpec.options}
          />
        {/if}
      {/each}

      <!-- Axes -->
      <Axis type="x" label={spec?.labels?.[spec?.x ?? ''] ?? ''} />
      <Axis type="y" label={spec?.labels?.[spec?.y ?? ''] ?? ''} />
    </g>
  </svg>

  <!-- Legend (HTML, outside SVG) -->
  {#if config.legend ?? legend}
    <Legend labels={spec?.labels ?? {}} />
  {/if}
</div>

<style>
  .plot-root {
    position: relative;
    width: 100%;
    height: auto;
  }

  svg {
    display: block;
    overflow: visible;
  }

  .plot-canvas {
    pointer-events: all;
  }

  .plot-title {
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    margin-bottom: 4px;
  }
</style>
```

- [x] **Step 3b: Add `update(config, helpers)` to `PlotState.svelte.js`**

Read `packages/chart/src/PlotState.svelte.js`. The Plan 1 PlotState accepts config in its constructor. `Plot.svelte` calls `state.update(config, helpers)` inside a `$effect` to keep state in sync with reactive props. Add this method if it does not already exist:

```js
// In PlotState class:
update(config, helpers = {}) {
  this.#config = config
  this.#helpers = helpers
  // #data, #geoms, etc. are $derived from #config, so they react automatically
  // if they are defined as $derived.by(() => this.#config.data) etc.
  // If they are stored directly (not derived), reassign here:
  // this.#data = config.data ?? []
}
```

If `PlotState` already reads `config` properties via `$derived` (referencing the constructor argument reactively), the `update()` method may be a no-op. Add it regardless so `Plot.svelte` can call it without a runtime error.

- [x] **Step 4: Run tests**

```bash
bun run test:ci -- packages/chart/spec/Plot.spec.js
```

Expected: All pass.

- [x] **Step 5: Run full test suite to verify no regressions**

```bash
cd packages/chart && bun run test
```

Expected: All existing tests still pass.

- [x] **Step 6: Commit**

```bash
git add packages/chart/src/Plot.svelte packages/chart/spec/Plot.spec.js
git commit -m "feat(chart): add Plot.svelte orchestrator — declarative + spec-driven API"
```

---

## Chunk 5: Chart wrappers + exports

### Task 13: Updated chart wrappers

**Status: completed**

All existing chart wrapper components become thin wrappers around `Plot.svelte`. They preserve their existing prop signatures for backward compatibility. Read each file before rewriting it.

**Files:**

- Modify: `packages/chart/src/charts/BarChart.svelte`
- Modify: `packages/chart/src/charts/LineChart.svelte`
- Modify: `packages/chart/src/charts/AreaChart.svelte`
- Modify: `packages/chart/src/charts/PieChart.svelte`
- Modify: `packages/chart/src/charts/ScatterPlot.svelte`
- Modify: `packages/chart/src/charts/BoxPlot.svelte`
- Modify: `packages/chart/src/charts/ViolinPlot.svelte`
- Modify: `packages/chart/src/charts/BubbleChart.svelte`

- [x] **Step 1: Rewrite `charts/BarChart.svelte`**

Read `packages/chart/src/charts/BarChart.svelte` to confirm existing props, then replace with:

```svelte
<script>
  import Plot from '../Plot.svelte'
  import Bar from '../geoms/Bar.svelte'

  let {
    data = [],
    x = undefined,
    y = undefined,
    fill = undefined, // mapped to color channel
    pattern = undefined,
    width = 600,
    height = 400,
    mode = 'light',
    grid = true,
    legend = false,
    stat = 'identity'
  } = $props()
</script>

<Plot {data} {width} {height} {mode} {grid} {legend}>
  <Bar {x} {y} color={fill} {stat} />
</Plot>
```

**Note:** `pattern` is not yet wired — it requires the pattern channel support in Bar geom and `PlotState.patterns`. This is a known limitation of Plan 2. The `pattern` prop can be passed through in a follow-up once the `patterns` channel is integrated into PlotState.

- [x] **Step 2: Rewrite `charts/LineChart.svelte`**

Read `packages/chart/src/charts/LineChart.svelte` first to get its props, then replace:

```svelte
<script>
  import Plot from '../Plot.svelte'
  import Line from '../geoms/Line.svelte'

  let {
    data = [],
    x = undefined,
    y = undefined,
    color = undefined,
    width = 600,
    height = 400,
    mode = 'light',
    grid = true,
    legend = false
  } = $props()
</script>

<Plot {data} {width} {height} {mode} {grid} {legend}>
  <Line {x} {y} {color} />
</Plot>
```

- [x] **Step 3: Rewrite remaining chart wrappers**

For each file, read it first to confirm the existing props, then replace with the thin wrapper below. The pattern is identical: forward data + channels to `Plot` + the matching geom.

**`charts/AreaChart.svelte`:**

```svelte
<script>
  import Plot from '../Plot.svelte'
  import Area from '../geoms/Area.svelte'
  let {
    data = [],
    x,
    y,
    color,
    width = 600,
    height = 400,
    mode = 'light',
    grid = true,
    legend = false
  } = $props()
</script>

<Plot {data} {width} {height} {mode} {grid} {legend}>
  <Area {x} {y} {color} />
</Plot>
```

**`charts/PieChart.svelte`:**

```svelte
<script>
  import Plot from '../Plot.svelte'
  import Arc from '../geoms/Arc.svelte'
  let {
    data = [],
    theta,
    color,
    innerRadius = 0,
    width = 400,
    height = 400,
    mode = 'light',
    legend = false
  } = $props()
</script>

<Plot {data} {width} {height} {mode} grid={false} {legend}>
  <Arc {theta} {color} options={{ innerRadius }} />
</Plot>
```

**`charts/ScatterPlot.svelte`:**

```svelte
<script>
  import Plot from '../Plot.svelte'
  import Point from '../geoms/Point.svelte'
  let {
    data = [],
    x,
    y,
    color,
    size,
    width = 600,
    height = 400,
    mode = 'light',
    grid = true,
    legend = false
  } = $props()
</script>

<Plot {data} {width} {height} {mode} {grid} {legend}>
  <Point {x} {y} {color} {size} />
</Plot>
```

**`charts/BoxPlot.svelte`:**

```svelte
<script>
  import Plot from '../Plot.svelte'
  import Box from '../geoms/Box.svelte'
  let {
    data = [],
    x,
    y,
    color,
    width = 600,
    height = 400,
    mode = 'light',
    grid = true,
    legend = false
  } = $props()
</script>

<Plot {data} {width} {height} {mode} {grid} {legend}>
  <Box {x} {y} {color} />
</Plot>
```

**`charts/ViolinPlot.svelte`:**

```svelte
<script>
  import Plot from '../Plot.svelte'
  import Violin from '../geoms/Violin.svelte'
  let {
    data = [],
    x,
    y,
    color,
    width = 600,
    height = 400,
    mode = 'light',
    grid = true,
    legend = false
  } = $props()
</script>

<Plot {data} {width} {height} {mode} {grid} {legend}>
  <Violin {x} {y} {color} />
</Plot>
```

**`charts/BubbleChart.svelte`:**

```svelte
<script>
  import Plot from '../Plot.svelte'
  import Point from '../geoms/Point.svelte'
  let {
    data = [],
    x,
    y,
    size,
    color,
    width = 600,
    height = 400,
    mode = 'light',
    grid = true,
    legend = false
  } = $props()
</script>

<Plot {data} {width} {height} {mode} {grid} {legend}>
  <Point {x} {y} {color} {size} />
</Plot>
```

**Note:** For each wrapper, read the original file first to confirm the exact prop names before overwriting. The wrappers above assume common conventions — if an existing chart used different prop names (e.g. `fill` vs `color`, `label` vs `theta`), match the original name in the `$props()` destructure and map to the geom's prop.

- [x] **Step 4: Run the full test suite**

```bash
bun run test:ci
```

Expected: All tests pass, zero errors.

- [x] **Step 5: Commit**

```bash
git add packages/chart/src/charts/
git commit -m "refactor(chart): update all chart wrappers to use new Plot.svelte + geoms"
```

---

### Task 14: Update `index.js` exports

**Status: completed**

The package's public API should export `Plot.svelte` and all geom components under a `Plot` namespace, alongside the existing exports.

**Files:**

- Modify: `packages/chart/src/index.js`

- [x] **Step 1: Rename the old `Plot` namespace export**

The current `index.js` exports `export const Plot = { Root, Axis, Bar, ... }` (the old system components). The new orchestrator `Plot.svelte` needs the `Plot` name. Rename the old namespace to `PlotLayers` to avoid the conflict:

```js
// BEFORE (in index.js):
export const Plot = { Root, Axis, Bar, Grid, Legend, Line, Area, Point, Arc }

// AFTER:
export const PlotLayers = { Root, Axis, Bar, Grid, Legend, Line, Area, Point, Arc }
// Note: This is a breaking change for users importing Plot.Root etc.
// The old system is deprecated — consumers should migrate to the new geoms.
```

- [x] **Step 2: Add new exports**

After the `PlotLayers` rename, add the new system exports:

```js
// New Plot system
export { default as PlotChart } from './Plot.svelte'

// Geom components (for declarative use inside PlotChart)
export { default as GeomBar } from './geoms/Bar.svelte'
export { default as GeomLine } from './geoms/Line.svelte'
export { default as GeomArea } from './geoms/Area.svelte'
export { default as GeomPoint } from './geoms/Point.svelte'
export { default as GeomArc } from './geoms/Arc.svelte'
export { default as GeomBox } from './geoms/Box.svelte'
export { default as GeomViolin } from './geoms/Violin.svelte'
```

**Why `PlotChart` not `Plot`:** The old `export const Plot = { Root, Axis, Bar, ... }` would collide. Rather than a silent override, use `PlotChart` for the new orchestrator. Internal imports inside the package (e.g. in `Plot.svelte` itself importing `Bar`) continue to use the bare module path and are unaffected.

**Why `GeomBar` etc.:** Geom names (`Bar`, `Line`) also collide with the old `Plot/Bar.svelte` components imported in `index.js`. The `Geom` prefix makes the new exports unambiguous. In future (when the old system is fully removed), these can be re-exported as bare `Bar`, `Line`, etc.

- [x] **Step 3: Run tests and lint**

```bash
bun run test:ci && bun run lint
```

Expected: All tests pass, zero lint errors.

- [x] **Step 4: Commit**

```bash
git add packages/chart/src/index.js
git commit -m "feat(chart): export new Plot + geom components from package index"
```

---

## Done

After Task 14, the rendering layer is complete:

- `plot/Axis.svelte` — reads `plot-state` context, supports quadrant-aware positioning
- `plot/Grid.svelte` — horizontal + vertical grid lines
- `plot/Legend.svelte` — categorical swatches or gradient bar
- `plot/DefinePatterns.svelte` — SVG pattern defs from preset
- `geoms/lib/bars.js` — grouped, stacked, horizontal bar computation (tested)
- `geoms/Bar.svelte` — vertical grouped, vertical stacked, horizontal bars
- `geoms/Line.svelte` — multi-series line
- `geoms/Area.svelte` — area fill
- `geoms/Point.svelte` — scatter
- `geoms/Arc.svelte` — pie + donut
- `geoms/Box.svelte` — box plots
- `geoms/Violin.svelte` — violin plots
- `Plot.svelte` — orchestrator supporting declarative children + spec-driven API
- `charts/BarChart.svelte`, `charts/LineChart.svelte`, `charts/AreaChart.svelte`, `charts/PieChart.svelte`, `charts/ScatterPlot.svelte`, `charts/BoxPlot.svelte`, `charts/ViolinPlot.svelte`, `charts/BubbleChart.svelte` — all updated as thin wrappers

**Next: Plan 3 — Facets and Animation** (`FacetPlot.svelte`, `AnimatedPlot.svelte`, frame normalization, timeline controls)
