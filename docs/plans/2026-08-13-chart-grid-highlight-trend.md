# Chart Grid-Axis Control + Observation Highlight + Trend Lines — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add three additive, backward-compatible chart capabilities — `grid` axis control (incl. vertical gridlines on continuous scales), an `highlight` selector that marks a specific observation, and a `trend` engine (avg/median/min/max/value constants + linear/ma/ema/exp fitted series) — on the composable `Plot.*` primitives and the `AreaChart`/`LineChart` wrappers, all themed via data-attributes + CSS vars.

**Architecture:** Two pure, fully-unit-tested calculators (`lib/highlight.js`, `lib/trend.js`) hold all logic. Two new overlay primitives (`geoms/Highlight.svelte`, `geoms/Trend.svelte`) read data + scales from `PlotState` (via a new `get data()`) and render marks; they do NOT register geoms (pure overlays, no domain effect). `Plot/Grid.svelte` gains a `lines` mode + tick alignment. `Plot.svelte` maps the widened `grid` prop and renders the two overlays from its `x`/`y`. Wrappers forward everything.

**Tech Stack:** Svelte 5 (runes), `d3-shape`/`d3-scale` (already deps), Vitest + `@testing-library/svelte` (jsdom, project `chart`), Playwright (learn app). Spec: `docs/backlog/2026-08-13-chart-grid-axis-highlight.md`.

**Conventions:**
- Run a single test file: `bun run test:ci -- <relative/path/to.spec.js>` (vitest run, one-shot).
- Full gate before finishing: `bun run test:ci` + `bun run lint` (0 errors). Pure `.js`/`.ts` files are coverage-gated at **100% statements/lines** — the `lib/` tests must exercise every branch.
- Commit after each task on `develop` (never `main`). Conventional commits (`feat(chart): …`).

---

## File Structure

**Create:**
- `packages/chart/src/lib/highlight.js` — `resolveHighlight(rows, selector, {y}) → number[]`
- `packages/chart/src/lib/trend.js` — statistics + `computeTrend(rows, {x,y}, method)`
- `packages/chart/src/geoms/Highlight.svelte` — marker overlay (`Plot.Highlight`/`GeomHighlight`)
- `packages/chart/src/geoms/Trend.svelte` — trend-line overlay (`Plot.Trend`/`GeomTrend`)
- `packages/chart/spec/lib/highlight.spec.js`, `packages/chart/spec/lib/trend.spec.js`
- `packages/chart/spec/Grid.spec.js`, `packages/chart/spec/Highlight.spec.js`, `packages/chart/spec/Trend.spec.js`
- `packages/chart/spec/exports.spec.js`
- `apps/learn/e2e/chart-metrics.e2e.ts`

**Modify:**
- `packages/chart/src/PlotState.svelte.js` — add `get data()`
- `packages/chart/src/Plot/Grid.svelte` — `lines` prop, tick alignment, per-orientation attrs + CSS vars
- `packages/chart/src/Plot.svelte` — widen `grid`; add `x`/`y`/`highlight`/`trend`; render overlays
- `packages/chart/src/charts/AreaChart.svelte`, `packages/chart/src/charts/LineChart.svelte` — widen `grid`, add `highlight`/`trend`, forward
- `packages/chart/src/index.js` — export `Plot.Highlight`/`Plot.Trend`, `GeomHighlight`/`GeomTrend`
- `apps/learn/src/lib/koan/demos/chart/index.svelte` — "Last 30 days" showcase section
- `docs/design/20-chart.md`, `docs/design/21-charts.md`, `apps/learn/**/llms/components/*.txt` — docs
- `agents/journal.md`, `docs/design/12-priority.md`, backlog file — bookkeeping

---

## Task 1: `lib/highlight.js` — selector resolution (pure)

**Files:**
- Create: `packages/chart/src/lib/highlight.js`
- Test: `packages/chart/spec/lib/highlight.spec.js`

- [ ] **Step 1: Write the failing test**

```js
// packages/chart/spec/lib/highlight.spec.js
import { describe, it, expect } from 'vitest'
import { resolveHighlight } from '../../src/lib/highlight.js'

const rows = [
	{ d: 0, v: 5 },
	{ d: 1, v: 9 },
	{ d: 2, v: 3 },
	{ d: 3, v: 7 }
]

describe('resolveHighlight', () => {
	it("'first' → index 0, 'last' → last index", () => {
		expect(resolveHighlight(rows, 'first', { y: 'v' })).toEqual([0])
		expect(resolveHighlight(rows, 'last', { y: 'v' })).toEqual([3])
	})
	it("'min'/'max' use the y field", () => {
		expect(resolveHighlight(rows, 'min', { y: 'v' })).toEqual([2])
		expect(resolveHighlight(rows, 'max', { y: 'v' })).toEqual([1])
	})
	it('numeric index, incl. negative from the end', () => {
		expect(resolveHighlight(rows, 2, { y: 'v' })).toEqual([2])
		expect(resolveHighlight(rows, -1, { y: 'v' })).toEqual([3])
		expect(resolveHighlight(rows, 99, { y: 'v' })).toEqual([])
	})
	it('predicate matches every row', () => {
		expect(resolveHighlight(rows, (r) => r.v > 4, { y: 'v' })).toEqual([0, 1, 3])
	})
	it('guards: empty/nullish/unknown → []', () => {
		expect(resolveHighlight([], 'last', { y: 'v' })).toEqual([])
		expect(resolveHighlight(rows, null, { y: 'v' })).toEqual([])
		expect(resolveHighlight(rows, 'min')).toEqual([]) // no y field
		expect(resolveHighlight(rows, 'bogus', { y: 'v' })).toEqual([])
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test:ci -- packages/chart/spec/lib/highlight.spec.js`
Expected: FAIL — `resolveHighlight` is not a function / module not found.

- [ ] **Step 3: Write the implementation**

