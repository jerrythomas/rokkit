# Chart Stat Aggregation & Brewer Subclasses — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `stat` prop to BarChart, LineChart, AreaChart, and PieChart that aggregates data before rendering, using a subclass-per-chart-type pattern that will also support BoxPlot and ViolinPlot in a follow-up plan.

**Architecture:** The Svelte-5 `ChartBrewer` (in `brewer.svelte.js`) gains a `transform(data, channels, stat)` hook and a `processedData` derived property. Subclasses (`CartesianBrewer`, `PieBrewer`) override `transform` to apply aggregation via `@rokkit/data`'s `dataset()`. All existing `$derived` marks switch from raw `#data` to `processedData`. Chart components swap `new ChartBrewer()` for their specific subclass and accept a `stat` prop.

**Tech Stack:** Svelte 5 runes, `@rokkit/data` (`dataset().groupBy().summarize().rollup().select()`), `d3-array` (`sum`, `mean`, `min`, `max`, `quantile`, `ascending`), Vitest, `@testing-library/svelte`

---

## File Map

**New files:**
- `packages/chart/src/lib/brewing/stats.js` — `STAT_FNS` map + `applyAggregate()` helper
- `packages/chart/src/lib/brewing/CartesianBrewer.svelte.js` — subclass for Bar/Line/Area
- `packages/chart/src/lib/brewing/PieBrewer.svelte.js` — subclass for Pie (always aggregates)
- `packages/chart/spec/brewing/stats.spec.js` — unit tests for stats.js
- `packages/chart/spec/brewing/CartesianBrewer.spec.js`
- `packages/chart/spec/brewing/PieBrewer.spec.js`

**Modified files:**
- `packages/chart/src/lib/brewing/brewer.svelte.js` — add transform hook, processedData, channels getter, stat in update()
- `packages/chart/src/charts/BarChart.svelte` — use CartesianBrewer, add `stat` prop
- `packages/chart/src/charts/LineChart.svelte` — use CartesianBrewer, add `stat` prop
- `packages/chart/src/charts/AreaChart.svelte` — use CartesianBrewer, add `stat` prop
- `packages/chart/src/charts/PieChart.svelte` — use PieBrewer, add `stat` prop (default `'sum'`)
- `packages/chart/src/index.js` — export CartesianBrewer, PieBrewer
- `site/src/routes/(play)/playground/components/bar-chart/+page.svelte` — add stat control + multi-row data
- `site/src/routes/(play)/playground/components/pie-chart/+page.svelte` — add stat control

---

## Chunk 1: Stats Utility

### Task 1: `stats.js` — stat functions and aggregate helper

**Files:**
- Create: `packages/chart/src/lib/brewing/stats.js`
- Create: `packages/chart/spec/brewing/stats.spec.js`

**Context:**
`@rokkit/data` is already a dependency. The `dataset()` API:
```js
dataset(data)
  .groupBy('field1', 'field2')
  .summarize((row) => row['y'], { y: sumFn })
  .rollup()
  .select()  // returns aggregated array
```
The mapper in `summarize` must be a function returning the raw value (not `pick()`), so formula functions receive arrays of numbers.

- [ ] **Step 1: Write the failing tests**

