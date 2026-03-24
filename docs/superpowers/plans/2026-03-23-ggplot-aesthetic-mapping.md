# ggplot-Style Aesthetic Mapping Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement ggplot2-style independent aesthetic mapping where `color`, `pattern`, and `symbol` each accept a field name string, with the legend automatically merging groups that share the same field and showing separate sections for different fields.

**Architecture:** `ChartBrewer` gains a `legendGroups` derived property that groups mapped aesthetics by their field, merging same-field aesthetics into one legend section. All five chart components (`BarChart`, `AreaChart`, `PieChart`, `LineChart`, `ScatterPlot`) revert their `pattern`/`symbol` props from boolean flags to string field names. Chart legend rendering switches from a flat `legendItems` array to the `legendGroups` array from the brewer.

**Tech Stack:** Svelte 5 runes (`$derived`, `$state`, `$effect`), `ChartBrewer` class, `@testing-library/svelte`, Vitest

---

## Current State (context for implementer)

In the last session, `pattern` (BarChart, AreaChart, PieChart) and `symbol` (LineChart, ScatterPlot) were converted from string field names to boolean flags that auto-dual-code the `color` field. This plan reverses that, replacing the boolean with proper string field names, and adds ggplot-style legend grouping.

Key files:
- `packages/chart/src/lib/brewing/brewer.svelte.js` — ChartBrewer class, already has `colorMap`, `patternMap`, `symbolMap` derived from `this.#channels`
- `packages/chart/src/lib/ChartPatternDefs.svelte` — SVG `<defs>` for patterns; currently only imports 9 of the 20 available patterns
- `packages/chart/src/charts/BarChart.svelte` — currently `pattern = true` (boolean)
- `packages/chart/src/charts/AreaChart.svelte` — currently `pattern = true` (boolean)
- `packages/chart/src/charts/PieChart.svelte` — currently `pattern = true` (boolean)
- `packages/chart/src/charts/LineChart.svelte` — currently `symbol = true` (boolean)
- `packages/chart/src/charts/ScatterPlot.svelte` — currently `symbol = true` (boolean)

The boolean channel assignment pattern that needs reverting (same in all charts):
```js
// CURRENT (boolean, to be replaced):
if (pattern && color) channels.pattern = color

// TARGET (string field name):
if (pattern) channels.pattern = pattern
```

---

## File Structure

**Modified files:**
- `packages/chart/src/lib/brewing/brewer.svelte.js` — add `buildLegendGroups` helper + `legendGroups` derived
- `packages/chart/src/lib/ChartPatternDefs.svelte` — register all 20 patterns
- `packages/chart/src/charts/BarChart.svelte` — string prop, legendGroups legend
- `packages/chart/src/charts/AreaChart.svelte` — string prop, legendGroups legend
- `packages/chart/src/charts/PieChart.svelte` — string prop, legendGroups legend
- `packages/chart/src/charts/LineChart.svelte` — string prop, legendGroups legend
- `packages/chart/src/charts/ScatterPlot.svelte` — string prop, legendGroups legend
- `site/src/routes/(play)/playground/components/bar-chart/+page.svelte` — string dropdown controls
- `site/src/routes/(play)/playground/components/area-chart/+page.svelte` — string dropdown controls
- `site/src/routes/(play)/playground/components/pie-chart/+page.svelte` — string dropdown controls
- `site/src/routes/(play)/playground/components/line-chart/+page.svelte` — string dropdown controls
- `site/src/routes/(play)/playground/components/scatter-plot/+page.svelte` — string dropdown controls

**New test file:**
- `packages/chart/spec/brewing/legend-groups.spec.js` — unit tests for `buildLegendGroups`

---

## Chunk 1: ChartBrewer legendGroups

### Task 1: Add `buildLegendGroups` to brewer

**Files:**
- Create: `packages/chart/spec/brewing/legend-groups.spec.js`
- Modify: `packages/chart/src/lib/brewing/brewer.svelte.js`

- [ ] **Step 1: Write failing tests for `buildLegendGroups`**

