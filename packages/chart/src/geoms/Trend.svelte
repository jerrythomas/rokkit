<script lang="ts">
	import { getContext } from 'svelte'
	import { line as d3line } from 'd3-shape'
	import type { PlotState } from '../PlotState.svelte.js'
	import { computeTrend } from '../lib/trend.js'
	import { scalePos } from '../lib/scale.js'

	type Method = string | number | { type: string; [k: string]: unknown }
	type Props = { x?: string; y?: string; trend?: Method | Method[] }
	let { x, y, trend = undefined }: Props = $props()

	const state = getContext<PlotState>('plot-state')

	const methods = $derived(
		Array.isArray(trend) ? trend : trend === null || trend === undefined ? [] : [trend]
	)

	const typeOf = (m: Method) => {
		const t = typeof m === 'string' ? m : typeof m === 'number' ? 'value' : (m?.type ?? '')
		return t === 'mean' ? 'avg' : t
	}

	/** Everything a path builder needs, resolved once per derivation. */
	type Ctx = {
		rows: Record<string, unknown>[]
		// Scales come from PlotState (untyped JS), so they stay loose here.
		xs: (v: unknown) => number
		ys: (v: number) => number
		x: string
		y: string
		innerWidth: number
	}

	const isDrawable = (s: PlotState | undefined) =>
		Boolean(s?.xScale && s?.yScale && s?.data?.length)

	/** Null until the plot has data, both scales, both channels and at least one method. */
	const ctx = $derived.by((): Ctx | null => {
		if (!isDrawable(state) || !x || !y || !methods.length) return null
		return { rows: state.data, xs: state.xScale, ys: state.yScale, x, y, innerWidth: state.innerWidth }
	})

	/** A flat rule spanning the plot — what every `constant` trend (avg, median, min…) draws. */
	const constantPath = (c: Ctx, value: number) => {
		const yy = c.ys(value)
		return `M0,${yy} L${c.innerWidth},${yy}`
	}

	/** A polyline through the trend's per-row values, dropping points that don't place. */
	function seriesPath(c: Ctx, values: number[]): string | null {
		const pts = values
			.map((v, i) => ({ vx: scalePos(c.xs, c.rows[i][c.x]), vy: c.ys(v) }))
			.filter((p) => Number.isFinite(p.vx) && Number.isFinite(p.vy))
		return d3line<{ vx: number; vy: number }>()
			.x((p) => p.vx)
			.y((p) => p.vy)(pts)
	}

	/** One method → one path, or null when the method doesn't resolve for this data. */
	function trendPath(c: Ctx, m: Method, i: number) {
		const res = computeTrend(c.rows, { x: c.x, y: c.y }, m)
		if (!res) return null
		const d = res.kind === 'constant' ? constantPath(c, res.value) : seriesPath(c, res.values)
		return d ? { d, type: typeOf(m), i } : null
	}

	const paths = $derived.by(() => {
		if (!ctx) return []
		return methods.map((m, i) => trendPath(ctx, m, i)).filter((p) => p !== null)
	})
</script>

{#if paths.length}
	<g data-plot-geom="trend">
		{#each paths as p (p.i)}
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