```js
// packages/chart/src/lib/highlight.js

/**
 * Resolve a highlight selector to zero or more row indices.
 * @param {Array<Record<string, unknown>>} rows
 * @param {'first'|'last'|'min'|'max'|number|((row:any,i:number)=>boolean)} selector
 * @param {{ y?: string }} [opts]
 * @returns {number[]}
 */
export function resolveHighlight(rows, selector, opts = {}) {
	if (!Array.isArray(rows) || rows.length === 0 || selector == null) return []
	const { y } = opts

	if (typeof selector === 'function') {
		const out = []
		for (let i = 0; i < rows.length; i++) if (selector(rows[i], i)) out.push(i)
		return out
	}

	if (typeof selector === 'number') {
		const i = selector < 0 ? rows.length + selector : selector
		return i >= 0 && i < rows.length ? [i] : []
	}

	if (selector === 'first') return [0]
	if (selector === 'last') return [rows.length - 1]

	if (selector === 'min' || selector === 'max') {
		if (!y) return []
		let best = -1
		let bestVal = null
		for (let i = 0; i < rows.length; i++) {
			const v = Number(rows[i][y])
			if (Number.isNaN(v)) continue
			if (bestVal === null || (selector === 'min' ? v < bestVal : v > bestVal)) {
				bestVal = v
				best = i
			}
		}
		return best === -1 ? [] : [best]
	}

	return []
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test:ci -- packages/chart/spec/lib/highlight.spec.js`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/lib/highlight.js packages/chart/spec/lib/highlight.spec.js
git commit -m "feat(chart): add resolveHighlight selector util"
```

---

## Task 2: `lib/trend.js` — trend calculators (pure)

**Files:**
- Create: `packages/chart/src/lib/trend.js`
- Test: `packages/chart/spec/lib/trend.spec.js`

- [ ] **Step 1: Write the failing test**

```js
// packages/chart/spec/lib/trend.spec.js
import { describe, it, expect } from 'vitest'
import {
	mean,
	median,
	linearRegression,
	movingAverage,
	ema,
	expRegression,
	computeTrend
} from '../../src/lib/trend.js'

const rows = [
	{ d: 0, v: 2 },
	{ d: 1, v: 4 },
	{ d: 2, v: 6 },
	{ d: 3, v: 8 }
]

describe('statistics', () => {
	it('mean / median', () => {
		expect(mean([2, 4, 6, 8])).toBe(5)
		expect(median([2, 4, 6, 8])).toBe(5) // avg of middle two
		expect(median([1, 2, 3])).toBe(2)
		expect(mean([])).toBeNull()
		expect(median([])).toBeNull()
	})
	it('linearRegression fits a perfect line', () => {
		expect(linearRegression([0, 1, 2, 3], [2, 4, 6, 8])).toEqual({ m: 2, b: 2 })
		expect(linearRegression([0], [1])).toBeNull() // < 2 points
		expect(linearRegression([1, 1, 1], [2, 4, 6])).toBeNull() // zero x-variance
	})
	it('movingAverage keeps length, partial window at head', () => {
		expect(movingAverage([2, 4, 6, 8], 2)).toEqual([2, 3, 5, 7])
		expect(movingAverage([2, 4, 6], 1)).toEqual([2, 4, 6])
	})
	it('ema derives alpha from span', () => {
		const out = ema([2, 4, 6, 8], { span: 1 }) // alpha = 2/(1+1) = 1 → follows series
		expect(out).toEqual([2, 4, 6, 8])
		expect(ema([2, 4], { alpha: 0.5 })).toEqual([2, 3])
	})
	it('expRegression fits y = a·e^(bx); null on non-positive y', () => {
		const fit = expRegression([0, 1, 2], [1, Math.E, Math.E ** 2])
		expect(fit.a).toBeCloseTo(1, 6)
		expect(fit.b).toBeCloseTo(1, 6)
		expect(expRegression([0, 1], [1, 0])).toBeNull() // y ≤ 0
		expect(expRegression([0], [1])).toBeNull() // < 2 points
	})
})

