# Spark: Plot + geom composition Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let sparklines compose from the same geoms as full charts — `<Spark><Line /><Trend /></Spark>` — by giving them a lightweight, `PlotState`-compatible context, and fold `Sparkline` onto it without regressing anything.

**Architecture:** A new `SparkState` publishes on the same `'plot-state'` context key that `PlotState` uses, so every existing geom resolves it unmodified. It is a thin composition of the pure modules `PlotState` already uses (`lib/plot/scales.js`, `lib/plot/stat.js`, `lib/brewing/colors.js`, `lib/preset.js`), omitting zoom, crossfilter, selection, facets, patterns, symbols and chrome. `geoms/Area` first gains the baseline-anchored negative-fill split that currently only `Sparkline` has (#148), so `Sparkline` can sit on top of the geoms losslessly.

**Tech Stack:** Svelte 5 runes, d3-shape/d3-scale, Vitest (jsdom + browser mode via Playwright), `@testing-library/svelte`.

**Spec:** `docs/superpowers/specs/2026-08-20-spark-plot-geom-architecture-design.md`

**Branch:** work on `develop` (project convention — do not create a worktree).

---

## Critical constraint

`Sparkline` and the geoms share the `data-plot-*` hook *vocabulary* but **not** the DOM *structure*.
`data-plot-area`, `data-plot-area-sign` and `data-plot-baseline` exist in **zero** geoms today.

Two acceptance rules follow, and they are the point of the whole plan:

1. The 27 existing `packages/chart/spec/Sparkline.spec.js` tests and `apps/learn/e2e/sparkline.e2e.ts`
   must pass **unmodified**.
2. The existing `packages/chart/spec/geoms/*area*` tests must pass **unmodified** — the Area change is
   attribute-additive only.

If you find yourself wanting to edit either, **stop**: the design is wrong, not the test.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `packages/chart/src/geoms/lib/areas.js` | **Modify** — `buildAreas` gains an optional `baseline` value; emits `sign` on segments |
| `packages/chart/src/geoms/lib/marks/area.js` | **Modify** — forward `options.baseline` |
| `packages/chart/src/geoms/Area.svelte` | **Modify** — accept `options.baseline`; add `data-plot-area` + `data-plot-area-sign` |
| `packages/chart/src/SparkState.svelte.js` | **Create** — lean context + exported `GEOM_CONTRACT` |
| `packages/chart/src/Spark.svelte` | **Create** — container: context, `<svg>`, pattern defs, baseline line |
| `packages/chart/src/Sparkline.svelte` | **Modify** — becomes a thin wrapper over `Spark` + geoms |
| `packages/chart/src/index.js` | **Modify** — export `Spark`, `SparkState` |
| `packages/chart/spec/geoms/area-baseline.spec.js` | **Create** — the negative-fill port |
| `packages/chart/spec/SparkState.spec.js` | **Create** — scales, stats, colours, lifecycle |
| `packages/chart/spec/spark-contract.spec.js` | **Create** — conformance vs `PlotState` |
| `packages/chart/spec/Spark.spec.svelte.js` | **Create** — container behaviour |
| `packages/chart/browser/Spark.browser.spec.ts` | **Create** — Spark-vs-Plot geometry parity |
| `packages/chart/browser/fixtures/SparkParity.svelte` | **Create** — renders the same geom in both |

---

### Task 1: `buildAreas` — baseline split

**Files:**
- Modify: `packages/chart/src/geoms/lib/areas.js`
- Test: `packages/chart/spec/geoms/area-baseline.spec.js`

Today `buildAreas` hardcodes the anchor to the chart bottom:

```js
const baseline = yScale.range()[0] // bottom of the chart (y pixel max)
```

The port mirrors `Sparkline`'s proven approach exactly (two full-width areas, both anchored at the
baseline pixel, one clamped up and one clamped down) — no segment splitting.

- [ ] **Step 1: Write the failing test**

Create `packages/chart/spec/geoms/area-baseline.spec.js`:

```js
import { describe, it, expect } from 'vitest'
import { scaleLinear } from 'd3-scale'
import { buildAreas } from '../../src/geoms/lib/areas.js'

const data = [
	{ x: 0, y: 5 },
	{ x: 1, y: -3 },
	{ x: 2, y: 4 }
]
const channels = { x: 'x', y: 'y' }
const xScale = scaleLinear().domain([0, 2]).range([0, 100])
const yScale = scaleLinear().domain([-5, 5]).range([50, 0])
const colors = new Map([[undefined, { fill: '#888', stroke: '#888' }]])

describe('buildAreas — baseline split', () => {
	it('returns a single unsigned segment when no baseline is given', () => {
		const segs = buildAreas(data, channels, xScale, yScale, colors)
		expect(segs).toHaveLength(1)
		expect(segs[0].sign).toBeUndefined()
	})

	it('splits into above and below segments when a baseline is given', () => {
		const segs = buildAreas(data, channels, xScale, yScale, colors, undefined, undefined, undefined, 0)
		expect(segs.map((s) => s.sign)).toEqual(['above', 'below'])
	})

	it('gives both segments a drawable path', () => {
		const segs = buildAreas(data, channels, xScale, yScale, colors, undefined, undefined, undefined, 0)
		for (const s of segs) {
			expect(s.d).toBeTruthy()
			expect(s.d).not.toContain('NaN')
		}
	})

	it('anchors both segments at the baseline pixel, not the chart bottom', () => {
		const segs = buildAreas(data, channels, xScale, yScale, colors, undefined, undefined, undefined, 0)
		const zeroPx = yScale(0)
		// Every anchor coordinate is the baseline pixel; nothing reaches the bottom (50).
		for (const s of segs) {
			expect(s.d).toContain(String(zeroPx))
		}
	})

	it('keeps the fill/stroke aesthetics it already resolved', () => {
		const segs = buildAreas(data, channels, xScale, yScale, colors, undefined, undefined, undefined, 0)
		expect(segs[0].fill).toBe('#888')
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run --project chart packages/chart/spec/geoms/area-baseline.spec.js`
Expected: FAIL — the split tests report a single segment with `sign: undefined`.