Create `packages/chart/spec/brewing/legend-groups.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { buildLegendGroups } from '../../src/lib/brewing/brewer.svelte.js'

describe('buildLegendGroups', () => {
  const colorMap = new Map([
    ['North', { fill: '#blue', stroke: '#darkblue' }],
    ['South', { fill: '#red', stroke: '#darkred' }]
  ])
  const patternMap = new Map([['North', 'Dots'], ['South', 'Waves']])
  const symbolMap = new Map([['Basic', 'circle'], ['Pro', 'triangle']])

  it('returns empty array when no aesthetic channels set', () => {
    const result = buildLegendGroups({}, colorMap, patternMap, symbolMap)
    expect(result).toEqual([])
  })

  it('single color field → one group with fill/stroke', () => {
    const result = buildLegendGroups({ color: 'region' }, colorMap, patternMap, symbolMap)
    expect(result).toHaveLength(1)
    expect(result[0].field).toBe('region')
    expect(result[0].items).toHaveLength(2)
    expect(result[0].items[0]).toMatchObject({ label: 'North', fill: '#blue', stroke: '#darkblue', patternId: null, shape: null })
  })

  it('same field for color + pattern → one merged group', () => {
    const result = buildLegendGroups({ color: 'region', pattern: 'region' }, colorMap, patternMap, symbolMap)
    expect(result).toHaveLength(1)
    expect(result[0].field).toBe('region')
    expect(result[0].items[0]).toMatchObject({
      label: 'North',
      fill: '#blue',
      patternId: 'chart-pat-North'
    })
  })

  it('different fields for color + symbol → two separate groups', () => {
    const result = buildLegendGroups({ color: 'region', symbol: 'tier' }, colorMap, patternMap, symbolMap)
    expect(result).toHaveLength(2)
    expect(result[0].field).toBe('region')
    expect(result[0].items[0]).toMatchObject({ fill: '#blue', shape: null })
    expect(result[1].field).toBe('tier')
    expect(result[1].items[0]).toMatchObject({ label: 'Basic', fill: null, shape: 'circle' })
  })

  it('pattern field with no matching color → patternId present, fill null', () => {
    const result = buildLegendGroups({ pattern: 'tier' }, colorMap, patternMap, symbolMap)
    // patternMap doesn't have 'Basic'/'Pro' so these won't match — but patternMap IS symbolMap keys here
    // Use the actual patternMap
    const pm2 = new Map([['Basic', 'Dots'], ['Pro', 'Waves']])
    const r2 = buildLegendGroups({ pattern: 'tier' }, colorMap, pm2, symbolMap)
    expect(r2).toHaveLength(1)
    expect(r2[0].items[0]).toMatchObject({ fill: null, patternId: 'chart-pat-Basic' })
  })
})
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd /Users/Jerry/Developer/rokkit
bunx vitest run --project chart spec/brewing/legend-groups.spec.js
```
Expected: FAIL — `buildLegendGroups is not exported`

- [ ] **Step 3: Implement `buildLegendGroups` in brewer.svelte.js**

Add this function at the module level (before the class) in `packages/chart/src/lib/brewing/brewer.svelte.js`:

```js
/**
 * Groups aesthetic channel mappings by field name, merging aesthetics that
 * share the same field into one legend section.
 *
 * @param {{ color?: string, pattern?: string, symbol?: string }} channels
 * @param {Map<unknown, {fill:string, stroke:string}>} colorMap
 * @param {Map<unknown, string>} patternMap
 * @param {Map<unknown, string>} symbolMap
 * @returns {{ field: string, items: { label: string, fill: string|null, stroke: string|null, patternId: string|null, shape: string|null }[] }[]}
 */
export function buildLegendGroups(channels, colorMap, patternMap, symbolMap) {
  const { color: cf, pattern: pf, symbol: sf } = channels
  const byField = new Map()

  if (cf) {
    byField.set(cf, { aesthetics: ['color'], keys: [...colorMap.keys()] })
  }
  if (pf) {
    if (byField.has(pf)) {
      byField.get(pf).aesthetics.push('pattern')
    } else {
      byField.set(pf, { aesthetics: ['pattern'], keys: [...patternMap.keys()] })
    }
  }
  if (sf) {
    if (byField.has(sf)) {
      byField.get(sf).aesthetics.push('symbol')
    } else {
      byField.set(sf, { aesthetics: ['symbol'], keys: [...symbolMap.keys()] })
    }
  }

  return [...byField.entries()].map(([field, { aesthetics, keys }]) => ({
    field,
    items: keys.map((key) => ({
      label: String(key),
      fill: aesthetics.includes('color') ? (colorMap.get(key)?.fill ?? null) : null,
      stroke: aesthetics.includes('color') ? (colorMap.get(key)?.stroke ?? null) : null,
      patternId:
        aesthetics.includes('pattern') && patternMap.has(key) ? `chart-pat-${key}` : null,
      shape: aesthetics.includes('symbol') ? (symbolMap.get(key) ?? 'circle') : null
    }))
  }))
}
```

Then add `legendGroups` as a derived property on the `ChartBrewer` class, after `points`:

```js
legendGroups = $derived(
  buildLegendGroups(this.#channels, this.colorMap, this.patternMap, this.symbolMap)
)
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
bunx vitest run --project chart spec/brewing/legend-groups.spec.js
```
Expected: All tests PASS

- [ ] **Step 5: Run full chart test suite to confirm no regressions**

```bash
bunx vitest run --project chart
```
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
cd /Users/Jerry/Developer/rokkit
git add packages/chart/src/lib/brewing/brewer.svelte.js packages/chart/spec/brewing/legend-groups.spec.js
git commit -m "feat(chart): add buildLegendGroups to ChartBrewer for ggplot-style legend grouping

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Chunk 2: ChartPatternDefs + chart components

### Task 2: Fix ChartPatternDefs to register all 20 patterns

**Files:**
- Modify: `packages/chart/src/lib/ChartPatternDefs.svelte`

`ChartPatternDefs` currently only imports 9 of the 20 available patterns. The full list from `packages/chart/src/patterns/index.js` is:
Brick, Checkerboard, CircleGrid, Circles, CrossDot, CrossHatch, CurvedWave, DiagonalLines, DiamondOutline, Diamonds, Dots, Hexagons, HorizontalLines, OutlineCircles, ScatteredTriangles, Tile, Triangles, VerticalLines, Waves, Zigzag

- [ ] **Step 1: Update imports and COMPONENTS map**

Replace the entire `<script>` block in `packages/chart/src/lib/ChartPatternDefs.svelte`:

```svelte
<script>
  import Brick from '../patterns/Brick.svelte'
  import Checkerboard from '../patterns/Checkerboard.svelte'
  import CircleGrid from '../patterns/CircleGrid.svelte'
  import Circles from '../patterns/Circles.svelte'
  import CrossDot from '../patterns/CrossDot.svelte'
  import CrossHatch from '../patterns/CrossHatch.svelte'
  import CurvedWave from '../patterns/CurvedWave.svelte'
  import DiagonalLines from '../patterns/DiagonalLines.svelte'
  import DiamondOutline from '../patterns/DiamondOutline.svelte'
  import Diamonds from '../patterns/Diamonds.svelte'
  import Dots from '../patterns/Dots.svelte'
  import Hexagons from '../patterns/Hexagons.svelte'
  import HorizontalLines from '../patterns/HorizontalLines.svelte'
  import OutlineCircles from '../patterns/OutlineCircles.svelte'
  import ScatteredTriangles from '../patterns/ScatteredTriangles.svelte'
  import Tile from '../patterns/Tile.svelte'
  import Triangles from '../patterns/Triangles.svelte'
  import VerticalLines from '../patterns/VerticalLines.svelte'
  import Waves from '../patterns/Waves.svelte'
  import Zigzag from '../patterns/Zigzag.svelte'

  const COMPONENTS = {
    Brick, Checkerboard, CircleGrid, Circles, CrossDot, CrossHatch, CurvedWave,
    DiagonalLines, DiamondOutline, Diamonds, Dots, Hexagons, HorizontalLines,
    OutlineCircles, ScatteredTriangles, Tile, Triangles, VerticalLines, Waves, Zigzag
  }
  const SIZE = 10

  /**
   * @type {{ patternMap: Map<unknown, string>, colorMap: Map<unknown, {fill: string, stroke: string}> }}
   */
  let { patternMap, colorMap } = $props()

  const defs = $derived(
    Array.from(patternMap.entries()).map(([key, name]) => {
      const color = colorMap.get(key) ?? { fill: '#ddd', stroke: '#666' }
      return {
        id: `chart-pat-${key}`,
        Component: COMPONENTS[name] ?? null,
        fill: color.fill,
        stroke: color.stroke
      }
    })
  )
</script>
```

- [ ] **Step 2: Run chart tests**

```bash
bunx vitest run --project chart
```
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add packages/chart/src/lib/ChartPatternDefs.svelte
git commit -m "fix(chart): register all 20 patterns in ChartPatternDefs

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Update chart components — string props + legendGroups

**Files:**
- Modify: `packages/chart/src/charts/BarChart.svelte`
- Modify: `packages/chart/src/charts/AreaChart.svelte`
- Modify: `packages/chart/src/charts/PieChart.svelte`
- Modify: `packages/chart/src/charts/LineChart.svelte`
- Modify: `packages/chart/src/charts/ScatterPlot.svelte`

All five charts need the same treatment:
1. Revert `pattern`/`symbol` prop type annotation from `boolean` to `string`
2. Change default from `true` to `undefined`
3. Change channel assignment from `if (pattern && color) channels.pattern = color` → `if (pattern) channels.pattern = pattern`
4. Remove local `legendItems` derived, replace with `legendGroups` from brewer
5. Update legend rendering to iterate `legendGroups` with section titles + combined swatches

#### BarChart.svelte

- [ ] **Step 1: Update BarChart script section**

In `packages/chart/src/charts/BarChart.svelte`, replace the entire `<script>` block:

```svelte
<script>
  import { setContext } from 'svelte'
  import { ChartBrewer } from '../lib/brewing/brewer.svelte.js'
  import ChartPatternDefs from '../lib/ChartPatternDefs.svelte'

  /**
   * @type {{
   *   data?: Object[],
   *   x?: string,
   *   y?: string,
   *   color?: string,
   *   pattern?: string,
   *   width?: number,
   *   height?: number,
   *   mode?: 'light' | 'dark',
   *   grid?: boolean,
   *   legend?: boolean
   * }}
   */
  let {
    data = [],
    x = undefined,
    y = undefined,
    color = undefined,
    pattern = undefined,
    width = 600,
    height = 400,
    mode = 'light',
    grid = true,
    legend = false
  } = $props()

  const brewer = new ChartBrewer()
  setContext('chart-brewer', brewer)

  $effect(() => {
    const channels = {}
    if (x)       channels.x = x
    if (y)       channels.y = y
    if (color)   channels.color = color
    if (pattern) channels.pattern = pattern
    brewer.update({ data, channels, width, height, mode })
  })

  const margin = { top: 20, right: 20, bottom: 40, left: 50 }
  const innerWidth = $derived(width - margin.left - margin.right)
  const innerHeight = $derived(height - margin.top - margin.bottom)

  const bars = $derived(brewer.bars)
  const xScale = $derived(brewer.xScale)
  const yScale = $derived(brewer.yScale)
  const patternMap = $derived(brewer.patternMap)
  const colorMap = $derived(brewer.colorMap)
  const legendGroups = $derived(brewer.legendGroups)

  const xTicks = $derived(
    xScale && typeof xScale.domain === 'function'
      ? xScale.domain().map((val) => ({
          value: val,
          x: (xScale(val) ?? 0) + (typeof xScale.bandwidth === 'function' ? xScale.bandwidth() / 2 : 0)
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
```

- [ ] **Step 2: Update BarChart legend markup**

Replace the `<!-- HTML legend -->` block (from `{#if legend` to `{/if}`) at the end of the template:

```svelte
  <!-- HTML legend -->
  {#if legend && legendGroups.length > 0}
    <div data-chart-legend>
      {#each legendGroups as group}
        {#if legendGroups.length > 1}
          <div data-chart-legend-title>{group.field}</div>
        {/if}
        {#each group.items as item (item.label)}
          <div data-chart-legend-item>
            {#if item.patternId}
              <svg width="12" height="12" data-chart-legend-swatch>
                <rect width="12" height="12" fill={item.fill ?? '#ddd'} />
                <rect width="12" height="12" fill="url(#{item.patternId})" />
              </svg>
            {:else}
              <span data-chart-legend-swatch style="background-color: {item.fill ?? '#ddd'}"></span>
            {/if}
            <span data-chart-legend-label>{item.label}</span>
          </div>
        {/each}
      {/each}
    </div>
  {/if}
```

#### AreaChart.svelte

- [ ] **Step 3: Update AreaChart script section**

Same script changes as BarChart, plus `curve` prop and `areas` instead of `bars`.

In `packages/chart/src/charts/AreaChart.svelte`, replace the entire `<script>` block:

```svelte
<script>
  import { setContext } from 'svelte'
  import { ChartBrewer } from '../lib/brewing/brewer.svelte.js'
  import ChartPatternDefs from '../lib/ChartPatternDefs.svelte'

  /**
   * @type {{
   *   data?: Object[],
   *   x?: string,
   *   y?: string,
   *   color?: string,
   *   pattern?: string,
   *   width?: number,
   *   height?: number,
   *   mode?: 'light' | 'dark',
   *   grid?: boolean,
   *   legend?: boolean,
   *   curve?: 'linear' | 'smooth' | 'step'
   * }}
   */
  let {
    data = [],
    x = undefined,
    y = undefined,
    color = undefined,
    pattern = undefined,
    width = 600,
    height = 400,
    mode = 'light',
    grid = true,
    legend = false,
    curve = 'linear'
  } = $props()

  const brewer = new ChartBrewer()
  setContext('chart-brewer', brewer)

  $effect(() => {
    const channels = {}
    if (x)       channels.x = x
    if (y)       channels.y = y
    if (color)   channels.color = color
    if (pattern) channels.pattern = pattern
    brewer.update({ data, channels, width, height, mode, curve })
  })

  const margin = { top: 20, right: 20, bottom: 40, left: 50 }
  const innerWidth = $derived(width - margin.left - margin.right)
  const innerHeight = $derived(height - margin.top - margin.bottom)

  const areas = $derived(brewer.areas)
  const xScale = $derived(brewer.xScale)
  const yScale = $derived(brewer.yScale)
  const patternMap = $derived(brewer.patternMap)
  const colorMap = $derived(brewer.colorMap)
  const legendGroups = $derived(brewer.legendGroups)

  const xTicks = $derived(
    xScale && typeof xScale.domain === 'function'
      ? xScale.domain().map((val) => ({
          value: val,
          x: (xScale(val) ?? 0) + (typeof xScale.bandwidth === 'function' ? xScale.bandwidth() / 2 : 0)
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
```

- [ ] **Step 4: Update AreaChart legend markup**

Same legend block as BarChart (pattern swatch + color fallback).

#### PieChart.svelte

- [ ] **Step 5: Update PieChart script section**

In `packages/chart/src/charts/PieChart.svelte`, replace the entire `<script>` block:

```svelte
<script>
  import { setContext } from 'svelte'
  import { ChartBrewer } from '../lib/brewing/brewer.svelte.js'
  import ChartPatternDefs from '../lib/ChartPatternDefs.svelte'

  /**
   * @type {{
   *   data?: Object[],
   *   label?: string,
   *   y?: string,
   *   color?: string,
   *   pattern?: string,
   *   width?: number,
   *   height?: number,
   *   mode?: 'light' | 'dark',
   *   legend?: boolean
   * }}
   */
  let {
    data = [],
    label = undefined,
    y = undefined,
    color = undefined,
    pattern = undefined,
    width = 400,
    height = 400,
    mode = 'light',
    legend = false
  } = $props()

  const brewer = new ChartBrewer()
  setContext('chart-brewer', brewer)

  $effect(() => {
    const channels = {}
    if (label)   channels.label = label
    if (y)       channels.y = y
    if (color)   channels.color = color
    if (pattern) channels.pattern = pattern
    brewer.update({ data, channels, width, height, mode })
  })

  const arcs = $derived(brewer.arcs)
  const patternMap = $derived(brewer.patternMap)
  const colorMap = $derived(brewer.colorMap)
  const legendGroups = $derived(brewer.legendGroups)
</script>
```

- [ ] **Step 6: Update PieChart legend markup**

PieChart uses an SVG legend (inside `<svg>`), not an HTML legend. Replace the `{#if legend ...}` block:

```svelte
    <!-- Legend -->
    {#if legend && legendGroups.length > 0}
      <g class="chart-legend" transform="translate(10, 10)" data-chart-legend>
        {@const allItems = legendGroups.flatMap((g, gi) =>
          legendGroups.length > 1
            ? [{ _title: g.field, _gi: gi }, ...g.items]
            : g.items
        )}
        {#each allItems as item, i}
          {#if item._title}
            <text x="0" y={i * 20 + 9} font-size="9" fill="currentColor" font-weight="bold" data-chart-legend-title>{item._title}</text>
          {:else}
            <g transform="translate(0, {i * 20})">
              {#if item.patternId}
                <svg x="0" y="0" width="10" height="10">
                  <rect width="10" height="10" fill={item.fill ?? '#ddd'} data-chart-legend-marker />
                  <rect width="10" height="10" fill="url(#{item.patternId})" />
                </svg>
              {:else}
                <rect width="10" height="10" fill={item.fill ?? '#ddd'} data-chart-legend-marker />
              {/if}
              <text x="14" y="9" text-anchor="start" data-chart-legend-label>{item.label}</text>
            </g>
          {/if}
        {/each}
      </g>
    {/if}
```

