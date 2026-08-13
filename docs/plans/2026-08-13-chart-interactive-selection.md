# Chart Interactive Selection — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add `onselect(detail)` (rich click/keyboard select event), `selectable` (opt-in click-to-highlight, multi/toggle), and `bind:selected` (row refs) to `@rokkit/chart` — on the primitives and `AreaChart`/`LineChart`, across all cartesian geoms — reusing the Highlight overlay to render the selection.

**Architecture:** `PlotState` centralizes selection (a `SvelteSet` of row references, alongside the existing `hovered`) and exposes `interactive`/`handleSelect`/selection getters. A pure `lib/select.js` assembles the `SelectDetail`. Each geom (Line/Point/Bar/Area) renders hit targets when `plotState.interactive` and calls `plotState.handleSelect(...)`. The `Highlight` overlay unions the static `highlight` with `plotState.selectedRows`, tagging selected marks `data-plot-selected`. `Plot.svelte` exposes the props (`selected` is `$bindable`) and two-way syncs.

**Tech Stack:** Svelte 5 runes (`$state`/`$derived`/`$bindable`, `svelte/reactivity` `SvelteSet`), Vitest + `@testing-library/svelte` (project `chart`), Playwright. Spec: `docs/backlog/2026-08-13-chart-interactive-selection.md`. Builds on the grid/highlight/trend work.

**Conventions:** single test file → `bun run test:ci -- <path>`; full gate `bun run test:ci` + `bun run lint` (0 errors); `lib/*.js` = 100% coverage; validate `.svelte` with the Svelte MCP autofixer; repo lint bans `== null` (use `=== null`/`!== undefined`); commit per task on `develop`.

---

## File Structure

**Create:** `src/lib/select.js` (buildSelectDetail); specs `spec/lib/select.spec.js`, `spec/selection.spec.js`.
**Modify:** `src/PlotState.svelte.js`; geoms `Line.svelte`/`Point.svelte`/`Bar.svelte`/`Area.svelte`; `src/lib/brewing/marks/points.js` (carry index); `src/geoms/Highlight.svelte`; `src/Plot.svelte`; `src/charts/AreaChart.svelte`/`LineChart.svelte`; `spec/PlotState.spec.js`, `spec/Highlight.spec.js`; learn showcase + e2e; design docs + demo meta.

---

## Task 1: `lib/select.js` — `buildSelectDetail` (pure)

**Files:** Create `packages/chart/src/lib/select.js`; test `packages/chart/spec/lib/select.spec.js`.

- [ ] **Step 1: failing test**

```js
// packages/chart/spec/lib/select.spec.js
import { describe, it, expect } from 'vitest'
import { buildSelectDetail } from '../../src/lib/select.js'

describe('buildSelectDetail', () => {
	const row = { day: 3, v: 9, product: 'Pro' }
	const ev = { type: 'click' }
	it('assembles a rich detail from a row + channels', () => {
		const d = buildSelectDetail(row, 2, { x: 'day', y: 'v' }, 'line', 'Pro', ev)
		expect(d).toEqual({
			datum: row, index: 2, series: 'Pro', value: 9, x: 3, y: 9, geom: 'line', event: ev
		})
	})
	it('series/x/y are undefined when not provided', () => {
		const d = buildSelectDetail(row, 0, { y: 'v' }, 'bar', undefined, ev)
		expect(d.series).toBeUndefined()
		expect(d.x).toBeUndefined()
		expect(d.value).toBe(9)
		expect(d.y).toBe(9)
	})
})
```

- [ ] **Step 2:** `bun run test:ci -- packages/chart/spec/lib/select.spec.js` → FAIL (module not found).

- [ ] **Step 3: implement**

