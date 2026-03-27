# New Chart Types: BoxPlot, ViolinPlot, BubbleChart — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Prerequisite:** `docs/superpowers/plans/2026-03-23-chart-stat-brewers.md` must be fully implemented first. This plan depends on `ChartBrewer.transform()`, `processedData`, and `get channels()` being in place.

**Goal:** Add three new chart types — BoxPlot (quartile summary), ViolinPlot (distribution shape), and BubbleChart (scatter with size encoding) — each with a dedicated brewer subclass, mark builder, Svelte component, playground page, and exports.

**Architecture:** BoxPlot and ViolinPlot use dedicated brewer subclasses that override `transform()` to compute quartile statistics via `@rokkit/data`'s `dataset()`. BubbleChart reuses `ChartBrewer` directly (the existing `size` channel + `sizeScale` already handles bubble encoding). All three follow the exact same file/test/export patterns as existing charts.

**ViolinPlot scope:** A simplified violin shape computed from five key statistics (min, q1, median, q3, max) with symmetric width at each — not a true KDE. This is visually informative and implementation-practical.

**Tech Stack:** Svelte 5 runes, `@rokkit/data` (`dataset()`), `d3-array` (`quantile`, `ascending`, `min`, `max`), `d3-shape`, Vitest, `@testing-library/svelte`

---

## File Map

**New files:**

- `packages/chart/src/lib/brewing/BoxBrewer.svelte.js`
- `packages/chart/src/lib/brewing/ViolinBrewer.svelte.js`
- `packages/chart/src/lib/brewing/marks/boxes.js`
- `packages/chart/src/lib/brewing/marks/violins.js`
- `packages/chart/src/charts/BoxPlot.svelte`
- `packages/chart/src/charts/ViolinPlot.svelte`
- `packages/chart/src/charts/BubbleChart.svelte`
- `packages/chart/spec/brewing/BoxBrewer.spec.js`
- `packages/chart/spec/brewing/ViolinBrewer.spec.js`
- `packages/chart/spec/brewing/marks/boxes.spec.js`
- `packages/chart/spec/brewing/marks/violins.spec.js`
- `packages/chart/spec/charts/BoxPlot.spec.js`
- `packages/chart/spec/charts/ViolinPlot.spec.js`
- `packages/chart/spec/charts/BubbleChart.spec.js`
- `site/src/routes/(play)/playground/components/box-plot/+page.svelte`
- `site/src/routes/(play)/playground/components/violin-plot/+page.svelte`
- `site/src/routes/(play)/playground/components/bubble-chart/+page.svelte`

**Modified files:**

- `packages/chart/src/index.js` — export BoxPlot, ViolinPlot, BubbleChart, BoxBrewer, ViolinBrewer

---

## Chunk 4: BoxPlot

### Task 1: `boxes.js` mark builder

**Files:**

- Create: `packages/chart/src/lib/brewing/marks/boxes.js`
- Create: `packages/chart/spec/brewing/marks/boxes.spec.js`

**Context:**
`buildBoxes` receives data already aggregated by `BoxBrewer` — each row has `{ [xField], q1, median, q3, min, max }`. It returns box geometry: whisker line (min→max), IQR rectangle (q1→q3), and median line. The color key uses the x field (or color field if set).

- [ ] **Step 1: Write the failing tests**

```js
// packages/chart/spec/brewing/marks/boxes.spec.js
import { describe, it, expect } from 'vitest'
import { buildBoxes } from '../../../src/lib/brewing/marks/boxes.js'
import { scaleBand, scaleLinear } from 'd3-scale'

const xScale = scaleBand().domain(['A', 'B']).range([0, 200]).padding(0.1)
const yScale = scaleLinear().domain([0, 100]).range([200, 0])
const colors = new Map([
  ['A', { fill: '#blue', stroke: '#darkblue' }],
  ['B', { fill: '#red', stroke: '#darkred' }]
])

const data = [
  { cat: 'A', q1: 20, median: 40, q3: 60, iqr_min: 5, iqr_max: 80 },
  { cat: 'B', q1: 30, median: 50, q3: 70, iqr_min: 10, iqr_max: 90 }
]

describe('buildBoxes', () => {
  it('returns one box per row', () => {
    const boxes = buildBoxes(data, { x: 'cat' }, xScale, yScale, colors)
    expect(boxes).toHaveLength(2)
  })

  it('box has cx, q1, median, q3, iqr_min, iqr_max, width, fill, stroke', () => {
    const [box] = buildBoxes(data, { x: 'cat' }, xScale, yScale, colors)
    expect(box).toHaveProperty('cx')
    expect(box).toHaveProperty('q1')
    expect(box).toHaveProperty('median')
    expect(box).toHaveProperty('q3')
    expect(box).toHaveProperty('iqr_min')
    expect(box).toHaveProperty('iqr_max')
    expect(box).toHaveProperty('width')
    expect(box).toHaveProperty('fill')
    expect(box).toHaveProperty('stroke')
  })

  it('cx is centered in band', () => {
    const [box] = buildBoxes(data, { x: 'cat' }, xScale, yScale, colors)
    const expectedCx = xScale('A') + xScale.bandwidth() / 2
    expect(box.cx).toBeCloseTo(expectedCx)
  })

  it('uses color field key when color channel is set', () => {
    const coloredData = [
      { cat: 'A', region: 'North', q1: 20, median: 40, q3: 60, iqr_min: 5, iqr_max: 80 }
    ]
    const [box] = buildBoxes(
      coloredData,
      { x: 'cat', color: 'region' },
      xScale,
      yScale,
      new Map([['North', { fill: 'green', stroke: 'darkgreen' }]])
    )
    expect(box.fill).toBe('green')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd packages/chart && bun run test --reporter=verbose spec/brewing/marks/boxes.spec.js
```

Expected: FAIL — module not found

- [ ] **Step 3: Implement `boxes.js`**