#### LineChart.svelte

- [ ] **Step 7: Update LineChart script section**

In `packages/chart/src/charts/LineChart.svelte`, replace the entire `<script>` block:

```svelte
<script>
  import { setContext } from 'svelte'
  import { ChartBrewer } from '../lib/brewing/brewer.svelte.js'
  import Shape from '../symbols/Shape.svelte'

  /**
   * @type {{
   *   data?: Object[],
   *   x?: string,
   *   y?: string,
   *   color?: string,
   *   width?: number,
   *   height?: number,
   *   mode?: 'light' | 'dark',
   *   grid?: boolean,
   *   legend?: boolean,
   *   curve?: 'linear' | 'smooth' | 'step',
   *   symbol?: string
   * }}
   */
  let {
    data = [],
    x = undefined,
    y = undefined,
    color = undefined,
    width = 600,
    height = 400,
    mode = 'light',
    grid = true,
    legend = false,
    curve = 'linear',
    symbol = undefined
  } = $props()

  const brewer = new ChartBrewer()
  setContext('chart-brewer', brewer)

  $effect(() => {
    const channels = {}
    if (x)      channels.x = x
    if (y)      channels.y = y
    if (color)  channels.color = color
    if (symbol) channels.symbol = symbol
    brewer.update({ data, channels, width, height, mode, curve })
  })

  const margin = { top: 20, right: 20, bottom: 40, left: 50 }
  const innerWidth = $derived(width - margin.left - margin.right)
  const innerHeight = $derived(height - margin.top - margin.bottom)

  const lines = $derived(brewer.lines)
  const xScale = $derived(brewer.xScale)
  const yScale = $derived(brewer.yScale)
  const symbolMap = $derived(brewer.symbolMap)
  const legendGroups = $derived(brewer.legendGroups)

  const xTicks = $derived(
    xScale && typeof xScale.domain === 'function'
      ? xScale.domain().map((val) => ({
          value: val,
          x: (xScale(val) ?? 0) + (typeof xScale.bandwidth === 'function' ? xScale.bandwidth() / 2 : 0)
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
```

- [ ] **Step 8: Update LineChart symbol markers condition**

The `{#if symbol}` guard on the symbol markers group still works because `symbol` is now a string (truthy when set).

- [ ] **Step 9: Update LineChart legend markup**

Replace the `<!-- HTML legend -->` block. Lines use `stroke` for their color (not `fill`), and legend items may have a shape marker:

```svelte
  <!-- HTML legend (below SVG, styled via base/theme CSS) -->
  {#if legend && legendGroups.length > 0}
    <div data-chart-legend>
      {#each legendGroups as group}
        {#if legendGroups.length > 1}
          <div data-chart-legend-title>{group.field}</div>
        {/if}
        {#each group.items as item (item.label)}
          <div data-chart-legend-item>
            {#if item.shape}
              <svg width="20" height="12" data-chart-legend-swatch>
                <line x1="0" y1="6" x2="20" y2="6" stroke={item.stroke ?? '#888'} stroke-width="2" />
                <Shape x={10} y={6} size={0.6} name={item.shape} fill={item.stroke ?? '#888'} stroke={item.stroke ?? '#888'} thickness={1} />
              </svg>
            {:else}
              <span data-chart-legend-swatch style="background-color: {item.stroke ?? item.fill ?? '#888'}"></span>
            {/if}
            <span data-chart-legend-label>{item.label}</span>
          </div>
        {/each}
      {/each}
    </div>
  {/if}
```

#### ScatterPlot.svelte

- [ ] **Step 10: Update ScatterPlot script section**

In `packages/chart/src/charts/ScatterPlot.svelte`, replace the entire `<script>` block:

```svelte
<script>
  import { setContext } from 'svelte'
  import { ChartBrewer } from '../lib/brewing/brewer.svelte.js'
  import Shape from '../symbols/Shape.svelte'

  /**
   * @type {{
   *   data?: Object[],
   *   x?: string,
   *   y?: string,
   *   color?: string,
   *   symbol?: string,
   *   size?: string,
   *   width?: number,
   *   height?: number,
   *   mode?: 'light' | 'dark',
   *   grid?: boolean,
   *   legend?: boolean
   * }}
   */
  let {
    data = [],
    x = undefined,
    y = undefined,
    color = undefined,
    symbol = undefined,
    size = undefined,
    width = 600,
    height = 400,
    mode = 'light',
    grid = true,
    legend = false
  } = $props()

  const brewer = new ChartBrewer()
  setContext('chart-brewer', brewer)

  $effect(() => {
    const channels = {}
    if (x)      channels.x = x
    if (y)      channels.y = y
    if (color)  channels.color = color
    if (symbol) channels.symbol = symbol
    if (size)   channels.size = size
    brewer.update({ data, channels, width, height, mode })
  })

  const margin = { top: 20, right: 20, bottom: 40, left: 50 }
  const innerWidth = $derived(width - margin.left - margin.right)
  const innerHeight = $derived(height - margin.top - margin.bottom)

  const points = $derived(brewer.points)
  const xScale = $derived(brewer.xScale)
  const yScale = $derived(brewer.yScale)
  const legendGroups = $derived(brewer.legendGroups)

  const xTicks = $derived(
    xScale && typeof xScale.ticks === 'function'
      ? xScale.ticks(5).map((val) => ({ value: val, x: xScale(val) ?? 0 }))
      : xScale && typeof xScale.domain === 'function'
        ? xScale.domain().map((val) => ({
            value: val,
            x: (xScale(val) ?? 0) + (typeof xScale.bandwidth === 'function' ? xScale.bandwidth() / 2 : 0)
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
```