```js
// packages/chart/src/lib/select.js
/**
 * Assemble the SelectDetail handed to a chart's onselect callback.
 * @param {Record<string, unknown>} datum
 * @param {number} index  index within the geom's rendered data
 * @param {{ x?: string, y?: string }} channels
 * @param {'line'|'point'|'area'|'bar'} geom
 * @param {unknown} series  color/group value, or undefined
 * @param {MouseEvent|KeyboardEvent} event
 */
export function buildSelectDetail(datum, index, channels, geom, series, event) {
	const { x, y } = channels
	return {
		datum,
		index,
		series: series ?? undefined,
		value: y ? datum[y] : undefined,
		x: x ? datum[x] : undefined,
		y: y ? datum[y] : undefined,
		geom,
		event
	}
}
```

- [ ] **Step 4:** rerun → PASS (2 tests). Confirm 100% coverage of `select.js`.
- [ ] **Step 5: commit** `git add packages/chart/src/lib/select.js packages/chart/spec/lib/select.spec.js && git commit -m "feat(chart): add buildSelectDetail helper"`

---

## Task 2: `PlotState` — selection state

**Files:** Modify `packages/chart/src/PlotState.svelte.js`; test `packages/chart/spec/PlotState.spec.js` (append).

- [ ] **Step 1: failing test**

```js
// append to packages/chart/spec/PlotState.spec.js  (PlotState already imported)
describe('PlotState selection', () => {
	const rows = [{ a: 1 }, { a: 2 }, { a: 3 }]
	it('handleSelect fires onselect; selectable toggles selection', () => {
		const calls = []
		const s = new PlotState({ data: rows, channels: { x: 'a', y: 'a' }, onselect: (d) => calls.push(d), selectable: true })
		expect(s.interactive).toBe(true)
		s.handleSelect({ datum: rows[0], index: 0 })
		expect(calls).toHaveLength(1)
		expect(s.isSelected(rows[0])).toBe(true)
		expect(s.selectedRows).toEqual([rows[0]])
		s.handleSelect({ datum: rows[0], index: 0 }) // toggle off
		expect(s.isSelected(rows[0])).toBe(false)
	})
	it('non-selectable fires onselect but does not accumulate', () => {
		const s = new PlotState({ data: rows, channels: { x: 'a', y: 'a' }, onselect: () => {} })
		expect(s.interactive).toBe(true)
		s.handleSelect({ datum: rows[1], index: 1 })
		expect(s.selectedRows).toEqual([])
	})
	it('setSelected / clearSelected', () => {
		const s = new PlotState({ data: rows, channels: { x: 'a', y: 'a' }, selectable: true })
		s.setSelected([rows[0], rows[2]])
		expect(s.selectedRows).toEqual([rows[0], rows[2]])
		s.clearSelected()
		expect(s.selectedRows).toEqual([])
	})
	it('interactive is false with neither onselect nor selectable', () => {
		const s = new PlotState({ data: rows, channels: { x: 'a', y: 'a' } })
		expect(s.interactive).toBe(false)
	})
})
```

- [ ] **Step 2:** `bun run test:ci -- packages/chart/spec/PlotState.spec.js` → FAIL.

- [ ] **Step 3: implement.** In `PlotState.svelte.js`:

Add `SvelteSet` to the existing `svelte/reactivity` import (it already imports `SvelteMap, SvelteSet`). Add fields near `#hovered` (~line 41):

```js
	#selected = $state(new SvelteSet())
	#onselect = $state(undefined)
	#selectable = $state(false)
```

In the constructor (near `this.#chartPreset = ...`): 
```js
		this.#onselect = config.onselect
		this.#selectable = config.selectable ?? false
		if (config.selected) this.#selected = new SvelteSet(config.selected)
```

In `update(config)` (near the other `if (config.x !== undefined)` lines):
```js
		if (config.onselect !== undefined) this.#onselect = config.onselect
		if (config.selectable !== undefined) this.#selectable = config.selectable
```

