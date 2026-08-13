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
		if (p === undefined) return NaN
		return typeof scale.bandwidth === 'function' ? p + scale.bandwidth() / 2 : p
	}

	const marks = $derived.by(() => {
		const rows = state?.data ?? []
		const xs = state?.xScale
		const ys = state?.yScale
		if (!rows.length || !xs || !ys || highlight === null || highlight === undefined || !x || !y)
			return []
		return resolveHighlight(rows, highlight, { y })
			.map((i) => {
				const row = rows[i]
				return { i, cx: scaleX(xs, row[x]), cy: ys(Number(row[y])), row }
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
		{#each marks as m (m.i)}
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