describe('computeTrend', () => {
	it('constant methods → { kind:"constant", value }', () => {
		expect(computeTrend(rows, { x: 'd', y: 'v' }, 'avg')).toEqual({ kind: 'constant', value: 5 })
		expect(computeTrend(rows, { x: 'd', y: 'v' }, 'mean')).toEqual({ kind: 'constant', value: 5 })
		expect(computeTrend(rows, { x: 'd', y: 'v' }, 'min')).toEqual({ kind: 'constant', value: 2 })
		expect(computeTrend(rows, { x: 'd', y: 'v' }, 'max')).toEqual({ kind: 'constant', value: 8 })
		expect(computeTrend(rows, { x: 'd', y: 'v' }, 'median')).toEqual({ kind: 'constant', value: 5 })
		expect(computeTrend(rows, { x: 'd', y: 'v' }, 7)).toEqual({ kind: 'constant', value: 7 })
		expect(computeTrend(rows, { x: 'd', y: 'v' }, { type: 'value', value: 3 })).toEqual({
			kind: 'constant',
			value: 3
		})
	})
	it('linear → per-row fitted series', () => {
		const r = computeTrend(rows, { x: 'd', y: 'v' }, 'linear')
		expect(r).toEqual({ kind: 'series', values: [2, 4, 6, 8] })
	})
	it('ma / ema → series of row length', () => {
		expect(computeTrend(rows, { x: 'd', y: 'v' }, { type: 'ma', window: 2 })).toEqual({
			kind: 'series',
			values: [2, 3, 5, 7]
		})
		const e = computeTrend(rows, { x: 'd', y: 'v' }, 'ema')
		expect(e.kind).toBe('series')
		expect(e.values).toHaveLength(4)
	})
	it('exp → series; ma without window → null', () => {
		const e = computeTrend(rows, { x: 'd', y: 'v' }, 'exp')
		expect(e.kind).toBe('series')
		expect(e.values).toHaveLength(4)
		expect(computeTrend(rows, { x: 'd', y: 'v' }, { type: 'ma' })).toBeNull()
	})
	it('degenerate inputs → null', () => {
		expect(computeTrend([], { x: 'd', y: 'v' }, 'avg')).toBeNull()
		expect(computeTrend([{ d: 0, v: 5 }], { x: 'd', y: 'v' }, 'linear')).toBeNull()
		expect(computeTrend(rows, { x: 'd', y: 'v' }, null)).toBeNull()
		expect(computeTrend(rows, { x: 'd', y: 'v' }, { type: 'bogus' })).toBeNull()
	})
	it('non-numeric x falls back to row index for fits', () => {
		const cat = [{ d: 'a', v: 2 }, { d: 'b', v: 4 }, { d: 'c', v: 6 }]
		expect(computeTrend(cat, { x: 'd', y: 'v' }, 'linear')).toEqual({
			kind: 'series',
			values: [2, 4, 6]
		})
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test:ci -- packages/chart/spec/lib/trend.spec.js`
Expected: FAIL — module not found.

- [ ] **Step 3: Write the implementation**

```js
// packages/chart/src/lib/trend.js

export function mean(ys) {
	if (!ys.length) return null
	return ys.reduce((s, v) => s + v, 0) / ys.length
}

export function median(ys) {
	if (!ys.length) return null
	const sorted = [...ys].sort((a, b) => a - b)
	const mid = Math.floor(sorted.length / 2)
	return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

/** Least-squares line. Returns { m, b } or null (< 2 points or zero x-variance). */
export function linearRegression(xs, ys) {
	const n = xs.length
	if (n < 2) return null
	const mx = mean(xs)
	const my = mean(ys)
	let num = 0
	let den = 0
	for (let i = 0; i < n; i++) {
		const dx = xs[i] - mx
		num += dx * (ys[i] - my)
		den += dx * dx
	}
	if (den === 0) return null
	const m = num / den
	return { m, b: my - m * mx }
}

/** Trailing simple moving average; length preserved (partial window at the head). */
export function movingAverage(ys, window) {
	const w = Math.max(1, Math.floor(window))
	const out = []
	for (let i = 0; i < ys.length; i++) {
		const start = Math.max(0, i - w + 1)
		const slice = ys.slice(start, i + 1)
		out.push(slice.reduce((s, v) => s + v, 0) / slice.length)
	}
	return out
}

/** Exponential moving average; alpha = alpha ?? 2/(span+1). Length preserved. */
export function ema(ys, { span, alpha } = {}) {
	if (!ys.length) return []
	const a = alpha ?? 2 / ((span ?? 7) + 1)
	const out = [ys[0]]
	for (let i = 1; i < ys.length; i++) out.push(a * ys[i] + (1 - a) * out[i - 1])
	return out
}

/** Fit y = a·e^(bx) via log-linear least squares. Null if any y ≤ 0 or < 2 points. */
export function expRegression(xs, ys) {
	if (xs.length < 2) return null
	if (ys.some((v) => v <= 0)) return null
	const reg = linearRegression(xs, ys.map((v) => Math.log(v)))
	if (!reg) return null
	return { a: Math.exp(reg.b), b: reg.m }
}

function normalize(method) {
	if (typeof method === 'number') return { type: 'value', value: method }
	if (typeof method === 'string') return { type: method === 'mean' ? 'avg' : method }
	if (method && typeof method === 'object' && method.type)
		return { ...method, type: method.type === 'mean' ? 'avg' : method.type }
	return null
}

/**
 * Compute a trend for `rows` on channels {x, y}.
 * @returns {{kind:'constant', value:number} | {kind:'series', values:number[]} | null}
 */
export function computeTrend(rows, channels, method) {
	const cfg = normalize(method)
	if (!cfg || !Array.isArray(rows) || rows.length === 0) return null
	const { x, y } = channels
	const ys = rows.map((r) => Number(r[y]))
	const xs = rows.map((r, i) => {
		const v = Number(r[x])
		return Number.isFinite(v) ? v : i
	})

	switch (cfg.type) {
		case 'avg':
			return { kind: 'constant', value: mean(ys) }
		case 'median':
			return { kind: 'constant', value: median(ys) }
		case 'min':
			return { kind: 'constant', value: Math.min(...ys) }
		case 'max':
			return { kind: 'constant', value: Math.max(...ys) }
		case 'value':
			return typeof cfg.value === 'number' ? { kind: 'constant', value: cfg.value } : null
		case 'linear': {
			const reg = linearRegression(xs, ys)
			if (!reg) return null
			return { kind: 'series', values: xs.map((v) => reg.m * v + reg.b) }
		}
		case 'ma': {
			if (!cfg.window) return null
			return { kind: 'series', values: movingAverage(ys, cfg.window) }
		}
		case 'ema':
			return { kind: 'series', values: ema(ys, { span: cfg.span, alpha: cfg.alpha }) }
		case 'exp': {
			const reg = expRegression(xs, ys)
			if (!reg) return null
			return { kind: 'series', values: xs.map((v) => reg.a * Math.exp(reg.b * v)) }
		}
		default:
			return null
	}
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test:ci -- packages/chart/spec/lib/trend.spec.js`
Expected: PASS (all `computeTrend` + statistics cases).

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/lib/trend.js packages/chart/spec/lib/trend.spec.js
git commit -m "feat(chart): add trend calculators (avg/median/min/max/linear/ma/ema/exp)"
```

---

## Task 3: `PlotState.get data()`

**Files:**
- Modify: `packages/chart/src/PlotState.svelte.js` (add getter near other getters, ~line 348)
- Test: `packages/chart/spec/PlotState.spec.js` (append)

- [ ] **Step 1: Write the failing test**

```js
// append to packages/chart/spec/PlotState.spec.js
import { PlotState } from '../src/PlotState.svelte.js'

describe('PlotState.data', () => {
	it('exposes the current data array', () => {
		const rows = [{ a: 1 }, { a: 2 }]
		const s = new PlotState({ data: rows, channels: { x: 'a', y: 'a' } })
		expect(s.data).toEqual(rows)
	})
})
```

(If `PlotState`/`describe` are already imported at the top of the file, don't re-import — just add the `describe` block.)

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test:ci -- packages/chart/spec/PlotState.spec.js`
Expected: FAIL — `s.data` is `undefined`.

- [ ] **Step 3: Add the getter**

In `packages/chart/src/PlotState.svelte.js`, next to `get margin()` (~line 348):

```js
	get data() {
		return this.#data
	}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test:ci -- packages/chart/spec/PlotState.spec.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/PlotState.svelte.js packages/chart/spec/PlotState.spec.js
git commit -m "feat(chart): expose PlotState.data getter for overlays"
```

---

## Task 4: `Grid.svelte` axis control + Plot mapping

**Files:**
- Modify: `packages/chart/src/Plot/Grid.svelte` (full rewrite of script + template + style)
- Modify: `packages/chart/src/Plot.svelte` (grid prop → union; pass `lines`/ticks to Grid)
- Test: `packages/chart/spec/Grid.spec.js`

- [ ] **Step 1: Write the failing test**

```js
// packages/chart/spec/Grid.spec.js
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Plot from '../src/Plot.svelte'

// Continuous x (numeric day) + line geom → drives point/linear x-scale.
const data = Array.from({ length: 8 }, (_, i) => ({ day: i, v: (i % 3) + 1 }))
const spec = { data, x: 'day', y: 'v', geoms: [{ type: 'line' }] }

function grid(gridProp) {
	const { container } = render(Plot, {
		props: { spec, grid: gridProp, width: 400, height: 300 }
	})
	return {
		x: container.querySelectorAll('[data-plot-grid-line="x"]').length,
		y: container.querySelectorAll('[data-plot-grid-line="y"]').length
	}
}

describe('Grid axis control', () => {
	it("'both' adds vertical lines on a continuous x-scale", () => {
		const g = grid('both')
		expect(g.x).toBeGreaterThan(0)
		expect(g.y).toBeGreaterThan(0)
	})
	it('true (auto) draws horizontals only on a continuous x-scale', () => {
		const g = grid(true)
		expect(g.x).toBe(0)
		expect(g.y).toBeGreaterThan(0)
	})
	it("'x' draws verticals only; 'y' draws horizontals only", () => {
		expect(grid('x').y).toBe(0)
		expect(grid('x').x).toBeGreaterThan(0)
		expect(grid('y').x).toBe(0)
		expect(grid('y').y).toBeGreaterThan(0)
	})
	it('false renders no grid lines', () => {
		expect(grid(false)).toEqual({ x: 0, y: 0 })
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test:ci -- packages/chart/spec/Grid.spec.js`
Expected: FAIL — no `[data-plot-grid-line="y"]` (today horizontals use bare `data-plot-grid-line`), and `'both'` produces no verticals on a continuous scale.

- [ ] **Step 3a: Rewrite `Plot/Grid.svelte`**

```svelte
<script lang="ts">
	import { getContext } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'

	type Props = {
		lines?: 'auto' | 'x' | 'y' | 'both'
		xTicks?: number
		yTicks?: number
	}
	let { lines = 'auto', xTicks = 6, yTicks = 6 }: Props = $props()

	const state = getContext<PlotState>('plot-state')

	const isBand = (s: unknown) =>
		!!s && typeof (s as { bandwidth?: unknown }).bandwidth === 'function'

	const showX = $derived(lines === 'x' || lines === 'both' || (lines === 'auto' && isBand(state.xScale)))
	const showY = $derived(lines === 'auto' || lines === 'y' || lines === 'both')

	const yLines = $derived.by(() => {
		const s = state.yScale
		if (!showY || !s || typeof s.ticks !== 'function') return []
		return s.ticks(yTicks).map((val: number) => ({ pos: s(val) }))
	})

	const xLines = $derived.by(() => {
		const s = state.xScale
		if (!showX || !s) return []
		if (isBand(s)) return s.domain().map((val: unknown) => ({ pos: (s(val) ?? 0) + s.bandwidth() / 2 }))
		if (typeof s.ticks !== 'function') return []
		return s.ticks(xTicks).map((val: number) => ({ pos: s(val) }))
	})
</script>

<g class="grid" data-plot-grid>
	{#each yLines as line (line.pos)}
		<line x1="0" y1={line.pos} x2={state.innerWidth} y2={line.pos} data-plot-grid-line="y" />
	{/each}
	{#each xLines as line (line.pos)}
		<line x1={line.pos} y1="0" x2={line.pos} y2={state.innerHeight} data-plot-grid-line="x" />
	{/each}
</g>

<style>
	[data-plot-grid-line] {
		stroke: var(--chart-grid-color, currentColor);
		stroke-width: var(--chart-grid-width, 1);
		stroke-dasharray: var(--chart-grid-dash, 2 4);
		opacity: var(--chart-grid-opacity, 0.15);
	}
</style>
```

- [ ] **Step 3b: Map the `grid` union in `Plot.svelte`**

In the `Props` type (~line 36) change `grid?: boolean` to:

```ts
		grid?: boolean | 'x' | 'y' | 'both'
```

Replace the existing `showGrid` derived (~line 95):

```ts
	const gridValue = $derived(spec?.grid ?? grid)
	const showGrid = $derived(gridValue !== false)
	const gridLines = $derived(gridValue === true ? 'auto' : (gridValue as 'x' | 'y' | 'both' | 'auto'))
```

Replace the grid render (~line 219):

```svelte
				{#if showGrid}
					<Grid lines={gridLines} {xTicks} {yTicks} />
				{/if}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test:ci -- packages/chart/spec/Grid.spec.js`
Expected: PASS (4 tests). Also run `bun run test:ci -- packages/chart/spec/Plot.spec.js` to confirm no regression.

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/Plot/Grid.svelte packages/chart/src/Plot.svelte packages/chart/spec/Grid.spec.js
git commit -m "feat(chart): grid axis control (boolean|x|y|both) + per-orientation theming"
```

---

## Task 5: `Highlight.svelte` primitive + Plot wiring

**Files:**
- Create: `packages/chart/src/geoms/Highlight.svelte`
- Modify: `packages/chart/src/Plot.svelte` (add `x`/`y`/`highlight` props; render `<Highlight>`)
- Test: `packages/chart/spec/Highlight.spec.js`

- [ ] **Step 1: Write the failing test**

```js
// packages/chart/spec/Highlight.spec.js
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Plot from '../src/Plot.svelte'

const data = [
	{ day: 0, v: 5 },
	{ day: 1, v: 9 },
	{ day: 2, v: 3 },
	{ day: 3, v: 7 }
]
const spec = { data, x: 'day', y: 'v', geoms: [{ type: 'line' }] }

describe('Highlight overlay', () => {
	it('renders one marker for a keyword selector', () => {
		const { container } = render(Plot, {
			props: { spec, highlight: 'last', grid: false, width: 400, height: 300 }
		})
		expect(container.querySelectorAll('[data-plot-highlight]')).toHaveLength(1)
	})
	it('renders a marker per match for a predicate', () => {
		const { container } = render(Plot, {
			props: { spec, highlight: (r) => r.v > 4, grid: false, width: 400, height: 300 }
		})
		expect(container.querySelectorAll('[data-plot-highlight]')).toHaveLength(3)
	})
	it('renders a label only when requested', () => {
		const { container } = render(Plot, {
			props: { spec, highlight: 'max', grid: false, width: 400, height: 300 }
		})
		expect(container.querySelectorAll('[data-plot-highlight-label]')).toHaveLength(0)
	})
	it('renders nothing when highlight is unset', () => {
		const { container } = render(Plot, { props: { spec, grid: false, width: 400, height: 300 } })
		expect(container.querySelectorAll('[data-plot-highlight]')).toHaveLength(0)
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test:ci -- packages/chart/spec/Highlight.spec.js`
Expected: FAIL — no `[data-plot-highlight]` elements.

- [ ] **Step 3a: Create `geoms/Highlight.svelte`**

```svelte
<script lang="ts">
	import { getContext } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'
	import { resolveHighlight } from '../lib/highlight.js'

	type Row = Record<string, unknown>
	type Props = {
		x?: string
		y?: string
		highlight?: 'first' | 'last' | 'min' | 'max' | number | ((row: Row, i: number) => boolean)
		label?: boolean | string | ((row: Row) => unknown)
	}
	let { x, y, highlight = undefined, label = false }: Props = $props()

	const state = getContext<PlotState>('plot-state')

	const scaleX = (scale: any, v: unknown) => {
		const p = scale(v)
		return typeof scale.bandwidth === 'function' ? (p ?? 0) + scale.bandwidth() / 2 : p
	}

	const marks = $derived.by(() => {
		const rows = state?.data ?? []
		const xs = state?.xScale
		const ys = state?.yScale
		if (!rows.length || !xs || !ys || highlight == null || !x || !y) return []
		return resolveHighlight(rows, highlight, { y })
			.map((i) => {
				const row = rows[i]
				return { cx: scaleX(xs, row[x]), cy: ys(Number(row[y])), row }
			})
			.filter((m) => Number.isFinite(m.cx) && Number.isFinite(m.cy))
	})

	function resolveLabel(row: Row): string | null {
		if (!label) return null
		if (label === true) return String((y ? row[y] : '') ?? '')
		if (typeof label === 'function') return String(label(row) ?? '')
		return String(row[label] ?? '')
	}
</script>

{#if marks.length}
	<g data-plot-geom="highlight">
		{#each marks as m (`${m.cx}::${m.cy}`)}
			<circle cx={m.cx} cy={m.cy} data-plot-highlight />
			{#if label}
				{@const text = resolveLabel(m.row)}
				{#if text}
					<text x={m.cx} y={m.cy} dy="-8" text-anchor="middle" data-plot-highlight-label>{text}</text>
				{/if}
			{/if}
		{/each}
	</g>
{/if}

<style>
	[data-plot-highlight] {
		fill: var(--chart-highlight-color, rgb(var(--color-accent-500, 194 65 12)));
		stroke: var(--chart-highlight-ring, none);
		r: var(--chart-highlight-radius, 4);
	}
	[data-plot-highlight-label] {
		fill: currentColor;
		font-size: 11px;
	}
</style>
```

- [ ] **Step 3b: Wire into `Plot.svelte`**

Add the import near the other geom imports (~line 16):

```ts
	import Highlight from './geoms/Highlight.svelte'
```

Add to the `Props` type (~line 47, near `xFormat`):

```ts
		x?: string
		y?: string
		highlight?: 'first' | 'last' | 'min' | 'max' | number | ((row: Row, i: number) => boolean)
		label?: boolean | string | ((row: Row) => unknown)
```

Add to the destructured props (~line 71, near `minorTicks`):

```ts
		x = undefined,
		y = undefined,
		highlight = undefined,
		label = false,
```

Add a derived for the overlay channels (after `specGeoms`, ~line 170):

```ts
	const overlayX = $derived(spec?.x ?? x)
	const overlayY = $derived(spec?.y ?? y)
```

Render the overlay **after** the `{#if axes}` block, still inside the `plot-canvas` `<g>` (~line 252):

```svelte
				{#if highlight != null}
					<Highlight x={overlayX} y={overlayY} {highlight} {label} />
				{/if}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test:ci -- packages/chart/spec/Highlight.spec.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/geoms/Highlight.svelte packages/chart/src/Plot.svelte packages/chart/spec/Highlight.spec.js
git commit -m "feat(chart): Highlight overlay primitive + Plot wiring"
```

---

## Task 6: `Trend.svelte` primitive + Plot wiring

**Files:**
- Create: `packages/chart/src/geoms/Trend.svelte`
- Modify: `packages/chart/src/Plot.svelte` (add `trend` prop; render `<Trend>`)
- Test: `packages/chart/spec/Trend.spec.js`

- [ ] **Step 1: Write the failing test**

```js
// packages/chart/spec/Trend.spec.js
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Plot from '../src/Plot.svelte'

const data = Array.from({ length: 6 }, (_, i) => ({ day: i, v: i + 1 }))
const spec = { data, x: 'day', y: 'v', geoms: [{ type: 'line' }] }

const paths = (trend) =>
	render(Plot, {
		props: { spec, trend, grid: false, width: 400, height: 300 }
	}).container.querySelectorAll('[data-plot-trend]')

describe('Trend overlay', () => {
	it('a constant method renders one horizontal path', () => {
		const p = paths('avg')
		expect(p).toHaveLength(1)
		expect(p[0].getAttribute('data-plot-trend')).toBe('avg')
		const d = p[0].getAttribute('d')
		const m = d.match(/M[\d.]+,([\d.]+) L[\d.]+,([\d.]+)/)
		expect(Number(m[1])).toBeCloseTo(Number(m[2]), 6) // horizontal
	})
	it('a fitted method renders a path', () => {
		expect(paths('linear')).toHaveLength(1)
		expect(paths('ema')).toHaveLength(1)
	})
	it('an array renders one path per method', () => {
		expect(paths(['avg', 'max'])).toHaveLength(2)
	})
	it('renders nothing when trend is unset or degenerate', () => {
		expect(paths(undefined)).toHaveLength(0)
		expect(paths({ type: 'ma' })).toHaveLength(0) // ma without window → null
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test:ci -- packages/chart/spec/Trend.spec.js`
Expected: FAIL — no `[data-plot-trend]` elements.

- [ ] **Step 3a: Create `geoms/Trend.svelte`**

```svelte
<script lang="ts">
	import { getContext } from 'svelte'
	import { line as d3line } from 'd3-shape'
	import type { PlotState } from '../PlotState.svelte.js'
	import { computeTrend } from '../lib/trend.js'

	type Row = Record<string, unknown>
	type Method = string | number | { type: string; [k: string]: unknown }
	type Props = { x?: string; y?: string; trend?: Method | Method[] }
	let { x, y, trend = undefined }: Props = $props()

	const state = getContext<PlotState>('plot-state')

	const methods = $derived(Array.isArray(trend) ? trend : trend == null ? [] : [trend])

	const scaleX = (scale: any, v: unknown) => {
		const p = scale(v)
		return typeof scale.bandwidth === 'function' ? (p ?? 0) + scale.bandwidth() / 2 : p
	}

	const typeOf = (m: Method) =>
		typeof m === 'string' ? m : typeof m === 'number' ? 'value' : (m?.type ?? '')

	const paths = $derived.by(() => {
		const rows = state?.data ?? []
		const xs = state?.xScale
		const ys = state?.yScale
		if (!rows.length || !xs || !ys || !x || !y || !methods.length) return []
		const out: { d: string; type: string }[] = []
		for (const m of methods) {
			const res = computeTrend(rows, { x, y }, m)
			if (!res) continue
			if (res.kind === 'constant') {
				const yy = ys(res.value)
				out.push({ d: `M0,${yy} L${state.innerWidth},${yy}`, type: typeOf(m) })
			} else {
				const pts = res.values
					.map((v, i) => ({ vx: scaleX(xs, rows[i][x]), vy: ys(v) }))
					.filter((p) => Number.isFinite(p.vx) && Number.isFinite(p.vy))
				const gen = d3line<{ vx: number; vy: number }>()
					.x((p) => p.vx)
					.y((p) => p.vy)
				const d = gen(pts)
				if (d) out.push({ d, type: typeOf(m) })
			}
		}
		return out
	})
</script>

{#if paths.length}
	<g data-plot-geom="trend">
		{#each paths as p (`${p.type}::${p.d}`)}
			<path d={p.d} data-plot-trend={p.type} />
		{/each}
	</g>
{/if}

<style>
	[data-plot-trend] {
		fill: none;
		stroke: var(--chart-trend-color, currentColor);
		stroke-width: var(--chart-trend-width, 1);
		stroke-dasharray: var(--chart-trend-dash, 4 4);
		opacity: var(--chart-trend-opacity, 0.7);
	}
</style>
```

- [ ] **Step 3b: Wire into `Plot.svelte`**

Add the import (~line 16):

```ts
	import Trend from './geoms/Trend.svelte'
```

Above the `Props` type add the helper type (near the other `type` aliases, ~line 27):

```ts
	type Method = string | number | { type: string; [k: string]: unknown }
```

Add to the `Props` type (near `highlight` from Task 5):

```ts
		trend?: Method | Method[]
```

Add to destructured props (near `highlight`):

```ts
		trend = undefined,
```

Render **before** the `<Highlight>` block (so the highlight dot sits on top of the trend line):

```svelte
				{#if trend != null}
					<Trend x={overlayX} y={overlayY} {trend} />
				{/if}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test:ci -- packages/chart/spec/Trend.spec.js`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/geoms/Trend.svelte packages/chart/src/Plot.svelte packages/chart/spec/Trend.spec.js
git commit -m "feat(chart): Trend overlay primitive (constant + fitted) + Plot wiring"
```

---

## Task 7: Wrappers — `AreaChart` + `LineChart`

**Files:**
- Modify: `packages/chart/src/charts/AreaChart.svelte`
- Modify: `packages/chart/src/charts/LineChart.svelte`
- Test: `packages/chart/spec/Plot.spec.js` (append wrapper-forwarding cases)

- [ ] **Step 1: Write the failing test**

```js
// append to packages/chart/spec/Plot.spec.js
import AreaChart from '../src/charts/AreaChart.svelte'
import LineChart from '../src/charts/LineChart.svelte'

describe('wrapper forwarding: grid / highlight / trend', () => {
	const data = Array.from({ length: 6 }, (_, i) => ({ day: i, v: i + 1 }))

	it('AreaChart forwards grid="both" + trend + highlight', () => {
		const { container } = render(AreaChart, {
			props: {
				data, x: 'day', y: 'v', grid: 'both', trend: 'avg', highlight: 'last', width: 400, height: 300
			}
		})
		expect(container.querySelectorAll('[data-plot-grid-line="x"]').length).toBeGreaterThan(0)
		expect(container.querySelectorAll('[data-plot-trend]')).toHaveLength(1)
		expect(container.querySelectorAll('[data-plot-highlight]')).toHaveLength(1)
	})

	it('LineChart forwards highlight + trend array', () => {
		const { container } = render(LineChart, {
			props: {
				data, x: 'day', y: 'v', trend: ['avg', 'max'], highlight: 'max', width: 400, height: 300
			}
		})
		expect(container.querySelectorAll('[data-plot-trend]')).toHaveLength(2)
		expect(container.querySelectorAll('[data-plot-highlight]')).toHaveLength(1)
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test:ci -- packages/chart/spec/Plot.spec.js`
Expected: FAIL — wrappers don't accept/forward `highlight`/`trend`, and `grid` type is `boolean`.

- [ ] **Step 3a: Update `AreaChart.svelte`**

Replace the `Props` type's `grid` line and add two props:

```ts
		grid?: boolean | 'x' | 'y' | 'both'
		highlight?: 'first' | 'last' | 'min' | 'max' | number | ((row: Row, i: number) => boolean)
		trend?: unknown
```

Add to the destructure (near `grid = true`):

```ts
		highlight = undefined,
		trend = undefined,
```

Replace the `<Plot …>` open tag to pass `x`/`y`/`highlight`/`trend`:

```svelte
<Plot {data} {x} {y} {width} {height} {mode} {grid} {legend} {highlight} {trend} {xFormat} {yFormat} {xTicks} {yTicks} {minorTicks}>
	<Area {x} {y} color={fill} {pattern} {stat} options={{ curve, stack }} />
</Plot>
```

- [ ] **Step 3b: Update `LineChart.svelte`**

Same edits: widen `grid`, add `highlight` + `trend` props and destructure, and pass `{x} {y} {highlight} {trend}` on the `<Plot …>` tag (keep the existing `{tooltip}`):

```svelte
<Plot {data} {x} {y} {width} {height} {mode} {grid} {legend} {tooltip} {highlight} {trend} {xFormat} {yFormat} {xTicks} {yTicks} {minorTicks}>
	<Line {x} {y} {color} {symbol} {label} {stat} options={{ curve }} />
</Plot>
```

(Note: `x`/`y` are already destructured in both wrappers; only the `<Plot>` tag and the props list change.)

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test:ci -- packages/chart/spec/Plot.spec.js`
Expected: PASS including the two new wrapper cases.

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/charts/AreaChart.svelte packages/chart/src/charts/LineChart.svelte packages/chart/spec/Plot.spec.js
git commit -m "feat(chart): forward grid/highlight/trend through AreaChart + LineChart"
```

---

## Task 8: Exports — `Plot.Highlight` / `Plot.Trend` + geoms

**Files:**
- Modify: `packages/chart/src/index.js`
- Test: `packages/chart/spec/exports.spec.js` (new)

- [ ] **Step 1: Write the failing test**

```js
// packages/chart/spec/exports.spec.js
import { describe, it, expect } from 'vitest'
import { Plot, GeomHighlight, GeomTrend } from '../src/index.js'

describe('chart exports', () => {
	it('exposes Highlight + Trend on the Plot namespace and as Geom*', () => {
		expect(Plot.Highlight).toBeTruthy()
		expect(Plot.Trend).toBeTruthy()
		expect(GeomHighlight).toBeTruthy()
		expect(GeomTrend).toBeTruthy()
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test:ci -- packages/chart/spec/exports.spec.js`
Expected: FAIL — named exports undefined.

- [ ] **Step 3: Add the exports**

In `packages/chart/src/index.js`, add imports at the end of the `Plot` import group (~line 9, after the `Arc` import):

```js
import Highlight from './geoms/Highlight.svelte'
import Trend from './geoms/Trend.svelte'
```

Add to the `Plot` object literal (~line 21, after `Arc`):

```js
	Point,
	Arc,
	Highlight,
	Trend
```

Add standalone geom exports next to the other `Geom*` exports (~line 49):

```js
export { default as GeomHighlight } from './geoms/Highlight.svelte'
export { default as GeomTrend } from './geoms/Trend.svelte'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test:ci -- packages/chart/spec/exports.spec.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/index.js packages/chart/spec/exports.spec.js
git commit -m "feat(chart): export Plot.Highlight/Plot.Trend + GeomHighlight/GeomTrend"
```

---

## Task 9: Learn-app showcase — "Last 30 days"

**Files:**
- Modify: `apps/learn/src/lib/koan/demos/chart/index.svelte`

The learn app imports `@rokkit/chart` from **src** (package `exports.import` → `./src/index.js`), so new exports are picked up with no build step.

- [ ] **Step 1: Add the showcase section**

Extend the import (line 2) to add the primitives:

```svelte
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
		GeomLine
	} from '@rokkit/chart'
```

Add a deterministic 30-point series + axis formatter to the `<script>` (after `sparkRevenue`, line 59):

```svelte
	// 30-day daily metric — gently rising with wobble (deterministic, no RNG).
	const metrics = Array.from({ length: 30 }, (_, i) => ({
		day: i - 29, // -29 … 0 (today)
		value: Math.round(40 + i * 1.6 + 8 * Math.sin(i / 2))
	}))
	const dayFormat = (d: unknown) => (Number(d) === 0 ? 'today' : `${d}d`)
```

Add a new `<section>` as the **first** child of `.grid` (before the BarChart section, line 63):

```svelte
	<section>
		<header>Metrics — last 30 days · daily (grid + trend + highlight)</header>
		<div class="chart-stage">
			<PlotChart
				data={metrics}
				x="day"
				y="value"
				grid="both"
				trend="avg"
				highlight="last"
				xFormat={dayFormat}
				width={720}
				height={240}
			>
				<GeomArea x="day" y="value" color="accent" />
				<GeomLine x="day" y="value" color="accent" />
			</PlotChart>
		</div>
	</section>
```

- [ ] **Step 2: Verify it renders live**

```bash
cd apps/learn && bun run dev
```

Open `http://localhost:5173/app/chart`. Confirm the "Metrics — last 30 days" panel shows: a rising area+line, faint horizontal **and** vertical gridlines, a dashed average line, a single accent dot on `today`, and `-29d … today` x labels. Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add apps/learn/src/lib/koan/demos/chart/index.svelte
git commit -m "docs(learn): 'last 30 days' chart showcase (grid/trend/highlight)"
```

---

## Task 10: Playwright e2e guard

**Files:**
- Create: `apps/learn/e2e/chart-metrics.e2e.ts`

- [ ] **Step 1: Write the e2e test**

```ts
// apps/learn/e2e/chart-metrics.e2e.ts
import { test, expect } from '@playwright/test'

// Guards the "last 30 days" showcase on /app/chart: the three new features
// (grid both-axes, trend line, highlighted observation) must render.
test('chart metrics showcase renders grid + trend + highlight', async ({ page }) => {
	await page.goto('/app/chart')
	await expect(page.locator('[data-plot-grid-line="x"]').first()).toBeVisible()
	await expect(page.locator('[data-plot-grid-line="y"]').first()).toBeVisible()
	await expect(page.locator('[data-plot-trend]').first()).toBeVisible()
	await expect(page.locator('[data-plot-highlight]').first()).toBeVisible()
})
```

- [ ] **Step 2: Run the e2e test**

Run: `cd apps/learn && npx playwright test chart-metrics`
Expected: PASS (1 test). Playwright starts its web server per `playwright.config` if needed.

- [ ] **Step 3: Commit**

```bash
git add apps/learn/e2e/chart-metrics.e2e.ts
git commit -m "test(learn): e2e guard for chart grid/trend/highlight showcase"
```

---

## Task 11: Docs, references, skills

**Files:**
- Modify: `docs/design/20-chart.md`, `docs/design/21-charts.md`
- Modify: the shipped `llms/components/{plot-chart,area-chart,line-chart}.txt` (find the editable source first)
- Audit: `.claude/skills/rokkit-components/SKILL.md`, semantic-styles-rokkit token list

- [ ] **Step 1: Update design docs**

In `docs/design/21-charts.md`, under the geom/primitive list, add:

```md
### Overlays: Highlight & Trend

- **`Plot.Highlight`** (`GeomHighlight`) — marks a specific observation. Prop `highlight`
  accepts `'first' | 'last' | 'min' | 'max' | number(index) | (row,i)=>boolean` (predicate
  matches many). Themed via `[data-plot-highlight]` + `--chart-highlight-{color,radius,ring}`.
- **`Plot.Trend`** (`GeomTrend`) — overlays computed trend/reference lines. Prop `trend` accepts a
  method or an array. Constant methods (`avg`/`median`/`min`/`max`/`value`/fixed number) draw a
  horizontal line; fitted methods (`linear`, `{type:'ma',window}`, `ema`, `exp`) draw a series.
  Themed via `[data-plot-trend="<type>"]` + `--chart-trend-{color,width,dash,opacity}` (dashed).

### Grid axis control

`grid` accepts `boolean | 'x' | 'y' | 'both'`. `true` is *auto* (horizontal always; vertical only
for band scales); `'both'`/`'x'` force vertical lines on continuous scales at the x-tick positions.
Per-orientation attributes `[data-plot-grid-line="x"|"y"]` + `--chart-grid-{color,width,dash,opacity}`.
```

In `docs/design/20-chart.md`, add `Highlight` and `Trend` to the primitives list where geoms are enumerated (one line each mirroring the above).

- [ ] **Step 2: Update the shipped reference docs**

Locate the editable source of the llms txt (they may be generated):

```bash
cd /Users/Jerry/Developer/rokkit
grep -rl "AreaChart" apps/learn/src apps/learn/static/llms/components 2>/dev/null | head
```

Edit the `plot-chart`, `area-chart`, and `line-chart` reference docs (prefer a generator/source under `apps/learn/src` if one exists; otherwise the `static/llms` files) to add the `grid` union, `highlight`, and `trend` props plus the new `data-plot-*` attributes and `--chart-*` CSS vars, keeping the existing format.

- [ ] **Step 3: Audit chart-facing skills**

```bash
grep -niE "chart|--chart-|grid|highlight|trend" .claude/skills/rokkit-components/SKILL.md .claude/skills/semantic-styles-rokkit/SKILL.md
```

Only if a skill currently enumerates chart props or `--chart-*` tokens, add the new `grid`/`highlight`/`trend` props and `--chart-grid-*` / `--chart-highlight-*` / `--chart-trend-*` tokens. If they don't mention charts, make no change (record "no change needed" in the journal).

- [ ] **Step 4: Commit**

```bash
git add docs/design/20-chart.md docs/design/21-charts.md apps/learn
git commit -m "docs(chart): document grid union, highlight, and trend overlays"
```

---

## Task 12: Gate, bookkeeping, finish

- [ ] **Step 1: Full test + lint gate**

```bash
cd /Users/Jerry/Developer/rokkit
bun run test:ci
bun run lint
```
Expected: all tests pass; lint 0 errors. Do not proceed on red (sensei mandatory rule). Confirm the real exit status of each command — do not rely on a piped/tail'd summary.

- [ ] **Step 2: e2e gate**

```bash
cd apps/learn && npx playwright test chart-metrics
```
Expected: PASS.

- [ ] **Step 3: Update journal**

Append a dated entry to `agents/journal.md` summarizing the three features, the new files/primitives, the CSS-var theming hooks, test counts, and commit hashes.

- [ ] **Step 4: Mark backlog done + priority**

- Move/mark `docs/backlog/2026-08-13-chart-grid-axis-highlight.md` as done per repo convention (the `done/` folder holds completed items).
- Update `docs/design/12-priority.md` — mark the item complete.

- [ ] **Step 5: Commit bookkeeping**

```bash
git add agents/journal.md docs/design/12-priority.md docs/backlog
git commit -m "chore(chart): journal + backlog close for grid/highlight/trend"
```

- [ ] **Step 6: Finish the branch**

Invoke `superpowers:finishing-a-development-branch` to decide merge/PR for `develop`.

---

## Self-Review (completed at authoring time)

**Spec coverage:** grid union → Task 4; per-orientation theming → Task 4; highlight selector + CSS theming → Tasks 1, 5; trend constant+fitted methods (avg/median/min/max/value/linear/ma/ema/exp) → Tasks 2, 6; one-or-array → Task 6; primitives + wrappers → Tasks 5–7; exports → Task 8; showcase → Task 9; e2e → Task 10; design/reference/skill docs → Task 11; gate + bookkeeping → Task 12. All spec sections mapped.

**Type consistency:** `resolveHighlight(rows, selector, {y}) → number[]` used identically in Task 1 and `Highlight.svelte`. `computeTrend(rows, {x,y}, method) → {kind:'constant',value} | {kind:'series',values} | null` used identically in Task 2 and `Trend.svelte`. `PlotState.data` (Task 3) consumed by both overlays. Grid `lines: 'auto'|'x'|'y'|'both'` matches Plot's `gridLines` mapping. `data-plot-grid-line="x"|"y"`, `data-plot-highlight`, `data-plot-trend="<type>"` attribute names are consistent across components, tests, showcase, and e2e.

**Placeholder scan:** none — every code/step is complete and runnable.