- [ ] **Step 11: Update ScatterPlot legend markup**

Replace the `<!-- HTML legend -->` block. Scatter uses `fill` for point color, and may show shape symbols:

```svelte
  <!-- HTML legend -->
  {#if legend && legendGroups.length > 0}
    <div data-chart-legend>
      {#each legendGroups as group}
        {#if legendGroups.length > 1}
          <div data-chart-legend-title>{group.field}</div>
        {/if}
        {#each group.items as item (item.label)}
          <div data-chart-legend-item>
            {#if item.shape}
              <svg width="12" height="12" data-chart-legend-swatch>
                <Shape x={6} y={6} size={0.6} name={item.shape} fill={item.fill ?? '#888'} stroke={item.stroke ?? '#888'} thickness={1} />
              </svg>
            {:else}
              <span data-chart-legend-swatch style="background-color: {item.fill ?? '#ddd'}"></span>
            {/if}
            <span data-chart-legend-label>{item.label}</span>
          </div>
        {/each}
      {/each}
    </div>
  {/if}
```

- [ ] **Step 12: Run full chart test suite**

```bash
bunx vitest run --project chart
```
Expected: All tests pass (chart component tests only do render smoke tests)

- [ ] **Step 13: Commit**

```bash
git add packages/chart/src/charts/BarChart.svelte \
        packages/chart/src/charts/AreaChart.svelte \
        packages/chart/src/charts/PieChart.svelte \
        packages/chart/src/charts/LineChart.svelte \
        packages/chart/src/charts/ScatterPlot.svelte \
        packages/chart/src/lib/ChartPatternDefs.svelte
git commit -m "feat(chart): ggplot-style aesthetic mapping — string field props + legendGroups legend

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## Chunk 3: Playground pages

### Task 4: Update all 5 playground pages

**Files:**
- Modify: `site/src/routes/(play)/playground/components/bar-chart/+page.svelte`
- Modify: `site/src/routes/(play)/playground/components/area-chart/+page.svelte`
- Modify: `site/src/routes/(play)/playground/components/pie-chart/+page.svelte`
- Modify: `site/src/routes/(play)/playground/components/line-chart/+page.svelte`
- Modify: `site/src/routes/(play)/playground/components/scatter-plot/+page.svelte`

Each playground needs:
- Replace boolean `pattern`/`symbol` state with string field state
- Update schema: `boolean` → `string`
- Update layout: boolean toggle → dropdown with field options
- Update component binding: `pattern={props.pattern}` → `pattern={props.patternField || undefined}`
- Update InfoField labels

#### bar-chart/+page.svelte

- [ ] **Step 1: Rewrite bar-chart playground**

Full file content for `site/src/routes/(play)/playground/components/bar-chart/+page.svelte`:

```svelte
<script>
	// @ts-nocheck
	import { BarChart } from '@rokkit/chart'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	const data = [
		{ category: 'Q1', revenue: 42000, region: 'North' },
		{ category: 'Q2', revenue: 58000, region: 'South' },
		{ category: 'Q3', revenue: 51000, region: 'East' },
		{ category: 'Q4', revenue: 73000, region: 'West' }
	]

	let props = $state({
		colorField: 'region',
		patternField: 'region',
		grid: true,
		legend: false
	})

	const schema = {
		type: 'object',
		properties: {
			colorField: { type: 'string' },
			patternField: { type: 'string' },
			grid: { type: 'boolean' },
			legend: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{
				scope: '#/colorField',
				label: 'Color field',
				props: { options: ['', 'region', 'category'] }
			},
			{
				scope: '#/patternField',
				label: 'Pattern field',
				props: { options: ['', 'region', 'category'] }
			},
			{ scope: '#/grid', label: 'Grid' },
			{ scope: '#/legend', label: 'Legend' },
			{ type: 'separator' }
		]
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-col gap-8 p-6">
			<div>
				<h4 class="text-surface-z5 m-0 mb-3 text-xs uppercase tracking-widest font-semibold">
					Quarterly Revenue
				</h4>
				<BarChart
					{data}
					x="category"
					y="revenue"
					color={props.colorField || undefined}
					pattern={props.patternField || undefined}
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
		<InfoField label="Color field" value={props.colorField || '(none)'} />
		<InfoField label="Pattern field" value={props.patternField || '(none)'} />
		<InfoField label="Grid" value={String(props.grid)} />
		<InfoField label="Legend" value={String(props.legend)} />
	{/snippet}
</PlaySection>
```

#### area-chart/+page.svelte

- [ ] **Step 2: Rewrite area-chart playground**

Full file content for `site/src/routes/(play)/playground/components/area-chart/+page.svelte`:

```svelte
<script>
	// @ts-nocheck
	import { AreaChart } from '@rokkit/chart'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	const data = [
		{ month: 'Jan', revenue: 32000, region: 'North' },
		{ month: 'Feb', revenue: 41000, region: 'North' },
		{ month: 'Mar', revenue: 38000, region: 'North' },
		{ month: 'Apr', revenue: 52000, region: 'North' },
		{ month: 'May', revenue: 61000, region: 'North' },
		{ month: 'Jun', revenue: 58000, region: 'North' },
		{ month: 'Jan', revenue: 21000, region: 'South' },
		{ month: 'Feb', revenue: 29000, region: 'South' },
		{ month: 'Mar', revenue: 34000, region: 'South' },
		{ month: 'Apr', revenue: 31000, region: 'South' },
		{ month: 'May', revenue: 44000, region: 'South' },
		{ month: 'Jun', revenue: 40000, region: 'South' }
	]

	let props = $state({
		colorField: 'region',
		patternField: 'region',
		curve: 'linear',
		grid: true,
		legend: false
	})

	const schema = {
		type: 'object',
		properties: {
			colorField: { type: 'string' },
			patternField: { type: 'string' },
			curve: { type: 'string' },
			grid: { type: 'boolean' },
			legend: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{
				scope: '#/colorField',
				label: 'Color field',
				props: { options: ['', 'region', 'month'] }
			},
			{
				scope: '#/patternField',
				label: 'Pattern field',
				props: { options: ['', 'region', 'month'] }
			},
			{
				scope: '#/curve',
				label: 'Curve',
				props: { options: ['linear', 'smooth', 'step'] }
			},
			{ scope: '#/grid', label: 'Grid' },
			{ scope: '#/legend', label: 'Legend' },
			{ type: 'separator' }
		]
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-col gap-8 p-6">
			<div>
				<h4 class="text-surface-z5 m-0 mb-3 text-xs uppercase tracking-widest font-semibold">
					Monthly Revenue
				</h4>
				<AreaChart
					{data}
					x="month"
					y="revenue"
					color={props.colorField || undefined}
					pattern={props.patternField || undefined}
					curve={props.curve}
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
		<InfoField label="Color field" value={props.colorField || '(none)'} />
		<InfoField label="Pattern field" value={props.patternField || '(none)'} />
		<InfoField label="Curve" value={props.curve} />
		<InfoField label="Grid" value={String(props.grid)} />
		<InfoField label="Legend" value={String(props.legend)} />
	{/snippet}
</PlaySection>
```

#### pie-chart/+page.svelte

- [ ] **Step 3: Rewrite pie-chart playground**

Full file content for `site/src/routes/(play)/playground/components/pie-chart/+page.svelte`:

```svelte
<script>
	// @ts-nocheck
	import { PieChart } from '@rokkit/chart'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	const data = [
		{ segment: 'Mobile', share: 42 },
		{ segment: 'Desktop', share: 35 },
		{ segment: 'Tablet', share: 15 },
		{ segment: 'Other', share: 8 }
	]

	let props = $state({
		colorField: 'segment',
		patternField: 'segment',
		legend: false
	})

	const schema = {
		type: 'object',
		properties: {
			colorField: { type: 'string' },
			patternField: { type: 'string' },
			legend: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{
				scope: '#/colorField',
				label: 'Color field',
				props: { options: ['', 'segment'] }
			},
			{
				scope: '#/patternField',
				label: 'Pattern field',
				props: { options: ['', 'segment'] }
			},
			{ scope: '#/legend', label: 'Legend' },
			{ type: 'separator' }
		]
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-col gap-8 p-6">
			<div>
				<h4 class="text-surface-z5 m-0 mb-3 text-xs uppercase tracking-widest font-semibold">
					Market Share by Device
				</h4>
				<PieChart
					{data}
					label="segment"
					y="share"
					color={props.colorField || undefined}
					pattern={props.patternField || undefined}
					legend={props.legend}
					width={400}
					height={400}
				/>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<FormRenderer bind:data={props} {schema} {layout} />
		<InfoField label="Color field" value={props.colorField || '(none)'} />
		<InfoField label="Pattern field" value={props.patternField || '(none)'} />
		<InfoField label="Legend" value={String(props.legend)} />
	{/snippet}
</PlaySection>
```

#### line-chart/+page.svelte

- [ ] **Step 4: Rewrite line-chart playground**

Full file content for `site/src/routes/(play)/playground/components/line-chart/+page.svelte`:

```svelte
<script>
	// @ts-nocheck
	import { LineChart } from '@rokkit/chart'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	const multiData = [
		{ month: 'Jan', value: 32000, region: 'North' },
		{ month: 'Feb', value: 41000, region: 'North' },
		{ month: 'Mar', value: 38000, region: 'North' },
		{ month: 'Apr', value: 52000, region: 'North' },
		{ month: 'May', value: 61000, region: 'North' },
		{ month: 'Jun', value: 58000, region: 'North' },
		{ month: 'Jan', value: 25000, region: 'South' },
		{ month: 'Feb', value: 31000, region: 'South' },
		{ month: 'Mar', value: 45000, region: 'South' },
		{ month: 'Apr', value: 38000, region: 'South' },
		{ month: 'May', value: 47000, region: 'South' },
		{ month: 'Jun', value: 53000, region: 'South' },
		{ month: 'Jan', value: 18000, region: 'East' },
		{ month: 'Feb', value: 22000, region: 'East' },
		{ month: 'Mar', value: 19000, region: 'East' },
		{ month: 'Apr', value: 28000, region: 'East' },
		{ month: 'May', value: 35000, region: 'East' },
		{ month: 'Jun', value: 31000, region: 'East' }
	]

	let props = $state({
		colorField: 'region',
		symbolField: 'region',
		curve: 'linear',
		grid: true,
		legend: false
	})

	const schema = {
		type: 'object',
		properties: {
			colorField: { type: 'string' },
			symbolField: { type: 'string' },
			curve: { type: 'string' },
			grid: { type: 'boolean' },
			legend: { type: 'boolean' }
		}
	}

	const layout = {
		type: 'vertical',
		elements: [
			{
				scope: '#/colorField',
				label: 'Color field',
				props: { options: ['', 'region'] }
			},
			{
				scope: '#/symbolField',
				label: 'Symbol field',
				props: { options: ['', 'region'] }
			},
			{
				scope: '#/curve',
				label: 'Curve',
				props: { options: ['linear', 'smooth', 'step'] }
			},
			{ scope: '#/grid', label: 'Grid' },
			{ scope: '#/legend', label: 'Legend' },
			{ type: 'separator' }
		]
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-col gap-8 p-6">
			<div>
				<h4 class="text-surface-z5 m-0 mb-3 text-xs uppercase tracking-widest font-semibold">
					Regional Revenue by Month
				</h4>
				<LineChart
					data={multiData}
					x="month"
					y="value"
					color={props.colorField || undefined}
					symbol={props.symbolField || undefined}
					curve={props.curve}
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
		<InfoField label="Color field" value={props.colorField || '(none)'} />
		<InfoField label="Symbol field" value={props.symbolField || '(none)'} />
		<InfoField label="Curve" value={props.curve} />
		<InfoField label="Grid" value={String(props.grid)} />
		<InfoField label="Legend" value={String(props.legend)} />
	{/snippet}
</PlaySection>
```

#### scatter-plot/+page.svelte

- [ ] **Step 5: Rewrite scatter-plot playground**

Full file content for `site/src/routes/(play)/playground/components/scatter-plot/+page.svelte`:

```svelte
<script>
	// @ts-nocheck
	import { ScatterPlot } from '@rokkit/chart'
	import { FormRenderer, InfoField } from '@rokkit/forms'
	import PlaySection from '$lib/components/PlaySection.svelte'

	const data = [
		{ sessions: 120, conversions: 18, channel: 'Email', tier: 'Basic' },
		{ sessions: 340, conversions: 45, channel: 'Social', tier: 'Pro' },
		{ sessions: 200, conversions: 22, channel: 'Email', tier: 'Pro' },
		{ sessions: 480, conversions: 71, channel: 'Organic', tier: 'Enterprise' },
		{ sessions: 150, conversions: 14, channel: 'Paid', tier: 'Basic' },
		{ sessions: 390, conversions: 60, channel: 'Social', tier: 'Enterprise' },
		{ sessions: 270, conversions: 38, channel: 'Organic', tier: 'Pro' },
		{ sessions: 510, conversions: 82, channel: 'Paid', tier: 'Enterprise' },
		{ sessions: 95,  conversions: 10, channel: 'Email', tier: 'Basic' },
		{ sessions: 430, conversions: 55, channel: 'Organic', tier: 'Pro' }
	]

	let props = $state({
		colorField: 'channel',
		symbolField: 'tier',
		grid: true,
		legend: false
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
			{
				scope: '#/colorField',
				label: 'Color field',
				props: { options: ['', 'channel', 'tier'] }
			},
			{
				scope: '#/symbolField',
				label: 'Symbol field',
				props: { options: ['', 'channel', 'tier'] }
			},
			{ scope: '#/grid', label: 'Grid' },
			{ scope: '#/legend', label: 'Legend' },
			{ type: 'separator' }
		]
	}
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-col gap-8 p-6">
			<div>
				<h4 class="text-surface-z5 m-0 mb-3 text-xs uppercase tracking-widest font-semibold">
					Sessions vs Conversions
				</h4>
				<ScatterPlot
					{data}
					x="sessions"
					y="conversions"
					color={props.colorField || undefined}
					symbol={props.symbolField || undefined}
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
		<InfoField label="Color field" value={props.colorField || '(none)'} />
		<InfoField label="Symbol field" value={props.symbolField || '(none)'} />
		<InfoField label="Grid" value={String(props.grid)} />
		<InfoField label="Legend" value={String(props.legend)} />
	{/snippet}
</PlaySection>
```

- [ ] **Step 6: Run full chart test suite**

```bash
bunx vitest run --project chart
```
Expected: All tests pass

- [ ] **Step 7: Run full repo test suite**

```bash
cd /Users/Jerry/Developer/rokkit && bun run test:ci
```
Expected: All tests pass, 0 errors

- [ ] **Step 8: Commit**

```bash
git add site/src/routes/\(play\)/playground/components/bar-chart/+page.svelte \
        site/src/routes/\(play\)/playground/components/area-chart/+page.svelte \
        site/src/routes/\(play\)/playground/components/pie-chart/+page.svelte \
        site/src/routes/\(play\)/playground/components/line-chart/+page.svelte \
        site/src/routes/\(play\)/playground/components/scatter-plot/+page.svelte
git commit -m "feat(playground): update chart playgrounds for ggplot-style aesthetic field mapping

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```
