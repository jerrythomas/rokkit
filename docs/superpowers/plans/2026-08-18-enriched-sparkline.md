# Enriched Sparkline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add min/max/last **markers**, a **trend line**, and a **baseline** (which re-anchors bars so negative sparkbars render correctly) to `@rokkit/chart`'s standalone `Sparkline`, reusing the already-pure `resolveHighlight`/`computeTrend` utilities.

**Architecture:** `Sparkline.svelte` stays a lightweight standalone SVG island with its own tight `scaleLinear` x/y — no `PlotState`, no `PlotSurface`, no ResizeObserver (perf-safe for hundreds of sparklines in a table). It imports the pure, unit-tested `resolveHighlight` (`lib/highlight.js`) and `computeTrend` (`lib/trend.js`) via a trivial `rows = values.map((v,i)=>({x:i,y:v}))` adapter, and mirrors the geom overlays' `data-plot-*` attributes and `--chart-*` CSS tokens so a theme styles both paths identically.

**Tech Stack:** Svelte 5 (runes), d3-scale (`scaleLinear`), d3-shape (`line`), Vitest + `@testing-library/svelte`.

**Spec:** `docs/superpowers/specs/2026-08-18-enriched-sparkline-design.md`

---

## File Structure

- **Modify:** `packages/chart/src/Sparkline.svelte` — add `highlight`, `trend`, `baseline` props; a `rows` adapter; highlight-index / trend-path / baseline derivations; three new SVG groups; scoped styles mirroring the geom tokens. Rework `yMin`/`yMax` and the bar rect math for baseline anchoring.
- **Modify (tests):** `packages/chart/spec/Sparkline.spec.js` — add rendering/positioning tests for baseline (negative bars + auto-default + regression), markers, trend. (The math itself is already covered by `highlight`/`trend` util specs.)
- **Modify (docs):** `docs/design/20-chart.md` — expand the Sparkline section with the new props.
- **Modify (docs):** `apps/learn/src/lib/koan/demos/chart/meta.ts` — extend the sparkline demo snippet to show the enriched props.

No other files change. `packages/chart/src/lib/plot/scales.js` and `PlotState` are **not** touched. `packages/blocks/src/SparklinePlugin.svelte` spreads props, so it inherits the new props for free.

**Naming locked across tasks** (use these exact identifiers):
`baseline`, `highlight`, `trend` (props); `hasNegative`, `effectiveBaseline`, `rawMin`, `rawMax`, `yMin`, `yMax`, `barAnchorY`, `rows`, `highlightSelectors`, `highlightIndices`, `trendMethods`, `trendPaths` (derived). Data-attrs: `data-plot-baseline`, `data-plot-highlight`, `data-plot-trend`. Groups: `data-plot-geom="highlight"`, `data-plot-geom="trend"`.

---

## Task 1: Baseline — negative-bar re-anchor + smart default + reference rule

**Files:**
- Modify: `packages/chart/src/Sparkline.svelte` (props ~7-31; `yMin`/`yMax` at lines 39-40; bar block at lines 101-121; add baseline rule + scoped style)
- Test: `packages/chart/spec/Sparkline.spec.js`

**Behavior:** `baseline` is the value bars grow *from* (positive up, negative down). For `type="bar"` with any negative value and no explicit `baseline`, it **defaults to `0`**. All-positive bars with no baseline stay min-anchored (current look — no regression). When a baseline is in effect the y-domain extends to include it; explicit `min`/`max` still win. A reference `<line data-plot-baseline>` is drawn whenever a baseline is in effect.

- [ ] **Step 1: Write the failing tests**

Add to `packages/chart/spec/Sparkline.spec.js` inside the `describe('Sparkline', …)` block:

```js
it('re-anchors bars at an explicit baseline (negative bars hang down)', () => {
	// values [5,-5], height 40, domain [-5,5] → yScale(0)=20, yScale(5)=0, yScale(-5)=40
	const { container } = render(Sparkline, {
		data: [5, -5],
		type: 'bar',
		width: 100,
		height: 40,
		baseline: 0
	})
	const rects = container.querySelectorAll('rect')
	expect(rects.length).toBe(2)
	// positive bar grows UP from the zero line: top at 0, height 20
	expect(rects[0].getAttribute('y')).toBe('0')
	expect(rects[0].getAttribute('height')).toBe('20')
	// negative bar hangs DOWN from the zero line: top at 20, height 20
	expect(rects[1].getAttribute('y')).toBe('20')
	expect(rects[1].getAttribute('height')).toBe('20')
})

it('auto-defaults baseline to 0 for bars with negative values', () => {
	const { container } = render(Sparkline, {
		data: [5, -5],
		type: 'bar',
		width: 100,
		height: 40
	})
	const rects = container.querySelectorAll('rect')
	// same anchoring as explicit baseline={0}: negative bar hangs from the zero line
	expect(rects[1].getAttribute('y')).toBe('20')
	expect(rects[1].getAttribute('height')).toBe('20')
})

it('draws a baseline reference line when a baseline is in effect', () => {
	const { container } = render(Sparkline, {
		data: [5, -5],
		type: 'bar',
		width: 100,
		height: 40,
		baseline: 0
	})
	const line = container.querySelector('[data-plot-baseline]')
	expect(line).toBeTruthy()
	expect(line?.getAttribute('y1')).toBe('20')
	expect(line?.getAttribute('y2')).toBe('20')
})

it('keeps all-positive bars min-anchored with no baseline (regression)', () => {
	// domain [10,30] range [40,0] → yScale(10)=40 → shortest bar has height 0
	const { container } = render(Sparkline, {
		data: [10, 20, 30],
		type: 'bar',
		width: 100,
		height: 40
	})
	const rects = container.querySelectorAll('rect')
	expect(rects.length).toBe(3)
	expect(rects[0].getAttribute('height')).toBe('0')
	// no baseline line drawn when baseline is not in effect
	expect(container.querySelector('[data-plot-baseline]')).toBeNull()
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun run test:ui --filter chart -- Sparkline`

(From repo root. If the `--filter` form is unavailable, run from the package: `cd packages/chart && bun run test -- Sparkline` — but prefer the root script per the monorepo rule.)

Expected: the 4 new tests FAIL (baseline re-anchoring not implemented; `[data-plot-baseline]` absent). Existing tests PASS.

- [ ] **Step 3: Add the `baseline` prop**

In `packages/chart/src/Sparkline.svelte`, add `baseline` to the `Props` type (after `max?: number` at line 17):

```ts
		max?: number
		baseline?: number
```

And to the destructure (after `max = undefined` at line 30):

```js
		max = undefined,
		baseline = undefined
```

- [ ] **Step 4: Rework the domain + add baseline/anchor derivations**

Replace the current `yMin`/`yMax` block (lines 39-40):

```js
	const yMin = $derived(min ?? Math.min(...values))
	const yMax = $derived(max ?? Math.max(...values))
```

with:

```js
	const hasNegative = $derived(values.some((v) => v < 0))
	// Bars with negative values are meaningless when measured from the pixel bottom, so a
	// bar sparkline auto-anchors at 0 when any value is negative. Everything else is opt-in.
	const effectiveBaseline = $derived(baseline ?? (type === 'bar' && hasNegative ? 0 : undefined))

	const rawMin = $derived(Math.min(...values))
	const rawMax = $derived(Math.max(...values))
	// Explicit min/max win; otherwise extend the auto domain to include the baseline so it
	// (and the full negative extent) stay on-canvas.
	const yMin = $derived(
		min ?? (effectiveBaseline !== undefined ? Math.min(rawMin, effectiveBaseline) : rawMin)
	)
	const yMax = $derived(
		max ?? (effectiveBaseline !== undefined ? Math.max(rawMax, effectiveBaseline) : rawMax)
	)
```

Then add the bar anchor derivation just after the `yScale` definition (after line 47):

```js
	// When no baseline is in effect, anchor at the pixel bottom — preserves the classic
	// min-anchored sparkbar look (Math.min/abs below both collapse to the old formula).
	const barAnchorY = $derived(effectiveBaseline !== undefined ? yScale(effectiveBaseline) : height)
```

- [ ] **Step 5: Rework the bar rects to anchor at `barAnchorY`**

Replace the bar block (lines 101-121):

```svelte
	{:else if type === 'bar'}
		{#each values as v, i (i)}
			<rect
				x={xScale(i) - barWidth / 2}
				y={yScale(v)}
				width={barWidth}
				height={height - yScale(v)}
				fill={strokeColor}
			/>
			{#if patternMarks}
				<rect
					x={xScale(i) - barWidth / 2}
					y={yScale(v)}
					width={barWidth}
					height={height - yScale(v)}
					fill="url(#{patternId})"
					pointer-events="none"
				/>
			{/if}
		{/each}
	{/if}
```

