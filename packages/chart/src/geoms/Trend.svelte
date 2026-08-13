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

	const paths = $derived.by(() => {
		const rows = state?.data ?? []
		const xs = state?.xScale
		const ys = state?.yScale
		if (!rows.length || !xs || !ys || !x || !y || !methods.length) return []
		const out: { d: string; type: string; i: number }[] = []
		methods.forEach((m, idx) => {
			const res = computeTrend(rows, { x, y }, m)
			if (!res) return
			if (res.kind === 'constant') {
				const yy = ys(res.value)
				out.push({ d: `M0,${yy} L${state.innerWidth},${yy}`, type: typeOf(m), i: idx })
			} else {
				const pts = res.values
					.map((v, i) => ({ vx: scalePos(xs, rows[i][x]), vy: ys(v) }))
					.filter((p) => Number.isFinite(p.vx) && Number.isFinite(p.vy))
				const gen = d3line<{ vx: number; vy: number }>()
					.x((p) => p.vx)
					.y((p) => p.vy)
				const d = gen(pts)
				if (d) out.push({ d, type: typeOf(m), i: idx })
			}
		})
		return out
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
