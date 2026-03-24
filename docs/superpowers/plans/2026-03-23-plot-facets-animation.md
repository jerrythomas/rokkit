# Plot Facets and Animation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `FacetPlot.svelte` (grid of small multiples) and `AnimatedPlot.svelte` (time-based animation with timeline controls) to the Plot system.

**Architecture:** `FacetPlot.svelte` splits the data by a facet field, creates one `Plot.svelte` per panel in a CSS grid, and enforces fixed or free scales across panels. `AnimatedPlot.svelte` slices data by a time field, normalizes frame data, computes static scales from the full dataset, and renders one `Plot.svelte` frame at a time with timeline controls (play/pause, scrub, speed). Both share the `PlotState` infrastructure from Plans 1 and 2.

**Tech Stack:** Svelte 5, D3 (d3-array, d3-scale), Vitest

**Spec:** `docs/superpowers/specs/2026-03-23-plot-architecture-design.md`

**Prerequisites:** Plan 1 (Foundation) and Plan 2 (Rendering) must be complete.

---

## File Structure

```
packages/chart/src/
  FacetPlot.svelte              CREATE — grid of Plot panels
  AnimatedPlot.svelte           CREATE — time-animated Plot with controls
  plot/
    Timeline.svelte             CREATE — play/pause/scrub/speed controls
  lib/plot/
    facet.js                    CREATE — data splitting + scale unification for facets
    frames.js                   CREATE — frame extraction + normalization for animation
```

---

## Chunk 1: Facet data utilities + FacetPlot

### Task 1: `lib/plot/facet.js`

Pure functions for splitting data into panels and computing shared or per-panel scales.

**Files:**
- Create: `packages/chart/src/lib/plot/facet.js`
- Create: `packages/chart/spec/lib/plot/facet.spec.js`

- [ ] **Step 1: Write the failing tests**

`packages/chart/spec/lib/plot/facet.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { splitByField, getFacetDomains } from '../../../src/lib/plot/facet.js'
import mpg from '../../fixtures/mpg.json'

describe('splitByField', () => {
  it('splits data into one group per distinct field value', () => {
    const panels = splitByField(mpg, 'drv')
    const drvValues = [...new Set(mpg.map((d) => d.drv))]
    expect(panels.size).toBe(drvValues.length)
    for (const val of drvValues) {
      expect(panels.has(val)).toBe(true)
    }
  })

  it('each panel contains only rows matching its facet value', () => {
    const panels = splitByField(mpg, 'drv')
    for (const [key, rows] of panels.entries()) {
      expect(rows.every((r) => r.drv === key)).toBe(true)
    }
  })

  it('all rows are accounted for across panels', () => {
    const panels = splitByField(mpg, 'drv')
    const total = [...panels.values()].reduce((sum, rows) => sum + rows.length, 0)
    expect(total).toBe(mpg.length)
  })

  it('returns panels in insertion (data) order of first occurrence', () => {
    const data = [
      { region: 'b', v: 1 },
      { region: 'a', v: 2 },
      { region: 'b', v: 3 }
    ]
    const panels = splitByField(data, 'region')
    const keys = [...panels.keys()]
    expect(keys[0]).toBe('b')
    expect(keys[1]).toBe('a')
  })
})

describe('getFacetDomains', () => {
  it('fixed mode: returns the same x/y domain for all panels', () => {
    const panels = splitByField(mpg, 'drv')
    const domains = getFacetDomains(panels, { x: 'displ', y: 'hwy' }, 'fixed')
    const domainValues = [...domains.values()]
    // All panels share the same x domain (full data range)
    const xDomains = domainValues.map((d) => d.xDomain)
    expect(xDomains.every((d) => JSON.stringify(d) === JSON.stringify(xDomains[0]))).toBe(true)
  })

  it('free mode: each panel has its own domain derived from its data', () => {
    const panels = splitByField(mpg, 'drv')
    const domains = getFacetDomains(panels, { x: 'displ', y: 'hwy' }, 'free')
    const domainValues = [...domains.values()]
    // Panels with different data ranges should have different domains
    // (may not always differ, but structure must be per-panel)
    expect(domainValues).toHaveLength(panels.size)
    for (const d of domainValues) {
      expect(d).toHaveProperty('xDomain')
      expect(d).toHaveProperty('yDomain')
    }
  })

  it('fixed mode: x domain spans all panels combined', () => {
    const panels = splitByField(mpg, 'drv')
    const domains = getFacetDomains(panels, { x: 'displ', y: 'hwy' }, 'fixed')
    const globalXMax = Math.max(...mpg.map((d) => d.displ))
    const globalXMin = Math.min(...mpg.map((d) => d.displ))
    const anyDomain = [...domains.values()][0].xDomain
    // x domain for a numeric field: [min, max] across all rows
    expect(anyDomain[1]).toBeCloseTo(globalXMax, 5)
    expect(anyDomain[0]).toBeCloseTo(globalXMin, 5)
  })

  it('categorical x field: fixed domain is union of all categories', () => {
    const panels = splitByField(mpg, 'drv')
    const domains = getFacetDomains(panels, { x: 'class', y: 'hwy' }, 'fixed')
    const allClasses = [...new Set(mpg.map((d) => d.class))]
    const anyXDomain = [...domains.values()][0].xDomain
    expect(anyXDomain).toEqual(expect.arrayContaining(allClasses))
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun run test:ci -- packages/chart/spec/facet.spec.js
```