- [ ] **Step 3: Implement the split**

In `packages/chart/src/geoms/lib/areas.js`, add a 9th parameter and use it. Change the signature:

```js
export function buildAreas(
	data,
	channels,
	xScale,
	yScale,
	colors,
	curve,
	patterns,
	place = (x, y) => ({ x, y }),
	baselineValue = undefined
) {
```

Replace the hardcoded anchor:

```js
	// Anchor: an explicit baseline VALUE (data space) wins; otherwise the chart bottom.
	const hasBaseline = baselineValue !== undefined && baselineValue !== null
	const baseline = hasBaseline ? yScale(baselineValue) : yScale.range()[0]
```

Add a clamp parameter to the generator factory so a signed pass can clamp one side:

```js
	const makeGen = (clamp) => {
		const gen = area()
			.defined((p) => Number.isFinite(p.top.y) && (yf === undefined || yf === null || (p.v !== undefined && p.v !== null)))
			.x0((p) => p.base.x)
			.y0((p) => p.base.y)
			.x1((p) => p.top.x)
			.y1((p) => (clamp === 'above' ? Math.min(p.top.y, baseline) : clamp === 'below' ? Math.max(p.top.y, baseline) : p.top.y))
		if (curve === 'smooth') gen.curve(curveCatmullRom)
		else if (curve === 'step') gen.curve(curveStep)
		return gen
	}
```

Every existing `makeGen()` call site becomes `makeGen()` still (no clamp = unchanged behaviour).
Then, where a segment object is built, emit two signed copies instead of one when `hasBaseline`:

```js
	// One unsigned segment normally; with a baseline, an above and a below copy so themes can
	// colour positive vs negative fill independently. Mirrors Sparkline's #148 approach.
	const expand = (seg, rows) =>
		hasBaseline
			? [
					{ ...seg, d: makeGen('above')(rows.map(toEdge)), sign: 'above' },
					{ ...seg, d: makeGen('below')(rows.map(toEdge)), sign: 'below' }
				]
			: [seg]
```

Apply `expand(...)` to each segment the function currently returns, flattening the result. Keep
`key` unique per emitted segment by appending the sign (`key: seg.key ? `${seg.key}::${sign}` : sign`)
so Svelte's keyed each does not collide.

- [ ] **Step 4: Run the new test and the whole existing area suite**

Run: `bunx vitest run --project chart packages/chart/spec/geoms/area-baseline.spec.js`
Expected: PASS (5 tests)

Run: `bunx vitest run --project chart -t area`
Expected: PASS — **zero edits** to any pre-existing area spec. If one fails, the change is not
additive; fix the implementation, not the test.

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/geoms/lib/areas.js packages/chart/spec/geoms/area-baseline.spec.js
git commit -m "feat(chart): baseline-anchored negative-fill split in buildAreas