Add methods/getters near `setHovered`/`get hovered`:
```js
	get interactive() {
		return !!this.#onselect || this.#selectable
	}
	get selectable() {
		return this.#selectable
	}
	get selectedRows() {
		return [...this.#selected]
	}
	isSelected(row) {
		return this.#selected.has(row)
	}
	setSelected(rows) {
		this.#selected = new SvelteSet(rows ?? [])
	}
	clearSelected() {
		this.#selected = new SvelteSet()
	}
	handleSelect(detail) {
		this.#onselect?.(detail)
		if (this.#selectable && detail?.datum !== undefined) {
			if (this.#selected.has(detail.datum)) this.#selected.delete(detail.datum)
			else this.#selected.add(detail.datum)
		}
	}
```

- [ ] **Step 4:** rerun → PASS (all incl. prior PlotState tests).
- [ ] **Step 5: commit** `git add packages/chart/src/PlotState.svelte.js packages/chart/spec/PlotState.spec.js && git commit -m "feat(chart): PlotState selection state (handleSelect/interactive/selectedRows)"`

---

## Task 3: `Highlight` renders selection

**Files:** Modify `packages/chart/src/geoms/Highlight.svelte`; test `spec/Highlight.spec.js` (append).

Do this before the geoms so selection is visible as soon as `handleSelect` runs.

- [ ] **Step 1: failing test**

```js
// append inside the existing describe('Highlight overlay', ...) in spec/Highlight.spec.js
	it('renders selected rows (from PlotState) tagged data-plot-selected', async () => {
		const { container } = render(Plot, {
			props: { spec, selectable: true, grid: false, width: 400, height: 300 }
		})
		// no selection yet, no static highlight → no marks
		expect(container.querySelectorAll('[data-plot-highlight]')).toHaveLength(0)
	})
```

