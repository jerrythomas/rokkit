# Sparkline demo + live guide gallery + e2e verification (#147) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a dedicated chat-based `/app/sparkline` Koan demo, make the guides render live charts/sparklines via the existing `@rokkit/blocks` plugin system, and leave the Playwright suite green and meaningful (repurpose the two stale chart specs + add a sparkline spec).

**Architecture:** Mirror the existing chart demo (`apps/learn/src/lib/koan/demos/chart/`) as a simpler single-component demo under `demos/sparkline/`; register it through the four Koan wiring seams (catalog + route map, `ShellDemoType`, the shell layout's conversation/controls branches, and `pickDemoKind`). Extract the block-plugin list into one shared module imported by both the chat demo's `BlockList` and the guides' `GuidePage`, then add a live gallery to the Charts guide. Verify everything with Playwright against the real `data-plot-*` marks the shipped `Sparkline` already emits.

**Tech Stack:** Svelte 5 (runes, `lang="ts"`), SvelteKit (apps/learn), Vitest (`learn` project, jsdom), Playwright (chromium, `baseURL :4173`), `@rokkit/chart`, `@rokkit/blocks`, `@rokkit/ui`, UnoCSS named tokens. Package manager: **bun**, root scripts only.

---

## Decisions & spec corrections (read before starting)

The mapping pass surfaced facts that **override the spec's wording**. These are load-bearing — follow the plan, not the spec, where they differ:

1. **`baseline` is a `number` only — off must map to `undefined`, never `false`.** `false` is not nullish, so `baseline ?? …` keeps it and the component's `effectiveBaseline !== undefined` guard still draws a rule at `yScale(0)`. The store's mapping is `baseline ? 0 : undefined`.
2. **The component has no `'minmax'`/`'all'` highlight tokens.** Valid tokens are exactly `'first' | 'last' | 'min' | 'max' | number | predicate`. The store must expand the UI mode to an array: `minmax → ['min','max']`, `last → ['last']`, `all → ['min','max','last']`, `none → undefined`.
3. **`SparklinePlugin.svelte` does NOT emit `data-sparkline-plugin` today** — its success branch renders `<Sparkline {...result.spec}/>` bare. The spec's testability contract assumes the hook, so **Part 2 adds a `<div data-sparkline-plugin>` wrapper** to the plugin (mirrors `PlotPlugin`'s `data-plot-plugin`). This is a one-line `packages/blocks` change, not the #149 consolidation.
4. **`Sparkline` does NOT emit `data-plot-element` or `data-plot-type`** (only `PlotChart` geoms do). Sparkline base geometry can only be asserted via `svg path` / `svg rect`. Enriched marks are `data-plot-baseline`, `data-plot-highlight`, `data-plot-trend`, `data-plot-geom="trend|highlight"`.
5. **`/app/chart` no longer has the "Metrics" showcase** — it mounts `ChartExplorer` (default `type='bar'`). The chart-type chips live behind the composer **tweak drawer**, so any spec that clicks `[data-chart-type]` must first click `.composer-tweak-toggle`. Grid/trend/baseline are 1px axis-aligned SVG shapes → assert `toBeAttached()` + `count()>0`, never `toBeVisible()`.
6. **Bars auto-anchor the baseline — the `baseline` toggle is only observable on `line`/`area`.** `Sparkline` computes `effectiveBaseline = baseline ?? (type === 'bar' && hasNegative ? 0 : undefined)`. Our sample series has negatives, so for `type='bar'` a `[data-plot-baseline]` rule renders **regardless of the prop** — toggling baseline off does nothing visible on bars. Consequences baked into the plan: (a) the demo store **defaults to `type: 'line'`** so the baseline toggle is live on first load, and (b) the e2e asserts the on↔off transition on `line`, and only asserts *presence* (not toggling) on `bar`.

**One deliberate deviation from the spec's file path:** the shared plugin module is `apps/learn/src/lib/koan/block-plugins.ts` (as the spec names it). Both consumers import it as `$lib/koan/block-plugins`. (`BlockList` lives under `chat-demo/`, `GuidePage` under `koan/`; a neutral `$lib/block-plugins.ts` was considered — keeping the spec's path for fidelity.)

---

## File structure

**New files**

| Path | Responsibility |
| --- | --- |
| `apps/learn/src/lib/koan/demos/sparkline/mapping.ts` | Pure types + `toSparklineProps(settings)` — the tricky UI→prop mapping (unit-tested). |
| `apps/learn/src/lib/koan/demos/sparkline/store.svelte.ts` | `SparklineStore` singleton `sparkline`: `$state` settings, `set`, `apply`, `props`, `describe`, `tips`. |
| `apps/learn/src/lib/koan/demos/sparkline/SparklineExplorer.svelte` | Canvas: primary `<Sparkline>` in `[data-sparkline-demo]` + a KPI table-row example. |
| `apps/learn/src/lib/koan/demos/sparkline/SparklineControls.svelte` | Tweak-drawer control rows (`data-sparkline-control`, `data-active`). |
| `apps/learn/src/lib/koan/demos/sparkline/SparklineConversation.svelte` | Chat-left messages + guidance chips (uses `$lib/chat`). |
| `apps/learn/src/lib/koan/demos/sparkline/index.svelte` | `load()` target; optional `type` prop; renders `<SparklineExplorer/>`. |
| `apps/learn/src/lib/koan/demos/sparkline/docs.md` | Docs tab / `/components/sparkline` content. |
| `apps/learn/src/lib/koan/demos/sparkline/meta.ts` | `DemoMeta` default export. |
| `apps/learn/src/routes/app/sparkline/+page.svelte` | Thin state-setter route page. |
| `apps/learn/src/lib/koan/block-plugins.ts` | Shared `BLOCK_PLUGINS: MarkdownPlugin[]`. |
| `apps/learn/spec/sparkline-mapping.spec.ts` | Unit test for `toSparklineProps`. |
| `apps/learn/e2e/sparkline.e2e.ts` | Playwright: demo controls + guide gallery. |

**Modified files**

| Path | Change |
| --- | --- |
| `apps/learn/src/lib/koan/catalog.ts` | Import `sparkline`, add to `catalog[]` + `DEMO_ROUTE`. |
| `apps/learn/src/lib/koan/shell.svelte.ts` | Add `'sparkline'` to `ShellDemoType`. |
| `apps/learn/src/lib/koan/demos/chart/meta.ts` | Remove `'sparkline'`, `'spark-line'`, `'inline-chart'` keywords. |
| `apps/learn/src/routes/app/+layout.svelte` | Imports + `hasSparklineControls`/`showDetails` + conversation branch + controls branch + `DemoKind`/`pickDemoKind`. |
| `packages/blocks/src/SparklinePlugin.svelte` | Wrap output in `<div data-sparkline-plugin>`. |
| `apps/learn/src/lib/chat-demo/components/BlockList.svelte` | Use `BLOCK_PLUGINS` from the shared module. |
| `apps/learn/src/lib/koan/components/GuidePage.svelte` | Pass `plugins={BLOCK_PLUGINS}` + live-block styling. |
| `apps/learn/src/lib/guides/charts/content.md` | Add a live sparkline gallery. |
| `apps/learn/e2e/chart-metrics.e2e.ts` | Rewrite against live `ChartExplorer`. |
| `apps/learn/e2e/chart-select.e2e.ts` | Rewrite against live explorer selection/toggles. |

**Deleted**