```js
// packages/chart/spec/brewing/stats.spec.js
import { describe, it, expect } from 'vitest'
import { STAT_FNS, applyAggregate } from '../../src/lib/brewing/stats.js'

const data = [
  { cat: 'A', val: 10, group: 'x' },
  { cat: 'A', val: 20, group: 'x' },
  { cat: 'B', val: 30, group: 'y' },
  { cat: 'B', val: 40, group: 'y' }
]

describe('STAT_FNS', () => {
  it('sum adds values', () => expect(STAT_FNS.sum([1, 2, 3])).toBe(6))
  it('mean averages values', () => expect(STAT_FNS.mean([10, 20, 30])).toBe(20))
  it('min returns smallest', () => expect(STAT_FNS.min([5, 1, 9])).toBe(1))
  it('max returns largest', () => expect(STAT_FNS.max([5, 1, 9])).toBe(9))
  it('count returns length', () => expect(STAT_FNS.count([1, 2, 3])).toBe(3))
})

describe('applyAggregate', () => {
  it('identity returns data unchanged', () => {
    const result = applyAggregate(data, { by: ['cat'], value: 'val', stat: 'identity' })
    expect(result).toBe(data)
  })

  it('sum groups and sums', () => {
    const result = applyAggregate(data, { by: ['cat'], value: 'val', stat: 'sum' })
    expect(result).toHaveLength(2)
    const a = result.find((r) => r.cat === 'A')
    expect(a.val).toBe(30)
  })

  it('mean groups and averages', () => {
    const result = applyAggregate(data, { by: ['cat'], value: 'val', stat: 'mean' })
    const a = result.find((r) => r.cat === 'A')
    expect(a.val).toBe(15)
  })

  it('count groups and counts rows', () => {
    const result = applyAggregate(data, { by: ['cat'], value: 'val', stat: 'count' })
    const a = result.find((r) => r.cat === 'A')
    expect(a.val).toBe(2)
  })

  it('accepts a custom function', () => {
    const customFn = (values) => values.reduce((a, b) => a + b, 0) * 2
    const result = applyAggregate(data, { by: ['cat'], value: 'val', stat: customFn })
    const a = result.find((r) => r.cat === 'A')
    expect(a.val).toBe(60)
  })

  it('groups by multiple fields', () => {
    const result = applyAggregate(data, { by: ['cat', 'group'], value: 'val', stat: 'sum' })
    expect(result).toHaveLength(2)
  })

  it('returns data unchanged when by is empty', () => {
    const result = applyAggregate(data, { by: [], value: 'val', stat: 'sum' })
    expect(result).toBe(data)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd packages/chart && bun run test --reporter=verbose spec/brewing/stats.spec.js
```
Expected: FAIL — `Cannot find module '../../src/lib/brewing/stats.js'`

- [ ] **Step 3: Implement `stats.js`**

```js
// packages/chart/src/lib/brewing/stats.js
import { sum, mean, min, max } from 'd3-array'
import { dataset } from '@rokkit/data'

/**
 * Built-in reduction functions. Each receives an array of numeric values.
 * @type {Record<string, (values: number[]) => number>}
 */
export const STAT_FNS = {
  sum,
  mean,
  min,
  max,
  count: (values) => values.length
}

/**
 * Aggregates data by one or more grouping fields, reducing the value field
 * using the given stat. Accepts a built-in name or a custom function.
 *
 * @param {Object[]} data
 * @param {{ by: string[], value: string, stat: string|Function }} opts
 * @returns {Object[]}
 */
export function applyAggregate(data, { by, value, stat }) {
  if (stat === 'identity' || !by.length || !value) return data
  const fn = typeof stat === 'function' ? stat : STAT_FNS[stat]
  if (!fn) return data
  return dataset(data)
    .groupBy(...by)
    .summarize((row) => row[value], { [value]: fn })
    .rollup()
    .select()
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd packages/chart && bun run test --reporter=verbose spec/brewing/stats.spec.js
```
Expected: 12 tests PASS

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/lib/brewing/stats.js packages/chart/spec/brewing/stats.spec.js
git commit -m "feat(chart): add stat aggregation utility with STAT_FNS and applyAggregate"
```

---

## Chunk 2: Brewer Subclasses

### Task 2: Refactor `brewer.svelte.js` — add transform hook

**Files:**
- Modify: `packages/chart/src/lib/brewing/brewer.svelte.js`
- Modify: `packages/chart/spec/brewing/brewer.spec.js`

**Context:**
Current `brewer.svelte.js` has `#data = $state([])`. We need to:
1. Rename to `#rawData`
2. Add `#stat = $state('identity')`
3. Add `transform(data, channels, stat) { return data }` — subclasses override this
4. Add `processedData = $derived(this.transform(this.#rawData, this.#channels, this.#stat))` — public, so subclasses can reference it
5. Add `get channels()` — so subclasses can read channels in their own `$derived` properties
6. Replace every `this.#data` reference in `$derived` properties with `this.processedData`
7. Handle `stat` in `update()`