```js
// packages/chart/src/lib/brewing/marks/boxes.js

/**
 * Builds box geometry for box plot charts.
 * Input data rows must already contain { q1, median, q3, iqr_min, iqr_max } —
 * computed by BoxBrewer before reaching this function.
 *
 * @param {Object[]} data - Pre-aggregated rows with quartile fields
 * @param {{ x: string, color?: string }} channels
 * @param {import('d3-scale').ScaleBand} xScale
 * @param {import('d3-scale').ScaleLinear} yScale
 * @param {Map<unknown, {fill:string, stroke:string}>} colors
 * @returns {Array}
 */
export function buildBoxes(data, channels, xScale, yScale, colors) {
  const { x: xf, color: cf } = channels
  const bw = typeof xScale.bandwidth === 'function' ? xScale.bandwidth() : 20
  const boxWidth = bw * 0.6
  const whiskerWidth = bw * 0.3

  return data.map((d) => {
    const colorKey = cf ? d[cf] : d[xf]
    const colorEntry = colors?.get(colorKey) ?? { fill: '#888', stroke: '#444' }
    const cx = (xScale(d[xf]) ?? 0) + (typeof xScale.bandwidth === 'function' ? bw / 2 : 0)
    return {
      data: d,
      cx,
      q1: yScale(d.q1),
      median: yScale(d.median),
      q3: yScale(d.q3),
      iqr_min: yScale(d.iqr_min),
      iqr_max: yScale(d.iqr_max),
      width: boxWidth,
      whiskerWidth,
      fill: colorEntry.fill,
      stroke: colorEntry.stroke
    }
  })
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd packages/chart && bun run test --reporter=verbose spec/brewing/marks/boxes.spec.js
```

Expected: all PASS

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/lib/brewing/marks/boxes.js packages/chart/spec/brewing/marks/boxes.spec.js
git commit -m "feat(chart): add buildBoxes mark builder for box plot geometry"
```

---

### Task 2: `BoxBrewer` + `BoxPlot.svelte`

**Files:**

- Create: `packages/chart/src/lib/brewing/BoxBrewer.svelte.js`
- Create: `packages/chart/src/charts/BoxPlot.svelte`
- Create: `packages/chart/spec/brewing/BoxBrewer.spec.js`
- Create: `packages/chart/spec/charts/BoxPlot.spec.js`

**Context:**
`BoxBrewer.transform()` groups by x (and color if set) and computes: `q1`, `median`, `q3` (from d3-array `quantile` — requires sorted input), `iqr_min = q1 - 1.5*IQR`, `iqr_max = q3 + 1.5*IQR`. The stat prop is ignored — BoxPlot always computes quartiles.

`BoxPlot.svelte` uses the brewer's `boxes = $derived(...)` property. The SVG renders three elements per box: whisker line (iqr_min → iqr_max), IQR rect (q3 → q1), median line.

Note: `BoxBrewer` adds a `boxes` property as a class field using `$derived`. It can read `this.processedData`, `this.channels`, `this.xScale`, `this.yScale`, `this.colorMap` — all public from the base class.

- [ ] **Step 1: Write the failing tests**

```js
// packages/chart/spec/brewing/BoxBrewer.spec.js
import { describe, it, expect } from 'vitest'
import { BoxBrewer } from '../../src/lib/brewing/BoxBrewer.svelte.js'

const rawData = [
  { group: 'A', value: 10 },
  { group: 'A', value: 20 },
  { group: 'A', value: 30 },
  { group: 'A', value: 40 },
  { group: 'A', value: 50 },
  { group: 'B', value: 100 },
  { group: 'B', value: 200 },
  { group: 'B', value: 300 }
]

describe('BoxBrewer.transform', () => {
  it('produces one row per group with quartile fields', () => {
    const brewer = new BoxBrewer()
    const result = brewer.transform(rawData, { x: 'group', y: 'value' })
    expect(result).toHaveLength(2)
    const a = result.find((r) => r.group === 'A')
    expect(a).toHaveProperty('q1')
    expect(a).toHaveProperty('median')
    expect(a).toHaveProperty('q3')
    expect(a).toHaveProperty('iqr_min')
    expect(a).toHaveProperty('iqr_max')
  })

  it('computes correct median for group A', () => {
    const brewer = new BoxBrewer()
    const result = brewer.transform(rawData, { x: 'group', y: 'value' })
    const a = result.find((r) => r.group === 'A')
    expect(a.median).toBe(30)
  })

  it('returns data unchanged when x or y is missing', () => {
    const brewer = new BoxBrewer()
    expect(brewer.transform(rawData, { y: 'value' })).toBe(rawData)
    expect(brewer.transform(rawData, { x: 'group' })).toBe(rawData)
  })

  it('groups by color field as well when color is set', () => {
    const brewer = new BoxBrewer()
    const data = [
      { group: 'A', region: 'N', value: 10 },
      { group: 'A', region: 'N', value: 20 },
      { group: 'A', region: 'S', value: 30 }
    ]
    const result = brewer.transform(data, { x: 'group', y: 'value', color: 'region' })
    expect(result).toHaveLength(2) // A/N and A/S
  })
})
```

```js
// packages/chart/spec/charts/BoxPlot.spec.js
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import BoxPlot from '../../src/charts/BoxPlot.svelte'

const data = [
  { category: 'A', value: 10 },
  { category: 'A', value: 30 },
  { category: 'A', value: 50 },
  { category: 'B', value: 20 },
  { category: 'B', value: 40 },
  { category: 'B', value: 60 }
]