Ports the above/below fill split from Sparkline (#148) into the shared area
builder. Without a baseline the output is unchanged; with one, each segment is
emitted twice carrying sign: 'above' | 'below', both anchored at the baseline
pixel and clamped on opposite sides."
```

---

### Task 2: `Area` geom — forward the option, add the hooks

**Files:**
- Modify: `packages/chart/src/geoms/lib/marks/area.js`
- Modify: `packages/chart/src/geoms/Area.svelte`
- Test: `packages/chart/spec/geoms/area-baseline.spec.js` (append)

- [ ] **Step 1: Write the failing test**

Append to `packages/chart/spec/geoms/area-baseline.spec.js`. This needs a rendered geom, so use the
existing `TestArea`-style harness convention — create `packages/chart/spec/helpers/TestArea.svelte`:

```svelte
<script>
	import { setContext, untrack } from 'svelte'
	import Area from '../../src/geoms/Area.svelte'

	let { state, x = 'x', y = 'y', options = {} } = $props()
	setContext('plot-state', untrack(() => state))
</script>

<svg>
	<Area {x} {y} {options} />
</svg>
```

Then append this describe block to the spec:

```js
import { render } from '@testing-library/svelte'
import TestArea from '../helpers/TestArea.svelte'
import { createMockState } from '../helpers/mock-plot-state.js'

describe('Area geom — baseline hooks', () => {
	const state = () =>
		createMockState({
			xScale: scaleLinear().domain([0, 2]).range([0, 100]),
			yScale: scaleLinear().domain([-5, 5]).range([50, 0]),
			geomData: () => data,
			colors: new Map([[undefined, { fill: '#888', stroke: '#888' }]])
		})

	it('keeps the existing hooks untouched without a baseline', () => {
		const { container } = render(TestArea, { state: state() })
		expect(container.querySelector('[data-plot-geom="area"]')).toBeTruthy()
		expect(container.querySelector('[data-plot-element="area"]')).toBeTruthy()
		expect(container.querySelector('[data-plot-area-sign]')).toBeNull()
	})

	it('adds data-plot-area to every segment', () => {
		const { container } = render(TestArea, { state: state() })
		expect(container.querySelector('[data-plot-area]')).toBeTruthy()
	})

	it('emits above and below signed segments with a baseline', () => {
		const { container } = render(TestArea, { state: state(), options: { baseline: 0 } })
		expect(container.querySelector('[data-plot-area-sign="above"]')).toBeTruthy()
		expect(container.querySelector('[data-plot-area-sign="below"]')).toBeTruthy()
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run --project chart packages/chart/spec/geoms/area-baseline.spec.js`
Expected: FAIL — no `[data-plot-area]`, no signed segments.

- [ ] **Step 3: Forward the option**

In `packages/chart/src/geoms/lib/marks/area.js`, pass the baseline through to `buildAreas` as the new
9th argument:

```js
	const raw = buildAreas(
		data,
		channels,
		xScale,
		yScale,
		colors,
		options.curve,
		plot.patterns,
		plot.isFlipped ? plot.place : undefined,
		options.baseline
	)
```

Carry `sign` onto the returned mark objects so the template can read it:

```js
		return { ...seg, fill, stroke, alpha: a, sign: seg.sign }
```

- [ ] **Step 4: Add the attributes**

In `packages/chart/src/geoms/Area.svelte`, add `baseline` to the `Options` type:

```ts
	type Options = { curve?: 'linear' | 'smooth' | 'step'; baseline?: number }
```

On both segment `<path>` elements (the fill path and the pattern overlay path), add the two new
attributes alongside the existing `data-plot-element="area"` — do not remove or rename anything:

```svelte
			<path
				d={seg.d}
				fill={seg.fill}
				fill-opacity={seg.patternId ? 1 : seg.alpha}
				stroke={seg.stroke ?? 'none'}
				data-plot-element="area"
				data-plot-area
				data-plot-area-sign={seg.sign}
			/>
```

`data-plot-area-sign={undefined}` renders no attribute, so the no-baseline case is unchanged.

- [ ] **Step 5: Run tests**

Run: `bunx vitest run --project chart packages/chart/spec/geoms/area-baseline.spec.js`
Expected: PASS (8 tests)

Run: `bunx vitest run --project chart`
Expected: PASS, all files, **no pre-existing spec edited**.

- [ ] **Step 6: Commit**

```bash
git add packages/chart/src/geoms/lib/marks/area.js packages/chart/src/geoms/Area.svelte \
        packages/chart/spec/geoms/area-baseline.spec.js packages/chart/spec/helpers/TestArea.svelte
git commit -m "feat(chart): Area accepts options.baseline; adds data-plot-area hooks

Attribute-additive: data-plot-geom and data-plot-element are untouched, so every
existing chart consumer and Area test is unaffected. data-plot-area is always
emitted; data-plot-area-sign only when a baseline splits the fill."
```

---

### Task 3: `SparkState` — data, channels, dimensions, scales

**Files:**
- Create: `packages/chart/src/SparkState.svelte.js`
- Test: `packages/chart/spec/SparkState.spec.js`

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest'
import { SparkState } from '../src/SparkState.svelte.js'

const rows = [
	{ day: 0, sales: 10 },
	{ day: 1, sales: 30 },
	{ day: 2, sales: 20 }
]
const make = (over = {}) =>
	new SparkState({ data: rows, channels: { x: 'day', y: 'sales' }, width: 80, height: 24, ...over })

describe('SparkState — dimensions and data', () => {
	it('exposes width/height as the inner box (sparks have no margin)', () => {
		const s = make()
		expect(s.innerWidth).toBe(80)
		expect(s.innerHeight).toBe(24)
	})

	it('defaults to 80x24', () => {
		const s = new SparkState({ data: rows, channels: { x: 'day', y: 'sales' } })
		expect(s.innerWidth).toBe(80)
		expect(s.innerHeight).toBe(24)
	})

	it('returns the same array identity it was given', () => {
		const s = make()
		expect(s.data).toBe(rows)
	})

	it('exposes the channels it was configured with', () => {
		expect(make().channels).toEqual({ x: 'day', y: 'sales' })
	})
})

describe('SparkState — scales', () => {
	it('builds an x scale spanning the full width', () => {
		const s = make()
		expect(s.xScale.range()).toEqual([0, 80])
	})

	it('builds an inverted y scale spanning the full height', () => {
		const s = make()
		expect(s.yScale.range()).toEqual([24, 0])
	})

	it('maps the max value to the top of the box', () => {
		const s = make()
		expect(s.yScale(30)).toBeLessThan(s.yScale(10))
	})

	it('honours an explicit min/max domain', () => {
		const s = make({ min: 0, max: 100 })
		expect(s.yScale.domain()).toEqual([0, 100])
	})

	it('extends the domain to include the baseline', () => {
		const s = make({ baseline: 0, data: [{ day: 0, sales: 5 }, { day: 1, sales: 9 }] })
		expect(s.yScale.domain()[0]).toBeLessThanOrEqual(0)
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run --project chart packages/chart/spec/SparkState.spec.js`
Expected: FAIL — "Failed to resolve import ... SparkState.svelte.js"

- [ ] **Step 3: Implement**

Create `packages/chart/src/SparkState.svelte.js`:

```js
import { buildUnifiedXScale, buildUnifiedYScale } from './lib/plot/scales.js'
import { defaultPreset } from './lib/preset.js'

/**
 * A lean, PlotState-compatible context for inline sparks.
 *
 * Published on the SAME 'plot-state' context key as PlotState, so every existing
 * geom resolves it with no changes. It composes the same pure modules PlotState
 * does and deliberately omits everything an 80x24 glyph has no use for: zoom,
 * crossfilter, selection, facets, patterns, symbols, tooltip/format helpers, axis
 * positions, orientation flipping and animation gating.
 *
 * See docs/superpowers/specs/2026-08-20-spark-plot-geom-architecture-design.md
 */
export class SparkState {
	#rawData = $state([])
	#channels = $state({})
	#width = $state(80)
	#height = $state(24)
	#min = $state(undefined)
	#max = $state(undefined)
	#baseline = $state(undefined)

	constructor(config = {}) {
		this.update(config)
	}

	/** Re-apply config; Spark calls this from an $effect so props stay live. */
	update(config = {}) {
		this.#rawData = config.data ?? []
		this.#channels = config.channels ?? {}
		this.#width = config.width ?? 80
		this.#height = config.height ?? 24
		this.#min = config.min
		this.#max = config.max
		this.#baseline = config.baseline
	}

	get data() {
		return this.#rawData
	}
	get channels() {
		return this.#channels
	}
	get innerWidth() {
		return this.#width
	}
	get innerHeight() {
		return this.#height
	}
	get chartPreset() {
		return defaultPreset
	}

	#yDomain = $derived.by(() => {
		if (this.#min !== undefined && this.#max !== undefined) return [this.#min, this.#max]
		const values = this.#rawData
			.map((d) => Number(d[this.#channels.y]))
			.filter((v) => Number.isFinite(v))
		if (!values.length) return undefined
		let lo = this.#min ?? Math.min(...values)
		let hi = this.#max ?? Math.max(...values)
		// Keep the baseline (and the full negative extent) on-canvas.
		if (this.#baseline !== undefined) {
			lo = Math.min(lo, this.#baseline)
			hi = Math.max(hi, this.#baseline)
		}
		return [lo, hi]
	})

	xScale = $derived.by(() =>
		buildUnifiedXScale([this.#rawData], this.#channels.x, this.#width, { nice: false })
	)

	yScale = $derived.by(() =>
		buildUnifiedYScale([this.#rawData], this.#channels.y, this.#height, {
			domain: this.#yDomain
		})
	)
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run --project chart packages/chart/spec/SparkState.spec.js`
Expected: PASS (9 tests)

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/SparkState.svelte.js packages/chart/spec/SparkState.spec.js
git commit -m "feat(chart): SparkState core — data, channels, dimensions, scales"
```

---

### Task 4: `SparkState` — geom lifecycle

**Files:**
- Modify: `packages/chart/src/SparkState.svelte.js`
- Test: `packages/chart/spec/SparkState.spec.js` (append)

- [ ] **Step 1: Write the failing test**

```js
describe('SparkState — geom lifecycle', () => {
	const cfg = { type: 'line', channels: { x: 'day', y: 'sales' }, stat: 'identity' }

	it('returns a distinct id per registered geom', () => {
		const s = make()
		expect(s.registerGeom(cfg)).not.toBe(s.registerGeom(cfg))
	})

	it('geomData returns the raw rows for stat=identity', () => {
		const s = make()
		expect(s.geomData(s.registerGeom(cfg))).toBe(s.data)
	})

	it('geomData returns [] for an unknown id', () => {
		expect(make().geomData('nope')).toEqual([])
	})

	it('aggregates when a stat is set', () => {
		const s = new SparkState({
			data: [
				{ k: 'a', v: 1 },
				{ k: 'a', v: 3 },
				{ k: 'b', v: 5 }
			],
			channels: { x: 'k', y: 'v' }
		})
		const id = s.registerGeom({ type: 'bar', channels: { x: 'k', y: 'v' }, stat: 'sum' })
		const out = s.geomData(id)
		expect(out).toHaveLength(2)
		expect(out.find((r) => r.k === 'a').v).toBe(4)
	})

	it('updateGeom changes what geomData returns', () => {
		const s = make()
		const id = s.registerGeom(cfg)
		s.updateGeom(id, { channels: cfg.channels, stat: 'identity' })
		expect(s.geomData(id)).toBe(s.data)
	})

	it('unregisterGeom removes it', () => {
		const s = make()
		const id = s.registerGeom(cfg)
		s.unregisterGeom(id)
		expect(s.geomData(id)).toEqual([])
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run --project chart packages/chart/spec/SparkState.spec.js`
Expected: FAIL — "s.registerGeom is not a function"

- [ ] **Step 3: Implement**

Add to `SparkState.svelte.js` — import `applyGeomStat` at the top:

```js
import { applyGeomStat } from './lib/plot/stat.js'
```

Add a module-level counter and the four methods:

```js
let nextId = 0
```

```js
	#geoms = $state([])

	registerGeom(config) {
		const id = `spark-geom-${nextId++}`
		this.#geoms = [...this.#geoms, { id, ...config }]
		return id
	}

	updateGeom(id, config) {
		this.#geoms = this.#geoms.map((g) => (g.id === id ? { ...g, ...config } : g))
	}

	unregisterGeom(id) {
		this.#geoms = this.#geoms.filter((g) => g.id !== id)
	}

	geomData(id) {
		const geom = this.#geoms.find((g) => g.id === id)
		if (!geom) return []
		const stat = geom.stat ?? 'identity'
		// Identity returns the SAME array identity as `data` — geoms call
		// data.indexOf(row) and a copy would break it (see spec §2).
		if (stat === 'identity') return this.#rawData
		return applyGeomStat(this.#rawData, { stat, channels: { ...this.#channels, ...geom.channels } })
	}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run --project chart packages/chart/spec/SparkState.spec.js`
Expected: PASS (15 tests)

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/SparkState.svelte.js packages/chart/spec/SparkState.spec.js
git commit -m "feat(chart): SparkState geom lifecycle — register/update/unregister/geomData"
```

---

### Task 5: `SparkState` — aesthetics and inert members

**Files:**
- Modify: `packages/chart/src/SparkState.svelte.js`
- Test: `packages/chart/spec/SparkState.spec.js` (append)

- [ ] **Step 1: Write the failing test**

```js
describe('SparkState — aesthetics', () => {
	it('assigns a colour per distinct series value', () => {
		const s = new SparkState({
			data: [
				{ x: 0, y: 1, k: 'a' },
				{ x: 1, y: 2, k: 'b' }
			],
			channels: { x: 'x', y: 'y', color: 'k' }
		})
		expect(s.colors.size).toBe(2)
		expect(s.colors.get('a')).toHaveProperty('fill')
	})

	it('yields a single-entry palette with no colour channel', () => {
		expect(make().colors.size).toBeLessThanOrEqual(1)
	})

	it('exposes the default geom preset', () => {
		expect(make().chartPreset).toHaveProperty('opacity')
	})
})

describe('SparkState — inert members geoms still read', () => {
	const s = make()

	it('place is identity — sparks never flip', () => {
		expect(s.place(3, 7)).toEqual({ x: 3, y: 7 })
	})

	it('reports a non-flipped vertical orientation', () => {
		expect(s.isFlipped).toBe(false)
		expect(s.orientation).toBe('vertical')
	})

	it('has empty pattern and symbol maps', () => {
		expect(s.patterns.size).toBe(0)
		expect(s.symbols.size).toBe(0)
	})

	it('is non-interactive with no continuous colour scale', () => {
		expect(s.interactive).toBe(false)
		expect(s.continuousColorScale).toBe(null)
		expect(s.continuousCategory).toBe(false)
	})

	it('hover and select handlers are safe no-ops', () => {
		expect(() => s.setHovered({}, 0)).not.toThrow()
		expect(() => s.clearHovered()).not.toThrow()
		expect(() => s.handleSelect({})).not.toThrow()
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run --project chart packages/chart/spec/SparkState.spec.js`
Expected: FAIL — "Cannot read properties of undefined (reading 'size')"

- [ ] **Step 3: Implement**

Import the colour helpers:

```js
import { distinct, assignColors } from './lib/brewing/colors.js'
```

Add:

```js
	colors = $derived.by(() => {
		const field = this.#channels.color ?? this.#channels.fill
		const values = field ? distinct(this.#rawData, field) : [undefined]
		return assignColors(values, 'light', defaultPreset)
	})

	// ─── Inert members ────────────────────────────────────────────────────────
	// Geoms read these; a spark has no use for any of them. Kept explicit (rather
	// than absent) so the contract test in spec/spark-contract.spec.js can assert
	// the full geom-facing surface.
	get patterns() {
		return new Map()
	}
	get symbols() {
		return new Map()
	}
	get isFlipped() {
		return false
	}
	get orientation() {
		return 'vertical'
	}
	get continuousCategory() {
		return false
	}
	get continuousColorScale() {
		return null
	}
	get interactive() {
		return false
	}
	place(u, v) {
		return { x: u, y: v }
	}
	setHovered() {}
	clearHovered() {}
	handleSelect() {}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run --project chart packages/chart/spec/SparkState.spec.js`
Expected: PASS (23 tests)

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/SparkState.svelte.js packages/chart/spec/SparkState.spec.js
git commit -m "feat(chart): SparkState aesthetics + inert geom-facing members"
```

---

### Task 6: Conformance test against `PlotState`

**Files:**
- Modify: `packages/chart/src/SparkState.svelte.js` (export the contract)
- Create: `packages/chart/spec/spark-contract.spec.js`

This is the guard against the one standing risk: `PlotState` growing a member geoms read while
`SparkState` silently doesn't have it.

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest'
import { SparkState, GEOM_CONTRACT } from '../src/SparkState.svelte.js'
import { PlotState } from '../src/PlotState.svelte.js'

/**
 * GEOM_CONTRACT is the set of members every geom reads off its context, derived by
 * static scan of geoms/ (`plot.*` in adapters, `plotState.*` in components).
 *
 * If a geom starts reading something new, add it here — the failure you get is the
 * point: it tells you SparkState needs it too, instead of a consumer's table cell
 * throwing at runtime.
 */
const spark = new SparkState({ data: [{ x: 0, y: 1 }], channels: { x: 'x', y: 'y' } })
const plot = new PlotState({ data: [{ x: 0, y: 1 }], channels: { x: 'x', y: 'y' } })

const has = (obj, key) => key in obj || obj[key] !== undefined

describe('SparkState conformance', () => {
	it('the contract is non-empty', () => {
		expect(GEOM_CONTRACT.length).toBeGreaterThan(20)
	})

	it.each(GEOM_CONTRACT)('SparkState provides %s', (key) => {
		expect(has(spark, key)).toBe(true)
	})

	it.each(GEOM_CONTRACT)('PlotState also provides %s (contract is accurate)', (key) => {
		expect(has(plot, key)).toBe(true)
	})

	it.each(GEOM_CONTRACT)('%s is the same kind on both', (key) => {
		expect(typeof spark[key]).toBe(typeof plot[key])
	})
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run --project chart packages/chart/spec/spark-contract.spec.js`
Expected: FAIL — `GEOM_CONTRACT` is not exported.

- [ ] **Step 3: Export the contract**

At the top of `packages/chart/src/SparkState.svelte.js`:

```js
/**
 * Every member a geom reads off its context. SparkState must implement all of it or
 * geoms break at runtime inside <Spark>. Enforced by spec/spark-contract.spec.js.
 */
export const GEOM_CONTRACT = [
	// scales + dimensions
	'xScale',
	'yScale',
	'innerWidth',
	'innerHeight',
	// geom lifecycle
	'registerGeom',
	'updateGeom',
	'unregisterGeom',
	'geomData',
	// data
	'data',
	'channels',
	// aesthetics
	'colors',
	'patterns',
	'symbols',
	'chartPreset',
	// orientation
	'place',
	'isFlipped',
	'orientation',
	// colour typing
	'continuousCategory',
	'continuousColorScale',
	// interactivity
	'interactive',
	'handleSelect',
	'setHovered',
	'clearHovered'
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run --project chart packages/chart/spec/spark-contract.spec.js`
Expected: PASS

- [ ] **Step 5: Prove the guard actually guards**

Temporarily comment out the `place` method in `SparkState`, re-run, and confirm the
`SparkState provides place` case FAILS. Restore it, re-run, confirm green. Do not commit the
commented-out version.

- [ ] **Step 6: Commit**

```bash
git add packages/chart/src/SparkState.svelte.js packages/chart/spec/spark-contract.spec.js
git commit -m "test(chart): conformance test pinning SparkState to the geom contract

Fails in CI the moment SparkState and PlotState diverge on anything a geom reads,
rather than at runtime in a consumer's table cell. Verified by removing a member
and watching the case fail."
```

---

### Task 7: `Spark` container

**Files:**
- Create: `packages/chart/src/Spark.svelte`
- Test: `packages/chart/spec/Spark.spec.svelte.js`

- [ ] **Step 1: Write the failing test**

```js
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import SparkHarness from './helpers/SparkHarness.svelte'

const rows = [
	{ day: 0, sales: 10 },
	{ day: 1, sales: -4 },
	{ day: 2, sales: 20 }
]

describe('Spark container', () => {
	it('renders an svg at the given size', () => {
		const { container } = render(SparkHarness, { data: rows, width: 80, height: 24 })
		const svg = container.querySelector('svg')
		expect(svg.getAttribute('width')).toBe('80')
		expect(svg.getAttribute('height')).toBe('24')
	})

	it('defaults to 80x24', () => {
		const { container } = render(SparkHarness, { data: rows })
		const svg = container.querySelector('svg')
		expect(svg.getAttribute('width')).toBe('80')
		expect(svg.getAttribute('height')).toBe('24')
	})

	it('renders no axes, grid or legend', () => {
		const { container } = render(SparkHarness, { data: rows })
		expect(container.querySelector('[data-plot-axis]')).toBeNull()
		expect(container.querySelector('[data-plot-grid]')).toBeNull()
		expect(container.querySelector('[data-plot-legend]')).toBeNull()
	})

	it('provides context so a child geom renders', () => {
		const { container } = render(SparkHarness, { data: rows })
		expect(container.querySelector('[data-plot-geom="line"]')).toBeTruthy()
	})

	it('draws a baseline line when given a baseline', () => {
		const { container } = render(SparkHarness, { data: rows, baseline: 0 })
		expect(container.querySelector('[data-plot-baseline]')).toBeTruthy()
	})

	it('omits the baseline line otherwise', () => {
		const { container } = render(SparkHarness, { data: rows })
		expect(container.querySelector('[data-plot-baseline]')).toBeNull()
	})

	it('renders pattern defs so pattern fills resolve', () => {
		const { container } = render(SparkHarness, { data: rows })
		expect(container.querySelector('defs')).toBeTruthy()
	})
})
```

Create `packages/chart/spec/helpers/SparkHarness.svelte`:

```svelte
<script>
	import Spark from '../../src/Spark.svelte'
	import Line from '../../src/geoms/Line.svelte'

	let { data = [], width = undefined, height = undefined, baseline = undefined } = $props()
</script>

<Spark {data} x="day" y="sales" {width} {height} {baseline}>
	<Line />
</Spark>
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run --project chart packages/chart/spec/Spark.spec.svelte.js`
Expected: FAIL — cannot resolve `../../src/Spark.svelte`

- [ ] **Step 3: Implement**

Create `packages/chart/src/Spark.svelte`:

```svelte
<script lang="ts">
	import { setContext, untrack } from 'svelte'
	import type { Snippet } from 'svelte'
	import { SparkState } from './SparkState.svelte.js'
	import DefinePatterns from './patterns/DefinePatterns.svelte'

	type Row = Record<string, unknown>

	type Props = {
		data?: Row[]
		x?: string
		y?: string
		color?: string
		width?: number
		height?: number
		min?: number
		max?: number
		/** Anchor value: extends the domain AND draws a reference line. */
		baseline?: number
		children?: Snippet
	}

	let {
		data = [],
		x = undefined,
		y = undefined,
		color = undefined,
		width = 80,
		height = 24,
		min = undefined,
		max = undefined,
		baseline = undefined,
		children
	}: Props = $props()

	const config = () => ({
		data,
		channels: { x, y, color },
		width,
		height,
		min,
		max,
		baseline
	})

	// untrack: the constructor must not register the initial read as a dependency.
	const state = untrack(() => new SparkState(config()))
	setContext('plot-state', state)
	$effect(() => {
		state.update(config())
	})

	const baselineY = $derived(baseline === undefined ? null : state.yScale(baseline))
</script>

<svg {width} {height} data-spark style="overflow: visible; display: block;">
	<defs>
		<DefinePatterns />
	</defs>

	{#if baselineY !== null}
		<line x1={0} y1={baselineY} x2={width} y2={baselineY} data-plot-baseline />
	{/if}

	{@render children?.()}
</svg>

<style>
	[data-plot-baseline] {
		stroke: var(--chart-baseline-color, currentColor);
		stroke-width: 1;
		opacity: 0.35;
	}
</style>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run --project chart packages/chart/spec/Spark.spec.svelte.js`
Expected: PASS (7 tests)

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/Spark.svelte packages/chart/spec/Spark.spec.svelte.js \
        packages/chart/spec/helpers/SparkHarness.svelte
git commit -m "feat(chart): Spark container — geom context, pattern defs, baseline line"
```

---

### Task 8: Export `Spark` and `SparkState`

**Files:**
- Modify: `packages/chart/src/index.js`
- Test: `packages/chart/spec/exports.spec.js` (append)

- [ ] **Step 1: Write the failing test**

Append to `packages/chart/spec/exports.spec.js`:

```js
	it('exports Spark and SparkState', async () => {
		const mod = await import('../src/index.js')
		expect(mod.Spark).toBeTruthy()
		expect(mod.SparkState).toBeTruthy()
	})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bunx vitest run --project chart packages/chart/spec/exports.spec.js`
Expected: FAIL — `mod.Spark` is undefined.

- [ ] **Step 3: Add the exports**

In `packages/chart/src/index.js`, next to the existing `Sparkline` export:

```js
export { default as Spark } from './Spark.svelte'
export { SparkState, GEOM_CONTRACT } from './SparkState.svelte.js'
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bunx vitest run --project chart packages/chart/spec/exports.spec.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/index.js packages/chart/spec/exports.spec.js
git commit -m "feat(chart): export Spark, SparkState, GEOM_CONTRACT"
```

---

### Task 9: `Sparkline` becomes a wrapper

**Files:**
- Modify: `packages/chart/src/Sparkline.svelte`
- Test: `packages/chart/spec/Sparkline.spec.js` — **read only, do not edit**

This is the task the whole plan exists to make safe. The 27 existing tests are the specification.

- [ ] **Step 1: Establish the baseline**

Run: `bunx vitest run --project chart packages/chart/spec/Sparkline.spec.js`
Expected: PASS (27 tests). Record the number — it must not change.

- [ ] **Step 2: Rewrite `Sparkline` as a wrapper**

Replace the body of `packages/chart/src/Sparkline.svelte`. Keep the **entire existing props block
unchanged** (`data`, `field`, `type`, `curve`, `color`, `pattern`, `width`, `height`, `min`, `max`,
`baseline`, `highlight`, `trend`) — only the internals change:

```svelte
<script lang="ts">
	import Spark from './Spark.svelte'
	import Line from './geoms/Line.svelte'
	import Area from './geoms/Area.svelte'
	import Bar from './geoms/Bar.svelte'
	import Trend from './geoms/Trend.svelte'
	import Highlight from './geoms/Highlight.svelte'
	import { PATTERNS } from './patterns/patterns.js'

	// ...KEEP the existing Props type and destructuring verbatim...

	// Normalise number[] | Record[] to rows the geoms understand.
	const values = $derived(
		data.map((d) => (field && typeof d === 'object' && d !== null ? Number(d[field]) : Number(d)))
	)
	const rows = $derived(values.map((v, i) => ({ x: i, y: v })))

	// A bar spark with negatives is meaningless measured from the pixel bottom, so it
	// auto-anchors at 0. Everything else is opt-in. (Preserved from the original.)
	const hasNegative = $derived(values.some((v) => v < 0))
	const effectiveBaseline = $derived(baseline ?? (type === 'bar' && hasNegative ? 0 : undefined))

	const geomOptions = $derived({ curve, baseline: effectiveBaseline })
</script>

<Spark
	data={rows}
	x="x"
	y="y"
	{color}
	{width}
	{height}
	{min}
	{max}
	baseline={effectiveBaseline}
>
	{#if type === 'line'}
		<Line options={geomOptions} />
	{:else if type === 'area'}
		<Area options={geomOptions} {pattern} />
	{:else if type === 'bar'}
		<Bar options={geomOptions} {pattern} />
	{/if}

	{#if trend !== undefined}
		<Trend {trend} x="x" y="y" />
	{/if}
	{#if highlight !== undefined}
		<Highlight {highlight} x="x" y="y" />
	{/if}
</Spark>
```

- [ ] **Step 3: Run the untouched suite**

Run: `bunx vitest run --project chart packages/chart/spec/Sparkline.spec.js`
Expected: PASS (27 tests), **spec file unedited**.

If any fail, diff the rendered DOM against what the test expects and fix `Spark`/the geom — not the
test. The likely culprits, in order: (a) `Bar` needs a band x scale — `buildBars` calls `ensureBandX`
so it should cope, but verify bar count and widths; (b) pattern fills need the pattern registered in
`DefinePatterns`; (c) `Highlight`/`Trend` read `x`/`y` channels that must match the `rows` shape.

- [ ] **Step 4: Run the e2e suite**

Run: `cd apps/learn && npx playwright test sparkline.e2e.ts`
Expected: PASS, spec unedited.

- [ ] **Step 5: Commit**

```bash
git add packages/chart/src/Sparkline.svelte
git commit -m "refactor(chart): Sparkline composes Spark + geoms

Same props, same DOM hooks. The 27 existing specs and sparkline.e2e.ts pass
unmodified — that is the definition of backward compatible here, not an
assurance. Removes the parallel render path: line/area/bar geometry, scales and
pattern handling now come from the same geoms the full charts use."
```

---

### Task 10: Browser-mode geometry parity

**Files:**
- Create: `packages/chart/browser/fixtures/SparkParity.svelte`
- Create: `packages/chart/browser/Spark.browser.spec.ts`

The silent-stub risk: `SparkState` no-ops `place`/`setHovered`/`handleSelect`. If a geom leans on one,
it fails quietly. Real geometry is the check.

- [ ] **Step 1: Write the fixture**

```svelte
<script lang="ts">
	import Plot from '../../src/Plot.svelte'
	import Spark from '../../src/Spark.svelte'
	import Line from '../../src/geoms/Line.svelte'

	const { data = [], width = 200, height = 100 }: Record<string, unknown> = $props()
</script>

<!-- Same geom, same data, same box — one in Plot with all chrome off, one in Spark.
     The rendered path must be identical. -->
<div data-plot-side>
	<Plot {data} x="x" y="y" {width} {height} axes={false} grid={false} legend={false} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
		<Line />
	</Plot>
</div>
<div data-spark-side>
	<Spark {data} x="x" y="y" {width} {height}>
		<Line />
	</Spark>
</div>
```

- [ ] **Step 2: Write the failing test**

```ts
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import SparkParity from './fixtures/SparkParity.svelte'

/**
 * JSDOM reports 0 for all geometry, so this parity check is only meaningful in a
 * real browser. It is the guard against SparkState's no-op members (place,
 * setHovered, handleSelect) silently changing what a geom renders.
 */
const data = [
	{ x: 0, y: 5 },
	{ x: 1, y: 9 },
	{ x: 2, y: 3 },
	{ x: 3, y: 7 }
]

const pathIn = (root: Element, side: string) =>
	root.querySelector(`[${side}] [data-plot-geom="line"] path`) as SVGPathElement

describe('Spark vs Plot geometry parity', () => {
	it('renders a line in both containers', async () => {
		const { container } = render(SparkParity, { data, width: 200, height: 100 })
		await new Promise((r) => requestAnimationFrame(() => r(null)))
		expect(pathIn(container, 'data-plot-side')).toBeTruthy()
		expect(pathIn(container, 'data-spark-side')).toBeTruthy()
	})

	it('produces the identical path geometry', async () => {
		const { container } = render(SparkParity, { data, width: 200, height: 100 })
		await new Promise((r) => requestAnimationFrame(() => r(null)))
		const a = pathIn(container, 'data-plot-side').getAttribute('d')
		const b = pathIn(container, 'data-spark-side').getAttribute('d')
		expect(b).toBe(a)
	})

	it('occupies the same real pixel box', async () => {
		const { container } = render(SparkParity, { data, width: 200, height: 100 })
		await new Promise((r) => requestAnimationFrame(() => r(null)))
		const a = pathIn(container, 'data-plot-side').getBoundingClientRect()
		const b = pathIn(container, 'data-spark-side').getBoundingClientRect()
		expect(b.width).toBeCloseTo(a.width, 0)
		expect(b.height).toBeCloseTo(a.height, 0)
	})
})
```

- [ ] **Step 3: Run it**

Run: `bunx vitest run --config vitest.browser.config.ts packages/chart/browser/Spark.browser.spec.ts`

If the paths differ, that is a **real finding** — `SparkState` is not equivalent to `PlotState` for
this geom. Diff the two `d` attributes, identify which context member causes it, and fix `SparkState`.
Do not relax the assertion to make it pass. If the difference turns out to be legitimate (e.g. Plot
applies `nice()` to the domain and Spark deliberately does not), pass an explicit matching domain in
the fixture and document why in a comment.

- [ ] **Step 4: Commit**

```bash
git add packages/chart/browser/
git commit -m "test(chart): browser-mode Spark-vs-Plot geometry parity

Guards SparkState's no-op members (place/setHovered/handleSelect) against
silently changing rendered output. Requires real layout, so it cannot live in the
jsdom suite."
```

---

### Task 11: Measure the perf claim

**Files:**
- Create: `packages/chart/browser/spark-perf.browser.spec.ts`

The spec commits to reporting a measured number rather than asserting `SparkState` is cheaper.

- [ ] **Step 1: Write the measurement**

```ts
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import SparkGrid from './fixtures/SparkGrid.svelte'
import PlotGrid from './fixtures/PlotGrid.svelte'

/**
 * Not a threshold test — a measurement. It asserts only that both render, and logs
 * the numbers so the perf claim in the spec is backed by evidence rather than
 * assumption. Do not turn this into a hard budget; machine variance makes that flaky.
 */
const rows = Array.from({ length: 12 }, (_, i) => ({ x: i, y: Math.sin(i) * 10 + 10 }))
const CELLS = 200

const timed = (fn: () => void) => {
	const t0 = performance.now()
	fn()
	return performance.now() - t0
}

describe('Spark vs Plot cost at table scale', () => {
	it(`renders ${CELLS} cells both ways and reports the cost`, () => {
		const sparkMs = timed(() => render(SparkGrid, { rows, count: CELLS }))
		const plotMs = timed(() => render(PlotGrid, { rows, count: CELLS }))
		console.log(`[perf] ${CELLS} cells — Spark ${sparkMs.toFixed(0)}ms, Plot ${plotMs.toFixed(0)}ms`)
		expect(sparkMs).toBeGreaterThan(0)
		expect(plotMs).toBeGreaterThan(0)
	})
})
```

Create the two fixtures — `SparkGrid.svelte` and `PlotGrid.svelte` — each looping `count` times over
the same rows, one using `<Spark><Line/></Spark>`, the other `<Plot axes={false} grid={false}
legend={false}><Line/></Plot>` at 80×24.

- [ ] **Step 2: Run and record the number**

Run: `bunx vitest run --config vitest.browser.config.ts packages/chart/browser/spark-perf.browser.spec.ts`

Copy the logged `[perf]` line into the commit message. **If `Spark` is not materially cheaper, say so
plainly** — the composition win stands on its own and the spec's risk table already allows for this
outcome. Do not quietly drop the measurement.

- [ ] **Step 3: Commit**

```bash
git add packages/chart/browser/
git commit -m "test(chart): measure Spark vs Plot cost at 200-cell table scale

<paste the [perf] line here>"
```

---

### Task 12: Docs, demo and journal

**Files:**
- Modify: `docs/design/20-chart.md` (exports), `docs/design/21-charts.md` (Spark section)
- Modify: `apps/learn` — chart guide + a live `Spark` example
- Modify: `agents/journal.md`, `docs/design/12-priority.md`

- [ ] **Step 1: Document the composition API**

Add a `Spark` section to `docs/design/21-charts.md` covering: what it is, the `<Spark><Line/></Spark>`
composition, which geoms work inside it, the `baseline` prop doing double duty (domain + line), and
the documented limitation — no axes/legend/tooltip by design, use `Plot` with chrome off if you need
them.

- [ ] **Step 2: Add a live example**

Per the project's new-component workflow, add a live doc page rather than docs alone. Add a `Spark`
composition example to the chart guide in `apps/learn` showing a table column of sparks built with
`<Spark>` + `<Line>` alongside the existing `<Sparkline>` one-liner.

- [ ] **Step 3: Run the full gate**

```bash
bun run check
bun run test:browser
bun run coverage
```

Expected: all green. Coverage must hold 100% statements+lines on `SparkState.svelte.js` and the
`buildAreas` changes, ≥90% on `Spark.svelte` and `Sparkline.svelte`. If `SparkState` is short of 100%,
add the missing cases — do not lower the threshold.

- [ ] **Step 4: Update the journal and priority**

Add a dated `agents/journal.md` entry covering: the parallel-path problem, the `SparkState` contract
approach, the negative-fill port that made it possible, the measured perf number, and commit hashes.
Mark the item in `docs/design/12-priority.md`. Note that cycle 2 (radar) is now unblocked and that
`SparkRadar` is obsolete.

- [ ] **Step 5: Commit**

```bash
git add docs/ agents/journal.md apps/learn/
git commit -m "docs(chart): Spark composition API, live example, journal"
```

---

## Self-review

**Spec coverage:**

| Spec section | Task |
| --- | --- |
| §1 `SparkState` | 3, 4, 5 |
| §2 geom contract | 5, 6 |
| §3 conformance test | 6 |
| §4 `Spark` container | 7 |
| §5 `Sparkline` wrapper | 9 |
| §5a negative-fill port | 1, 2 |
| §5b hook mapping | 1, 2, 7, 9 |
| §6 exports | 8 |
| Criterion 2 (27 tests unmodified) | 9 |
| Criterion 3 (Area tests unmodified) | 1, 2 |
| Criterion 6 (geometry parity) | 10 |
| Criterion 8 (coverage) | 12 |
| Risk: perf unverified | 11 |
| Testing section | 3–7, 10, 11 |

**Type consistency:** `buildAreas`'s 9th parameter is `baselineValue` in Task 1 and is passed from
`options.baseline` in Task 2. Segments carry `sign` in Tasks 1, 2. `SparkState.update(config)` is
defined in Task 3 and called in Task 7. `GEOM_CONTRACT` is exported in Task 6 and imported in Task 6's
test and Task 8's export. `effectiveBaseline` in Task 9 feeds both `Spark`'s `baseline` prop and
`options.baseline`.

**Known ordering dependency:** Tasks 1–2 must land before Task 9, because `Sparkline`'s
`[data-plot-area-sign]` tests can only pass once `geoms/Area` provides those hooks.
