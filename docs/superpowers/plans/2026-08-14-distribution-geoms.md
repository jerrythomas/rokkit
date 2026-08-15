# Distribution Geoms (`Plot.Box` / `Plot.Violin` / `Plot.Jitter`) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Surface `Plot.Box`/`Plot.Violin` in the composable `Plot.*` namespace, give Box proper Tukey whiskers + outlier points, and add a new `Plot.Jitter` beeswarm geom — closing issues #143 and #144.

**Architecture:** All three are registration-based geoms on the shared `'plot-state'` context (like the existing `GeomBox`/`GeomViolin`). Box/Violin already exist and only need outliers (Box) + namespace wiring. Jitter is new: a `geoms/Jitter.svelte` component + a `buildSwarm` mark builder supporting deterministic `jitter` and non-overlapping `swarm` layouts. `applyBoxStat` gains Tukey-clamped whiskers and an `outliers` array; `PlotState` folds outliers into the box y-domain and forces a band x-axis for these geoms.

**Tech Stack:** Svelte 5 (runes), d3-scale/d3-array/d3-shape, `@rokkit/data` (`dataset().groupBy().summarize().rollup().select()`), vitest + @testing-library/svelte.

**Commands:**
- Targeted test (run-mode, exits): `bun run test:ci -- <path-substring>`
- Full suite: `bun run test:ci`
- Lint (zero errors required): `bun run lint`

**Do NOT** use bare `vitest` or `test:unit` (watch mode orphans node processes). `Math.random`/`Date.now` are banned — all layouts must be deterministic.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `packages/chart/src/lib/brewing/stats.js` | `applyBoxStat` — quartiles + **Tukey-clamped whiskers + `outliers`** |
| `packages/chart/src/lib/brewing/marks/boxes.js` | `buildBoxes` — add `outliers` screen positions |
| `packages/chart/src/lib/brewing/marks/swarm.js` | **new** — `buildSwarm` (jitter + swarm point layout) |
| `packages/chart/src/geoms/Box.svelte` | render outlier circles |
| `packages/chart/src/geoms/Jitter.svelte` | **new** geom component |
| `packages/chart/src/PlotState.svelte.js` | outliers in box domain + `CATEGORICAL_X` band-forcing |
| `packages/chart/src/index.js` | `Plot.Box/Violin/Jitter`, `GeomJitter` exports |
| `packages/chart/spec/helpers/TestBox.svelte` | **new** test wrapper |
| `packages/chart/spec/helpers/TestJitter.svelte` | **new** test wrapper |
| `packages/chart/spec/**` | new + updated specs |
| `apps/learn/src/lib/koan/demos/chart/index.svelte` | composable distribution-geoms demo section |

---

## Task 1: Tukey-clamped whiskers + outliers in `applyBoxStat`

**Files:**
- Modify: `packages/chart/src/lib/brewing/stats.js`
- Test: `packages/chart/spec/brewing/stats.spec.js`

Semantics change: `iqr_min`/`iqr_max` become the **clamped whisker endpoints** (the most extreme datum *within* the 1.5·IQR fence). New `outliers: number[]` holds values outside the fence. This updates two existing assertions (they asserted the raw fence values) and adds outlier tests.

- [ ] **Step 1: Update the existing whisker assertions + add outlier tests**

In `packages/chart/spec/brewing/stats.spec.js`, REPLACE the two tests titled `'computes iqr_min = q1 - 1.5 * IQR'` and `'computes iqr_max = q3 + 1.5 * IQR'` (currently expecting `-5` and `55`) with the clamped versions, and add outlier coverage:

```js
	it('clamps iqr_min to the smallest datum within the lower fence', () => {
		const result = applyBoxStat(boxData, { x: 'class', y: 'hwy' })
		const a = result.find((r) => r.class === 'A')
		// A = [10,20,30,40]: q1=17.5, q3=32.5, IQR=15, fence_min=-5 → smallest datum ≥ -5 is 10
		expect(a.iqr_min).toBeCloseTo(10)
	})

	it('clamps iqr_max to the largest datum within the upper fence', () => {
		const result = applyBoxStat(boxData, { x: 'class', y: 'hwy' })
		const a = result.find((r) => r.class === 'A')
		// fence_max = 32.5 + 1.5*15 = 55 → largest datum ≤ 55 is 40
		expect(a.iqr_max).toBeCloseTo(40)
	})

	it('returns an empty outliers array when all data is within the fence', () => {
		const result = applyBoxStat(boxData, { x: 'class', y: 'hwy' })
		const a = result.find((r) => r.class === 'A')
		expect(a.outliers).toEqual([])
	})

	it('extracts values beyond the fence as outliers and clamps whiskers to inliers', () => {
		// [1,2,3,4,100]: q1=2, q3=4, IQR=2, fence=[-1,7] → 100 is an outlier
		const withOutlier = [
			{ g: 'X', v: 1 },
			{ g: 'X', v: 2 },
			{ g: 'X', v: 3 },
			{ g: 'X', v: 4 },
			{ g: 'X', v: 100 }
		]
		const [row] = applyBoxStat(withOutlier, { x: 'g', y: 'v' })
		expect(row.outliers).toEqual([100])
		expect(row.iqr_min).toBeCloseTo(1)
		expect(row.iqr_max).toBeCloseTo(4)
	})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test:ci -- brewing/stats`