with (compute the top/height once, use for both fill and pattern rects):

```svelte
	{:else if type === 'bar'}
		{#each values as v, i (i)}
			{@const vy = yScale(v)}
			{@const top = Math.min(vy, barAnchorY)}
			{@const barHeight = Math.abs(vy - barAnchorY)}
			<rect
				x={xScale(i) - barWidth / 2}
				y={top}
				width={barWidth}
				height={barHeight}
				fill={strokeColor}
			/>
			{#if patternMarks}
				<rect
					x={xScale(i) - barWidth / 2}
					y={top}
					width={barWidth}
					height={barHeight}
					fill="url(#{patternId})"
					pointer-events="none"
				/>
			{/if}
		{/each}
	{/if}
```

- [ ] **Step 6: Draw the baseline reference line**

Immediately **after** the closing `{/if}` of the type block (after the new bar block, before `</svg>` at line 122), add:

```svelte
	{#if effectiveBaseline !== undefined}
		{@const by = yScale(effectiveBaseline)}
		<line x1={0} y1={by} x2={width} y2={by} data-plot-baseline />
	{/if}
```

- [ ] **Step 7: Add the scoped baseline style**

In the component's `<style>` block (add one if none exists, immediately before the final `</svg>`-less end of file — this component currently has no `<style>`, so append it at the very end after `</svg>`):

```svelte
<style>
	[data-plot-baseline] {
		stroke: var(--chart-baseline-color, currentColor);
		stroke-width: var(--chart-baseline-width, 1);
		stroke-dasharray: var(--chart-baseline-dash, 4 4);
		opacity: var(--chart-baseline-opacity, 0.5);
		pointer-events: none;
	}
</style>
```

- [ ] **Step 8: Run the tests to verify they pass**

Run: `bun run test:ui --filter chart -- Sparkline`

Expected: all Sparkline tests PASS (4 new + existing).

- [ ] **Step 9: Commit**

```bash
git add packages/chart/src/Sparkline.svelte packages/chart/spec/Sparkline.spec.js
git commit -m "feat(chart): baseline anchors sparkline bars for negative values"
```

---

## Task 2: Highlight markers (min/max/last/index/predicate + array + dedup)

**Files:**
- Modify: `packages/chart/src/Sparkline.svelte` (add import, `rows`, `highlightSelectors`, `highlightIndices`, a `<g>` group, scoped style)
- Test: `packages/chart/spec/Sparkline.spec.js`

- [ ] **Step 1: Write the failing tests**

Add to `packages/chart/spec/Sparkline.spec.js`:

```js
it('renders highlight markers for min and max', () => {
	const { container } = render(Sparkline, {
		data: [10, 20, 30, 15],
		type: 'line',
		highlight: ['min', 'max']
	})
	const dots = container.querySelectorAll('[data-plot-highlight]')
	expect(dots.length).toBe(2)
})

it('renders a highlight marker for the last point', () => {
	const { container } = render(Sparkline, {
		data: [10, 20, 30, 15],
		type: 'line',
		width: 90,
		highlight: 'last'
	})
	const dots = container.querySelectorAll('[data-plot-highlight]')
	expect(dots.length).toBe(1)
	// last index = 3, xScale domain [0,3] range [0,90] → cx = 90
	expect(dots[0].getAttribute('cx')).toBe('90')
})

it('dedupes overlapping highlight selectors', () => {
	const { container } = render(Sparkline, {
		data: [10, 20, 30, 15],
		type: 'line',
		highlight: ['last', 3]
	})
	// 'last' and index 3 resolve to the same point → one marker
	expect(container.querySelectorAll('[data-plot-highlight]').length).toBe(1)
})

it('renders no markers when highlight is unset', () => {
	const { container } = render(Sparkline, { data: [10, 20, 30], type: 'line' })
	expect(container.querySelectorAll('[data-plot-highlight]').length).toBe(0)
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun run test:ui --filter chart -- Sparkline`
Expected: the 4 new tests FAIL (`highlight` prop/markers not implemented). Existing tests PASS.

- [ ] **Step 3: Add the import and prop**

At the top of `packages/chart/src/Sparkline.svelte`, after the existing imports (after line 5), add:

```js
	import { resolveHighlight } from './lib/highlight.js'
```