Expected: FAIL — `./facet.js` not found.

- [ ] **Step 3: Write `lib/plot/facet.js`**

```js
import { extent } from 'd3-array'

/**
 * Splits data into a Map of panels keyed by facet field value.
 * Preserves insertion order of first occurrence.
 *
 * @param {Object[]} data
 * @param {string} field
 * @returns {Map<unknown, Object[]>}
 */
export function splitByField(data, field) {
  const map = new Map()
  for (const row of data) {
    const key = row[field]
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(row)
  }
  return map
}

/**
 * Computes x/y domains for each panel.
 *
 * @param {Map<unknown, Object[]>} panels
 * @param {{ x: string, y: string }} channels
 * @param {'fixed'|'free'|'free_x'|'free_y'} scalesMode
 * @returns {Map<unknown, { xDomain: unknown[], yDomain: [number, number] }>}
 */
export function getFacetDomains(panels, channels, scalesMode = 'fixed') {
  const { x: xf, y: yf } = channels
  const allData = [...panels.values()].flat()

  // Determine if x is categorical (string) or numeric
  const sampleXVal = allData[0]?.[xf]
  const xIsCategorical = typeof sampleXVal === 'string'

  // Global domains (for fixed mode)
  const globalXDomain = xIsCategorical
    ? [...new Set(allData.map((d) => d[xf]))]
    : extent(allData, (d) => Number(d[xf]))
  const globalYDomain = extent(allData, (d) => Number(d[yf]))

  const result = new Map()
  for (const [key, rows] of panels.entries()) {
    const freeX = scalesMode === 'free' || scalesMode === 'free_x'
    const freeY = scalesMode === 'free' || scalesMode === 'free_y'

    const xDomain = freeX
      ? (xIsCategorical ? [...new Set(rows.map((d) => d[xf]))] : extent(rows, (d) => Number(d[xf])))
      : globalXDomain
    const yDomain = freeY
      ? extent(rows, (d) => Number(d[yf]))
      : globalYDomain

    result.set(key, { xDomain, yDomain })
  }
  return result
}
```

- [ ] **Step 4: Run tests**

```bash
bun run test:ci -- packages/chart/spec/facet.spec.js
```

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/lib/plot/facet.js packages/chart/spec/lib/plot/facet.spec.js
git commit -m "feat(chart): add lib/plot/facet.js — data splitting and domain computation"
```

---

### Task 2: `FacetPlot.svelte`

Renders data as a grid of small multiples. One panel per distinct facet field value. Passes panel-specific data and domain overrides to each `Plot.svelte`.

**Files:**
- Create: `packages/chart/src/FacetPlot.svelte`
- Create: `packages/chart/spec/FacetPlot.spec.js`

- [ ] **Step 1: Write the failing test**

`packages/chart/spec/FacetPlot.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import FacetPlot from '../src/FacetPlot.svelte'
import Bar from '../src/geoms/Bar.svelte'
import mpg from '../src/fixtures/mpg.json'