Expected: FAIL — `iqr_min` is `-5` (old fence), `a.outliers` is `undefined`.

- [ ] **Step 3: Implement Tukey clamping + outliers**

In `packages/chart/src/lib/brewing/stats.js`, add a `whiskerBounds` helper below `sortedQuantile` (reuse the already-imported `min`, `max` from `d3-array`):

```js
/**
 * Tukey whisker bounds for a group of numeric values.
 * Whiskers clamp to the most extreme datum within the 1.5·IQR fence;
 * values outside the fence are outliers.
 *
 * @param {number[]} values
 * @returns {{ min: number, max: number, outliers: number[] }}
 */
function whiskerBounds(values) {
	const q1 = sortedQuantile(values, 0.25)
	const q3 = sortedQuantile(values, 0.75)
	const iqr = q3 - q1
	const lo = q1 - 1.5 * iqr
	const hi = q3 + 1.5 * iqr
	const within = values.filter((v) => v >= lo && v <= hi)
	return {
		min: within.length ? min(within) : q1,
		max: within.length ? max(within) : q3,
		outliers: values.filter((v) => v < lo || v > hi)
	}
}
```

Then change the `applyBoxStat` summarize reducers — replace the `iqr_min`/`iqr_max` reducers and add `outliers`:

```js
		.summarize((row) => row[yf], {
			q1: (v) => sortedQuantile(v, 0.25),
			median: (v) => sortedQuantile(v, 0.5),
			q3: (v) => sortedQuantile(v, 0.75),
			iqr_min: (v) => whiskerBounds(v).min,
			iqr_max: (v) => whiskerBounds(v).max,
			outliers: (v) => whiskerBounds(v).outliers
		})
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test:ci -- brewing/stats`
Expected: PASS (all `applyBoxStat` tests, including the updated whisker + new outlier cases).

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/lib/brewing/stats.js packages/chart/spec/brewing/stats.spec.js
git commit -m "feat(chart): Tukey-clamped box whiskers + outliers in applyBoxStat

Refs #143"
```

---

## Task 2: Outlier screen positions in `buildBoxes`

**Files:**
- Modify: `packages/chart/src/lib/brewing/marks/boxes.js`
- Test: `packages/chart/spec/brewing/marks/boxes.spec.js`

- [ ] **Step 1: Add the failing outlier test**

In `packages/chart/spec/brewing/marks/boxes.spec.js`, add a test inside the `describe('buildBoxes', …)` block. The module-level `data`/`xScale`/`yScale`/`colors` already exist (see file top):

```js
	it('maps outliers to screen positions at the box cx', () => {
		const d = [{ cat: 'A', q1: 20, median: 40, q3: 60, iqr_min: 10, iqr_max: 80, outliers: [95] }]
		const [box] = buildBoxes(d, { x: 'cat' }, xScale, yScale, colors)
		expect(box.outliers).toHaveLength(1)
		expect(box.outliers[0].cy).toBeCloseTo(yScale(95))
		expect(box.outliers[0].value).toBe(95)
	})

	it('defaults outliers to an empty array when the field is absent', () => {
		const [box] = buildBoxes(data, { x: 'cat' }, xScale, yScale, colors)
		expect(box.outliers).toEqual([])
	})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test:ci -- brewing/marks/boxes`
Expected: FAIL — `box.outliers` is `undefined`.

- [ ] **Step 3: Add `outliers` to both return paths**

In `packages/chart/src/lib/brewing/marks/boxes.js`, add an `outliers` field to the object returned in BOTH the grouped path (the `return { data: d, cx, q1: ..., ... }` inside `if (grouped)`) and the non-grouped path. Add this line to each returned object (alongside `iqr_max: yScale(d.iqr_max),`):

```js
				outliers: (d.outliers ?? []).map((v) => ({ cy: yScale(v), value: v })),
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test:ci -- brewing/marks/boxes`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/lib/brewing/marks/boxes.js packages/chart/spec/brewing/marks/boxes.spec.js
git commit -m "feat(chart): compute box outlier positions in buildBoxes

Refs #143"
```

---

## Task 3: Render outlier circles in `Box.svelte`

**Files:**
- Modify: `packages/chart/src/geoms/Box.svelte`
- Create: `packages/chart/spec/helpers/TestBox.svelte`
- Test: `packages/chart/spec/geoms/Box.spec.js`

- [ ] **Step 1: Create the test wrapper**

Create `packages/chart/spec/helpers/TestBox.svelte` (mirrors `TestCandlestick.svelte`):

```svelte
<script>
	import { setContext } from 'svelte'
	import Box from '../../src/geoms/Box.svelte'

	let { state, x = 'cat', y = 'val', fill = undefined, options = {} } = $props()
	setContext('plot-state', state)
</script>

<svg>
	<Box {x} {y} {fill} {options} />
</svg>
```