Add to the `Props` type (after the `baseline?: number` added in Task 1):

```ts
		baseline?: number
		highlight?:
			| 'first'
			| 'last'
			| 'min'
			| 'max'
			| number
			| ((row: { x: number; y: number }, i: number) => boolean)
			| Array<
					| 'first'
					| 'last'
					| 'min'
					| 'max'
					| number
					| ((row: { x: number; y: number }, i: number) => boolean)
			  >
```

Add to the destructure (after `baseline = undefined`):

```js
		baseline = undefined,
		highlight = undefined
```

- [ ] **Step 4: Add the `rows` adapter + highlight derivations**

After the `values` derivation (after line 37), add the shared adapter:

```js
	// Adapter to the pure geom utilities (they operate on {x,y} rows).
	const rows = $derived(values.map((v, i) => ({ x: i, y: v })))
```

After the `barAnchorY` derivation added in Task 1, add:

```js
	const highlightSelectors = $derived(
		Array.isArray(highlight) ? highlight : highlight === null || highlight === undefined ? [] : [highlight]
	)
	const highlightIndices = $derived.by(() => {
		const seen = new Set()
		for (const sel of highlightSelectors) {
			for (const i of resolveHighlight(rows, sel, { y: 'y' })) seen.add(i)
		}
		return [...seen]
	})
```

- [ ] **Step 5: Render the marker group**

After the baseline `<line>` block (from Task 1 Step 6), before `</svg>`, add:

```svelte
	{#if highlightIndices.length}
		<g data-plot-geom="highlight">
			{#each highlightIndices as i (i)}
				<circle cx={xScale(i)} cy={yScale(values[i])} data-plot-highlight />
			{/each}
		</g>
	{/if}
```

- [ ] **Step 6: Add the scoped marker style**

Inside the `<style>` block (added in Task 1), add — mirroring `geoms/Highlight.svelte` tokens:

```css
	[data-plot-highlight] {
		fill: var(--chart-highlight-color, rgb(var(--color-accent-500, 194 65 12)));
		stroke: var(--chart-highlight-ring, none);
		r: var(--chart-highlight-radius, 3);
		pointer-events: none;
	}
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `bun run test:ui --filter chart -- Sparkline`
Expected: all Sparkline tests PASS.

- [ ] **Step 8: Commit**

```bash
git add packages/chart/src/Sparkline.svelte packages/chart/spec/Sparkline.spec.js
git commit -m "feat(chart): sparkline highlight markers (min/max/last/index)"
```

---

## Task 3: Trend line (constant + fitted series + array)

**Files:**
- Modify: `packages/chart/src/Sparkline.svelte` (add import, `trendMethods`, `trendPaths`, a `<g>` group, scoped style)
- Test: `packages/chart/spec/Sparkline.spec.js`

- [ ] **Step 1: Write the failing tests**

Add to `packages/chart/spec/Sparkline.spec.js`:

```js
it('renders a horizontal trend line for a constant method', () => {
	const { container } = render(Sparkline, {
		data: [10, 20, 30],
		type: 'line',
		width: 100,
		height: 40,
		trend: 'avg'
	})
	const path = container.querySelector('[data-plot-trend]')
	expect(path).toBeTruthy()
	const d = path?.getAttribute('d') ?? ''
	expect(d.startsWith('M0,')).toBe(true)
	// avg of 10,20,30 = 20; a constant trend is a horizontal line, so both ends share one y
	const ys = [...d.matchAll(/[ML]\d+,([\d.]+)/g)].map((m) => m[1])
	expect(ys[0]).toBe(ys[1]) // same y at both ends → horizontal
})

it('renders a fitted trend series path', () => {
	const { container } = render(Sparkline, {
		data: [10, 20, 30],
		type: 'line',
		trend: 'linear'
	})
	const path = container.querySelector('[data-plot-trend]')
	expect(path).toBeTruthy()
	expect(path?.getAttribute('d')).not.toContain('NaN')
})

it('renders one path per method for an array of trends', () => {
	const { container } = render(Sparkline, {
		data: [10, 20, 30, 25],
		type: 'line',
		trend: ['avg', 'linear']
	})
	expect(container.querySelectorAll('[data-plot-trend]').length).toBe(2)
})