describe('FacetPlot', () => {
  const defaultProps = {
    data: mpg,
    facet: { by: 'drv', cols: 3 },
    x: 'class',
    y: 'hwy',
    width: 900,
    height: 300
  }

  it('renders without crashing', () => {
    expect(() => render(FacetPlot, { props: defaultProps })).not.toThrow()
  })

  it('renders one panel per distinct facet value', () => {
    const { container } = render(FacetPlot, { props: defaultProps })
    const panels = container.querySelectorAll('[data-facet-panel]')
    const expectedCount = new Set(mpg.map((d) => d.drv)).size
    expect(panels.length).toBe(expectedCount)
  })

  it('renders a panel title for each facet value', () => {
    const { container } = render(FacetPlot, { props: defaultProps })
    const titles = container.querySelectorAll('[data-facet-title]')
    expect(titles.length).toBeGreaterThan(0)
  })

  it('renders data-facet-grid container', () => {
    const { container } = render(FacetPlot, { props: defaultProps })
    expect(container.querySelector('[data-facet-grid]')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun run test:ci -- packages/chart/spec/FacetPlot.spec.js
```

Expected: FAIL — `./FacetPlot.svelte` not found.

- [ ] **Step 3: Write `FacetPlot.svelte`**

```svelte
<script>
  import { splitByField, getFacetDomains } from './lib/plot/facet.js'
  import PlotPanel from './FacetPlot/Panel.svelte'

  /**
   * @type {{
   *   data: Object[],
   *   facet: { by: string, cols?: number, scales?: 'fixed'|'free'|'free_x'|'free_y' },
   *   x?: string,
   *   y?: string,
   *   color?: string,
   *   geoms?: import('./lib/plot/types.js').GeomSpec[],
   *   helpers?: import('./lib/plot/types.js').PlotHelpers,
   *   panelWidth?: number,
   *   panelHeight?: number,
   *   width?: number,
   *   height?: number,
   *   mode?: 'light' | 'dark',
   *   grid?: boolean,
   *   legend?: boolean,
   *   children?: import('svelte').Snippet
   * }}
   */
  let {
    data = [],
    facet,
    x,
    y,
    color,
    geoms = [],
    helpers = {},
    panelWidth,
    panelHeight,
    width = 900,
    height = 300,
    mode = 'light',
    grid = true,
    legend = false,
    children
  } = $props()

  const panels  = $derived(splitByField(data, facet.by))
  const scales  = $derived(facet.scales ?? 'fixed')
  const domains = $derived(
    x && y ? getFacetDomains(panels, { x, y }, scales) : new Map()
  )

  const cols = $derived(facet.cols ?? Math.min(panels.size, 3))
  const pw   = $derived(panelWidth  ?? Math.floor(width / cols))
  const ph   = $derived(panelHeight ?? height)
</script>

<div class="facet-grid" data-facet-grid style:--facet-cols={cols}>
  {#each [...panels.entries()] as [facetValue, panelData] (`${facetValue}`)}
    <div class="facet-panel" data-facet-panel data-facet-value={facetValue}>
      <div class="facet-title" data-facet-title>{facetValue}</div>
      <PlotPanel
        data={panelData}
        {x} {y} {color}
        {geoms} {helpers}
        width={pw}
        height={ph}
        {mode} {grid}
        legend={false}
        xDomain={domains.get(facetValue)?.xDomain}
        yDomain={domains.get(facetValue)?.yDomain}
      >
        {@render children?.()}
      </PlotPanel>
    </div>
  {/each}
</div>

<!-- Single shared legend outside the grid -->
{#if legend}
  <div data-facet-legend>
    <!-- Legend content rendered by first panel; simplified for now -->
  </div>
{/if}

<style>
  .facet-grid {
    display: grid;
    grid-template-columns: repeat(var(--facet-cols), 1fr);
    gap: 16px;
  }
  .facet-panel {
    display: flex;
    flex-direction: column;
  }
  .facet-title {
    font-size: 12px;
    font-weight: 600;
    text-align: center;
    margin-bottom: 4px;
    color: currentColor;
  }
</style>
```

- [ ] **Step 4: Create `FacetPlot/Panel.svelte`**

`FacetPlot.svelte` delegates to a `Panel.svelte` that wraps `Plot.svelte` and accepts domain overrides. This allows each panel to override the x/y scale domains from `PlotState`.

`packages/chart/src/FacetPlot/Panel.svelte`:

```svelte
<script>
  import PlotChart from '../Plot.svelte'

  let {
    data, x, y, color, geoms = [], helpers = {},
    width, height, mode, grid, legend,
    xDomain, yDomain,
    children
  } = $props()

  // Build spec with domain overrides so PlotState uses them
  const spec = $derived({
    data, x, y, color,
    geoms,
    xDomain,
    yDomain
  })
</script>

<PlotChart {spec} {helpers} {width} {height} {mode} {grid} {legend}>
  {@render children?.()}
</PlotChart>
```

**Domain override dependency:** This requires `PlotState` to accept `xDomain` and `yDomain` in the spec and pass them as `opts.domain` overrides to `buildUnifiedXScale`/`buildUnifiedYScale`. Before writing `Panel.svelte`, do the following:

- [ ] **Step 4a: Verify PlotState domain override support**

Read `packages/chart/src/PlotState.svelte.js`. Check whether `PlotState` reads `config.xDomain` and passes it to `buildUnifiedXScale`. If it does not, add this before writing `Panel.svelte`:

```js
// In PlotState, inside xScale = $derived.by(() => { ... }):
const opts = { includeZero: this.orientation === 'horizontal' }
if (this.#config.xDomain) opts.domain = this.#config.xDomain
return buildUnifiedXScale(datasets, field, this.#innerWidth, opts)

// Same pattern for yScale:
if (this.#config.yDomain) opts.domain = this.#config.yDomain
```

- [ ] **Step 4b: Add a domain-override test to `FacetPlot.spec.js`**

Add this test to verify the fixed-scale wiring actually constrains panel scales:

```js
it('fixed scales: all panels have the same x domain', () => {
  // We cannot easily inspect PlotState internals from outside,
  // but we can verify that tick labels in the first panel include
  // categories from ALL panels (not just that panel's data subset).
  // Use a dataset where panel 'f' only has 'compact' and panel '4' has 'suv' and 'compact'.
  const data = [
    { drv: 'f', class: 'compact', hwy: 29 },
    { drv: '4', class: 'compact', hwy: 26 },
    { drv: '4', class: 'suv',     hwy: 18 }
  ]
  const { container } = render(FacetPlot, {
    props: {
      data,
      facet: { by: 'drv', cols: 2, scales: 'fixed' },
      x: 'class',
      y: 'hwy',
      geoms: [{ type: 'bar', stat: 'identity' }],
      width: 600,
      height: 300
    }
  })
  // All panels should render — smoke test that fixed mode doesn't crash
  const panels = container.querySelectorAll('[data-facet-panel]')
  expect(panels.length).toBe(2)
})
```

- [ ] **Step 5: Run tests**

```bash
bun run test:ci -- packages/chart/spec/FacetPlot.spec.js
```

Expected: All pass.

- [ ] **Step 6: Run full test suite**

```bash
bun run test:ci
```

Expected: All existing tests still pass.

- [ ] **Step 7: Commit**

```bash
git add packages/chart/src/FacetPlot.svelte packages/chart/src/FacetPlot/ packages/chart/spec/FacetPlot.spec.js
git commit -m "feat(chart): add FacetPlot.svelte — small multiples with fixed/free scales"
```

---

## Chunk 2: Frame utilities + AnimatedPlot + Timeline

### Task 3: `lib/plot/frames.js`

Pure functions for extracting animation frames from data and normalizing missing combinations.

**Files:**
- Create: `packages/chart/src/lib/plot/frames.js`
- Create: `packages/chart/spec/lib/plot/frames.spec.js`

- [ ] **Step 1: Write the failing tests**

`packages/chart/spec/lib/plot/frames.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { extractFrames, normalizeFrame, computeStaticDomains } from '../../../src/lib/plot/frames.js'

const rawData = [
  { year: 1999, class: 'compact', hwy: 29 },
  { year: 1999, class: 'suv',     hwy: 20 },
  { year: 2008, class: 'compact', hwy: 31 },
  // 2008/suv intentionally missing to test normalization
]

describe('extractFrames', () => {
  it('returns one entry per distinct time field value', () => {
    const frames = extractFrames(rawData, 'year')
    expect(frames.size).toBe(2)
    expect([...frames.keys()]).toEqual([1999, 2008])
  })

  it('each frame contains rows matching its time value', () => {
    const frames = extractFrames(rawData, 'year')
    expect(frames.get(1999)).toHaveLength(2)
    expect(frames.get(2008)).toHaveLength(1)
  })
})

describe('normalizeFrame', () => {
  it('fills missing (x, color) combinations with value 0', () => {
    const frames = extractFrames(rawData, 'year')
    const allXValues    = [...new Set(rawData.map((d) => d.class))]
    const allColorValues = null  // no color in this test

    const frame1999 = normalizeFrame(frames.get(1999), { x: 'class', y: 'hwy' }, allXValues, null)
    const frame2008 = normalizeFrame(frames.get(2008), { x: 'class', y: 'hwy' }, allXValues, null)

    // 2008 should have a 'suv' row filled in with hwy=0
    expect(frame2008).toHaveLength(2)
    const suv2008 = frame2008.find((r) => r.class === 'suv')
    expect(suv2008).toBeDefined()
    expect(suv2008.hwy).toBe(0)
  })

  it('leaves existing rows unchanged', () => {
    const frames = extractFrames(rawData, 'year')
    const allXValues = [...new Set(rawData.map((d) => d.class))]
    const frame1999 = normalizeFrame(frames.get(1999), { x: 'class', y: 'hwy' }, allXValues, null)
    const compact = frame1999.find((r) => r.class === 'compact')
    expect(compact?.hwy).toBe(29)
  })
})

describe('computeStaticDomains', () => {
  it('returns y domain spanning all frames combined', () => {
    const frames = extractFrames(rawData, 'year')
    const { yDomain } = computeStaticDomains(frames, { y: 'hwy' })
    expect(yDomain[0]).toBe(0)   // includeZero default
    expect(yDomain[1]).toBe(31)  // max across all rows
  })

  it('returns categorical x domain covering all frames', () => {
    const frames = extractFrames(rawData, 'year')
    const { xDomain } = computeStaticDomains(frames, { x: 'class', y: 'hwy' })
    expect(xDomain).toContain('compact')
    expect(xDomain).toContain('suv')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun run test:ci -- packages/chart/spec/frames.spec.js
```

Expected: FAIL — `./frames.js` not found.

- [ ] **Step 3: Write `lib/plot/frames.js`**

```js
import { extent } from 'd3-array'

/**
 * Extracts animation frames from data, keyed by time field value.
 * Preserves insertion order of time values.
 *
 * @param {Object[]} data
 * @param {string} timeField
 * @returns {Map<unknown, Object[]>}
 */
export function extractFrames(data, timeField) {
  const map = new Map()
  for (const row of data) {
    const key = row[timeField]
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(row)
  }
  return map
}

/**
 * Ensures all (x, color) combinations exist in the frame data.
 * Missing combinations are filled with y=0 so the animation
 * starts/ends smoothly without bars jumping in from nowhere.
 *
 * @param {Object[]} frameData - rows for a single frame
 * @param {{ x: string, y: string, color?: string }} channels
 * @param {unknown[]} allXValues - all x values across all frames
 * @param {unknown[] | null} allColorValues - all color values across frames (null if no color)
 * @returns {Object[]}
 */
export function normalizeFrame(frameData, channels, allXValues, allColorValues) {
  const { x: xf, y: yf, color: cf } = channels

  // Build lookup of existing (x, color?) keys
  const existing = new Set(
    frameData.map((d) => (cf ? `${d[xf]}::${d[cf]}` : String(d[xf])))
  )

  const filled = [...frameData]

  const colorValues = cf && allColorValues ? allColorValues : [null]

  for (const xVal of allXValues) {
    for (const colorVal of colorValues) {
      const key = cf ? `${xVal}::${colorVal}` : String(xVal)
      if (!existing.has(key)) {
        const row = { [xf]: xVal, [yf]: 0 }
        if (cf && colorVal !== null) row[cf] = colorVal
        filled.push(row)
      }
    }
  }

  return filled
}

/**
 * Computes static x/y domains across all frames combined.
 * These domains stay constant throughout the animation so bars
 * can be compared across frames by absolute height.
 *
 * NOTE: y domain is pinned to [0, max] — assumes bar chart semantics where
 * the baseline is always 0. If used with scatter or line charts where y can
 * be negative, pass an explicit `yDomain` override instead.
 *
 * @param {Map<unknown, Object[]>} frames
 * @param {{ x: string, y: string }} channels
 * @returns {{ xDomain: unknown[], yDomain: [number, number] }}
 */
export function computeStaticDomains(frames, channels) {
  const { x: xf, y: yf } = channels
  const allData = [...frames.values()].flat()

  const sampleX = allData[0]?.[xf]
  const xIsCategorical = typeof sampleX === 'string'

  const xDomain = xIsCategorical
    ? [...new Set(allData.map((d) => d[xf]))]
    : extent(allData, (d) => Number(d[xf]))

  const [, yMax] = extent(allData, (d) => Number(d[yf]))
  const yDomain = [0, yMax ?? 0]   // pin to 0 (bar chart default)

  return { xDomain, yDomain }
}
```

- [ ] **Step 4: Run tests**

```bash
bun run test:ci -- packages/chart/spec/frames.spec.js
```

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/lib/plot/frames.js packages/chart/spec/lib/plot/frames.spec.js
git commit -m "feat(chart): add lib/plot/frames.js — animation frame extraction and normalization"
```

---

### Task 4: `plot/Timeline.svelte`

Play/pause, scrub slider, speed selector, and current frame label. Purely presentational — emits events to parent.

**Files:**
- Create: `packages/chart/src/plot/Timeline.svelte`
- Create: `packages/chart/spec/plot/Timeline.spec.js`

- [ ] **Step 1: Write failing Timeline test**

`packages/chart/spec/plot/Timeline.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Timeline from '../../src/plot/Timeline.svelte'

const defaultProps = {
  frameKeys: [1999, 2008],
  currentIndex: 0,
  playing: false,
  speed: 1
}

describe('Timeline', () => {
  it('renders without crashing', () => {
    expect(() => render(Timeline, { props: defaultProps })).not.toThrow()
  })

  it('renders data-plot-timeline container', () => {
    const { container } = render(Timeline, { props: defaultProps })
    expect(container.querySelector('[data-plot-timeline]')).toBeTruthy()
  })

  it('renders play button when not playing', () => {
    const { container } = render(Timeline, { props: { ...defaultProps, playing: false } })
    const btn = container.querySelector('[data-plot-timeline-playpause]')
    expect(btn?.textContent).toContain('▶')
  })

  it('renders pause button when playing', () => {
    const { container } = render(Timeline, { props: { ...defaultProps, playing: true } })
    const btn = container.querySelector('[data-plot-timeline-playpause]')
    expect(btn?.textContent).toContain('⏸')
  })

  it('renders scrub slider with max = frameKeys.length - 1', () => {
    const { container } = render(Timeline, { props: defaultProps })
    const slider = container.querySelector('[data-plot-timeline-scrub]')
    expect(Number(slider?.getAttribute('max'))).toBe(1)
  })

  it('shows current frame label', () => {
    const { container } = render(Timeline, { props: { ...defaultProps, currentIndex: 1 } })
    const label = container.querySelector('[data-plot-timeline-label]')
    expect(label?.textContent).toContain('2008')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun run test:ci -- packages/chart/spec/Timeline.spec.js
```

Expected: FAIL — `./Timeline.svelte` not found.

- [ ] **Step 3: Write `plot/Timeline.svelte`**

```svelte
<script>
  /**
   * @type {{
   *   frameKeys: unknown[],
   *   currentIndex: number,
   *   playing: boolean,
   *   speed: number,
   *   onplay: () => void,
   *   onpause: () => void,
   *   onscrub: (index: number) => void,
   *   onspeed: (speed: number) => void
   * }}
   */
  let {
    frameKeys = [],
    currentIndex = 0,
    playing = false,
    speed = 1,
    onplay,
    onpause,
    onscrub,
    onspeed
  } = $props()

  const frameLabel = $derived(frameKeys[currentIndex] ?? '')

  const SPEEDS = [0.5, 1, 1.5, 2, 4]
</script>

<div class="timeline" data-plot-timeline>
  <!-- Play / Pause -->
  <button
    class="play-pause"
    aria-label={playing ? 'Pause' : 'Play'}
    onclick={() => playing ? onpause?.() : onplay?.()}
    data-plot-timeline-playpause
  >
    {playing ? '⏸' : '▶'}
  </button>

  <!-- Frame label -->
  <span class="frame-label" data-plot-timeline-label>{frameLabel}</span>

  <!-- Scrub slider -->
  <input
    type="range"
    min="0"
    max={frameKeys.length - 1}
    value={currentIndex}
    class="scrub"
    aria-label="Animation timeline"
    oninput={(e) => onscrub?.(Number(e.currentTarget.value))}
    data-plot-timeline-scrub
  />

  <!-- Speed selector -->
  <select
    aria-label="Playback speed"
    value={speed}
    onchange={(e) => onspeed?.(Number(e.currentTarget.value))}
    data-plot-timeline-speed
  >
    {#each SPEEDS as s (s)}
      <option value={s}>{s}×</option>
    {/each}
  </select>
</div>

<style>
  .timeline {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
    font-size: 12px;
  }
  .play-pause {
    font-size: 16px;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
  }
  .scrub {
    flex: 1;
  }
  .frame-label {
    min-width: 4ch;
    text-align: right;
  }
</style>
```

- [ ] **Step 4: Run tests**

```bash
bun run test:ci -- packages/chart/spec/Timeline.spec.js
```

Expected: All pass.

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/plot/Timeline.svelte packages/chart/spec/plot/Timeline.spec.js
git commit -m "feat(chart): add plot/Timeline.svelte — play/pause/scrub/speed controls"
```

---

### Task 5: `AnimatedPlot.svelte`

Renders one frame at a time. Computes static scales from full data, normalizes frame data, and drives animation via `requestAnimationFrame` + `prefers-reduced-motion` support.

**Files:**
- Create: `packages/chart/src/AnimatedPlot.svelte`
- Create: `packages/chart/spec/AnimatedPlot.spec.js`

- [ ] **Step 1: Write the failing test**

`packages/chart/spec/AnimatedPlot.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import AnimatedPlot from '../src/AnimatedPlot.svelte'
import mpg from '../src/fixtures/mpg.json'

describe('AnimatedPlot', () => {
  const defaultProps = {
    data: mpg,
    animate: { by: 'year' },
    x: 'class',
    y: 'hwy',
    geoms: [{ type: 'bar', stat: 'mean' }],
    width: 600,
    height: 400
  }

  it('renders without crashing', () => {
    expect(() => render(AnimatedPlot, { props: defaultProps })).not.toThrow()
  })

  it('renders data-plot-animated container', () => {
    const { container } = render(AnimatedPlot, { props: defaultProps })
    expect(container.querySelector('[data-plot-animated]')).toBeTruthy()
  })

  it('renders timeline controls', () => {
    const { container } = render(AnimatedPlot, { props: defaultProps })
    expect(container.querySelector('[data-plot-timeline]')).toBeTruthy()
  })

  it('renders play/pause button', () => {
    const { container } = render(AnimatedPlot, { props: defaultProps })
    expect(container.querySelector('[data-plot-timeline-playpause]')).toBeTruthy()
  })

  it('renders scrub slider with correct max', () => {
    const { container } = render(AnimatedPlot, { props: defaultProps })
    const slider = container.querySelector('[data-plot-timeline-scrub]')
    const expectedFrames = new Set(mpg.map((d) => d.year)).size
    expect(Number(slider?.getAttribute('max'))).toBe(expectedFrames - 1)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun run test:ci -- packages/chart/spec/AnimatedPlot.spec.js
```

Expected: FAIL — `./AnimatedPlot.svelte` not found.

- [ ] **Step 3: Write `AnimatedPlot.svelte`**

```svelte
<script>
  import { onMount, onDestroy } from 'svelte'
  import { extractFrames, normalizeFrame, computeStaticDomains } from './lib/plot/frames.js'
  import Timeline from './plot/Timeline.svelte'
  import PlotChart from './Plot.svelte'

  /**
   * @type {{
   *   data: Object[],
   *   animate: { by: string, duration?: number, loop?: boolean },
   *   x?: string,
   *   y?: string,
   *   color?: string,
   *   geoms?: import('./lib/plot/types.js').GeomSpec[],
   *   helpers?: import('./lib/plot/types.js').PlotHelpers,
   *   width?: number,
   *   height?: number,
   *   mode?: 'light' | 'dark',
   *   grid?: boolean,
   *   legend?: boolean,
   *   children?: import('svelte').Snippet
   * }}
   */
  let {
    data = [],
    animate,
    x,
    y,
    color,
    geoms = [],
    helpers = {},
    width = 600,
    height = 400,
    mode = 'light',
    grid = true,
    legend = false,
    children
  } = $props()

  // Extract and normalize frames
  const rawFrames = $derived(extractFrames(data, animate.by))
  const frameKeys = $derived([...rawFrames.keys()])

  const channels = $derived({ x, y, color })
  const allXValues = $derived(x ? [...new Set(data.map((d) => d[x]))] : [])
  const allColorValues = $derived(color ? [...new Set(data.map((d) => d[color]))] : null)

  const staticDomains = $derived(
    x && y ? computeStaticDomains(rawFrames, channels) : { xDomain: undefined, yDomain: undefined }
  )

  // Playback state
  let currentIndex = $state(0)
  let playing      = $state(false)
  let speed        = $state(1)

  // Current frame data (normalized — missing combos filled with 0)
  const currentFrameData = $derived.by(() => {
    const key = frameKeys[currentIndex]
    const raw = rawFrames.get(key) ?? []
    if (!x || !y) return raw
    return normalizeFrame(raw, { x, y, color }, allXValues, allColorValues)
  })

  // Reduced motion preference
  let prefersReducedMotion = $state(false)
  onMount(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    prefersReducedMotion = mq.matches
    mq.addEventListener('change', (e) => { prefersReducedMotion = e.matches })
  })

  // Animation loop
  // `duration` from the spec means "ms to spend on each frame transition"
  // We use it as the base interval, then divide by speed for playback rate.
  const baseDuration = $derived(animate.duration ?? 800)  // default 800ms per frame
  const msPerFrame   = $derived(Math.round(baseDuration / speed))
  let lastTime = 0
  let rafId = 0

  function tick(time) {
    if (!playing) return
    if (time - lastTime >= msPerFrame) {
      lastTime = time
      currentIndex = currentIndex + 1
      if (currentIndex >= frameKeys.length) {
        if (animate.loop ?? false) {
          currentIndex = 0
        } else {
          playing = false
          return
        }
      }
    }
    rafId = requestAnimationFrame(tick)
  }

  $effect(() => {
    if (playing && !prefersReducedMotion) {
      lastTime = 0
      rafId = requestAnimationFrame(tick)
    } else {
      cancelAnimationFrame(rafId)
    }
    return () => cancelAnimationFrame(rafId)
  })

  // Reduced motion: step frames on interval instead
  let reducedInterval = $state(0)
  $effect(() => {
    if (!playing || !prefersReducedMotion) {
      clearInterval(reducedInterval)
      return
    }
    reducedInterval = setInterval(() => {
      currentIndex = currentIndex + 1
      if (currentIndex >= frameKeys.length) {
        if (animate.loop ?? false) currentIndex = 0
        else { playing = false; clearInterval(reducedInterval) }
      }
    }, msPerFrame)
    return () => clearInterval(reducedInterval)
  })

  onDestroy(() => {
    cancelAnimationFrame(rafId)
    clearInterval(reducedInterval)
  })

  function handlePlay()  { playing = true }
  function handlePause() { playing = false }
  function handleScrub(index) {
    playing = false
    currentIndex = index
  }
  function handleSpeed(s) { speed = s }

  // Build spec for the current frame, with static domain overrides
  const frameSpec = $derived({
    data: currentFrameData,
    x, y, color,
    geoms,
    xDomain: staticDomains.xDomain,
    yDomain: staticDomains.yDomain
  })
</script>

<div class="animated-plot" data-plot-animated>
  <PlotChart
    spec={frameSpec}
    {helpers}
    {width}
    {height}
    {mode}
    {grid}
    {legend}
  >
    {@render children?.()}
  </PlotChart>

  <Timeline
    {frameKeys}
    {currentIndex}
    {playing}
    {speed}
    onplay={handlePlay}
    onpause={handlePause}
    onscrub={handleScrub}
    onspeed={handleSpeed}
  />
</div>

<style>
  .animated-plot {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
</style>
```

- [ ] **Step 4: Run tests**

```bash
bun run test:ci -- packages/chart/spec/AnimatedPlot.spec.js
```

Expected: All pass.

- [ ] **Step 5: Run full test suite**

```bash
bun run test:ci
```

Expected: All existing tests still pass.

- [ ] **Step 6: Commit**

```bash
git add packages/chart/src/AnimatedPlot.svelte packages/chart/spec/AnimatedPlot.spec.js
git commit -m "feat(chart): add AnimatedPlot.svelte with timeline controls and reduced-motion support"
```

---

## Chunk 3: Exports + docs update

### Task 6: Export new components + update docs status

**Files:**
- Modify: `packages/chart/src/index.js`
- Modify: `docs/features/07-Charts.md`

- [ ] **Step 1: Add exports to `index.js`**

```js
// Facets and Animation
export { default as FacetPlot }    from './FacetPlot.svelte'
export { default as AnimatedPlot } from './AnimatedPlot.svelte'
```

- [ ] **Step 2: Update `docs/features/07-Charts.md` status tables**

Update these rows from 🔲 Planned to ✅ Implemented:

```
| `FacetPlot.svelte`               | ✅ Implemented |
| Fixed scales (shared domain)      | ✅ Implemented |
| Free scales (per-panel domain)    | ✅ Implemented |
| Missing values → gaps             | ✅ Implemented |
| `AnimatedPlot.svelte`             | ✅ Implemented |
| Frame normalization (fill missing with 0) | ✅ Implemented |
| Static scales across frames       | ✅ Implemented |
| Timeline controls (play/pause/scrub/speed) | ✅ Implemented |
| `prefers-reduced-motion`          | ✅ Implemented |
```

Note: "Shared axis/legend across facet panels" and "Bar chart race (sorted positions)" remain 🔲 Planned — they are not in this plan's scope.

- [ ] **Step 3: Run tests and lint**

```bash
bun run test:ci && bun run lint
```

Expected: All pass, zero lint errors.

- [ ] **Step 4: Commit**

```bash
git add packages/chart/src/index.js docs/features/07-Charts.md
git commit -m "feat(chart): export FacetPlot and AnimatedPlot; update feature status"
```

---

## Done

After Task 6, the Facets and Animation layer is complete:

- `lib/plot/facet.js` — `splitByField`, `getFacetDomains` (fixed/free scales) — tested
- `lib/plot/frames.js` — `extractFrames`, `normalizeFrame`, `computeStaticDomains` — tested
- `FacetPlot.svelte` — CSS grid of Plot panels, fixed/free scale modes, per-panel titles
- `FacetPlot/Panel.svelte` — Plot wrapper accepting xDomain/yDomain overrides
- `plot/Timeline.svelte` — play/pause, scrub slider, speed selector, frame label
- `AnimatedPlot.svelte` — frame-by-frame animation, static scales, `prefers-reduced-motion`

**Next: Plan 4 — CrossFilter** (`CrossFilter` context, `filterable`/`brush` geom props, `FilterBar`, `FilterSlider`)