- [ ] **Step 2: Write the failing component test**

Create `packages/chart/spec/geoms/Box.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { scaleBand, scaleLinear } from 'd3-scale'
import TestBox from '../helpers/TestBox.svelte'
import { createMockState } from '../helpers/mock-plot-state.js'

// One pre-aggregated box row with a single outlier at y=95.
const BOX_ROWS = [
	{ cat: 'A', q1: 20, median: 40, q3: 60, iqr_min: 10, iqr_max: 80, outliers: [95] }
]

function boxState(rows = BOX_ROWS, overrides = {}) {
	const xScale = scaleBand().domain(['A']).range([0, 200]).padding(0.1)
	const yScale = scaleLinear().domain([0, 100]).range([200, 0])
	return createMockState({
		xScale,
		yScale,
		colors: new Map([['A', { fill: '#4e79a7', stroke: '#264653' }]]),
		geomData: () => rows,
		chartPreset: { opacity: { box: 0.5 } },
		setHovered: () => {},
		clearHovered: () => {},
		...overrides
	})
}

describe('Box.svelte outliers', () => {
	it('renders the box body group', () => {
		const state = boxState()
		const { container } = render(TestBox, { props: { state, x: 'cat', y: 'val' } })
		expect(container.querySelector('[data-plot-geom="box"]')).toBeTruthy()
	})

	it('renders one outlier circle per outlier value', () => {
		const state = boxState()
		const { container } = render(TestBox, { props: { state, x: 'cat', y: 'val' } })
		const dots = container.querySelectorAll('[data-plot-element="box-outlier"]')
		expect(dots.length).toBe(1)
	})

	it('renders no outlier circle when the row has none', () => {
		const rows = [{ cat: 'A', q1: 20, median: 40, q3: 60, iqr_min: 10, iqr_max: 80, outliers: [] }]
		const state = boxState(rows)
		const { container } = render(TestBox, { props: { state, x: 'cat', y: 'val' } })
		expect(container.querySelectorAll('[data-plot-element="box-outlier"]').length).toBe(0)
	})
})
```

Note: `Box.svelte` reads `plotState.chartPreset.opacity.box`; the mock provides `chartPreset: { opacity: { box: 0.5 } }`.

- [ ] **Step 3: Run the test to verify it fails**

Run: `bun run test:ci -- geoms/Box`
Expected: FAIL — no `[data-plot-element="box-outlier"]` elements.

- [ ] **Step 4: Render outliers in `Box.svelte`**

In `packages/chart/src/geoms/Box.svelte`, replace the trailing comment line
`<!-- Outlier rendering deferred: buildBoxes does not compute outliers yet -->`
(just before the closing `{/each}`) with outlier circles:

```svelte
				<!-- Outliers: individual points beyond the 1.5·IQR fence -->
				{#each box.outliers as o, oi (`${i}-outlier-${oi}`)}
					<circle
						cx={xMid}
						cy={o.cy}
						r="2"
						fill="none"
						stroke={box.stroke}
						stroke-width="1"
						data-plot-element="box-outlier"
						role="presentation"
					/>
				{/each}
```

(`xMid` is already defined earlier in the `{#each}` as `box.cx`.)

- [ ] **Step 5: Run the test to verify it passes**

Run: `bun run test:ci -- geoms/Box`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add packages/chart/src/geoms/Box.svelte packages/chart/spec/helpers/TestBox.svelte packages/chart/spec/geoms/Box.spec.js
git commit -m "feat(chart): render box outlier points

Closes part of #143"
```

---

## Task 4: PlotState — outliers in box domain + `CATEGORICAL_X` band-forcing

**Files:**
- Modify: `packages/chart/src/PlotState.svelte.js`
- Test: `packages/chart/spec/PlotState-extended.spec.js`

Two changes: (a) `#resolveBoxDomain` folds `outliers` into min/max so dots aren't clipped; (b) generalize bar-only band-forcing to box/violin/jitter so numeric periods still get a band x-axis.

- [ ] **Step 1: Write the failing tests**

Append to `packages/chart/spec/PlotState-extended.spec.js` (it already imports `PlotState`, `describe`, `it`, `expect`; `mpg` is a module fixture — these tests use their own inline data):