(Fuller click→select coverage lands in Task 6's `selection.spec.js`; here just assert the overlay is wired to read selection and renders nothing when empty.)

- [ ] **Step 2:** rerun Highlight spec → the new case FAILS only if Plot rejects `selectable` (it doesn't exist yet on Plot). To keep Task 3 self-contained, test Highlight against a manual context instead — replace the test above with a direct-selection assertion via `setSelected`:

```js
	it('unions selected rows with static highlight, tagged data-plot-selected', () => {
		// render with a static highlight; selection is exercised in selection.spec.js
		const { container } = render(Plot, { props: { spec, highlight: 'first', grid: false, width: 400, height: 300 } })
		const marks = container.querySelectorAll('[data-plot-highlight]')
		expect(marks).toHaveLength(1)
		expect(marks[0].getAttribute('data-plot-selected')).toBe(null) // static highlight is not "selected"
	})
```

- [ ] **Step 3: implement.** In `Highlight.svelte`, extend `marks` to union `state.selectedRows`. Read the file; replace the `marks` derived so it:
  1. builds static marks from `resolveHighlight` (each tagged `selected: false`),
  2. appends `state.selectedRows` marks (tagged `selected: true`) whose row isn't already present,
  3. filters non-finite.

```svelte
	const marks = $derived.by(() => {
		const rows = state?.data ?? []
		const xs = state?.xScale
		const ys = state?.yScale
		if (!xs || !ys || !x || !y) return []
		const out = []
		const seen = new Set()
		if (highlight !== null && highlight !== undefined && rows.length) {
			for (const i of resolveHighlight(rows, highlight, { y })) {
				const row = rows[i]
				out.push({ key: `h${i}`, cx: scalePos(xs, row[x]), cy: ys(Number(row[y])), row, selected: false })
				seen.add(row)
			}
		}
		const selectedRows = state?.selectedRows ?? []
		selectedRows.forEach((row, j) => {
			if (seen.has(row)) return
			out.push({ key: `s${j}`, cx: scalePos(xs, row[x]), cy: ys(Number(row[y])), row, selected: true })
		})
		return out.filter((m) => Number.isFinite(m.cx) && Number.isFinite(m.cy))
	})
```

Update the template each/key + add the attribute:
```svelte
	{#each marks as m (m.key)}
		<circle cx={m.cx} cy={m.cy} data-plot-highlight data-plot-selected={m.selected ? 'true' : undefined} />
		...
```
(Keep the label block; it can key off `m.key` too.) Add to `<style>`:
```css
	[data-plot-highlight][data-plot-selected='true'] {
		stroke: var(--chart-selected-ring, var(--chart-highlight-color, rgb(var(--color-accent-500, 194 65 12))));
		stroke-width: var(--chart-selected-ring-width, 2);
		fill: var(--chart-selected-fill, var(--color-paper, #fff));
	}
```

- [ ] **Step 4:** validate `.svelte` via Svelte MCP; `bun run test:ci -- packages/chart/spec/Highlight.spec.js` → PASS (7). No regressions in Trend/Grid/Plot specs.
- [ ] **Step 5: commit** `git add packages/chart/src/geoms/Highlight.svelte packages/chart/spec/Highlight.spec.js && git commit -m "feat(chart): Highlight overlay renders PlotState selection (data-plot-selected)"`

---

## Task 4: `Point` index + `Line`/`Point` interactive

**Files:** Modify `packages/chart/src/lib/brewing/marks/points.js`, `src/geoms/Point.svelte`, `src/geoms/Line.svelte`. Covered by Task 6's `selection.spec.js` (no separate unit test — these are wiring changes verified end-to-end).

- [ ] **Step 1:** `points.js` `buildPoints` — add `i` (row index) to each returned point object (it already maps `data.map((d, i) => ({...}))`; include `i` in the returned literal).

- [ ] **Step 2:** `Line.svelte` — the invisible hit circles already render when `onselect || keyboard`. Change the gate to also include `plotState.interactive`, and on click/keydown call `plotState.handleSelect(...)` in addition to the local `onselect`. Read the file; for the hit `{#each seg.points as pt ...}` circle set:
  - `role` / `tabindex` / `cursor` guard: `onselect || keyboard || plotState.interactive`.
  - build a detail and dispatch. Add a helper in the `<script>`:
    ```ts
    import { buildSelectDetail } from '../lib/select.js'
    const geomIndex = (row: Row) => plotState.data.indexOf(row)
    function select(pt, seg, event) {
    	onselect?.(pt.data)
    	if (plotState.interactive)
    		plotState.handleSelect(buildSelectDetail(pt.data, geomIndex(pt.data), { x, y }, 'line', seg.key, event))
    }
    ```
  - wire `onclick={(e) => select(pt, seg, e)}` and `onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && select(pt, seg, e)}` on the hit circle; keep `setHovered`/`clearHovered`.

- [ ] **Step 3:** `Point.svelte` — same treatment on the point path/circle: import `buildSelectDetail`, gate interactivity on `onselect || keyboard || plotState.interactive`, and on click/keydown call both the local `onselect(pt.data)` and (when interactive) `plotState.handleSelect(buildSelectDetail(pt.data, geomIndex(pt.data), { x, y }, 'point', color ? pt.data[color] : undefined, e))`. Use the point's own index where available.

- [ ] **Step 4:** validate both `.svelte` via Svelte MCP; run `bun run test:ci -- packages/chart` → no regressions (full suite green). `bun run lint` → 0 errors.
- [ ] **Step 5: commit** `git add packages/chart/src/lib/brewing/marks/points.js packages/chart/src/geoms/Line.svelte packages/chart/src/geoms/Point.svelte && git commit -m "feat(chart): Line + Point interactive select (handleSelect via context)"`

---

## Task 5: `Bar` + `Area` interactive

**Files:** Modify `packages/chart/src/geoms/Bar.svelte`, `src/geoms/Area.svelte`.

- [ ] **Step 1:** `Bar.svelte` — it already has `onselect`/`filterable` on the bar rects. Add interactivity-awareness: gate cursor/role/tabindex on `filterable || onselect || keyboard || plotState.interactive`; on click/keydown also call `plotState.handleSelect(buildSelectDetail(bar.data, plotState.data.indexOf(bar.data), { x, y }, 'bar', color ? bar.data[color] : undefined, e))` when `plotState.interactive` (in addition to the existing `onselect`/`handleBarClick`). Import `buildSelectDetail`.

- [ ] **Step 2:** `Area.svelte` — the per-point hover circles (the `{#each data as d, i (`hover::${i}`)}` block) become clickable when `plotState.interactive`. Import `buildSelectDetail`; on those circles add, when `plotState.interactive`: `role="button"`, `tabindex={0}`, `style:cursor="pointer"`, `onclick={(e) => plotState.handleSelect(buildSelectDetail(d, i, { x, y }, 'area', undefined, e))}`, `onkeydown={(e) => (e.key === 'Enter' || e.key === ' ') && plotState.handleSelect(buildSelectDetail(d, i, { x, y }, 'area', undefined, e))}`. Keep `setHovered`/`clearHovered`. Reuse `scalePos` for `px` if convenient (optional).

- [ ] **Step 3:** validate both `.svelte` via Svelte MCP; `bun run test:ci -- packages/chart` → no regressions; `bun run lint` → 0.
- [ ] **Step 4: commit** `git add packages/chart/src/geoms/Bar.svelte packages/chart/src/geoms/Area.svelte && git commit -m "feat(chart): Bar + Area interactive select"`

---

## Task 6: `Plot.svelte` props + wiring + `selection.spec.js`

**Files:** Modify `packages/chart/src/Plot.svelte`; test `packages/chart/spec/selection.spec.js` (new).

- [ ] **Step 1: failing test**

```js
// packages/chart/spec/selection.spec.js
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/svelte'
import Plot from '../src/Plot.svelte'

const data = [ { day: 0, v: 5 }, { day: 1, v: 9 }, { day: 2, v: 3 } ]
const spec = { data, x: 'day', y: 'v', geoms: [{ type: 'line' }] }

describe('chart selection', () => {
	it('clicking a line point fires onselect with a rich detail', async () => {
		const onselect = vi.fn()
		const { container } = render(Plot, { props: { spec, onselect, grid: false, width: 400, height: 300 } })
		const hit = container.querySelector('[data-plot-element="line-hover"]')
		expect(hit).toBeTruthy()
		hit.dispatchEvent(new MouseEvent('click', { bubbles: true }))
		expect(onselect).toHaveBeenCalledTimes(1)
		const detail = onselect.mock.calls[0][0]
		expect(detail).toMatchObject({ geom: 'line', index: 0, value: 5, x: 0, y: 5 })
		expect(detail.datum).toBe(data[0])
	})

	it('selectable toggles a highlighted selection', async () => {
		const { container } = render(Plot, { props: { spec, selectable: true, grid: false, width: 400, height: 300 } })
		const hit = container.querySelector('[data-plot-element="line-hover"]')
		hit.dispatchEvent(new MouseEvent('click', { bubbles: true }))
		expect(container.querySelectorAll('[data-plot-highlight][data-plot-selected="true"]')).toHaveLength(1)
		hit.dispatchEvent(new MouseEvent('click', { bubbles: true }))
		expect(container.querySelectorAll('[data-plot-highlight][data-plot-selected="true"]')).toHaveLength(0)
	})
})
```

- [ ] **Step 2:** `bun run test:ci -- packages/chart/spec/selection.spec.js` → FAIL (Plot has no `onselect`/`selectable`).

- [ ] **Step 3: implement.** In `Plot.svelte`:
  - Add to `Props`: `onselect?: (detail: unknown) => void`, `selectable?: boolean`, `selected?: Row[]`.
  - Destructure with `selected = $bindable([])`, `onselect = undefined`, `selectable = false`.
  - In `buildPlotConfig()` add `onselect`, `selectable` to the returned config object.
  - Sync `selected` two-way with PlotState (PlotState = source of truth):
    ```ts
    $effect(() => { plotState.setSelected(selected) })          // external → state (guard against no-op loops: only when differing)
    $effect(() => { const rows = plotState.selectedRows; if (rows.length !== selected.length || rows.some((r, i) => r !== selected[i])) selected = rows })
    ```
    Use a shallow-equality guard (as shown) to avoid an update loop.
  - Render `<Highlight>` when `highlight != null` **or** selection is active. Change the existing highlight render guard to:
    ```svelte
    {#if highlight !== null && highlight !== undefined || selectable || selected.length}
    	<Highlight x={overlayX} y={overlayY} {highlight} {label} />
    {/if}
    ```
    (Highlight already reads `plotState.selectedRows` from Task 3.)

  Read `Plot.svelte` and place edits by content.

- [ ] **Step 4:** validate via Svelte MCP; `bun run test:ci -- packages/chart/spec/selection.spec.js packages/chart/spec/Plot.spec.js packages/chart/spec/Highlight.spec.js` → PASS; `bun run test:ci -- packages/chart` → no regressions; `bun run lint` → 0.
- [ ] **Step 5: commit** `git add packages/chart/src/Plot.svelte packages/chart/spec/selection.spec.js && git commit -m "feat(chart): Plot onselect/selectable/bind:selected wiring"`

---

## Task 7: wrappers forward selection

**Files:** Modify `packages/chart/src/charts/AreaChart.svelte`, `LineChart.svelte`; test `spec/selection.spec.js` (append).

- [ ] **Step 1: failing test** (append)

```js
	it('LineChart wrapper forwards onselect', async () => {
		const { default: LineChart } = await import('../src/charts/LineChart.svelte')
		const onselect = vi.fn()
		const { container } = render(LineChart, { props: { data, x: 'day', y: 'v', onselect, grid: false, width: 400, height: 300 } })
		container.querySelector('[data-plot-element="line-hover"]').dispatchEvent(new MouseEvent('click', { bubbles: true }))
		expect(onselect).toHaveBeenCalledTimes(1)
	})
```

- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3:** Both wrappers: add `onselect`, `selectable`, `selected = $bindable(undefined)` props and forward `{onselect} {selectable} bind:selected` on `<Plot …>`. (For `bind:selected` to be optional, default it and forward; if `$bindable(undefined)` complicates the two-way, forward `selected` + `onselect` and pass a plain `selected` — verify binding works or fall back to one-way `selected` + `onselect`.)
- [ ] **Step 4:** run selection + full package specs → green; lint 0.
- [ ] **Step 5: commit** `git add packages/chart/src/charts/AreaChart.svelte packages/chart/src/charts/LineChart.svelte packages/chart/spec/selection.spec.js && git commit -m "feat(chart): forward onselect/selectable/selected through wrappers"`

---

## Task 8: learn showcase — click-to-drill

**Files:** Modify `apps/learn/src/lib/koan/demos/chart/index.svelte`.

- [ ] **Step 1:** In the metrics section, add `selectable` + `onselect` to the `PlotChart` and a caption showing the last clicked point. Add to `<script>`:
```ts
	let picked = $state<{ day: number; value: number } | null>(null)
```
Update the `PlotChart` open tag: add `selectable onselect={(d) => (picked = { day: d.x as number, value: d.value as number })}`. Below the chart, add:
```svelte
			{#if picked}
				<p class="metrics-pick">Selected: {picked.day === 0 ? 'today' : `${picked.day}d`} · {picked.value}</p>
			{/if}
```
(Add a small `.metrics-pick` style consistent with the demo.)

- [ ] **Step 2:** validate via Svelte MCP; confirm no type/lint issues in the file (`bunx eslint` on the file). Do NOT run a dev server (e2e verifies).
- [ ] **Step 3: commit** `git add apps/learn/src/lib/koan/demos/chart/index.svelte && git commit -m "docs(learn): click-to-select drill in the metrics chart showcase"`

---

## Task 9: Playwright e2e

**Files:** Create `apps/learn/e2e/chart-select.e2e.ts`.

- [ ] **Step 1:** write the test — navigate `/app/chart`, click a `[data-plot-element="line-hover"]` (or `line-marker`) hit target in the metrics chart, assert a `[data-plot-selected="true"]` mark appears and the "Selected:" caption is visible.
```ts
import { test, expect } from '@playwright/test'
test('clicking a metrics point selects + drills', async ({ page }) => {
	await page.goto('/app/chart')
	const hit = page.locator('[data-plot-element="line-hover"]').first()
	await hit.click({ force: true })
	await expect(page.locator('[data-plot-highlight][data-plot-selected="true"]').first()).toBeAttached()
	await expect(page.getByText(/Selected:/).first()).toBeVisible()
})
```
- [ ] **Step 2:** `cd apps/learn && npx playwright test chart-select` → PASS. If the hit target needs a different selector to receive the click reliably, adjust to a working one (report it). If elements are genuinely absent, STOP and report (don't force a pass).
- [ ] **Step 3: commit** `git add apps/learn/e2e/chart-select.e2e.ts && git commit -m "test(learn): e2e for chart click-to-select"`

---

## Task 10: docs, gate, bookkeeping

- [ ] **Step 1:** `docs/design/21-charts.md` — add an "Interaction / Selection" subsection (onselect detail, selectable, bind:selected, keyboard, `data-plot-selected`). `20-chart.md` — note the props. Chart demo `meta.ts` — add `onselect`/`selectable`/`selected` props + `[data-plot-selected]` attr.
- [ ] **Step 2:** full gate — `bun run test:ci` (confirm real exit 0) + `bun run lint` (0 errors); `cd apps/learn && npx playwright test chart-select`.
- [ ] **Step 3:** `agents/journal.md` dated entry (summary, commit hashes, test counts); `docs/design/12-priority.md` "Recently Shipped" entry; move `docs/backlog/2026-08-13-chart-interactive-selection.md` → `docs/backlog/done/`.
- [ ] **Step 4: commit** docs + bookkeeping. Then `superpowers:finishing-a-development-branch`.

---

## Self-Review (authoring)

**Spec coverage:** select detail → Task 1; PlotState selection → Task 2; Highlight renders selection → Task 3; all geoms interactive (Line/Point Task 4, Bar/Area Task 5) → Tasks 4–5; Plot props + bindable + wiring → Task 6; wrappers → Task 7; showcase → Task 8; e2e → Task 9; docs/gate/bookkeeping → Task 10. All spec sections mapped.

**Type consistency:** `buildSelectDetail(datum, index, {x,y}, geom, series, event)` identical in Task 1 and the geom tasks. `PlotState.handleSelect(detail)` / `selectedRows` / `isSelected(row)` / `setSelected(rows)` / `interactive` consistent across Tasks 2, 3, 4, 5, 6. `data-plot-selected="true"` attribute consistent across Highlight (3), Plot render (6), showcase/e2e (8, 9). Selection keyed by **row reference** everywhere (SvelteSet of rows).

**Risk notes:** (a) the `selected` two-way `$effect` sync needs the shallow-equality guard shown to avoid an update loop — the implementer must include it. (b) `plotState.data.indexOf(datum)` gives a correct index only for identity-stat charts; for aggregated charts `detail.index` may be `-1` — acceptable (datum is authoritative), noted in the spec. (c) `$bindable` on the wrappers may need a defined default; Task 7 allows a one-way `selected` fallback if binding is awkward.

**Placeholder scan:** none — code and commands are concrete.