The `processedData` derived property MUST be declared before any derived that uses it (class field order matters in JS).

- [ ] **Step 1: Write the failing test**

Add to `packages/chart/spec/brewing/brewer.spec.js`:

```js
// Add this describe block to existing brewer.spec.js
describe('transform hook', () => {
  it('processedData defaults to raw data', () => {
    const brewer = new ChartBrewer()
    const data = [{ x: 1, y: 2 }]
    brewer.update({ data })
    expect(brewer.processedData).toEqual(data)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/chart && bun run test --reporter=verbose spec/brewing/brewer.spec.js
```
Expected: FAIL — `brewer.processedData is undefined`

- [ ] **Step 3: Update `brewer.svelte.js`**

Key changes (show full relevant sections):

```js
// packages/chart/src/lib/brewing/brewer.svelte.js
import { distinct, assignColors } from './colors.js'
import { assignPatterns, toPatternId } from './patterns.js'
import { assignSymbols } from './symbols.js'
import { buildXScale, buildYScale, buildSizeScale } from './scales.js'
import { buildBars } from './marks/bars.js'
import { buildLines } from './marks/lines.js'
import { buildAreas } from './marks/areas.js'
import { buildArcs } from './marks/arcs.js'
import { buildPoints } from './marks/points.js'

const DEFAULT_MARGIN = { top: 20, right: 20, bottom: 40, left: 50 }

export { buildLegendGroups } // keep existing export

export class ChartBrewer {
  #rawData = $state([])
  #channels = $state({})
  #width = $state(600)
  #height = $state(400)
  #mode = $state('light')
  #margin = $state(DEFAULT_MARGIN)
  #layers = $state([])
  #curve = $state(undefined)
  #stat = $state('identity')

  /**
   * Override in subclasses to apply stat aggregation.
   * @param {Object[]} data
   * @param {Object} channels
   * @param {string|Function} stat
   * @returns {Object[]}
   */
  transform(data, channels, stat) {
    return data
  }

  /** Aggregated data — all derived marks read this, not #rawData */
  processedData = $derived(this.transform(this.#rawData, this.#channels, this.#stat))

  /** Exposes channels to subclasses for use in their own $derived properties */
  get channels() { return this.#channels }

  colorMap = $derived(
    this.#channels.color
      ? assignColors(distinct(this.processedData, this.#channels.color), this.#mode)
      : new Map()
  )

  patternMap = $derived(
    this.#channels.pattern
      ? assignPatterns(distinct(this.processedData, this.#channels.pattern))
      : new Map()
  )

  symbolMap = $derived(
    this.#channels.symbol
      ? assignSymbols(distinct(this.processedData, this.#channels.symbol))
      : new Map()
  )

  get innerWidth()  { return this.#width  - this.#margin.left - this.#margin.right }
  get innerHeight() { return this.#height - this.#margin.top  - this.#margin.bottom }

  xScale = $derived(
    this.#channels.x
      ? buildXScale(this.processedData, this.#channels.x, this.innerWidth)
      : null
  )

  yScale = $derived(
    this.#channels.y
      ? buildYScale(this.processedData, this.#channels.y, this.innerHeight, this.#layers)
      : null
  )

  sizeScale = $derived(
    this.#channels.size
      ? buildSizeScale(this.processedData, this.#channels.size)
      : null
  )

  bars = $derived(
    this.xScale && this.yScale
      ? buildBars(this.processedData, this.#channels, this.xScale, this.yScale, this.colorMap, this.patternMap)
      : []
  )

  lines = $derived(
    this.xScale && this.yScale
      ? buildLines(this.processedData, this.#channels, this.xScale, this.yScale, this.colorMap, this.#curve)
      : []
  )

  areas = $derived(
    this.xScale && this.yScale
      ? buildAreas(this.processedData, this.#channels, this.xScale, this.yScale, this.colorMap, this.#curve, this.patternMap)
      : []
  )

  arcs = $derived(
    this.#channels.y
      ? buildArcs(this.processedData, this.#channels, this.colorMap, this.#width, this.#height)
      : []
  )

  points = $derived(
    this.xScale && this.yScale
      ? buildPoints(this.processedData, this.#channels, this.xScale, this.yScale, this.colorMap, this.sizeScale, this.symbolMap)
      : []
  )

  legendGroups = $derived(
    buildLegendGroups(this.#channels, this.colorMap, this.patternMap, this.symbolMap)
  )

  get margin()  { return this.#margin }
  get width()   { return this.#width }
  get height()  { return this.#height }
  get mode()    { return this.#mode }

  update(opts = {}) {
    if (opts.data     !== undefined) this.#rawData  = opts.data
    if (opts.channels !== undefined) this.#channels = opts.channels
    if (opts.width    !== undefined) this.#width    = opts.width
    if (opts.height   !== undefined) this.#height   = opts.height
    if (opts.mode     !== undefined) this.#mode     = opts.mode
    if (opts.margin   !== undefined) this.#margin   = { ...DEFAULT_MARGIN, ...opts.margin }
    if (opts.layers   !== undefined) this.#layers   = opts.layers
    if (opts.curve    !== undefined) this.#curve    = opts.curve
    if (opts.stat     !== undefined) this.#stat     = opts.stat
  }
}
```