```js
// ─── box domain includes outliers ─────────────────────────────────────────────
describe('PlotState — box y-domain includes outliers', () => {
	it('extends the y-domain to cover outlier points', () => {
		// [1,2,3,4,100] → whisker_max clamps to 4, but 100 is an outlier
		const data = [1, 2, 3, 4, 100].map((v) => ({ g: 'X', v }))
		const state = new PlotState({ data, channels: { x: 'g', y: 'v' }, width: 600, height: 400 })
		state.registerGeom({ type: 'box', channels: { x: 'g', y: 'v' }, stat: 'boxplot' })
		const [, domMax] = state.yScale.domain()
		expect(domMax).toBeGreaterThanOrEqual(100)
	})
})

// ─── band x-axis forced for distribution geoms with numeric x ──────────────────
describe('PlotState — band x-axis for box/violin/jitter with numeric x', () => {
	it('forces a band x-scale for a box geom even when x is numeric', () => {
		const data = [
			{ week: 1, v: 10 }, { week: 1, v: 20 }, { week: 1, v: 30 },
			{ week: 2, v: 15 }, { week: 2, v: 25 }, { week: 2, v: 35 }
		]
		const state = new PlotState({ data, channels: { x: 'week', y: 'v' }, width: 600, height: 400 })
		state.registerGeom({ type: 'box', channels: { x: 'week', y: 'v' }, stat: 'boxplot' })
		expect(typeof state.xScale.bandwidth).toBe('function')
	})

	it('forces a band x-scale for a jitter geom even when x is numeric', () => {
		const data = [
			{ week: 1, v: 10 }, { week: 2, v: 20 }
		]
		const state = new PlotState({ data, channels: { x: 'week', y: 'v' }, width: 600, height: 400 })
		state.registerGeom({ type: 'jitter', channels: { x: 'week', y: 'v' }, stat: 'identity' })
		expect(typeof state.xScale.bandwidth).toBe('function')
	})
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun run test:ci -- PlotState-extended`
Expected: FAIL — domMax is ~4 (whisker), not ≥100; jitter/box xScale with numeric x is linear (no `bandwidth`).

- [ ] **Step 3: Implement the PlotState changes**

In `packages/chart/src/PlotState.svelte.js`:

(a) Add a module-level constant just below `let nextId = 0`:

```js
// Geoms that treat the x channel as categorical (band scale), even for numeric x.
const CATEGORICAL_X = new Set(['bar', 'box', 'violin', 'jitter'])
```

(b) In `#resolveXType(rawXType, yType)`, replace the `hasBarGeom` computation to use the set:

```js
	#resolveXType(rawXType, yType) {
		const hasBandGeom = this.#geoms.some((g) => CATEGORICAL_X.has(g.type))
		return hasBandGeom && rawXType === 'continuous' && yType === 'continuous' ? 'band' : rawXType
	}
```

(c) In the `xScale` getter, replace the two lines computing `hasBarGeom`/`bandX`:

```js
			const hasBandGeom = this.#geoms.some((g) => CATEGORICAL_X.has(g.type))
			const bandX = hasBandGeom && this.orientation !== 'horizontal'
```

(d) In `#resolveBoxDomain()`, fold outliers into the min/max. Replace the `mins`/`maxs`/return block with:

```js
		const flatOutliers = boxData.flatMap((d) => d.outliers ?? []).filter(isValid)
		const mins = [...boxData.map((d) => d.iqr_min).filter(isValid), ...flatOutliers]
		const maxs = [...boxData.map((d) => d.iqr_max).filter(isValid), ...flatOutliers]
		return mins.length > 0 && maxs.length > 0 ? [Math.min(...mins), Math.max(...maxs)] : null
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `bun run test:ci -- PlotState-extended`
Expected: PASS. Also run `bun run test:ci -- PlotState.spec` to confirm no regression in the base PlotState suite.

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/PlotState.svelte.js packages/chart/spec/PlotState-extended.spec.js
git commit -m "feat(chart): box domain covers outliers + band x for distribution geoms

Refs #143 #144"
```

---

## Task 5a: `buildSwarm` mark builder (jitter + swarm layout)

**Files:**
- Create: `packages/chart/src/lib/brewing/marks/swarm.js`
- Test: `packages/chart/spec/brewing/marks/swarm.spec.js`

- [ ] **Step 1: Write the failing test**