describe('BoxPlot', () => {
  it('renders without errors', () => {
    const { container } = render(BoxPlot, { data, x: 'category', y: 'value' })
    expect(container).toBeTruthy()
  })

  it('renders an SVG element', () => {
    const { container } = render(BoxPlot, { data, x: 'category', y: 'value' })
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders box elements', () => {
    const { container } = render(BoxPlot, { data, x: 'category', y: 'value' })
    expect(container.querySelectorAll('[data-chart-element="box"]').length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd packages/chart && bun run test --reporter=verbose spec/brewing/BoxBrewer.spec.js spec/charts/BoxPlot.spec.js
```

- [ ] **Step 3: Implement `BoxBrewer.svelte.js`**

```js
// packages/chart/src/lib/brewing/BoxBrewer.svelte.js
import { quantile, ascending, min, max } from 'd3-array'
import { dataset } from '@rokkit/data'
import { ChartBrewer } from './brewer.svelte.js'
import { buildBoxes } from './marks/boxes.js'

function sortedQuantile(values, p) {
  return quantile([...values].sort(ascending), p)
}

/**
 * Brewer for box plots. Always aggregates by x (and color if set),
 * computing q1, median, q3, and IQR-based whisker bounds.
 * The `stat` prop is ignored — box plots always show quartile summaries.
 */
export class BoxBrewer extends ChartBrewer {
  transform(data, channels) {
    if (!channels.x || !channels.y) return data
    const by = [channels.x, channels.color].filter(Boolean)
    return dataset(data)
      .groupBy(...by)
      .summarize((row) => row[channels.y], {
        q1: (v) => sortedQuantile(v, 0.25),
        median: (v) => sortedQuantile(v, 0.5),
        q3: (v) => sortedQuantile(v, 0.75),
        iqr_min: (v) => {
          const q1 = sortedQuantile(v, 0.25)
          const q3 = sortedQuantile(v, 0.75)
          return q1 - 1.5 * (q3 - q1)
        },
        iqr_max: (v) => {
          const q1 = sortedQuantile(v, 0.25)
          const q3 = sortedQuantile(v, 0.75)
          return q3 + 1.5 * (q3 - q1)
        }
      })
      .rollup()
      .select()
  }

  boxes = $derived(
    this.xScale && this.yScale
      ? buildBoxes(this.processedData, this.channels, this.xScale, this.yScale, this.colorMap)
      : []
  )
}
```

- [ ] **Step 4: Implement `BoxPlot.svelte`**

```svelte
<!-- packages/chart/src/charts/BoxPlot.svelte -->
<script>
  // @ts-nocheck
  import { setContext } from 'svelte'
  import { BoxBrewer } from '../lib/brewing/BoxBrewer.svelte.js'

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

  const brewer = new BoxBrewer()
  setContext('chart-brewer', brewer)

  $effect(() => {
    const channels = {}
    if (x) channels.x = x
    if (y) channels.y = y
    if (color) channels.color = color
    brewer.update({ data, channels, width, height, mode })
  })

  const margin = { top: 20, right: 20, bottom: 40, left: 50 }
  const innerWidth = $derived(width - margin.left - margin.right)
  const innerHeight = $derived(height - margin.top - margin.bottom)

  const boxes = $derived(brewer.boxes)
  const xScale = $derived(brewer.xScale)
  const yScale = $derived(brewer.yScale)
  const legendGroups = $derived(brewer.legendGroups)

  const xTicks = $derived(
    xScale && typeof xScale.domain === 'function'
      ? xScale.domain().map((val) => ({
          value: val,
          x:
            (xScale(val) ?? 0) +
            (typeof xScale.bandwidth === 'function' ? xScale.bandwidth() / 2 : 0)
        }))
      : []
  )

  const yTicks = $derived(
    yScale && typeof yScale.ticks === 'function'
      ? yScale.ticks(5).map((val) => ({ value: val, y: yScale(val) }))
      : []
  )

  const gridLines = $derived(
    yScale && typeof yScale.ticks === 'function'
      ? yScale.ticks(5).map((val) => ({ y: yScale(val) }))
      : []
  )
</script>

<div class="chart-container" data-chart-root data-chart-type="box">
  <svg {width} {height} viewBox="0 0 {width} {height}" role="img" aria-label="Box plot">
    <g class="chart-area" transform="translate({margin.left}, {margin.top})" data-chart-canvas>
      {#if grid}
        <g class="chart-grid" data-chart-grid>
          {#each gridLines as line (line.y)}
            <line x1="0" y1={line.y} x2={innerWidth} y2={line.y} data-chart-grid-line />
          {/each}
        </g>
      {/if}

      <g class="chart-boxes" data-chart-mark="box">
        {#each boxes as box (box.data[x])}
          <g data-chart-element="box">
            <!-- Whisker: iqr_min to iqr_max -->
            <line
              x1={box.cx}
              y1={box.iqr_min}
              x2={box.cx}
              y2={box.iqr_max}
              stroke={box.stroke}
              stroke-width="1.5"
            />
            <!-- Whisker caps -->
            <line
              x1={box.cx - box.whiskerWidth / 2}
              y1={box.iqr_min}
              x2={box.cx + box.whiskerWidth / 2}
              y2={box.iqr_min}
              stroke={box.stroke}
              stroke-width="1.5"
            />
            <line
              x1={box.cx - box.whiskerWidth / 2}
              y1={box.iqr_max}
              x2={box.cx + box.whiskerWidth / 2}
              y2={box.iqr_max}
              stroke={box.stroke}
              stroke-width="1.5"
            />
            <!-- IQR rectangle -->
            <rect
              x={box.cx - box.width / 2}
              y={box.q3}
              width={box.width}
              height={Math.abs(box.q1 - box.q3)}
              fill={box.fill}
              stroke={box.stroke}
              stroke-width="1"
            />
            <!-- Median line -->
            <line
              x1={box.cx - box.width / 2}
              y1={box.median}
              x2={box.cx + box.width / 2}
              y2={box.median}
              stroke={box.stroke}
              stroke-width="2"
            />
          </g>
        {/each}
      </g>

      {#if xScale}
        <g class="axis x-axis" transform="translate(0, {innerHeight})" data-chart-axis="x">
          <line x1="0" y1="0" x2={innerWidth} y2="0" data-chart-axis-line />
          {#each xTicks as tick (tick.value)}
            <g transform="translate({tick.x}, 0)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" />
              <text
                x="0"
                y="9"
                text-anchor="middle"
                dominant-baseline="hanging"
                data-chart-tick-label
              >
                {tick.value}
              </text>
            </g>
          {/each}
        </g>
      {/if}

      {#if yScale}
        <g class="axis y-axis" data-chart-axis="y">
          <line x1="0" y1="0" x2="0" y2={innerHeight} data-chart-axis-line />
          {#each yTicks as tick (tick.value)}
            <g transform="translate(0, {tick.y})">
              <line x1="-6" y1="0" x2="0" y2="0" stroke="currentColor" />
              <text x="-9" y="0" text-anchor="end" dominant-baseline="middle" data-chart-tick-label>
                {tick.value}
              </text>
            </g>
          {/each}
        </g>
      {/if}
    </g>
  </svg>

  {#if legend && legendGroups.length > 0}
    <div data-chart-legend>
      {#each legendGroups as group}
        {#if legendGroups.length > 1}
          <div data-chart-legend-title>{group.field}</div>
        {/if}
        {#each group.items as item (item.label)}
          <div data-chart-legend-item>
            <span data-chart-legend-swatch style="background-color: {item.fill ?? '#ddd'}"></span>
            <span data-chart-legend-label>{item.label}</span>
          </div>
        {/each}
      {/each}
    </div>
  {/if}
</div>

<style>
  .chart-container {
    position: relative;
    width: 100%;
    height: auto;
  }
  svg {
    display: block;
    overflow: visible;
  }
  .axis {
    font-size: 11px;
    fill: currentColor;
  }
  .chart-grid {
    pointer-events: none;
  }
</style>
```

- [ ] **Step 5: Run all tests**

```bash
cd packages/chart && bun run test
```

Expected: all tests PASS

- [ ] **Step 6: Commit**

```bash
git add packages/chart/src/lib/brewing/BoxBrewer.svelte.js \
        packages/chart/src/charts/BoxPlot.svelte \
        packages/chart/spec/brewing/BoxBrewer.spec.js \
        packages/chart/spec/charts/BoxPlot.spec.js
git commit -m "feat(chart): add BoxPlot chart with BoxBrewer quartile aggregation"
```

---

### Task 3: BoxPlot playground page

**Files:**

- Create: `site/src/routes/(play)/playground/components/box-plot/+page.svelte`

- [ ] **Step 1: Create the playground page**

```svelte
<!-- site/src/routes/(play)/playground/components/box-plot/+page.svelte -->
<script>
  // @ts-nocheck
  import { BoxPlot } from '@rokkit/chart'
  import { FormRenderer, InfoField } from '@rokkit/forms'
  import PlaySection from '$lib/components/PlaySection.svelte'

  // Raw observations — BoxPlot aggregates these into quartiles
  const chartData = [
    { category: 'Control', score: 52, cohort: 'A' },
    { category: 'Control', score: 61, cohort: 'A' },
    { category: 'Control', score: 48, cohort: 'A' },
    { category: 'Control', score: 70, cohort: 'A' },
    { category: 'Control', score: 55, cohort: 'A' },
    { category: 'Control', score: 43, cohort: 'A' },
    { category: 'Control', score: 66, cohort: 'A' },
    { category: 'Control', score: 58, cohort: 'A' },
    { category: 'Treatment', score: 71, cohort: 'A' },
    { category: 'Treatment', score: 83, cohort: 'A' },
    { category: 'Treatment', score: 65, cohort: 'A' },
    { category: 'Treatment', score: 90, cohort: 'A' },
    { category: 'Treatment', score: 78, cohort: 'A' },
    { category: 'Treatment', score: 62, cohort: 'A' },
    { category: 'Treatment', score: 88, cohort: 'A' },
    { category: 'Treatment', score: 75, cohort: 'A' },
    { category: 'Placebo', score: 50, cohort: 'B' },
    { category: 'Placebo', score: 54, cohort: 'B' },
    { category: 'Placebo', score: 47, cohort: 'B' },
    { category: 'Placebo', score: 63, cohort: 'B' },
    { category: 'Placebo', score: 51, cohort: 'B' },
    { category: 'Placebo', score: 58, cohort: 'B' },
    { category: 'Placebo', score: 44, cohort: 'B' },
    { category: 'Placebo', score: 60, cohort: 'B' }
  ]

  let props = $state({
    colorField: 'category',
    grid: true,
    legend: false
  })

  const schema = {
    type: 'object',
    properties: {
      colorField: { type: 'string' },
      grid: { type: 'boolean' },
      legend: { type: 'boolean' }
    }
  }

  const layout = {
    type: 'vertical',
    elements: [
      { scope: '#/colorField', label: 'color', props: { options: ['', 'category', 'cohort'] } },
      { scope: '#/grid', label: 'grid' },
      { scope: '#/legend', label: 'legend' },
      { type: 'separator' }
    ]
  }
</script>

<PlaySection>
  {#snippet preview()}
    <div class="flex flex-col gap-8 p-6">
      <div>
        <h4 class="text-surface-z5 m-0 mb-3 text-xs font-semibold tracking-widest uppercase">
          Score Distribution by Group
        </h4>
        <BoxPlot
          data={chartData}
          x="category"
          y="score"
          color={props.colorField || undefined}
          grid={props.grid}
          legend={props.legend}
          width={560}
          height={320}
        />
      </div>
    </div>
  {/snippet}

  {#snippet controls()}
    <FormRenderer bind:data={props} {schema} {layout} />
    <InfoField label="x" value="category" />
    <InfoField label="y" value="score (raw observations)" />
  {/snippet}

  {#snippet data()}
    <div class="overflow-x-auto">
      <table class="w-full text-xs">
        <thead>
          <tr class="border-surface-z2 border-b">
            {#each Object.keys(chartData[0]) as col}
              <th class="text-surface-z4 py-1 pr-3 text-left font-medium">{col}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each chartData as row}
            <tr class="border-surface-z2 border-b last:border-0">
              {#each Object.values(row) as val}
                <td class="py-1 pr-3">{val}</td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/snippet}
</PlaySection>
```

- [ ] **Step 2: Verify site builds**

```bash
cd site && bun run build 2>&1 | tail -10
```

- [ ] **Step 3: Commit**

```bash
git add "site/src/routes/(play)/playground/components/box-plot/+page.svelte"
git commit -m "feat(site): add BoxPlot playground page"
```

---

## Chunk 5: ViolinPlot

### Task 4: `violins.js` mark builder

**Files:**

- Create: `packages/chart/src/lib/brewing/marks/violins.js`
- Create: `packages/chart/spec/brewing/marks/violins.spec.js`

**Context:**
`buildViolins` produces a symmetric SVG path for each group using five y-anchor points: `iqr_min`, `q1`, `median`, `q3`, `iqr_max`. The width at each anchor is proportional to relative density — `median` gets full width (1.0), `q1`/`q3` get 0.6×, `iqr_min`/`iqr_max` get 0.1×. The path is a closed smooth curve using `curveCatmullRom` from d3-shape.

- [ ] **Step 1: Write the failing tests**

```js
// packages/chart/spec/brewing/marks/violins.spec.js
import { describe, it, expect } from 'vitest'
import { buildViolins } from '../../../src/lib/brewing/marks/violins.js'
import { scaleBand, scaleLinear } from 'd3-scale'

const xScale = scaleBand().domain(['A']).range([0, 200]).padding(0.1)
const yScale = scaleLinear().domain([0, 100]).range([200, 0])
const colors = new Map([['A', { fill: '#aaa', stroke: '#333' }]])

const data = [{ cat: 'A', q1: 25, median: 50, q3: 75, iqr_min: 10, iqr_max: 90 }]

describe('buildViolins', () => {
  it('returns one violin per row', () => {
    const violins = buildViolins(data, { x: 'cat' }, xScale, yScale, colors)
    expect(violins).toHaveLength(1)
  })

  it('violin has d (SVG path), fill, stroke, cx', () => {
    const [v] = buildViolins(data, { x: 'cat' }, xScale, yScale, colors)
    expect(v).toHaveProperty('d')
    expect(typeof v.d).toBe('string')
    expect(v.d.length).toBeGreaterThan(0)
    expect(v).toHaveProperty('fill')
    expect(v).toHaveProperty('stroke')
    expect(v).toHaveProperty('cx')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd packages/chart && bun run test --reporter=verbose spec/brewing/marks/violins.spec.js
```

- [ ] **Step 3: Implement `violins.js`**

```js
// packages/chart/src/lib/brewing/marks/violins.js
import { line, curveCatmullRom } from 'd3-shape'

// Relative widths at each stat anchor (as fraction of max half-width)
const DENSITY_AT = { iqr_min: 0.08, q1: 0.55, median: 1.0, q3: 0.55, iqr_max: 0.08 }
const ANCHOR_ORDER = ['iqr_max', 'q3', 'median', 'q1', 'iqr_min']

/**
 * Builds a closed violin shape path for each group.
 * Input rows must have { q1, median, q3, iqr_min, iqr_max } from ViolinBrewer.
 *
 * @param {Object[]} data
 * @param {{ x: string, color?: string }} channels
 * @param {import('d3-scale').ScaleBand} xScale
 * @param {import('d3-scale').ScaleLinear} yScale
 * @param {Map} colors
 * @returns {Array}
 */
export function buildViolins(data, channels, xScale, yScale, colors) {
  const { x: xf, color: cf } = channels
  const bw = typeof xScale.bandwidth === 'function' ? xScale.bandwidth() : 40
  const halfMax = bw * 0.45

  const pathGen = line()
    .x((pt) => pt.x)
    .y((pt) => pt.y)
    .curve(curveCatmullRom.alpha(0.5))

  return data.map((d) => {
    const colorKey = cf ? d[cf] : d[xf]
    const colorEntry = colors?.get(colorKey) ?? { fill: '#888', stroke: '#444' }
    const cx = (xScale(d[xf]) ?? 0) + (typeof xScale.bandwidth === 'function' ? bw / 2 : 0)

    // Build right side top→bottom, then left side bottom→top (closed shape)
    const rightPts = ANCHOR_ORDER.map((k) => ({ x: cx + halfMax * DENSITY_AT[k], y: yScale(d[k]) }))
    const leftPts = [...ANCHOR_ORDER]
      .reverse()
      .map((k) => ({ x: cx - halfMax * DENSITY_AT[k], y: yScale(d[k]) }))
    const allPts = [...rightPts, ...leftPts, rightPts[0]] // close path

    return {
      data: d,
      cx,
      d: pathGen(allPts),
      fill: colorEntry.fill,
      stroke: colorEntry.stroke
    }
  })
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
cd packages/chart && bun run test --reporter=verbose spec/brewing/marks/violins.spec.js
```

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/lib/brewing/marks/violins.js packages/chart/spec/brewing/marks/violins.spec.js
git commit -m "feat(chart): add buildViolins mark builder for simplified violin plot geometry"
```

---

### Task 5: `ViolinBrewer` + `ViolinPlot.svelte`

**Files:**

- Create: `packages/chart/src/lib/brewing/ViolinBrewer.svelte.js`
- Create: `packages/chart/src/charts/ViolinPlot.svelte`
- Create: `packages/chart/spec/brewing/ViolinBrewer.spec.js`
- Create: `packages/chart/spec/charts/ViolinPlot.spec.js`

**Context:**
`ViolinBrewer` uses the same quartile computation as `BoxBrewer` — it inherits from `ChartBrewer` and adds `violins = $derived(...)`. `ViolinPlot.svelte` renders a single `<path>` per group using `box.d`.

- [ ] **Step 1: Write the failing tests**

```js
// packages/chart/spec/brewing/ViolinBrewer.spec.js
import { describe, it, expect } from 'vitest'
import { ViolinBrewer } from '../../src/lib/brewing/ViolinBrewer.svelte.js'

const rawData = Array.from({ length: 20 }, (_, i) => ({
  group: i < 10 ? 'A' : 'B',
  value: (i % 10) * 10 + 5
}))

describe('ViolinBrewer.transform', () => {
  it('produces one row per group', () => {
    const brewer = new ViolinBrewer()
    const result = brewer.transform(rawData, { x: 'group', y: 'value' })
    expect(result).toHaveLength(2)
  })

  it('output rows have quartile fields', () => {
    const brewer = new ViolinBrewer()
    const [row] = brewer.transform(rawData, { x: 'group', y: 'value' })
    expect(row).toHaveProperty('q1')
    expect(row).toHaveProperty('median')
    expect(row).toHaveProperty('q3')
    expect(row).toHaveProperty('iqr_min')
    expect(row).toHaveProperty('iqr_max')
  })

  it('returns data unchanged when x or y missing', () => {
    const brewer = new ViolinBrewer()
    expect(brewer.transform(rawData, { y: 'value' })).toBe(rawData)
  })
})
```

```js
// packages/chart/spec/charts/ViolinPlot.spec.js
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import ViolinPlot from '../../src/charts/ViolinPlot.svelte'

const data = Array.from({ length: 20 }, (_, i) => ({
  category: i < 10 ? 'A' : 'B',
  value: (i % 10) * 10 + 5
}))

describe('ViolinPlot', () => {
  it('renders without errors', () => {
    const { container } = render(ViolinPlot, { data, x: 'category', y: 'value' })
    expect(container).toBeTruthy()
  })

  it('renders SVG with violin paths', () => {
    const { container } = render(ViolinPlot, { data, x: 'category', y: 'value' })
    expect(container.querySelector('[data-chart-mark="violin"]')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd packages/chart && bun run test --reporter=verbose spec/brewing/ViolinBrewer.spec.js spec/charts/ViolinPlot.spec.js
```

- [ ] **Step 3: Implement `ViolinBrewer.svelte.js`**

```js
// packages/chart/src/lib/brewing/ViolinBrewer.svelte.js
import { quantile, ascending } from 'd3-array'
import { dataset } from '@rokkit/data'
import { ChartBrewer } from './brewer.svelte.js'
import { buildViolins } from './marks/violins.js'

function sortedQuantile(values, p) {
  return quantile([...values].sort(ascending), p)
}

export class ViolinBrewer extends ChartBrewer {
  transform(data, channels) {
    if (!channels.x || !channels.y) return data
    const by = [channels.x, channels.color].filter(Boolean)
    return dataset(data)
      .groupBy(...by)
      .summarize((row) => row[channels.y], {
        q1: (v) => sortedQuantile(v, 0.25),
        median: (v) => sortedQuantile(v, 0.5),
        q3: (v) => sortedQuantile(v, 0.75),
        iqr_min: (v) => {
          const q1 = sortedQuantile(v, 0.25)
          const q3 = sortedQuantile(v, 0.75)
          return q1 - 1.5 * (q3 - q1)
        },
        iqr_max: (v) => {
          const q1 = sortedQuantile(v, 0.25)
          const q3 = sortedQuantile(v, 0.75)
          return q3 + 1.5 * (q3 - q1)
        }
      })
      .rollup()
      .select()
  }

  violins = $derived(
    this.xScale && this.yScale
      ? buildViolins(this.processedData, this.channels, this.xScale, this.yScale, this.colorMap)
      : []
  )
}
```

- [ ] **Step 4: Implement `ViolinPlot.svelte`**

Follow the same structure as `BoxPlot.svelte` but:

- Use `brewer.violins` instead of `brewer.boxes`
- Change `data-chart-type="violin"` and `data-chart-mark="violin"`
- Render each violin as `<path d={violin.d} fill={violin.fill} fill-opacity="0.7" stroke={violin.stroke} stroke-width="1.5" data-chart-element="violin" />`
- Change aria-label to "Violin plot"

```svelte
<!-- packages/chart/src/charts/ViolinPlot.svelte -->
<script>
  // @ts-nocheck
  import { setContext } from 'svelte'
  import { ViolinBrewer } from '../lib/brewing/ViolinBrewer.svelte.js'

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

  const brewer = new ViolinBrewer()
  setContext('chart-brewer', brewer)

  $effect(() => {
    const channels = {}
    if (x) channels.x = x
    if (y) channels.y = y
    if (color) channels.color = color
    brewer.update({ data, channels, width, height, mode })
  })

  const margin = { top: 20, right: 20, bottom: 40, left: 50 }
  const innerWidth = $derived(width - margin.left - margin.right)
  const innerHeight = $derived(height - margin.top - margin.bottom)

  const violins = $derived(brewer.violins)
  const xScale = $derived(brewer.xScale)
  const yScale = $derived(brewer.yScale)
  const legendGroups = $derived(brewer.legendGroups)

  const xTicks = $derived(
    xScale && typeof xScale.domain === 'function'
      ? xScale.domain().map((val) => ({
          value: val,
          x:
            (xScale(val) ?? 0) +
            (typeof xScale.bandwidth === 'function' ? xScale.bandwidth() / 2 : 0)
        }))
      : []
  )

  const yTicks = $derived(
    yScale && typeof yScale.ticks === 'function'
      ? yScale.ticks(5).map((val) => ({ value: val, y: yScale(val) }))
      : []
  )

  const gridLines = $derived(
    yScale && typeof yScale.ticks === 'function'
      ? yScale.ticks(5).map((val) => ({ y: yScale(val) }))
      : []
  )
</script>

<div class="chart-container" data-chart-root data-chart-type="violin">
  <svg {width} {height} viewBox="0 0 {width} {height}" role="img" aria-label="Violin plot">
    <g class="chart-area" transform="translate({margin.left}, {margin.top})" data-chart-canvas>
      {#if grid}
        <g class="chart-grid" data-chart-grid>
          {#each gridLines as line (line.y)}
            <line x1="0" y1={line.y} x2={innerWidth} y2={line.y} data-chart-grid-line />
          {/each}
        </g>
      {/if}

      <g class="chart-violins" data-chart-mark="violin">
        {#each violins as violin (violin.data[x])}
          <path
            d={violin.d}
            fill={violin.fill}
            fill-opacity="0.7"
            stroke={violin.stroke}
            stroke-width="1.5"
            data-chart-element="violin"
          />
        {/each}
      </g>

      {#if xScale}
        <g class="axis x-axis" transform="translate(0, {innerHeight})" data-chart-axis="x">
          <line x1="0" y1="0" x2={innerWidth} y2="0" data-chart-axis-line />
          {#each xTicks as tick (tick.value)}
            <g transform="translate({tick.x}, 0)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" />
              <text
                x="0"
                y="9"
                text-anchor="middle"
                dominant-baseline="hanging"
                data-chart-tick-label
              >
                {tick.value}
              </text>
            </g>
          {/each}
        </g>
      {/if}

      {#if yScale}
        <g class="axis y-axis" data-chart-axis="y">
          <line x1="0" y1="0" x2="0" y2={innerHeight} data-chart-axis-line />
          {#each yTicks as tick (tick.value)}
            <g transform="translate(0, {tick.y})">
              <line x1="-6" y1="0" x2="0" y2="0" stroke="currentColor" />
              <text x="-9" y="0" text-anchor="end" dominant-baseline="middle" data-chart-tick-label>
                {tick.value}
              </text>
            </g>
          {/each}
        </g>
      {/if}
    </g>
  </svg>

  {#if legend && legendGroups.length > 0}
    <div data-chart-legend>
      {#each legendGroups as group}
        {#if legendGroups.length > 1}
          <div data-chart-legend-title>{group.field}</div>
        {/if}
        {#each group.items as item (item.label)}
          <div data-chart-legend-item>
            <span data-chart-legend-swatch style="background-color: {item.fill ?? '#ddd'}"></span>
            <span data-chart-legend-label>{item.label}</span>
          </div>
        {/each}
      {/each}
    </div>
  {/if}
</div>

<style>
  .chart-container {
    position: relative;
    width: 100%;
    height: auto;
  }
  svg {
    display: block;
    overflow: visible;
  }
  .axis {
    font-size: 11px;
    fill: currentColor;
  }
  .chart-grid {
    pointer-events: none;
  }
</style>
```

- [ ] **Step 5: Run all tests**

```bash
cd packages/chart && bun run test
```

Expected: all PASS

- [ ] **Step 6: Commit**

```bash
git add packages/chart/src/lib/brewing/ViolinBrewer.svelte.js \
        packages/chart/src/charts/ViolinPlot.svelte \
        packages/chart/spec/brewing/ViolinBrewer.spec.js \
        packages/chart/spec/charts/ViolinPlot.spec.js
git commit -m "feat(chart): add ViolinPlot chart with simplified quartile-based violin shape"
```

---

### Task 6: ViolinPlot playground page

- [ ] **Step 1: Create `site/src/routes/(play)/playground/components/violin-plot/+page.svelte`**

Use same dataset as BoxPlot (raw observations per group). Use `color` for group coloring. Same structure as box-plot playground page but with `<ViolinPlot>`.

```svelte
<script>
  // @ts-nocheck
  import { ViolinPlot } from '@rokkit/chart'
  import { FormRenderer, InfoField } from '@rokkit/forms'
  import PlaySection from '$lib/components/PlaySection.svelte'

  const chartData = [
    { category: 'Control', score: 52, cohort: 'A' },
    { category: 'Control', score: 61, cohort: 'A' },
    { category: 'Control', score: 48, cohort: 'A' },
    { category: 'Control', score: 70, cohort: 'A' },
    { category: 'Control', score: 55, cohort: 'A' },
    { category: 'Control', score: 43, cohort: 'A' },
    { category: 'Control', score: 66, cohort: 'A' },
    { category: 'Control', score: 58, cohort: 'A' },
    { category: 'Treatment', score: 71, cohort: 'A' },
    { category: 'Treatment', score: 83, cohort: 'A' },
    { category: 'Treatment', score: 65, cohort: 'A' },
    { category: 'Treatment', score: 90, cohort: 'A' },
    { category: 'Treatment', score: 78, cohort: 'A' },
    { category: 'Treatment', score: 62, cohort: 'A' },
    { category: 'Treatment', score: 88, cohort: 'A' },
    { category: 'Treatment', score: 75, cohort: 'A' },
    { category: 'Placebo', score: 50, cohort: 'B' },
    { category: 'Placebo', score: 54, cohort: 'B' },
    { category: 'Placebo', score: 47, cohort: 'B' },
    { category: 'Placebo', score: 63, cohort: 'B' },
    { category: 'Placebo', score: 51, cohort: 'B' },
    { category: 'Placebo', score: 58, cohort: 'B' },
    { category: 'Placebo', score: 44, cohort: 'B' },
    { category: 'Placebo', score: 60, cohort: 'B' }
  ]

  let props = $state({ colorField: 'category', grid: true, legend: false })

  const schema = {
    type: 'object',
    properties: {
      colorField: { type: 'string' },
      grid: { type: 'boolean' },
      legend: { type: 'boolean' }
    }
  }

  const layout = {
    type: 'vertical',
    elements: [
      { scope: '#/colorField', label: 'color', props: { options: ['', 'category', 'cohort'] } },
      { scope: '#/grid', label: 'grid' },
      { scope: '#/legend', label: 'legend' },
      { type: 'separator' }
    ]
  }
</script>

<PlaySection>
  {#snippet preview()}
    <div class="flex flex-col gap-8 p-6">
      <div>
        <h4 class="text-surface-z5 m-0 mb-3 text-xs font-semibold tracking-widest uppercase">
          Score Distribution by Group
        </h4>
        <ViolinPlot
          data={chartData}
          x="category"
          y="score"
          color={props.colorField || undefined}
          grid={props.grid}
          legend={props.legend}
          width={560}
          height={320}
        />
      </div>
    </div>
  {/snippet}

  {#snippet controls()}
    <FormRenderer bind:data={props} {schema} {layout} />
    <InfoField label="x" value="category" />
    <InfoField label="y" value="score (raw observations)" />
  {/snippet}

  {#snippet data()}
    <div class="overflow-x-auto">
      <table class="w-full text-xs">
        <thead>
          <tr class="border-surface-z2 border-b">
            {#each Object.keys(chartData[0]) as col}
              <th class="text-surface-z4 py-1 pr-3 text-left font-medium">{col}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each chartData as row}
            <tr class="border-surface-z2 border-b last:border-0">
              {#each Object.values(row) as val}
                <td class="py-1 pr-3">{val}</td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/snippet}
</PlaySection>
```

- [ ] **Step 2: Commit**

```bash
git add "site/src/routes/(play)/playground/components/violin-plot/+page.svelte"
git commit -m "feat(site): add ViolinPlot playground page"
```

---

## Chunk 6: BubbleChart

### Task 7: `BubbleChart.svelte` + playground

**Files:**

- Create: `packages/chart/src/charts/BubbleChart.svelte`
- Create: `packages/chart/spec/charts/BubbleChart.spec.js`
- Create: `site/src/routes/(play)/playground/components/bubble-chart/+page.svelte`

**Context:**
`BubbleChart` is a `ScatterPlot` variant where `size` is a required prop. The existing `ChartBrewer` already has `sizeScale` and `buildPoints` already uses it. The component is essentially `ScatterPlot.svelte` with `size` as mandatory (not optional), a different `aria-label`, and `data-chart-type="bubble"`. No new brewer needed.

- [ ] **Step 1: Write the failing tests**

```js
// packages/chart/spec/charts/BubbleChart.spec.js
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import BubbleChart from '../../src/charts/BubbleChart.svelte'

const data = [
  { x: 10, y: 20, size: 100, category: 'A' },
  { x: 30, y: 40, size: 200, category: 'B' },
  { x: 50, y: 10, size: 150, category: 'A' }
]

describe('BubbleChart', () => {
  it('renders without errors', () => {
    const { container } = render(BubbleChart, { data, x: 'x', y: 'y', size: 'size' })
    expect(container).toBeTruthy()
  })

  it('renders an SVG element', () => {
    const { container } = render(BubbleChart, { data, x: 'x', y: 'y', size: 'size' })
    expect(container.querySelector('svg')).toBeTruthy()
  })

  it('renders with data-chart-type=bubble', () => {
    const { container } = render(BubbleChart, { data, x: 'x', y: 'y', size: 'size' })
    expect(container.querySelector('[data-chart-type="bubble"]')).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd packages/chart && bun run test --reporter=verbose spec/charts/BubbleChart.spec.js
```

- [ ] **Step 3: Implement `BubbleChart.svelte`**

Copy `ScatterPlot.svelte` as the base. Change:

- `data-chart-type="bubble"` (was `"scatter"`)
- `aria-label="Bubble chart"`
- Add `size` to props (required — no default value)
- Keep `symbol` prop optional
- In `$effect`: `if (size) channels.size = size` (same as ScatterPlot, already there)

```svelte
<!-- packages/chart/src/charts/BubbleChart.svelte -->
<!-- Same as ScatterPlot.svelte except: -->
<!-- - data-chart-type="bubble" -->
<!-- - aria-label="Bubble chart" -->
<!-- - size prop documented as required -->
```

(Implementer: copy ScatterPlot.svelte verbatim, make only the three changes above.)

- [ ] **Step 4: Create bubble-chart playground page**

```svelte
<!-- site/src/routes/(play)/playground/components/bubble-chart/+page.svelte -->
<script>
  // @ts-nocheck
  import { BubbleChart } from '@rokkit/chart'
  import { FormRenderer, InfoField } from '@rokkit/forms'
  import PlaySection from '$lib/components/PlaySection.svelte'

  const chartData = [
    { country: 'USA', gdp: 25000, lifeExp: 79, population: 331, continent: 'Americas' },
    { country: 'China', gdp: 18000, lifeExp: 77, population: 1412, continent: 'Asia' },
    { country: 'Germany', gdp: 4200, lifeExp: 81, population: 84, continent: 'Europe' },
    { country: 'India', gdp: 3700, lifeExp: 70, population: 1380, continent: 'Asia' },
    { country: 'Japan', gdp: 4300, lifeExp: 84, population: 125, continent: 'Asia' },
    { country: 'Brazil', gdp: 2100, lifeExp: 75, population: 215, continent: 'Americas' },
    { country: 'UK', gdp: 3100, lifeExp: 81, population: 67, continent: 'Europe' },
    { country: 'France', gdp: 2900, lifeExp: 82, population: 68, continent: 'Europe' },
    { country: 'Nigeria', gdp: 477, lifeExp: 55, population: 218, continent: 'Africa' },
    { country: 'Mexico', gdp: 1290, lifeExp: 75, population: 130, continent: 'Americas' },
    { country: 'S.Korea', gdp: 1800, lifeExp: 83, population: 52, continent: 'Asia' },
    { country: 'Canada', gdp: 2100, lifeExp: 82, population: 38, continent: 'Americas' },
    { country: 'Egypt', gdp: 476, lifeExp: 72, population: 104, continent: 'Africa' },
    { country: 'Italy', gdp: 2100, lifeExp: 83, population: 60, continent: 'Europe' },
    { country: 'Pakistan', gdp: 376, lifeExp: 68, population: 231, continent: 'Asia' }
  ]

  let props = $state({
    colorField: 'continent',
    symbolField: 'continent',
    grid: true,
    legend: true
  })

  const schema = {
    type: 'object',
    properties: {
      colorField: { type: 'string' },
      symbolField: { type: 'string' },
      grid: { type: 'boolean' },
      legend: { type: 'boolean' }
    }
  }

  const layout = {
    type: 'vertical',
    elements: [
      { scope: '#/colorField', label: 'color', props: { options: ['', 'continent'] } },
      { scope: '#/symbolField', label: 'symbol', props: { options: ['', 'continent'] } },
      { scope: '#/grid', label: 'grid' },
      { scope: '#/legend', label: 'legend' },
      { type: 'separator' }
    ]
  }
</script>

<PlaySection>
  {#snippet preview()}
    <div class="flex flex-col gap-8 p-6">
      <div>
        <h4 class="text-surface-z5 m-0 mb-3 text-xs font-semibold tracking-widest uppercase">
          GDP vs Life Expectancy (bubble = population)
        </h4>
        <BubbleChart
          data={chartData}
          x="gdp"
          y="lifeExp"
          size="population"
          color={props.colorField || undefined}
          symbol={props.symbolField || undefined}
          grid={props.grid}
          legend={props.legend}
          width={560}
          height={380}
        />
      </div>
    </div>
  {/snippet}

  {#snippet controls()}
    <FormRenderer bind:data={props} {schema} {layout} />
    <InfoField label="x" value="gdp" />
    <InfoField label="y" value="lifeExp" />
    <InfoField label="size" value="population" />
  {/snippet}

  {#snippet data()}
    <div class="overflow-x-auto">
      <table class="w-full text-xs">
        <thead>
          <tr class="border-surface-z2 border-b">
            {#each Object.keys(chartData[0]) as col}
              <th class="text-surface-z4 py-1 pr-3 text-left font-medium">{col}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each chartData as row}
            <tr class="border-surface-z2 border-b last:border-0">
              {#each Object.values(row) as val}
                <td class="py-1 pr-3">{val}</td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/snippet}
</PlaySection>
```

- [ ] **Step 5: Run all tests**

```bash
cd packages/chart && bun run test
```

Expected: all PASS

- [ ] **Step 6: Add all exports to `packages/chart/src/index.js`**

```js
// Add to existing chart exports:
export { default as BoxPlot } from './charts/BoxPlot.svelte'
export { default as ViolinPlot } from './charts/ViolinPlot.svelte'
export { default as BubbleChart } from './charts/BubbleChart.svelte'

// Add to brewer exports:
export { BoxBrewer } from './lib/brewing/BoxBrewer.svelte.js'
export { ViolinBrewer } from './lib/brewing/ViolinBrewer.svelte.js'
```

- [ ] **Step 7: Final verification**

```bash
bun run test:ci && bun run lint
```

Expected: zero errors.

- [ ] **Step 8: Commit**

```bash
git add packages/chart/src/charts/BubbleChart.svelte \
        packages/chart/spec/charts/BubbleChart.spec.js \
        packages/chart/src/index.js \
        "site/src/routes/(play)/playground/components/bubble-chart/+page.svelte"
git commit -m "feat(chart): add BubbleChart, export BoxPlot/ViolinPlot/BubbleChart from index"
```

---

## Browser Verification

After all tasks:

- `http://localhost:5174/playground/components/box-plot` — boxes should show quartile ranges; color=category gives distinct colors per group
- `http://localhost:5174/playground/components/violin-plot` — teardrop/violin shapes; same dataset as box plot
- `http://localhost:5174/playground/components/bubble-chart` — GDP vs Life Expectancy, bubble size = population; China/India should be largest bubbles