- [ ] **Step 4: Run all chart tests to verify nothing regressed**

```bash
cd packages/chart && bun run test
```
Expected: all existing tests PASS (and the new processedData test passes)

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/lib/brewing/brewer.svelte.js packages/chart/spec/brewing/brewer.spec.js
git commit -m "feat(chart): add transform hook and processedData to ChartBrewer"
```

---

### Task 3: `CartesianBrewer` and `PieBrewer`

**Files:**
- Create: `packages/chart/src/lib/brewing/CartesianBrewer.svelte.js`
- Create: `packages/chart/src/lib/brewing/PieBrewer.svelte.js`
- Create: `packages/chart/spec/brewing/CartesianBrewer.spec.js`
- Create: `packages/chart/spec/brewing/PieBrewer.spec.js`

**Context:**
`CartesianBrewer` groups by `[x, color].filter(Boolean)` — this handles the case where bars are colored by a different field (multi-group). `PieBrewer` always aggregates by the `label` field and ignores `stat='identity'` (identity makes no sense for a pie).

- [ ] **Step 1: Write the failing tests**

```js
// packages/chart/spec/brewing/CartesianBrewer.spec.js
import { describe, it, expect } from 'vitest'
import { CartesianBrewer } from '../../src/lib/brewing/CartesianBrewer.svelte.js'

const data = [
  { month: 'Jan', region: 'North', revenue: 10 },
  { month: 'Jan', region: 'North', revenue: 20 },
  { month: 'Jan', region: 'South', revenue: 30 },
  { month: 'Feb', region: 'North', revenue: 15 }
]

describe('CartesianBrewer.transform', () => {
  it('returns data unchanged for identity stat', () => {
    const brewer = new CartesianBrewer()
    const result = brewer.transform(data, { x: 'month', y: 'revenue' }, 'identity')
    expect(result).toBe(data)
  })

  it('groups by x only when no color channel', () => {
    const brewer = new CartesianBrewer()
    const result = brewer.transform(data, { x: 'month', y: 'revenue' }, 'sum')
    expect(result).toHaveLength(2) // Jan + Feb
    expect(result.find((r) => r.month === 'Jan').revenue).toBe(60)
  })

  it('groups by x and color when color is set', () => {
    const brewer = new CartesianBrewer()
    const result = brewer.transform(data, { x: 'month', y: 'revenue', color: 'region' }, 'sum')
    // Jan/North=30, Jan/South=30, Feb/North=15
    expect(result).toHaveLength(3)
  })

  it('applies mean stat', () => {
    const brewer = new CartesianBrewer()
    const result = brewer.transform(data, { x: 'month', y: 'revenue' }, 'mean')
    expect(result.find((r) => r.month === 'Jan').revenue).toBe(20) // (10+20+30)/3
  })

  it('accepts a custom function', () => {
    const brewer = new CartesianBrewer()
    const double = (vals) => vals.reduce((a, b) => a + b, 0) * 2
    const result = brewer.transform(data, { x: 'month', y: 'revenue' }, double)
    expect(result.find((r) => r.month === 'Jan').revenue).toBe(120)
  })
})
```

```js
// packages/chart/spec/brewing/PieBrewer.spec.js
import { describe, it, expect } from 'vitest'
import { PieBrewer } from '../../src/lib/brewing/PieBrewer.svelte.js'