Create `packages/chart/spec/brewing/marks/swarm.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { buildSwarm } from '../../../src/lib/brewing/marks/swarm.js'
import { scaleBand, scaleLinear } from 'd3-scale'

const xScale = scaleBand().domain(['A', 'B']).range([0, 200]).padding(0.1)
const yScale = scaleLinear().domain([0, 100]).range([200, 0])
const colors = new Map([
	['A', { fill: '#4e79a7', stroke: '#264653' }],
	['B', { fill: '#f28e2b', stroke: '#8a4b00' }]
])

const data = [
	{ cat: 'A', val: 10 },
	{ cat: 'A', val: 12 },
	{ cat: 'A', val: 50 },
	{ cat: 'B', val: 30 }
]

describe('buildSwarm', () => {
	it('returns one placed point per datum', () => {
		const pts = buildSwarm(data, { x: 'cat', y: 'val' }, xScale, yScale, colors, { method: 'jitter', r: 2 })
		expect(pts).toHaveLength(4)
	})

	it('maps cy through yScale and colors by group', () => {
		const pts = buildSwarm(data, { x: 'cat', y: 'val' }, xScale, yScale, colors, { method: 'jitter', r: 2 })
		const first = pts.find((p) => p.data.val === 10)
		expect(first.cy).toBeCloseTo(yScale(10))
		expect(first.fill).toBe('#4e79a7')
	})

	it('keeps every point within its category band', () => {
		const pts = buildSwarm(data, { x: 'cat', y: 'val' }, xScale, yScale, colors, { method: 'jitter', r: 2 })
		const bw = xScale.bandwidth()
		for (const p of pts) {
			const bandStart = xScale(p.data.cat)
			expect(p.cx).toBeGreaterThanOrEqual(bandStart)
			expect(p.cx).toBeLessThanOrEqual(bandStart + bw)
		}
	})

	it('jitter layout is deterministic across calls', () => {
		const a = buildSwarm(data, { x: 'cat', y: 'val' }, xScale, yScale, colors, { method: 'jitter', r: 2 })
		const b = buildSwarm(data, { x: 'cat', y: 'val' }, xScale, yScale, colors, { method: 'jitter', r: 2 })
		expect(a.map((p) => p.cx)).toEqual(b.map((p) => p.cx))
	})

	it('swarm layout never overlaps two points within 2r and is deterministic', () => {
		// A tight cluster forces horizontal dodging.
		const cluster = Array.from({ length: 8 }, (_, i) => ({ cat: 'A', val: 50 + i * 0.2 }))
		const opts = { method: 'swarm', r: 4 }
		const a = buildSwarm(cluster, { x: 'cat', y: 'val' }, xScale, yScale, colors, opts)
		const b = buildSwarm(cluster, { x: 'cat', y: 'val' }, xScale, yScale, colors, opts)
		expect(a.map((p) => p.cx)).toEqual(b.map((p) => p.cx)) // deterministic
		for (let i = 0; i < a.length; i++) {
			for (let j = i + 1; j < a.length; j++) {
				const dist = Math.hypot(a[i].cx - a[j].cx, a[i].cy - a[j].cy)
				expect(dist).toBeGreaterThanOrEqual(2 * opts.r - 1e-6)
			}
		}
	})
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test:ci -- brewing/marks/swarm`
Expected: FAIL — module `swarm.js` does not exist.

- [ ] **Step 3: Implement `buildSwarm`**

Create `packages/chart/src/lib/brewing/marks/swarm.js`:

```js
import { ascending } from 'd3-array'

/**
 * Deterministic pseudo-random in [0, 1) from a non-negative integer seed.
 * Avoids Math.random so layouts are stable across renders (repo rule).
 *
 * @param {number} n
 * @returns {number}
 */
function hashUnit(n) {
	const x = Math.sin(n + 1) * 43758.5453
	return x - Math.floor(x)
}

/**
 * Places one point per datum within each x-band. Two layouts:
 *  - 'jitter': deterministic horizontal offset seeded by index-in-group.
 *  - 'swarm':  1-D beeswarm — sort by y, dodge horizontally to avoid overlap.
 *
 * @param {Object[]} data - raw rows (stat=identity)
 * @param {{ x?: string, y?: string, fill?: string }} channels
 * @param {import('d3-scale').ScaleBand} xScale
 * @param {import('d3-scale').ScaleLinear} yScale
 * @param {Map<unknown, {fill:string, stroke:string}>} colors
 * @param {{ method?: 'jitter'|'swarm', r?: number }} opts
 * @returns {Array<{ cx:number, cy:number, fill:string, stroke:string, data:Object }>}
 */
export function buildSwarm(data, channels, xScale, yScale, colors, opts = {}) {
	const { x: xf, y: yf, fill: ff } = channels
	const { method = 'jitter', r = 2 } = opts
	const bw = typeof xScale.bandwidth === 'function' ? xScale.bandwidth() : 40
	const halfBand = (bw / 2) * 0.8 // leave a small gutter

	// Group rows by x value, preserving first-seen order.
	const groups = new Map()
	for (const d of data) {
		const key = d[xf]
		if (!groups.has(key)) groups.set(key, [])
		groups.get(key).push(d)
	}

	const result = []
	for (const [xVal, rows] of groups) {
		const bandStart = typeof xScale.bandwidth === 'function' ? (xScale(xVal) ?? 0) : (xScale(xVal) ?? 0) - bw / 2
		const center = bandStart + bw / 2
		const offsets =
			method === 'swarm'
				? swarmOffsets(rows, yf, yScale, r, halfBand)
				: rows.map((_, i) => (hashUnit(i) * 2 - 1) * halfBand)

		rows.forEach((d, i) => {
			const fillKey = ff ? d[ff] : xVal
			const colorEntry = colors?.get(fillKey) ?? { fill: '#aaa', stroke: '#666' }
			result.push({
				data: d,
				cx: center + offsets[i],
				cy: yScale(d[yf]),
				fill: colorEntry.fill,
				stroke: colorEntry.stroke
			})
		})
	}
	return result
}

/**
 * Computes horizontal offsets for a beeswarm: sort by y, then for each point
 * pick the offset of smallest magnitude that doesn't collide (distance < 2r)
 * with any already-placed point in this group. Returns offsets in INPUT order.
 */
function swarmOffsets(rows, yf, yScale, r, halfBand) {
	const order = rows
		.map((d, i) => ({ i, cy: yScale(d[yf]) }))
		.sort((a, b) => ascending(a.cy, b.cy))
	const placed = []
	const offsetByIndex = new Array(rows.length).fill(0)
	const step = r / 2

	for (const { i, cy } of order) {
		let offset = 0
		for (let k = 0; k <= Math.ceil((2 * halfBand) / step); k++) {
			const candidate = k === 0 ? 0 : (k % 2 === 1 ? 1 : -1) * Math.ceil(k / 2) * step
			if (Math.abs(candidate) > halfBand) continue
			const collides = placed.some((p) => Math.hypot(candidate - p.offset, cy - p.cy) < 2 * r)
			if (!collides) {
				offset = candidate
				break
			}
		}
		placed.push({ offset, cy })
		offsetByIndex[i] = offset
	}
	return offsetByIndex
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test:ci -- brewing/marks/swarm`
Expected: PASS (including determinism + non-overlap for swarm).

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/lib/brewing/marks/swarm.js packages/chart/spec/brewing/marks/swarm.spec.js
git commit -m "feat(chart): buildSwarm mark builder (jitter + beeswarm layout)