it('renders no trend when trend is unset', () => {
	const { container } = render(Sparkline, { data: [10, 20, 30], type: 'line' })
	expect(container.querySelectorAll('[data-plot-trend]').length).toBe(0)
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `bun run test:ui --filter chart -- Sparkline`
Expected: the 4 new tests FAIL (`trend` prop/paths not implemented). Existing tests PASS.

- [ ] **Step 3: Add the import and prop**

After the `resolveHighlight` import (from Task 2 Step 3), add:

```js
	import { computeTrend } from './lib/trend.js'
```

(Note: `line as d3line` is already imported from `d3-shape` at line 3 — reuse it, do not re-import.)

Add to the `Props` type (after the `highlight?: …` block from Task 2):

```ts
		trend?:
			| string
			| number
			| { type: string; [k: string]: unknown }
			| Array<string | number | { type: string; [k: string]: unknown }>
```

Add to the destructure (after `highlight = undefined`):

```js
		highlight = undefined,
		trend = undefined
```

- [ ] **Step 4: Add the trend derivations**

After the `highlightIndices` derivation (from Task 2 Step 4), add:

```js
	const trendMethods = $derived(
		Array.isArray(trend) ? trend : trend === null || trend === undefined ? [] : [trend]
	)
	const trendPaths = $derived.by(() => {
		const out = []
		trendMethods.forEach((m, idx) => {
			const res = computeTrend(rows, { x: 'x', y: 'y' }, m)
			if (!res) return
			if (res.kind === 'constant') {
				const yy = yScale(res.value)
				out.push({ d: `M0,${yy} L${width},${yy}`, i: idx })
			} else {
				const gen = d3line()
					.x((_, i) => xScale(i))
					.y((v) => yScale(v))
				const d = gen(res.values)
				if (d) out.push({ d, i: idx })
			}
		})
		return out
	})
```

- [ ] **Step 5: Render the trend group**

Draw trend **below** the baseline and markers (paint order: bars/line/area → trend → baseline → markers). Insert the trend group **immediately after the type `{/if}` block and BEFORE the baseline `<line>` block** (from Task 1 Step 6):

```svelte
	{#if trendPaths.length}
		<g data-plot-geom="trend">
			{#each trendPaths as p (p.i)}
				<path d={p.d} data-plot-trend fill="none" />
			{/each}
		</g>
	{/if}
```

- [ ] **Step 6: Add the scoped trend style**

Inside the `<style>` block, add — mirroring `geoms/Trend.svelte` tokens:

```css
	[data-plot-trend] {
		fill: none;
		stroke: var(--chart-trend-color, currentColor);
		stroke-width: var(--chart-trend-width, 1);
		stroke-dasharray: var(--chart-trend-dash, 4 4);
		opacity: var(--chart-trend-opacity, 0.7);
		pointer-events: none;
	}
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `bun run test:ui --filter chart -- Sparkline`
Expected: all Sparkline tests PASS.

- [ ] **Step 8: Full package gate**

Run: `bun run test:ci` (from repo root)
Expected: 0 failures; Sparkline suite green; total test count increased by the 12 new tests. Confirm the real exit status is 0 (do not trust a piped tail).

Run: `bun run lint`
Expected: 0 errors.

- [ ] **Step 9: Commit**

```bash
git add packages/chart/src/Sparkline.svelte packages/chart/spec/Sparkline.spec.js
git commit -m "feat(chart): sparkline trend lines (constant + fitted)"
```

---

## Task 4: Docs — design doc + demo snippet

**Files:**
- Modify: `docs/design/20-chart.md` (Sparkline section, lines ~366-370)
- Modify: `apps/learn/src/lib/koan/demos/chart/meta.ts` (sparkline entry ~line 129-132)

- [ ] **Step 1: Update the design doc Sparkline section**

In `docs/design/20-chart.md`, replace the Sparkline section body (the paragraph after `## Sparkline`) with:

```markdown
`Sparkline` computes inline scales with no axes/grid/legend, for table cells or KPIs. `type`
selects `line` | `bar` | `area`; a dedicated `pattern` prop applies a single-series texture.

Enrichment props (all optional, additive):

- `highlight` — `'first'|'last'|'min'|'max'|<index>|<predicate>` or an array; draws
  `data-plot-highlight` markers (deduped when selectors overlap). Reuses the geom
  `resolveHighlight` util and `--chart-highlight-*` tokens.
- `trend` — `'avg'|'median'|'min'|'max'|'linear'|'ema'|'exp'|<number>|{type:'ma',window}` or an
  array; draws `data-plot-trend` line(s) via the geom `computeTrend` util and `--chart-trend-*`
  tokens.
- `baseline` — the value bars grow *from* (positive up, negative down), and a `data-plot-baseline`
  reference rule. For `type="bar"` with any negative value it **defaults to `0`** so negative
  sparkbars render correctly; all-positive bars with no baseline stay min-anchored. The y-domain
  extends to include the baseline. For `line`/`area` it is a reference rule only (fill anchor
  unchanged).
```

- [ ] **Step 2: Update the demo snippet**

In `apps/learn/src/lib/koan/demos/chart/meta.ts`, find the sparkline example snippet (the `<Sparkline data={[…]} … />` string near line 132) and extend it to show the enriched props, e.g.:

```svelte
<Sparkline data={[12, -8, 23, -17, 34, 56, -9, 41]} type="bar" baseline={0}
  highlight={['min', 'max', 'last']} trend="linear" width={140} height={36} />
```

(Keep the surrounding `meta.ts` structure and any adjacent line/area examples intact — only enrich the snippet string.)

- [ ] **Step 3: Verify the demo builds / renders**

Run: `cd apps/learn && npx playwright test chart` (or the project's chart e2e). If no sparkline e2e exists, load `/app/chart` in dev (`bun run dev --filter learn`) and confirm the enriched sparkline renders with negative bars anchored at zero, a trend line, and min/max/last dots. Observe the actual rendered output — do not claim done from the code alone.

- [ ] **Step 4: Commit**

```bash
git add docs/design/20-chart.md apps/learn/src/lib/koan/demos/chart/meta.ts
git commit -m "docs(chart): document enriched sparkline props + demo"
```

---

## Task 5: Journal + priority checklist

**Files:**
- Modify: `agents/journal.md` (append a dated entry)
- Modify: `docs/design/12-priority.md` (add to "Recently Shipped" if tracked)

- [ ] **Step 1: Append a journal entry**

Add a `## 2026-08-18 — Chart: enriched Sparkline (markers + trend + baseline)` entry summarizing: lean-island decision (no PlotState), reuse of `resolveHighlight`/`computeTrend`, the negative-bar baseline fix + auto-default, mirrored `--chart-*` tokens, test count delta, and the commit hashes from Tasks 1-4.

- [ ] **Step 2: Commit**

```bash
git add agents/journal.md docs/design/12-priority.md
git commit -m "docs: journal enriched sparkline"
```

---

## Self-Review

**Spec coverage** (checked against `2026-08-18-enriched-sparkline-design.md`):

- API `highlight`/`trend`/`baseline`, additive & backward-compatible → Tasks 1-3 (all default `undefined`; existing tests unchanged). ✅
- Pure-math reuse via `rows` adapter → Task 2 Step 4 (`rows`), Tasks 2/3 import `resolveHighlight`/`computeTrend`. ✅
- Markers: min/max/last/index/predicate + array + dedup → Task 2. ✅
- Trend: constant + fitted series + array → Task 3. ✅
- Baseline as bar anchor (negative bars) + smart `0` default for bars + all-positive stays min-anchored + y-domain extension + reference rule → Task 1. ✅
- Theming mirrors geom `data-plot-*` + `--chart-*` tokens → Task 1 Step 7, Task 2 Step 6, Task 3 Step 6. ✅
- Draw order series→trend→baseline→markers → Task 3 Step 5 (trend before baseline), Task 2 Step 5 (markers last). ✅
- No change to `PlotState`/`scales.js`; line/area negative-fill out of scope → not in any task. ✅
- Tests + docs → Tasks 4-5. ✅

**Placeholder scan:** No TBD/TODO; every code step shows the exact code; every run step shows the command + expected result. ✅

**Type consistency:** Prop names (`baseline`/`highlight`/`trend`) and derived names (`effectiveBaseline`, `barAnchorY`, `rows`, `highlightIndices`, `trendPaths`) are used identically across tasks. `rows` is defined once (Task 2 Step 4) and consumed by both highlight (Task 2) and trend (Task 3) — Task 3 assumes Task 2 landed first (execute in order). `d3line` reused from the existing import, not re-declared. ✅

**Ordering dependency note:** Tasks are order-dependent (2 defines `rows` used by 3; 1 defines `barAnchorY` and the `<style>` block that 2 and 3 extend). Execute 1 → 2 → 3 → 4 → 5.