const data = [
  { segment: 'A', share: 10 },
  { segment: 'A', share: 20 },
  { segment: 'B', share: 30 }
]

describe('PieBrewer.transform', () => {
  it('always aggregates by label field', () => {
    const brewer = new PieBrewer()
    const result = brewer.transform(data, { label: 'segment', y: 'share' }, 'sum')
    expect(result).toHaveLength(2)
    expect(result.find((r) => r.segment === 'A').share).toBe(30)
  })

  it('uses sum when stat is identity (identity not valid for pie)', () => {
    const brewer = new PieBrewer()
    const result = brewer.transform(data, { label: 'segment', y: 'share' }, 'identity')
    expect(result).toHaveLength(2) // still aggregates
  })

  it('applies count stat', () => {
    const brewer = new PieBrewer()
    const result = brewer.transform(data, { label: 'segment', y: 'share' }, 'count')
    expect(result.find((r) => r.segment === 'A').share).toBe(2)
  })

  it('returns data unchanged when label or y is missing', () => {
    const brewer = new PieBrewer()
    expect(brewer.transform(data, { y: 'share' }, 'sum')).toBe(data)
    expect(brewer.transform(data, { label: 'segment' }, 'sum')).toBe(data)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd packages/chart && bun run test --reporter=verbose spec/brewing/CartesianBrewer.spec.js spec/brewing/PieBrewer.spec.js
```
Expected: FAIL — modules not found

- [ ] **Step 3: Implement `CartesianBrewer.svelte.js`**

```js
// packages/chart/src/lib/brewing/CartesianBrewer.svelte.js
import { ChartBrewer } from './brewer.svelte.js'
import { applyAggregate } from './stats.js'

/**
 * Brewer for cartesian charts (Bar, Line, Area).
 * Groups by x (and color if set) and applies the given stat.
 */
export class CartesianBrewer extends ChartBrewer {
  transform(data, channels, stat) {
    if (stat === 'identity' || !channels.x || !channels.y) return data
    const by = [channels.x, channels.color].filter(Boolean)
    return applyAggregate(data, { by, value: channels.y, stat })
  }
}
```

- [ ] **Step 4: Implement `PieBrewer.svelte.js`**

```js
// packages/chart/src/lib/brewing/PieBrewer.svelte.js
import { ChartBrewer } from './brewer.svelte.js'
import { applyAggregate } from './stats.js'

/**
 * Brewer for pie charts. Always aggregates by the label field.
 * 'identity' is not meaningful for pie charts — falls back to 'sum'.
 */
export class PieBrewer extends ChartBrewer {
  transform(data, channels, stat) {
    if (!channels.label || !channels.y) return data
    const effectiveStat = stat === 'identity' ? 'sum' : (stat ?? 'sum')
    return applyAggregate(data, { by: [channels.label], value: channels.y, stat: effectiveStat })
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd packages/chart && bun run test --reporter=verbose spec/brewing/CartesianBrewer.spec.js spec/brewing/PieBrewer.spec.js
```
Expected: all tests PASS

- [ ] **Step 6: Commit**

```bash
git add packages/chart/src/lib/brewing/CartesianBrewer.svelte.js \
        packages/chart/src/lib/brewing/PieBrewer.svelte.js \
        packages/chart/spec/brewing/CartesianBrewer.spec.js \
        packages/chart/spec/brewing/PieBrewer.spec.js
git commit -m "feat(chart): add CartesianBrewer and PieBrewer subclasses with stat transform"
```

---

## Chunk 3: Wire Charts + Exports + Playground

### Task 4: Wire BarChart, LineChart, AreaChart to CartesianBrewer

**Files:**
- Modify: `packages/chart/src/charts/BarChart.svelte`
- Modify: `packages/chart/src/charts/LineChart.svelte`
- Modify: `packages/chart/src/charts/AreaChart.svelte`
- Modify: `packages/chart/spec/charts/BarChart.spec.js`

**Context:**
Each chart only needs two changes in its `<script>`:
1. Change import + `new ChartBrewer()` → `new CartesianBrewer()`
2. Add `stat = 'identity'` prop and pass it in `brewer.update()`

The `stat` prop accepts the strings `'identity'`, `'sum'`, `'mean'`, `'min'`, `'max'`, `'count'` or any `(values: number[]) => number` function.

- [ ] **Step 1: Write a failing test for stat in BarChart**

Add to `packages/chart/spec/charts/BarChart.spec.js`:

```js
it('renders with stat=sum', () => {
  const aggData = [
    { category: 'A', revenue: 50 },
    { category: 'A', revenue: 50 },
    { category: 'B', revenue: 200 }
  ]
  const { container } = render(BarChart, { data: aggData, x: 'category', y: 'revenue', stat: 'sum' })
  expect(container.querySelector('svg')).toBeTruthy()
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/chart && bun run test --reporter=verbose spec/charts/BarChart.spec.js
```
Expected: FAIL — `stat` prop has no effect / warning

- [ ] **Step 3: Update `BarChart.svelte`**

Change import and brewer instantiation:
```js
// Replace:
import { ChartBrewer } from '../lib/brewing/brewer.svelte.js'
// With:
import { CartesianBrewer } from '../lib/brewing/CartesianBrewer.svelte.js'
```

Add `stat` to props destructuring:
```js
let {
  data = [],
  x = undefined,
  y = undefined,
  color = undefined,
  pattern = undefined,
  stat = 'identity',   // ← add this
  width = 600,
  height = 400,
  mode = 'light',
  grid = true,
  legend = false
} = $props()
```

Change brewer instantiation:
```js
const brewer = new CartesianBrewer()  // was: new ChartBrewer()
```

Add stat to brewer.update():
```js
brewer.update({ data, channels, width, height, mode, stat })  // add stat
```

Apply same changes to `LineChart.svelte` and `AreaChart.svelte`.

- [ ] **Step 4: Run all chart tests**

```bash
cd packages/chart && bun run test
```
Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/charts/BarChart.svelte \
        packages/chart/src/charts/LineChart.svelte \
        packages/chart/src/charts/AreaChart.svelte \
        packages/chart/spec/charts/BarChart.spec.js
git commit -m "feat(chart): wire BarChart, LineChart, AreaChart to CartesianBrewer with stat prop"
```

---

### Task 5: Wire PieChart to PieBrewer

**Files:**
- Modify: `packages/chart/src/charts/PieChart.svelte`
- Modify: `packages/chart/spec/charts/PieChart.spec.js`

- [ ] **Step 1: Write a failing test**

Add to `packages/chart/spec/charts/PieChart.spec.js`:
```js
it('aggregates duplicate labels with stat=sum', () => {
  const dupData = [
    { segment: 'A', share: 10 },
    { segment: 'A', share: 20 },
    { segment: 'B', share: 30 }
  ]
  const { container } = render(PieChart, {
    data: dupData, label: 'segment', y: 'share', stat: 'sum'
  })
  expect(container.querySelector('svg')).toBeTruthy()
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd packages/chart && bun run test --reporter=verbose spec/charts/PieChart.spec.js
```

- [ ] **Step 3: Update `PieChart.svelte`**

```js
// Replace ChartBrewer import:
import { PieBrewer } from '../lib/brewing/PieBrewer.svelte.js'

// Add stat prop (default 'sum'):
let {
  data = [],
  label = undefined,
  y = undefined,
  color = undefined,
  pattern = undefined,
  stat = 'sum',          // ← add this; default sum because pie always aggregates
  width = 400,
  height = 400,
  mode = 'light',
  legend = false
} = $props()

// Change brewer:
const brewer = new PieBrewer()

// Add stat to update:
brewer.update({ data, channels, width, height, mode, stat })
```

- [ ] **Step 4: Run all tests**

```bash
cd packages/chart && bun run test
```
Expected: all tests PASS

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/charts/PieChart.svelte packages/chart/spec/charts/PieChart.spec.js
git commit -m "feat(chart): wire PieChart to PieBrewer — always aggregates by label field"
```

---

### Task 6: Update exports + playground pages

**Files:**
- Modify: `packages/chart/src/index.js`
- Modify: `site/src/routes/(play)/playground/components/bar-chart/+page.svelte`
- Modify: `site/src/routes/(play)/playground/components/pie-chart/+page.svelte`

**Context:**
The bar chart playground needs data with duplicate x values so stat is meaningful. Replace the current 8-quarter dataset with monthly revenue data that can be aggregated by quarter. The pie chart playground should expose `stat` but only show meaningful options (`sum`, `count`, `mean`).

- [ ] **Step 1: Add exports to `packages/chart/src/index.js`**

**Important context:** There are two `ChartBrewer` classes in this codebase:
- `lib/brewing/index.svelte.js` — the legacy non-runes class used by `Plot.*` primitives (setData/setFields API). This is currently the one exported as `ChartBrewer` from `src/index.js`. **Do not change this export.**
- `lib/brewing/brewer.svelte.js` — the Svelte 5 runes class used internally by all standalone chart components (BarChart, PieChart, etc.). Subclasses extend this one. It is not currently exported.

Add after existing chart exports — do NOT replace the existing `ChartBrewer` export:
```js
export { CartesianBrewer } from './lib/brewing/CartesianBrewer.svelte.js'
export { PieBrewer } from './lib/brewing/PieBrewer.svelte.js'
```

- [ ] **Step 2: Update bar-chart playground — add stat control + meaningful dataset**

Replace the existing `chartData` and props/schema/layout in `site/src/routes/(play)/playground/components/bar-chart/+page.svelte`:

```js
// Monthly data — aggregating by quarter is meaningful with stat='sum'
const chartData = [
  { quarter: 'Q1', month: 'Jan', revenue: 18000, cost: 13000, region: 'North' },
  { quarter: 'Q1', month: 'Feb', revenue: 22000, cost: 16000, region: 'North' },
  { quarter: 'Q1', month: 'Mar', revenue: 19000, cost: 14000, region: 'North' },
  { quarter: 'Q2', month: 'Apr', revenue: 31000, cost: 22000, region: 'North' },
  { quarter: 'Q2', month: 'May', revenue: 28000, cost: 20000, region: 'North' },
  { quarter: 'Q2', month: 'Jun', revenue: 35000, cost: 25000, region: 'North' },
  { quarter: 'Q3', month: 'Jul', revenue: 29000, cost: 21000, region: 'North' },
  { quarter: 'Q3', month: 'Aug', revenue: 33000, cost: 23000, region: 'North' },
  { quarter: 'Q3', month: 'Sep', revenue: 27000, cost: 19000, region: 'North' },
  { quarter: 'Q4', month: 'Oct', revenue: 40000, cost: 28000, region: 'North' },
  { quarter: 'Q4', month: 'Nov', revenue: 45000, cost: 32000, region: 'North' },
  { quarter: 'Q4', month: 'Dec', revenue: 52000, cost: 37000, region: 'North' },
  { quarter: 'Q1', month: 'Jan', revenue: 12000, cost: 9000,  region: 'South' },
  { quarter: 'Q1', month: 'Feb', revenue: 15000, cost: 11000, region: 'South' },
  { quarter: 'Q1', month: 'Mar', revenue: 11000, cost: 8000,  region: 'South' },
  { quarter: 'Q2', month: 'Apr', revenue: 19000, cost: 14000, region: 'South' },
  { quarter: 'Q2', month: 'May', revenue: 22000, cost: 16000, region: 'South' },
  { quarter: 'Q2', month: 'Jun', revenue: 18000, cost: 13000, region: 'South' },
  { quarter: 'Q3', month: 'Jul', revenue: 21000, cost: 15000, region: 'South' },
  { quarter: 'Q3', month: 'Aug', revenue: 24000, cost: 18000, region: 'South' },
  { quarter: 'Q3', month: 'Sep', revenue: 20000, cost: 14000, region: 'South' },
  { quarter: 'Q4', month: 'Oct', revenue: 28000, cost: 20000, region: 'South' },
  { quarter: 'Q4', month: 'Nov', revenue: 32000, cost: 23000, region: 'South' },
  { quarter: 'Q4', month: 'Dec', revenue: 35000, cost: 25000, region: 'South' }
]

let props = $state({
  colorField: 'region',
  patternField: 'region',
  stat: 'sum',
  grid: true,
  legend: true
})

const schema = {
  type: 'object',
  properties: {
    colorField: { type: 'string' },
    patternField: { type: 'string' },
    stat: { type: 'string' },
    grid: { type: 'boolean' },
    legend: { type: 'boolean' }
  }
}

const layout = {
  type: 'vertical',
  elements: [
    { scope: '#/colorField',   label: 'color',   props: { options: ['', 'region', 'quarter'] } },
    { scope: '#/patternField', label: 'pattern', props: { options: ['', 'region', 'quarter'] } },
    { scope: '#/stat',         label: 'stat',    props: { options: ['identity', 'sum', 'mean', 'min', 'max', 'count'] } },
    { scope: '#/grid',         label: 'grid' },
    { scope: '#/legend',       label: 'legend' },
    { type: 'separator' }
  ]
}
```

Update the BarChart usage in `{#snippet preview()}`:
```svelte
<BarChart
  data={chartData}
  x="quarter"
  y="revenue"
  color={props.colorField || undefined}
  pattern={props.patternField || undefined}
  stat={props.stat}
  grid={props.grid}
  legend={props.legend}
  width={560}
  height={320}
/>
```

Update controls snippet:
```svelte
{#snippet controls()}
  <FormRenderer bind:data={props} {schema} {layout} />
  <InfoField label="x" value="quarter" />
  <InfoField label="y" value="revenue" />
{/snippet}
```

- [ ] **Step 3: Update pie-chart playground — add stat control**

In `site/src/routes/(play)/playground/components/pie-chart/+page.svelte`, add `stat` to props, schema, layout and pass it to `PieChart`:

```js
let props = $state({
  colorField: 'segment',
  patternField: 'segment',
  stat: 'sum',
  legend: true
})
```

Add to schema:
```js
stat: { type: 'string' }
```

Add to layout elements (before separator):
```js
{ scope: '#/stat', label: 'stat', props: { options: ['sum', 'count', 'mean'] } }
```

Update PieChart in preview:
```svelte
<PieChart
  data={chartData}
  label="segment"
  y="share"
  color={props.colorField || undefined}
  pattern={props.patternField || undefined}
  stat={props.stat}
  legend={props.legend}
  width={400}
  height={400}
/>
```

- [ ] **Step 4: Verify the site builds**

```bash
cd site && bun run build 2>&1 | tail -20
```
Expected: Build succeeds with no errors

- [ ] **Step 5: Run all chart tests**

```bash
cd packages/chart && bun run test
```
Expected: all tests PASS

- [ ] **Step 6: Commit**

```bash
git add packages/chart/src/index.js \
        site/src/routes/\(play\)/playground/components/bar-chart/+page.svelte \
        site/src/routes/\(play\)/playground/components/pie-chart/+page.svelte
git commit -m "feat(chart): export brewer subclasses and add stat control to bar/pie playgrounds"
```

---

## Verification

After all tasks:

```bash
# Full test suite
bun run test:ci

# Lint
bun run lint
```

Expected: zero errors.

Open in browser:
- `http://localhost:5174/playground/components/bar-chart` — set stat=sum, observe quarterly totals from monthly data; set stat=mean for averages
- `http://localhost:5174/playground/components/pie-chart` — stat=count shows number of entries per segment