Refs #144"
```

---

## Task 5b: `Plot.Jitter` geom component

**Files:**
- Create: `packages/chart/src/geoms/Jitter.svelte`
- Create: `packages/chart/spec/helpers/TestJitter.svelte`
- Test: `packages/chart/spec/geoms/Jitter.spec.js`

- [ ] **Step 1: Create the test wrapper**

Create `packages/chart/spec/helpers/TestJitter.svelte`:

```svelte
<script>
	import { setContext } from 'svelte'
	import Jitter from '../../src/geoms/Jitter.svelte'

	let { state, x = 'cat', y = 'val', fill = undefined, method = 'jitter', r = 2 } = $props()
	setContext('plot-state', state)
</script>

<svg>
	<Jitter {x} {y} {fill} {method} {r} />
</svg>
```

- [ ] **Step 2: Write the failing component test**

Create `packages/chart/spec/geoms/Jitter.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { scaleBand, scaleLinear } from 'd3-scale'
import TestJitter from '../helpers/TestJitter.svelte'
import { createMockState } from '../helpers/mock-plot-state.js'

const ROWS = [
	{ cat: 'A', val: 10 },
	{ cat: 'A', val: 20 },
	{ cat: 'B', val: 30 }
]

function jitterState(rows = ROWS, overrides = {}) {
	const xScale = scaleBand().domain(['A', 'B']).range([0, 200]).padding(0.1)
	const yScale = scaleLinear().domain([0, 100]).range([200, 0])
	return createMockState({
		xScale,
		yScale,
		colors: new Map([
			['A', { fill: '#4e79a7', stroke: '#264653' }],
			['B', { fill: '#f28e2b', stroke: '#8a4b00' }]
		]),
		geomData: () => rows,
		setHovered: () => {},
		clearHovered: () => {},
		...overrides
	})
}