| Path | Reason |
| --- | --- |
| `apps/learn/src/lib/components/Sparkline.svelte` | Dead hand-rolled `<polyline>` duplicate; imported nowhere (confirmed by grep). |

**Commands** (all from repo root, bun, run-once scripts):
- Unit tests (all): `bun run test:ci`
- Unit tests (learn only): `bun run test:ci -- --project learn`
- Lint (0 errors): `bun run lint`
- Svelte type gate: `bun run check:svelte`
- Build learn: `cd apps/learn && bun run build`
- E2E: `bun run test:e2e` (builds + previews on :4173 automatically)

---

## Part 0 — Delete the dead app-local Sparkline

### Task 0: Remove the unused duplicate

**Files:**
- Delete: `apps/learn/src/lib/components/Sparkline.svelte`

- [ ] **Step 1: Confirm it is imported nowhere**

Run: `grep -rn "components/Sparkline" apps/learn/src`
Expected: no output (zero matches).

- [ ] **Step 2: Delete the file**

Run: `git rm apps/learn/src/lib/components/Sparkline.svelte`

- [ ] **Step 3: Verify the app still builds**

Run: `cd apps/learn && bun run build`
Expected: build succeeds (no missing-import error).

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "chore(learn): delete dead app-local Sparkline duplicate (#147)"
```

---

## Part 1 — `/app/sparkline` dedicated demo

### Task 1: Pure settings→props mapping (TDD)

**Files:**
- Create: `apps/learn/src/lib/koan/demos/sparkline/mapping.ts`
- Test: `apps/learn/spec/sparkline-mapping.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `apps/learn/spec/sparkline-mapping.spec.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { toSparklineProps, type SparklineSettings } from '$lib/koan/demos/sparkline/mapping'

const base: SparklineSettings = { type: 'bar', baseline: false, highlight: 'none', trend: 'none' }

describe('toSparklineProps', () => {
	it('maps baseline off to undefined (never false)', () => {
		const props = toSparklineProps({ ...base, baseline: false })
		expect(props.baseline).toBeUndefined()
	})

	it('maps baseline on to the number 0', () => {
		expect(toSparklineProps({ ...base, baseline: true }).baseline).toBe(0)
	})

	it('expands highlight modes to component tokens', () => {
		expect(toSparklineProps({ ...base, highlight: 'none' }).highlight).toBeUndefined()
		expect(toSparklineProps({ ...base, highlight: 'minmax' }).highlight).toEqual(['min', 'max'])
		expect(toSparklineProps({ ...base, highlight: 'last' }).highlight).toEqual(['last'])
		expect(toSparklineProps({ ...base, highlight: 'all' }).highlight).toEqual(['min', 'max', 'last'])
	})

	it('passes trend methods through, omitting none', () => {
		expect(toSparklineProps({ ...base, trend: 'none' }).trend).toBeUndefined()
		expect(toSparklineProps({ ...base, trend: 'avg' }).trend).toBe('avg')
		expect(toSparklineProps({ ...base, trend: 'linear' }).trend).toBe('linear')
	})

	it('passes type through unchanged', () => {
		expect(toSparklineProps({ ...base, type: 'area' }).type).toBe('area')
	})
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `bun run test:ci -- --project learn spec/sparkline-mapping.spec.ts`
Expected: FAIL — `Cannot find module '$lib/koan/demos/sparkline/mapping'`.

- [ ] **Step 3: Write the mapping module**

Create `apps/learn/src/lib/koan/demos/sparkline/mapping.ts`:

```ts
// Pure UI-settings → Sparkline-prop mapping. Kept framework-free (no runes) so
// the tricky conversions are unit-testable in isolation.
//
// Why this exists: the shipped Sparkline has no 'minmax'/'all' highlight tokens
// and `baseline` is strictly a number — passing the raw UI values would either
// render zero markers or draw a spurious zero-line. This module is the single
// place those UI vocabularies are translated to what the component accepts.

export type SparkType = 'line' | 'bar' | 'area'
export type HighlightMode = 'none' | 'minmax' | 'last' | 'all'
export type TrendMode = 'none' | 'avg' | 'linear'

/** The UI-facing settings the controls read/write. */
export type SparklineSettings = {
	type: SparkType
	baseline: boolean
	highlight: HighlightMode
	trend: TrendMode
}

/** The subset of real <Sparkline> props the demo drives. */
export type SparklineProps = {
	type: SparkType
	baseline: number | undefined
	highlight: Array<'min' | 'max' | 'last'> | undefined
	trend: 'avg' | 'linear' | undefined
}

const HIGHLIGHT_TOKENS: Record<HighlightMode, Array<'min' | 'max' | 'last'> | undefined> = {
	none: undefined,
	minmax: ['min', 'max'],
	last: ['last'],
	all: ['min', 'max', 'last']
}