describe('Jitter.svelte', () => {
	it('renders one point per datum (jitter method)', () => {
		const state = jitterState()
		const { container } = render(TestJitter, { props: { state, x: 'cat', y: 'val', method: 'jitter' } })
		expect(container.querySelectorAll('[data-plot-element="jitter-point"]').length).toBe(3)
	})

	it('renders one point per datum (swarm method)', () => {
		const state = jitterState()
		const { container } = render(TestJitter, { props: { state, x: 'cat', y: 'val', method: 'swarm' } })
		expect(container.querySelectorAll('[data-plot-element="jitter-point"]').length).toBe(3)
	})

	it('renders nothing when data is empty', () => {
		const state = jitterState([], { geomData: () => [] })
		const { container } = render(TestJitter, { props: { state, x: 'cat', y: 'val' } })
		expect(container.querySelector('[data-plot-geom="jitter"]')).toBeNull()
	})
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `bun run test:ci -- geoms/Jitter`
Expected: FAIL — `geoms/Jitter.svelte` does not exist.

- [ ] **Step 4: Implement `Jitter.svelte`** (mirrors `geoms/Box.svelte` registration lifecycle)

Create `packages/chart/src/geoms/Jitter.svelte`:

```svelte
<script lang="ts">
	import { getContext, onMount, onDestroy } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'
	import { buildSwarm } from '../lib/brewing/marks/swarm.js'

	type Props = {
		x?: string
		y?: string
		fill?: string
		r?: number
		method?: 'jitter' | 'swarm'
		options?: { opacity?: number }
	}

	let { x, y, fill, r = 2, method = 'jitter', options = {} }: Props = $props()

	const plotState = getContext<PlotState>('plot-state')
	let id = $state<string | null>(null)

	// fill ?? x drives the color lookup
	const fillChannel = $derived(fill ?? x)

	onMount(() => {
		id = plotState.registerGeom({
			type: 'jitter',
			channels: { x, y, color: fillChannel },
			stat: 'identity',
			options
		})
	})
	onDestroy(() => {
		if (id) plotState.unregisterGeom(id)
	})

	$effect(() => {
		if (id) plotState.updateGeom(id, { channels: { x, y, color: fillChannel }, stat: 'identity' })
	})

	const data = $derived(id ? plotState.geomData(id) : [])
	const xScale = $derived(plotState.xScale)
	const yScale = $derived(plotState.yScale)
	const colors = $derived(plotState.colors)

	const points = $derived.by(() => {
		if (!data?.length || !xScale || !yScale) return []
		return buildSwarm(data, { x, y, fill: fillChannel }, xScale, yScale, colors, { method, r })
	})
</script>

{#if points.length > 0}
	<g data-plot-geom="jitter">
		{#each points as pt, i (`${String(pt.cx)}::${i}`)}
			<circle
				cx={pt.cx}
				cy={pt.cy}
				{r}
				fill={pt.fill}
				fill-opacity={options?.opacity ?? plotState.chartPreset.opacity.point}
				stroke={pt.stroke}
				stroke-width="0.5"
				data-plot-element="jitter-point"
				role="graphics-symbol"
				aria-label={`(${String(pt.data[x])}, ${String(pt.data[y])})`}
				onmouseenter={() => plotState.setHovered(pt.data)}
				onmouseleave={() => plotState.clearHovered()}
			/>
		{/each}
	</g>
{/if}
```

Note: the mock state in the test must expose `chartPreset.opacity.point`. `createMockState` does not by default — add `chartPreset: { opacity: { point: 0.8 } }` to the `jitterState` overrides in Step 2 if the render throws. (Add it proactively.)

Update `jitterState` in the test to include: `chartPreset: { opacity: { point: 0.8 } },` alongside `geomData`.

- [ ] **Step 5: Run the test to verify it passes**

Run: `bun run test:ci -- geoms/Jitter`
Expected: PASS.

- [ ] **Step 6: Validate with the Svelte MCP autofixer**

Run the `svelte-autofixer` MCP tool on `packages/chart/src/geoms/Jitter.svelte`; apply any correctness fixes it reports, then re-run `bun run test:ci -- geoms/Jitter` (still PASS).

- [ ] **Step 7: Commit**

```bash
git add packages/chart/src/geoms/Jitter.svelte packages/chart/spec/helpers/TestJitter.svelte packages/chart/spec/geoms/Jitter.spec.js
git commit -m "feat(chart): Plot.Jitter beeswarm geom

Closes part of #144"
```

---

## Task 6: Exports — `Plot.Box/Violin/Jitter` + `GeomJitter`

**Files:**
- Modify: `packages/chart/src/index.js`
- Test: `packages/chart/spec/exports.spec.js`

- [ ] **Step 1: Write the failing test**

Replace the body of `packages/chart/spec/exports.spec.js` with (extends the existing import + adds the new geoms):

```js
import { describe, it, expect } from 'vitest'
import { Plot, GeomHighlight, GeomTrend, GeomBox, GeomViolin, GeomJitter } from '../src/index.js'

describe('chart exports', () => {
	it('exposes Highlight + Trend on the Plot namespace and as Geom*', () => {
		expect(Plot.Highlight).toBeTruthy()
		expect(Plot.Trend).toBeTruthy()
		expect(GeomHighlight).toBeTruthy()
		expect(GeomTrend).toBeTruthy()
	})

	it('exposes Box/Violin/Jitter on the Plot namespace', () => {
		expect(Plot.Box).toBeTruthy()
		expect(Plot.Violin).toBeTruthy()
		expect(Plot.Jitter).toBeTruthy()
	})

	it('exposes GeomBox/GeomViolin/GeomJitter aliases', () => {
		expect(GeomBox).toBeTruthy()
		expect(GeomViolin).toBeTruthy()
		expect(GeomJitter).toBeTruthy()
	})
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test:ci -- exports`
Expected: FAIL — `Plot.Box`/`Plot.Jitter` undefined; `GeomJitter` not exported.

- [ ] **Step 3: Wire up the exports**

In `packages/chart/src/index.js`:

Add imports near the other geom imports (after `import Trend from './geoms/Trend.svelte'`):

```js
import Box from './geoms/Box.svelte'
import Violin from './geoms/Violin.svelte'
import Jitter from './geoms/Jitter.svelte'
```

Add `Box, Violin, Jitter` to the `Plot` object (after `Trend`):

```js
export const Plot = {
	Root,
	Axis,
	Bar,
	Grid,
	Legend,
	Line,
	Area,
	Point,
	Arc,
	Highlight,
	Trend,
	Box,
	Violin,
	Jitter
}
```

Add the `GeomJitter` alias next to the other `Geom*` exports (after `GeomViolin`):

```js
export { default as GeomJitter } from './geoms/Jitter.svelte'
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test:ci -- exports`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/index.js packages/chart/spec/exports.spec.js
git commit -m "feat(chart): surface Plot.Box/Violin/Jitter + GeomJitter

Closes #143 #144 (API surface)"
```

---

## Task 7: Composable distribution-geoms demo in learn

**Files:**
- Modify: `apps/learn/src/lib/koan/demos/chart/index.svelte`

Add a section using `Plot.Root` + `Plot.Box`/`Plot.Violin`/`Plot.Jitter` over the existing `cars` dataset (`class` × `hwy`), proving the geoms compose. This is a visual/manual-verify task (no unit test); it must typecheck and build.

- [ ] **Step 1: Import the composable API**

In the `<script lang="ts">` import from `@rokkit/chart`, add `Plot` to the existing named imports:

```js
	import {
		BarChart,
		LineChart,
		AreaChart,
		PieChart,
		ScatterPlot,
		BubbleChart,
		BoxPlot,
		ViolinPlot,
		Sparkline,
		PlotChart,
		GeomArea,
		GeomLine,
		Plot
	} from '@rokkit/chart'
```

- [ ] **Step 2: Add the demo markup**

Add a new `<section>` inside the `.grid` (place it after the existing Box/Violin chart sections). It renders three composable variants over `cars` (`class` on x, `hwy` on y):

```svelte
	<section>
		<header>Distribution — hwy by class (composable Plot.Box + outliers + beeswarm)</header>
		<div class="chart-stage">
			<Plot.Root data={cars} x="class" y="hwy" width={520} height={280}>
				<Plot.Axis />
				<Plot.Box />
				<Plot.Jitter method="swarm" r={2.5} />
			</Plot.Root>
		</div>
		<div class="chart-stage">
			<Plot.Root data={cars} x="class" y="hwy" width={520} height={280}>
				<Plot.Axis />
				<Plot.Violin />
				<Plot.Jitter method="jitter" r={2} />
			</Plot.Root>
		</div>
	</section>
```

- [ ] **Step 3: Typecheck + build the learn app**

Run: `cd /Users/Jerry/Developer/rokkit && bun run check:types`
Expected: PASS (no tsc errors across packages/apps).

Run: `cd /Users/Jerry/Developer/rokkit/apps/learn && bunx vite build` (or the app's build script) — confirm the page compiles. If the repo has `bun run build:apps`, use that instead.

- [ ] **Step 4: Manual visual check**

Start the learn dev server (`cd apps/learn && bun run dev`), open the chart demo page, and confirm: boxes show whiskers + outlier dots, swarm/jitter points sit inside each class band, violins render. (No console errors.)

- [ ] **Step 5: Commit**

```bash
git add apps/learn/src/lib/koan/demos/chart/index.svelte
git commit -m "docs(learn): composable Plot.Box/Violin/Jitter distribution demo

Refs #143 #144"
```

---

## Task 8: Full verification + journal + close issues

**Files:**
- Modify: `agents/journal.md`
- Modify: `docs/design/12-priority.md` (if the distribution geoms are tracked there)

- [ ] **Step 1: Full test suite**

Run: `bun run test:ci`
Expected: PASS — all ~2536+ tests green (no regressions in charts/BoxPlot, ViolinPlot, brewers, PlotState).

- [ ] **Step 2: Lint (zero errors)**

Run: `bun run lint`
Expected: 0 errors (warnings acceptable per project policy).

- [ ] **Step 3: Types + svelte-check**

Run: `bun run check:types && bun run check:svelte`
Expected: PASS.

- [ ] **Step 4: Update the journal**

Append a dated entry to `agents/journal.md` summarizing: Tukey whiskers + outliers, `Plot.Box/Violin/Jitter` namespace, `buildSwarm` (jitter/swarm), demo page, commit hashes, and "closes #143, #144".

- [ ] **Step 5: Commit docs**

```bash
git add agents/journal.md docs/design/12-priority.md
git commit -m "docs: journal + priority update for distribution geoms

Closes #143 #144"
```

- [ ] **Step 6: Reference the issues**

After merge, the commit messages already reference `Closes #143 #144`. If closing manually: `gh issue close 143 144 --comment "Shipped Plot.Box (Tukey whiskers + outliers), Plot.Violin, and Plot.Jitter (jitter + beeswarm). See <commit>."` — only after the user confirms the branch is merged.

---

## Self-Review

**Spec coverage:**
- Box promotion → Task 6. Box outliers (Tukey) → Tasks 1–3. Domain covers outliers → Task 4.
- Violin promotion → Task 6.
- Plot.Jitter (jitter + swarm) → Tasks 5a, 5b. Band-x for numeric periods → Task 4.
- Exports (`Plot.*` + `GeomJitter`) → Task 6.
- Demo page → Task 7.
- Tests for every change → Tasks 1–6 each start with a failing test; Task 8 runs the full suite.
- Out-of-scope items (horizontal orientation, configurable multiplier, brewer charts) are not implemented. ✓

**Placeholder scan:** No TBD/TODO; every code step shows full code. ✓

**Type consistency:** `buildSwarm(data, channels, xScale, yScale, colors, opts)` signature is identical in Task 5a (impl + test) and Task 5b (Jitter.svelte call). `whiskerBounds` returns `{ min, max, outliers }` used consistently. Box outlier object shape `{ cy, value }` matches between Task 2 (buildBoxes) and Task 3 (Box.svelte reads `o.cy`). `outliers` field name consistent across stats → buildBoxes → PlotState → Box.svelte. ✓

**Known intentional test change:** Task 1 REWRITES two existing `applyBoxStat` assertions (fence → clamped). Called out explicitly so the implementer doesn't treat it as a regression.