export function toSparklineProps(s: SparklineSettings): SparklineProps {
	return {
		type: s.type,
		// baseline OFF must be undefined — `false` is not nullish, so the
		// component would still draw a rule at yScale(0).
		baseline: s.baseline ? 0 : undefined,
		highlight: HIGHLIGHT_TOKENS[s.highlight],
		trend: s.trend === 'none' ? undefined : s.trend
	}
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `bun run test:ci -- --project learn spec/sparkline-mapping.spec.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add apps/learn/src/lib/koan/demos/sparkline/mapping.ts apps/learn/spec/sparkline-mapping.spec.ts
git commit -m "feat(learn): sparkline demo settings→props mapping + tests (#147)"
```

---

### Task 2: The demo store

**Files:**
- Create: `apps/learn/src/lib/koan/demos/sparkline/store.svelte.ts`

- [ ] **Step 1: Write the store**

Create `apps/learn/src/lib/koan/demos/sparkline/store.svelte.ts`:

```ts
import {
	toSparklineProps,
	type SparklineSettings,
	type SparklineProps
} from './mapping'

/**
 * One fixed mixed-sign series so `baseline` has negatives to anchor and
 * min/max markers land on obvious points. Deterministic (no RNG) so renders
 * and e2e are stable.
 */
export const SAMPLE_SERIES = [12, -8, 23, -17, 34, 56, -9, 41]

// Default to a line so the baseline toggle is immediately live on first load:
// bars with negative values auto-anchor to 0 in the component regardless of the
// prop, which would make the baseline toggle look inert if the demo opened on bar.
const BASE: SparklineSettings = {
	type: 'line',
	baseline: true,
	highlight: 'minmax',
	trend: 'none'
}

/** One-tap guidance nudge — applies a settings patch. */
export type SparklineTip = { text: string; set: Partial<SparklineSettings> }

/**
 * The sparkline explorer's single source of truth. Simpler than the chart
 * registry: one component with variant settings, and the settings→prop mapping
 * lives here (via `toSparklineProps`) rather than in the template.
 */
export class SparklineStore {
	settings = $state<SparklineSettings>({ ...BASE })

	/** Real <Sparkline> props derived from the UI settings. */
	get props(): SparklineProps {
		return toSparklineProps(this.settings)
	}

	get tips(): SparklineTip[] {
		return [
			{ text: 'Anchor bars to a zero baseline', set: { type: 'bar', baseline: true } },
			{ text: 'Mark the min, max & last points', set: { highlight: 'all' } },
			{ text: 'Overlay a linear trend line', set: { type: 'line', trend: 'linear' } },
			{ text: 'Fill it in as an area', set: { type: 'area' } }
		]
	}

	set<K extends keyof SparklineSettings>(key: K, value: SparklineSettings[K]): void {
		// Immutable reassignment — required for Svelte 5 $state tracking.
		this.settings = { ...this.settings, [key]: value }
	}

	apply(patch: Partial<SparklineSettings>): void {
		this.settings = { ...this.settings, ...patch }
	}

	/** A short bot-style description of what the canvas is currently showing. */
	describe(): string {
		const s = this.settings
		const bits = [`A ${s.type} sparkline of an 8-point mixed-sign series.`]
		if (s.baseline) bits.push('A zero baseline anchors the swing between positive and negative.')
		if (s.highlight !== 'none') {
			const label =
				s.highlight === 'minmax'
					? 'the min and max points'
					: s.highlight === 'last'
						? 'the latest point'
						: 'the min, max and latest points'
			bits.push(`Markers call out ${label}.`)
		}
		if (s.trend !== 'none') {
			bits.push(`A ${s.trend === 'avg' ? 'mean' : 'linear'} trend line runs through it.`)
		}
		return bits.join(' ')
	}
}

/** Shared singleton for the demo (components import this). */
export const sparkline = new SparklineStore()
```

- [ ] **Step 2: Type-check the module**

Run: `cd apps/learn && bunx tsc --noEmit -p tsconfig.json` (or defer to the Task 8 gate)
Expected: no errors from `store.svelte.ts` / `mapping.ts`.

- [ ] **Step 3: Commit**

```bash
git add apps/learn/src/lib/koan/demos/sparkline/store.svelte.ts
git commit -m "feat(learn): sparkline demo store (#147)"
```

---

### Task 3: The canvas — SparklineExplorer

**Files:**
- Create: `apps/learn/src/lib/koan/demos/sparkline/SparklineExplorer.svelte`

- [ ] **Step 1: Write the component**

Create `apps/learn/src/lib/koan/demos/sparkline/SparklineExplorer.svelte`:

```svelte
<script lang="ts">
	import { Sparkline } from '@rokkit/chart'
	import { sparkline, SAMPLE_SERIES } from './store.svelte'

	const p = $derived(sparkline.props)
</script>

<div class="sparkline-explorer">
	<header class="head">
		<span class="eyebrow" data-sparkline-eyebrow>Data · live</span>
		<h3 data-sparkline-title>Sparkline</h3>
	</header>

	<!-- Primary, store-driven sparkline. The e2e hook `data-sparkline-demo`
	     scopes ONLY this one so control toggles don't get confused with the
	     fixed KPI example below. -->
	<div class="stage" data-sparkline-demo>
		{#key p.type}
			<Sparkline
				data={SAMPLE_SERIES}
				type={p.type}
				baseline={p.baseline}
				highlight={p.highlight}
				trend={p.trend}
				width={280}
				height={80}
			/>
		{/key}
	</div>

	<!-- The inline use case: a sparkline living in a table row next to a KPI. -->
	<section class="kpi" data-sparkline-kpi>
		<table>
			<thead>
				<tr><th>Metric</th><th>Last 8</th><th>Now</th></tr>
			</thead>
			<tbody>
				<tr>
					<td>Signups</td>
					<td class="spark-cell">
						<Sparkline data={SAMPLE_SERIES} type="line" highlight={['last']} width={120} height={24} />
					</td>
					<td class="num">41</td>
				</tr>
			</tbody>
		</table>
	</section>
</div>

<style>
	.sparkline-explorer {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 20px;
	}
	.head {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.eyebrow {
		font: 500 10.5px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	h3 {
		margin: 0;
		font: 600 15px var(--font-ui);
		color: var(--ink);
	}
	.stage {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 120px;
		padding: 16px;
		border: 1px solid var(--paper-edge);
		border-radius: var(--density-radius-base);
		background: var(--paper);
	}
	.kpi table {
		width: 100%;
		border-collapse: collapse;
		font: 400 12.5px var(--font-ui);
		color: var(--ink);
	}
	.kpi th {
		text-align: left;
		font: 500 10.5px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding: 4px 8px;
		border-bottom: 1px solid var(--paper-edge);
	}
	.kpi td {
		padding: 8px;
		border-bottom: 1px solid var(--paper-edge);
	}
	.spark-cell {
		width: 130px;
	}
	.num {
		text-align: right;
		font: 500 13px var(--font-mono);
		color: var(--primary);
	}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add apps/learn/src/lib/koan/demos/sparkline/SparklineExplorer.svelte
git commit -m "feat(learn): SparklineExplorer canvas (#147)"
```

---

### Task 4: The controls

**Files:**
- Create: `apps/learn/src/lib/koan/demos/sparkline/SparklineControls.svelte`

- [ ] **Step 1: Write the component**

Create `apps/learn/src/lib/koan/demos/sparkline/SparklineControls.svelte` (segmented buttons mirror `ChartControls`; each group carries `data-sparkline-control`, active buttons carry `data-active`):

```svelte
<script lang="ts">
	import { sparkline } from './store.svelte'
	import type { SparkType, HighlightMode, TrendMode } from './mapping'

	const s = $derived(sparkline.settings)

	const types: SparkType[] = ['line', 'bar', 'area']
	const highlights: HighlightMode[] = ['none', 'minmax', 'last', 'all']
	const trends: TrendMode[] = ['none', 'avg', 'linear']
</script>

<div class="sparkline-controls" data-sparkline-controls>
	<div class="row" data-sparkline-control="type">
		<span>Type</span>
		<div class="seg">
			{#each types as t (t)}
				<button
					type="button"
					data-active={s.type === t ? 'true' : undefined}
					onclick={() => sparkline.set('type', t)}
				>{t}</button>
			{/each}
		</div>
	</div>

	<div class="row" data-sparkline-control="baseline">
		<span>Baseline</span>
		<div class="seg">
			<button
				type="button"
				data-active={s.baseline ? 'true' : undefined}
				onclick={() => sparkline.set('baseline', !s.baseline)}
			>{s.baseline ? 'on' : 'off'}</button>
		</div>
	</div>

	<div class="row" data-sparkline-control="highlight">
		<span>Highlight</span>
		<div class="seg wrap">
			{#each highlights as h (h)}
				<button
					type="button"
					data-active={s.highlight === h ? 'true' : undefined}
					onclick={() => sparkline.set('highlight', h)}
				>{h}</button>
			{/each}
		</div>
	</div>

	<div class="row" data-sparkline-control="trend">
		<span>Trend</span>
		<div class="seg">
			{#each trends as tr (tr)}
				<button
					type="button"
					data-active={s.trend === tr ? 'true' : undefined}
					onclick={() => sparkline.set('trend', tr)}
				>{tr}</button>
			{/each}
		</div>
	</div>
</div>

<style>
	.sparkline-controls {
		display: flex;
		flex-direction: column;
	}
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		margin: 6px 0;
		font: 400 12px var(--font-ui);
		color: var(--ink);
	}
	.seg {
		display: flex;
		gap: 4px;
	}
	.seg.wrap {
		flex-wrap: wrap;
	}
	.seg button {
		border: 1px solid var(--paper-edge);
		background: var(--paper);
		color: var(--ink);
		border-radius: var(--density-radius-base);
		padding: 3px 8px;
		font: 400 11.5px var(--font-ui);
		cursor: pointer;
	}
	.seg button[data-active='true'] {
		background: var(--primary);
		color: var(--on-primary);
		border-color: transparent;
	}
</style>
```

- [ ] **Step 2: Commit**

```bash
git add apps/learn/src/lib/koan/demos/sparkline/SparklineControls.svelte
git commit -m "feat(learn): SparklineControls tweak-drawer panel (#147)"
```

---

### Task 5: The chat-left conversation

**Files:**
- Create: `apps/learn/src/lib/koan/demos/sparkline/SparklineConversation.svelte`

- [ ] **Step 1: Write the component** (mirrors `ChartConversation`, uses `$lib/chat` per the Koan shared chat-kit convention)

Create `apps/learn/src/lib/koan/demos/sparkline/SparklineConversation.svelte`:

```svelte
<script lang="ts">
	import { ChatStream, ChatMessage, Chips } from '$lib/chat'
	import { shell } from '$lib/koan/shell.svelte'
	import { sparkline, type SparklineTip } from './store.svelte'

	const tipChips = $derived(sparkline.tips.map((t) => ({ label: t.text, tip: t })))

	function runTip(item: { tip?: SparklineTip }) {
		if (item.tip) sparkline.apply(item.tip.set)
	}
</script>

<ChatStream>
	<ChatMessage kind="user" ago="2m" icon="i-mdi:chat-outline">
		{shell.lastQuery}
	</ChatMessage>
	<ChatMessage kind="info" status="mounted" ago="just now" icon="i-mdi:chart-line-variant">
		<code>&lt;Sparkline/&gt;</code> from <code>@rokkit/chart</code> on the canvas.
		{sparkline.describe()}
	</ChatMessage>
	<ChatMessage kind="info" status="explained" icon="i-mdi:tune-variant">
		<strong>One tiny inline chart.</strong> Toggle <code>type</code>, a zero
		<code>baseline</code>, <code>highlight</code> markers and a <code>trend</code>
		line under <em>tweak</em> — the same enriched props you'd pass in a table cell.
	</ChatMessage>
	{#if tipChips.length > 0}
		<ChatMessage kind="info" status="try" icon="i-mdi:auto-fix">
			Try one — it re-renders the sparkline on the canvas.
		</ChatMessage>
		<Chips items={tipChips} onselect={runTip} />
	{/if}
</ChatStream>
```

- [ ] **Step 2: Commit**

```bash
git add apps/learn/src/lib/koan/demos/sparkline/SparklineConversation.svelte
git commit -m "feat(learn): SparklineConversation chat-left panel (#147)"
```

---

### Task 6: `index.svelte`, `docs.md`, and `meta.ts`

**Files:**
- Create: `apps/learn/src/lib/koan/demos/sparkline/index.svelte`
- Create: `apps/learn/src/lib/koan/demos/sparkline/docs.md`
- Create: `apps/learn/src/lib/koan/demos/sparkline/meta.ts`

- [ ] **Step 1: Write `index.svelte`** (the `load()` target; optional `type` prop from the LLM tool)

Create `apps/learn/src/lib/koan/demos/sparkline/index.svelte`:

```svelte
<script lang="ts">
	import { onMount } from 'svelte'
	import SparklineExplorer from './SparklineExplorer.svelte'
	import { sparkline } from './store.svelte'

	// `type` lets the AI (mount_sparkline) open the explorer pre-set.
	let { type = undefined }: { type?: string } = $props()

	onMount(() => {
		if (type === 'line' || type === 'bar' || type === 'area') sparkline.set('type', type)
	})
</script>

<SparklineExplorer />
```

- [ ] **Step 2: Write `docs.md`**

Create `apps/learn/src/lib/koan/demos/sparkline/docs.md`:

```markdown
## Sparkline — a tiny inline chart

A `Sparkline` is a word-sized chart: no axes, no legend, just the shape of a
series. Drop it in a table cell, a KPI tile, or a sentence to show a trend at a
glance. It follows the same data-first contract as the rest of `@rokkit/chart`:
pass a numeric array (or object rows with a `field`), then size it with `width`
/ `height`.

## Basic usage

```svelte
<script>
  import { Sparkline } from '@rokkit/chart'
</script>

<Sparkline data={[12, 45, 23, 67, 34, 89]} type="area" width={120} height={32} />
```

## Enriched props

- `type` — `line` (default), `bar`, or `area`.
- `baseline` — draw a reference rule at a value (e.g. `0`). Bars with negative
  values auto-anchor to `0`.
- `highlight` — mark notable points: `'first' | 'last' | 'min' | 'max'`, a
  numeric index, or an array of them.
- `trend` — overlay a trend/reference line: `'avg'`, `'linear'`, `'median'`, a
  moving average, or a constant value (also accepts an array).
- `curve` — `'linear'` (default) or `'smooth'`.
- `color` — a palette role (`primary`, `accent`, …) for stroke/fill.
- `width` / `height` — the inline size in px (defaults `80 × 24`).

## In a table row

```svelte
<td>
  <Sparkline data={row.last8} type="line" highlight={['last']} width={120} height={24} />
</td>
```
```

- [ ] **Step 3: Write `meta.ts`**

Create `apps/learn/src/lib/koan/demos/sparkline/meta.ts`:

```ts
import type { DemoMeta } from '../../types'
import docs from './docs.md?raw'

const meta: DemoMeta = {
	id: 'sparkline',
	title: 'Sparkline',
	description:
		'An interactive Sparkline explorer — a word-sized inline chart for table cells and KPIs. Switch between line, bar and area and toggle a zero baseline, min/max/last markers and a trend line, live.',
	keywords: [
		'sparkline',
		'spark-line',
		'inline-chart',
		'micro-chart',
		'mini-chart',
		'trendline',
		'trend',
		'baseline',
		'kpi',
		'table-cell',
		'inline'
	],
	category: 'data',
	icon: '∿',
	load: () => import('./index.svelte'),
	tool: {
		name: 'mount_sparkline',
		description:
			'Mount the interactive Sparkline explorer on the canvas — the user toggles type, baseline, highlight markers and a trend line live. Pass `type` to open a specific shape.',
		parameters: {
			type: 'optional sparkline type to open: line | bar | area (defaults to line)'
		}
	},
	inline: { capable: true },
	variants: [],
	api: {
		props: [
			{ name: 'data', type: 'number[] | Record<string, unknown>[]', desc: 'The series — bare numbers, or object rows with `field`.' },
			{ name: 'field', type: 'string', desc: 'Field name when `data` is object rows.' },
			{ name: 'type', type: "'line' | 'bar' | 'area'", default: "'line'", desc: 'Spark shape.' },
			{ name: 'baseline', type: 'number', desc: 'Reference rule at this value (e.g. 0). Bars auto-anchor to 0 when the series has negatives.' },
			{ name: 'highlight', type: "'first' | 'last' | 'min' | 'max' | number | (…)[]", desc: 'Mark notable points.' },
			{ name: 'trend', type: "'avg' | 'linear' | 'median' | number | (…)[]", desc: 'Overlay a trend / reference line.' },
			{ name: 'curve', type: "'linear' | 'smooth'", default: "'linear'", desc: 'Line / area interpolation.' },
			{ name: 'color', type: 'string', default: "'primary'", desc: 'Palette role for stroke / fill.' },
			{ name: 'pattern', type: 'string', desc: 'Texture-fill key.' },
			{ name: 'width', type: 'number', default: '80', desc: 'SVG width (px).' },
			{ name: 'height', type: 'number', default: '24', desc: 'SVG height (px).' }
		],
		attrs: [
			{ selector: '[data-sparkline-demo]', desc: 'The demo canvas wrapper (e2e hook).' },
			{ selector: '[data-plot-baseline]', desc: 'The baseline reference rule.' },
			{ selector: '[data-plot-highlight]', desc: 'A highlighted point marker.' },
			{ selector: '[data-plot-trend]', desc: 'A trend / reference line (value = method).' },
			{ selector: '[data-plot-geom="trend|highlight"]', desc: 'Mark-group wrappers.' }
		]
	},
	docs
}

export default meta
```

- [ ] **Step 4: Verify the meta type-checks against `DemoMeta`/`ApiProp`/`ApiAttr`**

Run: `cd apps/learn && bunx tsc --noEmit -p tsconfig.json`
Expected: no errors in `demos/sparkline/meta.ts`. (Verified against `apps/learn/src/lib/koan/types.ts`: `ApiProp = { name, type, desc, default?, bindable? }`, `ApiAttr = { selector, desc }`, `DemoApi.props` required + `attrs?` optional, `DemoMeta.icon: string` — the meta above already matches.)

- [ ] **Step 5: Commit**

```bash
git add apps/learn/src/lib/koan/demos/sparkline/index.svelte apps/learn/src/lib/koan/demos/sparkline/docs.md apps/learn/src/lib/koan/demos/sparkline/meta.ts
git commit -m "feat(learn): sparkline demo index + docs + meta (#147)"
```

---

### Task 7: Register the demo (catalog, route map, shell type, keyword move)

**Files:**
- Modify: `apps/learn/src/lib/koan/catalog.ts`
- Modify: `apps/learn/src/lib/koan/shell.svelte.ts:11` (the `ShellDemoType` union)
- Modify: `apps/learn/src/lib/koan/demos/chart/meta.ts:13-14` (keyword move)
- Create: `apps/learn/src/routes/app/sparkline/+page.svelte`

- [ ] **Step 1: Import + register in `catalog.ts`**

Add the import next to the other demo meta imports (near `import chart from './demos/chart/meta'`):

```ts
import sparkline from './demos/sparkline/meta'
```

Add `sparkline,` to the `catalog[]` array immediately after `chart,`:

```ts
	chart,
	sparkline,
	combo,
```

Add the route to `DEMO_ROUTE` immediately after the `chart` entry:

```ts
	chart: '/app/chart',
	sparkline: '/app/sparkline',
	combo: '/app/combo',
```

- [ ] **Step 2: Add `'sparkline'` to `ShellDemoType`**

In `apps/learn/src/lib/koan/shell.svelte.ts`, add the member right after `| 'chart'`:

```ts
	| 'chart'
	| 'sparkline'
	| 'combo'
```

- [ ] **Step 3: Move the keywords off the chart meta**

In `apps/learn/src/lib/koan/demos/chart/meta.ts`, edit the `keywords` array to remove `'sparkline'`, `'spark-line'`, and `'inline-chart'`. Change:

```ts
		'box', 'box-plot', 'violin', 'violin-plot', 'sparkline', 'spark-line',
		'trends', 'distribution', 'kpi', 'inline-chart'
```

to:

```ts
		'box', 'box-plot', 'violin', 'violin-plot',
		'trends', 'distribution', 'kpi'
```

- [ ] **Step 4: Create the route page**

Create `apps/learn/src/routes/app/sparkline/+page.svelte` (mirrors `app/chart/+page.svelte`, guards the `lastQuery` seed so a typed query isn't clobbered):

```svelte
<script lang="ts">
	import { onMount } from 'svelte'
	import { setShellResponse, shell } from '$lib/koan/shell.svelte'

	onMount(() => {
		if (!shell.lastQuery) shell.lastQuery = 'Show me a sparkline'
		setShellResponse('sparkline')
	})
</script>
```

- [ ] **Step 5: Verify `routeFor('sparkline')` and a catalog search resolve**

Run: `cd apps/learn && bunx tsc --noEmit -p tsconfig.json`
Expected: no errors (`setShellResponse('sparkline')` now type-checks).

- [ ] **Step 6: Commit**

```bash
git add apps/learn/src/lib/koan/catalog.ts apps/learn/src/lib/koan/shell.svelte.ts apps/learn/src/lib/koan/demos/chart/meta.ts apps/learn/src/routes/app/sparkline/+page.svelte
git commit -m "feat(learn): register /app/sparkline demo + move sparkline keywords (#147)"
```

---

### Task 8: Wire the shell layout (conversation + controls + query routing)

**Files:**
- Modify: `apps/learn/src/routes/app/+layout.svelte` (imports ~49; `DemoKind`/`pickDemoKind` ~84-112; `showDetails` ~390; conversation branch ~2050; controls branch ~2056)

- [ ] **Step 1: Add the imports**

After line 49 (`import ChartControls from '$lib/koan/demos/chart/ChartControls.svelte'`), add:

```svelte
	import SparklineConversation from '$lib/koan/demos/sparkline/SparklineConversation.svelte'
	import SparklineControls from '$lib/koan/demos/sparkline/SparklineControls.svelte'
```

- [ ] **Step 2: Fold sparkline into the details gating**

Replace the `hasChartControls` / `showDetails` derives (currently lines 390-391):

```svelte
	const hasChartControls = $derived(shell.demoType === 'chart')
	const showDetails = $derived(hasDetails || hasChartControls)
```

with:

```svelte
	const hasChartControls = $derived(shell.demoType === 'chart')
	// Sparkline is likewise store-driven (no propsSchema) but surfaces its knobs
	// via SparklineControls in the details slab — treat it as "has details".
	const hasSparklineControls = $derived(shell.demoType === 'sparkline')
	const showDetails = $derived(hasDetails || hasChartControls || hasSparklineControls)
```

- [ ] **Step 3: Add `'sparkline'` to the local `DemoKind` union**

In the `type DemoKind = …` union (line 86), add `'sparkline'` next to `'chart'`:

```ts
		| 'form' | 'select' | 'chart' | 'sparkline' | 'combo' | 'date-picker' | 'stepper'
```

- [ ] **Step 4: Route a "sparkline" query to the demo**

In `pickDemoKind`, add a branch immediately after the `chart` line (line 107):

```ts
		if (top === 'chart') return 'chart'
		if (top === 'sparkline') return 'sparkline'
```

- [ ] **Step 5: Add the chat-left conversation branch**

Extend the conversation chain (currently ending lines 2050-2052) so it reads:

```svelte
			{:else if shell.phase === 'response' && shell.demoType === 'chart'}
				<ChartConversation />
			{:else if shell.phase === 'response' && shell.demoType === 'sparkline'}
				<SparklineConversation />
			{/if}
```

- [ ] **Step 6: Add the controls-slab branch**

In the tweaks-slab block (currently lines 2056-2067), add the sparkline branch before the `{:else}`:

```svelte
					{#if shell.demoType === 'chart'}
						<ChartControls />
					{:else if shell.demoType === 'sparkline'}
						<SparklineControls />
					{:else}
						<DetailsSlab
							demoId={shell.demoType}
							propsSchema={propsSchema}
							tweakValues={tweakProps}
							onTweakChange={setTweak}
							onTweakReset={resetTweaks}
							onTweakCopy={copyTweaks}
						/>
					{/if}
```

- [ ] **Step 7: Verify the svelte type gate is clean**

Run: `bun run check:svelte`
Expected: `0 ERRORS` across ui/app/chart/forms/blocks (the layout is in the app project). Fix any reported error before continuing (do not rely on the pre-commit `tsc`, which skips `.svelte` files).

- [ ] **Step 8: (Optional, manual) Eyeball the demo — skip in unattended/subagent runs; Task 13's Playwright spec is the authoritative programmatic gate.**

The canvas mounts client-side (`setShellResponse` runs in `onMount`), so the SSR HTML won't contain `data-sparkline-demo` — a `curl | grep` check is not reliable; use a real browser. If verifying by hand: `cd apps/learn && bun run build && bun run preview`, open `http://localhost:4173/app/sparkline`, confirm the sparkline renders and the composer **tweak** controls (Type/Baseline/Highlight/Trend) re-render it, then stop the server (`lsof -ti:4173 | xargs kill`).

- [ ] **Step 9: Commit**

```bash
git add apps/learn/src/routes/app/+layout.svelte
git commit -m "feat(learn): wire /app/sparkline into the Koan shell (#147)"
```

---

## Part 2 — Live chart gallery in the guides

### Task 9: Add the `data-sparkline-plugin` hook to the block plugin

**Files:**
- Modify: `packages/blocks/src/SparklinePlugin.svelte`

- [ ] **Step 1: Wrap the rendered sparkline**

In `packages/blocks/src/SparklinePlugin.svelte`, change the success branch from:

```svelte
{:else}
	<Sparkline {...result.spec} />
{/if}
```

to:

```svelte
{:else}
	<div data-sparkline-plugin>
		<Sparkline {...result.spec} />
	</div>
{/if}
```

(Mirrors `PlotPlugin.svelte`, which wraps in `<div data-plot-plugin>`. The hook is the guide-gallery e2e's stable target.)

- [ ] **Step 2: Rebuild blocks and confirm the svelte gate**

Run: `bun run check:svelte`
Expected: `0 ERRORS` (blocks is in the gate). This is the executable test for the wrapper — the guide e2e in Task 13 asserts `[data-sparkline-plugin]` is present.

- [ ] **Step 3: Commit**

```bash
git add packages/blocks/src/SparklinePlugin.svelte
git commit -m "feat(blocks): wrap SparklinePlugin output in [data-sparkline-plugin] (#147)"
```

---

### Task 10: Extract the shared `BLOCK_PLUGINS` module

**Files:**
- Create: `apps/learn/src/lib/koan/block-plugins.ts`
- Modify: `apps/learn/src/lib/chat-demo/components/BlockList.svelte`

- [ ] **Step 1: Create the shared module**

Create `apps/learn/src/lib/koan/block-plugins.ts`:

```ts
import type { MarkdownPlugin } from '@rokkit/ui'
import {
	PlotPlugin,
	TablePlugin,
	FormPlugin,
	ListPlugin,
	StepperPlugin,
	SparklinePlugin,
	MermaidPlugin
} from '@rokkit/blocks'

/**
 * The block-plugin list shared by every live-markdown surface: the chat demo's
 * BlockList and the guides' GuidePage both render fenced ```plot / ```sparkline
 * / ```table / … blocks as live components from this single source.
 */
export const BLOCK_PLUGINS: MarkdownPlugin[] = [
	PlotPlugin,
	TablePlugin,
	FormPlugin,
	ListPlugin,
	StepperPlugin,
	SparklinePlugin,
	MermaidPlugin
]
```

- [ ] **Step 2: Point `BlockList.svelte` at the shared module**

In `apps/learn/src/lib/chat-demo/components/BlockList.svelte`, remove the inline `@rokkit/blocks` import and the `const PLUGINS = [ … ]` array, and import the shared list instead. Replace:

```svelte
	import {
		PlotPlugin,
		TablePlugin,
		FormPlugin,
		ListPlugin,
		StepperPlugin,
		SparklinePlugin,
		MermaidPlugin
	} from '@rokkit/blocks'
```

with:

```svelte
	import { BLOCK_PLUGINS } from '$lib/koan/block-plugins'
```

and delete the `const PLUGINS = [ … ]` block. Then update the renderer invocation from `plugins={PLUGINS}` to:

```svelte
	<MarkdownRenderer markdown={block.markdown} plugins={BLOCK_PLUGINS} />
```

(Keep the `CodeBlock, MarkdownRenderer` import from `@rokkit/ui` and any other existing imports untouched.)

- [ ] **Step 3: Verify build + gate**

Run: `bun run check:svelte`
Expected: `0 ERRORS`. Then `cd apps/learn && bun run build` — expected: success (chat demo still compiles).

- [ ] **Step 4: Commit**

```bash
git add apps/learn/src/lib/koan/block-plugins.ts apps/learn/src/lib/chat-demo/components/BlockList.svelte
git commit -m "refactor(learn): extract shared BLOCK_PLUGINS module (#147)"
```

---

### Task 11: Make guides render live blocks + add the gallery

**Files:**
- Modify: `apps/learn/src/lib/koan/components/GuidePage.svelte`
- Modify: `apps/learn/src/lib/guides/charts/content.md`

- [ ] **Step 1: Pass plugins into the guide renderer**

Rewrite `apps/learn/src/lib/koan/components/GuidePage.svelte`:

```svelte
<script lang="ts">
	import { MarkdownRenderer } from '@rokkit/ui'
	import { BLOCK_PLUGINS } from '$lib/koan/block-plugins'

	interface Props {
		markdown: string
	}

	const { markdown }: Props = $props()
</script>

<article class="guide-page">
	<MarkdownRenderer {markdown} plugins={BLOCK_PLUGINS} />
</article>
```

Then add live-block spacing rules to the existing `<style>` block (chart/sparkline SVG output falls outside the `:global(h1/p/pre/…)` rules and would otherwise sit flush). Append inside `<style>`:

```css
	.guide-page :global([data-sparkline-plugin]),
	.guide-page :global([data-plot-plugin]) {
		display: flex;
		justify-content: center;
		margin: 16px 0;
	}
```

- [ ] **Step 2: Add the live gallery to the Charts guide**

In `apps/learn/src/lib/guides/charts/content.md`, append a new **top-level** section (top-level ` ```sparkline ` fences — NOT nested inside a ` ```markdown ` fence, or they render as escaped text). Each fence body must be strictly valid JSON (double-quoted keys, no trailing commas):

````markdown
## Live gallery

The blocks below are real components, rendered from fenced ` ```sparkline `
blocks by the same plugin system the chat demo uses.

A plain line and an area sparkline:

```sparkline
{ "data": [4, 8, 5, 11, 7, 13, 9, 15], "type": "line", "width": 160, "height": 40 }
```

```sparkline
{ "data": [4, 8, 5, 11, 7, 13, 9, 15], "type": "area", "highlight": ["min", "max", "last"], "width": 160, "height": 40 }
```

Bars over a mixed-sign series, anchored to a zero baseline:

```sparkline
{ "data": [12, -8, 23, -17, 34, 56, -9, 41], "type": "bar", "baseline": 0, "width": 200, "height": 44 }
```

A line with a linear trend overlay:

```sparkline
{ "data": [4, 8, 5, 11, 7, 13, 9, 15], "type": "line", "trend": "linear", "width": 200, "height": 44 }
```
````

- [ ] **Step 3: (Optional, manual) Eyeball the guide — skip in unattended/subagent runs; Task 13's guide test is the authoritative programmatic gate.**

Guides are prerendered (SSR-safe), so this one is scriptable if desired: `cd apps/learn && bun run build && (bun run preview &) && sleep 4 && curl -s http://localhost:4173/guides/charts | grep -c 'data-sparkline-plugin'; lsof -ti:4173 | xargs kill` — expect a count ≥ 1. Or open `http://localhost:4173/guides/charts` in a browser and confirm the four sparklines render as live SVGs (bar shows a baseline rule; area shows min/max/last dots; the last shows a trend line), then stop the server.

- [ ] **Step 4: Commit**

```bash
git add apps/learn/src/lib/koan/components/GuidePage.svelte apps/learn/src/lib/guides/charts/content.md
git commit -m "feat(learn): live sparkline gallery in the Charts guide (#147)"
```

---

## Part 3 — Playwright verification

> These specs are the executable acceptance criteria for Parts 1-2. Run from repo root with `bun run test:e2e` (builds + previews on :4173). If a preview server is already running with stale code, kill it first (`lsof -ti:4173 | xargs kill`) — `reuseExistingServer` is true locally, so a stale server would otherwise serve old code.

### Task 12: Rewrite the two stale chart specs against the live explorer

**Files:**
- Modify (rewrite): `apps/learn/e2e/chart-metrics.e2e.ts`
- Modify (rewrite): `apps/learn/e2e/chart-select.e2e.ts`

- [ ] **Step 1: Rewrite `chart-metrics.e2e.ts`**

Replace the entire file with:

```ts
import { test, expect } from '@playwright/test'

// /app/chart mounts the live ChartExplorer (default type='bar'). Guards that the
// canvas renders a geom + grid, and that switching type via the tweak drawer
// re-renders the corresponding geom.
//
// Grid lines are axis-aligned stroke-only SVG shapes — their bounding box is 1px
// thick in one dimension, which Chromium/Playwright's toBeVisible() reports as
// "not visible" even though they are attached and painted. So presence is
// asserted via toBeAttached() + a positive count. Filled shapes (bars) pass
// toBeVisible() fine.
test('chart explorer renders the default bar geom with a grid', async ({ page }) => {
	await page.goto('/app/chart')

	await expect(page.locator('[data-plot-explorer-chart]')).toBeVisible()
	await expect(page.locator('[data-plot-geom="bar"]').first()).toBeVisible()
	expect(await page.locator('[data-plot-element="bar"]').count()).toBeGreaterThan(0)

	const grid = page.locator('[data-plot-grid-line]')
	await expect(grid.first()).toBeAttached()
	expect(await grid.count()).toBeGreaterThan(0)
})

// The chart-type chips live in ChartControls, which only renders inside the tweak
// slab — so we open it via the composer toggle before selecting a type.
test('switching chart type via the tweak drawer re-renders the geom', async ({ page }) => {
	await page.goto('/app/chart')
	await page.locator('.composer-tweak-toggle').click()

	await page.locator('[data-chart-type="line"]').click()
	await expect(page.locator('[data-chart-type="line"]')).toHaveAttribute('data-active', 'true')
	await expect(page.locator('[data-plot-geom="line"]').first()).toBeAttached()

	await page.locator('[data-chart-type="area"]').click()
	await expect(page.locator('[data-plot-geom="area"]').first()).toBeAttached()
})
```

- [ ] **Step 2: Rewrite `chart-select.e2e.ts`**

Replace the entire file with:

```ts
import { test, expect } from '@playwright/test'

// The old click-to-select "Metrics" showcase is gone; ChartExplorer does not
// wire point selection. This guards the live selection the explorer DOES have:
// exclusive chart-type selection driving the canvas, and an interactive setting
// toggle that re-renders without breaking. Controls live behind the tweak drawer.
test('selecting a chart type is exclusive and drives the canvas geom', async ({ page }) => {
	await page.goto('/app/chart')
	await page.locator('.composer-tweak-toggle').click()

	// Default type is bar.
	await expect(page.locator('[data-chart-type="bar"]')).toHaveAttribute('data-active', 'true')

	// Select line — its chip activates, bar deactivates, and the canvas swaps geom.
	await page.locator('[data-chart-type="line"]').click()
	await expect(page.locator('[data-chart-type="line"]')).toHaveAttribute('data-active', 'true')
	await expect(page.locator('[data-chart-type="bar"]')).not.toHaveAttribute('data-active', 'true')
	await expect(page.locator('[data-plot-geom="line"]').first()).toBeAttached()
	await expect(page.locator('[data-plot-geom="bar"]')).toHaveCount(0)
})

test('toggling a live setting stays interactive and keeps the canvas rendering', async ({ page }) => {
	await page.goto('/app/chart')
	await page.locator('.composer-tweak-toggle').click()

	// Bar applies the 'legend' setting (default off) — a checkbox row.
	const legendRow = page.locator('[data-chart-controls] label.row.check', { hasText: 'Show legend' })
	const legend = legendRow.locator('input[type="checkbox"]')
	await legend.click()
	await expect(legend).toBeChecked()

	// The bar geom still renders after the setting change.
	expect(await page.locator('[data-plot-element="bar"]').count()).toBeGreaterThan(0)
})
```

- [ ] **Step 3: Run just these two specs**

Run: `cd apps/learn && npx playwright test e2e/chart-metrics.e2e.ts e2e/chart-select.e2e.ts`
Expected: 4 tests pass. (First run builds + previews; allow for the build wait.)

- [ ] **Step 4: Commit**

```bash
git add apps/learn/e2e/chart-metrics.e2e.ts apps/learn/e2e/chart-select.e2e.ts
git commit -m "test(learn): repurpose chart e2e specs to the live ChartExplorer (#147)"
```

---

### Task 13: New `sparkline.e2e.ts`

**Files:**
- Create: `apps/learn/e2e/sparkline.e2e.ts`

- [ ] **Step 1: Write the spec**

Create `apps/learn/e2e/sparkline.e2e.ts`:

```ts
import { test, expect } from '@playwright/test'

// /app/sparkline mounts SparklineExplorer. Controls live behind the composer
// "tweak" drawer (same pattern as chart). The baseline rule and trend path are
// 1px axis-aligned SVG shapes → assert toBeAttached()/count(), not toBeVisible().
// All assertions are scoped to [data-sparkline-demo] (the primary sparkline) so
// the fixed KPI example in the same view can't pollute counts.
test('sparkline demo toggles baseline / highlight / trend live', async ({ page }) => {
	await page.goto('/app/sparkline')
	const demo = page.locator('[data-sparkline-demo]')
	await expect(demo).toBeVisible()

	// Open the tweak drawer to reach the controls.
	await page.locator('.composer-tweak-toggle').click()

	// Bars over the mixed-sign series auto-anchor to a zero baseline: the
	// component forces effectiveBaseline=0 for bar+negatives regardless of the
	// prop, so the rule is always present on bar. Assert presence only.
	await page.locator('[data-sparkline-control="type"] button', { hasText: 'bar' }).click()
	await expect(demo.locator('[data-plot-baseline]')).toBeAttached()

	// On a line the baseline is purely prop-driven, so the toggle is observable:
	// on → the rule is attached, off → it is gone.
	await page.locator('[data-sparkline-control="type"] button', { hasText: 'line' }).click()
	const baselineBtn = page.locator('[data-sparkline-control="baseline"] button')
	if ((await baselineBtn.getAttribute('data-active')) !== 'true') await baselineBtn.click()
	await expect(baselineBtn).toHaveAttribute('data-active', 'true')
	await expect(demo.locator('[data-plot-baseline]')).toBeAttached()
	await baselineBtn.click()
	await expect(baselineBtn).not.toHaveAttribute('data-active', 'true')
	await expect(demo.locator('[data-plot-baseline]')).toHaveCount(0)

	// Highlight min/max → highlight circles appear (filled → visible).
	await page.locator('[data-sparkline-control="highlight"] button', { hasText: 'minmax' }).click()
	await expect(demo.locator('[data-plot-highlight]').first()).toBeVisible()

	// Trend linear → trend path appears; trend none → it disappears.
	await page.locator('[data-sparkline-control="trend"] button', { hasText: 'linear' }).click()
	await expect(demo.locator('[data-plot-trend]').first()).toBeAttached()
	await page.locator('[data-sparkline-control="trend"] button', { hasText: 'none' }).click()
	await expect(demo.locator('[data-plot-trend]')).toHaveCount(0)
})

// The Charts guide now renders live sparklines from fenced ```sparkline blocks.
test('charts guide renders live sparklines', async ({ page }) => {
	await page.goto('/guides/charts')

	const plugins = page.locator('[data-sparkline-plugin]')
	await expect(plugins.first()).toBeVisible()
	expect(await plugins.count()).toBeGreaterThan(0)

	// The gallery covers a zero baseline (negative bars), markers, and a trend line.
	await expect(page.locator('[data-sparkline-plugin] [data-plot-baseline]').first()).toBeAttached()
	await expect(page.locator('[data-sparkline-plugin] [data-plot-highlight]').first()).toBeAttached()
	await expect(page.locator('[data-sparkline-plugin] [data-plot-trend]').first()).toBeAttached()
})
```

- [ ] **Step 2: Run the new spec**

Run: `cd apps/learn && npx playwright test e2e/sparkline.e2e.ts`
Expected: 2 tests pass.

- [ ] **Step 3: Commit**

```bash
git add apps/learn/e2e/sparkline.e2e.ts
git commit -m "test(learn): sparkline demo + guide gallery e2e (#147)"
```

---

## Part 4 — Finish (full gate + docs + journal)

### Task 14: Zero-errors gate

- [ ] **Step 1: Lint (0 errors)**

Run: `bun run lint`
Expected: 0 errors (warnings acceptable). Read the actual summary line — do not trust a truncated tail.

- [ ] **Step 2: Svelte type gate**

Run: `bun run check:svelte`
Expected: `0 ERRORS` across ui/app/chart/forms/blocks.

- [ ] **Step 3: Unit tests**

Run: `bun run test:ci`
Expected: all pass, including the new `sparkline-mapping.spec.ts` (5 tests).

- [ ] **Step 4: Full e2e suite**

Run: `bun run test:e2e`
Expected: green — the two repurposed chart specs (4 tests) and `sparkline.e2e.ts` (2 tests) all pass, and no other spec regressed.

### Task 15: Update trackers

**Files:**
- Modify: `docs/design/12-priority.md`
- Modify: `agents/journal.md`

- [ ] **Step 1: Add a "Recently Shipped" bullet to `docs/design/12-priority.md`**

There is no open `[ ]` #147 row to check off — #147 lives only as the "Follow-ups:" clause under the shipped **Enriched Sparkline (2026-08-18)** entry. Add a new dated bullet to the Recently Shipped section:

```markdown
- **Sparkline demo + live guide gallery + e2e (#147, 2026-08-19)** — dedicated
  chat-based `/app/sparkline` Koan demo; guides now render live charts/sparklines
  via a shared `BLOCK_PLUGINS` module (`GuidePage` + `BlockList`); two stale chart
  e2e specs repurposed to the live `ChartExplorer` + new `sparkline.e2e.ts`; dead
  app-local `Sparkline.svelte` removed. See spec
  `docs/superpowers/specs/2026-08-18-sparkline-demo-verification-design.md` and journal 2026-08-19.
```

- [ ] **Step 2: Add a dated entry to `agents/journal.md`** summarizing the work, the spec corrections (baseline-off→undefined, highlight token expansion, `data-sparkline-plugin` added to `SparklinePlugin`), the new/changed files, test counts, and the commit hashes from Parts 0-3.

- [ ] **Step 3: Commit**

```bash
git add docs/design/12-priority.md agents/journal.md
git commit -m "docs: journal + priority for #147 sparkline demo + guide gallery + e2e"
```

- [ ] **Step 4: Confirm branch + status**

Run: `git status && git log --oneline -8`
Expected: on `develop`, clean tree, the Part 0-4 commits present. (Merge to `main` only at release — not part of this plan.)

---

## Self-review (completed by plan author)

**Spec coverage:**
- Part 1 — `/app/sparkline` demo: Tasks 1-8 (meta, index, explorer, controls, conversation, store, docs, route, catalog/route/shell/keyword registration, layout wiring). ✅
- Part 2 — live guide gallery: Tasks 9-11 (`data-sparkline-plugin` hook, shared `BLOCK_PLUGINS`, `GuidePage` wiring, gallery content). ✅
- Part 3 — Playwright: Tasks 12-13 (repurpose chart-metrics/chart-select, new sparkline.e2e). ✅
- Also-in-scope dead-code delete: Task 0. ✅
- Acceptance criteria 1-4 map to Tasks 8 (live demo + API/Docs tabs auto-derived from meta), 11 (guide gallery), 12-14 (green e2e + gate), 7 (keyword move → catalog search). ✅

**Placeholder scan:** No TBD/TODO/"handle edge cases" — every code step carries complete code; every run step carries an exact command + expected result. ✅

**Type consistency:** `SparklineSettings`/`SparklineProps`/`SparkType`/`HighlightMode`/`TrendMode`/`SparklineTip` are defined in Task 1-2 and referenced with the same names/shapes in Tasks 3-6, 8. `toSparklineProps`, `sparkline` singleton, `SAMPLE_SERIES`, `BLOCK_PLUGINS` used consistently. Data-attribute names (`data-sparkline-demo`, `data-sparkline-control`, `data-sparkline-plugin`, `data-plot-baseline|highlight|trend`, `data-chart-type`, `.composer-tweak-toggle`) match between the components that emit them and the specs that assert them. ✅

**Independent verification (completed before hand-off):**
- **Codebase fact-check** — all 11 concrete technical claims (meta/`ApiProp`/`ApiAttr` shapes, `@rokkit/blocks` seven-plugin exports, `PlotPlugin`'s `data-plot-plugin` wrapper, `$lib/chat` `Chips` contract, Sparkline's `data-plot-baseline|highlight|trend` emission, chart geom/grid selectors, `ShellDemoType`/`catalog`/`DEMO_ROUTE` insertion points, `MarkdownRenderer.plugins`, `/guides/charts` routing, the `label.row.check` legend selector) **CONFIRMED against the live code, zero mismatches**.
- **Depth gate** — found one real blocker: `Sparkline` auto-anchors the baseline for `type='bar'` + negative data (`effectiveBaseline = baseline ?? (type === 'bar' && hasNegative ? 0 : undefined)`), so a bar baseline toggle is inert. **Fixed:** correction #6 added, the store defaults to `type: 'line'`, and the e2e asserts the on↔off transition on `line` (presence-only on `bar`). Also **fixed:** the two "eyeball" steps are now marked optional/skippable for unattended runs with Part 3 as the authoritative gate.
