<script lang="ts">
	import { getContext } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'
	import { resolveHighlight } from '../lib/highlight.js'
	import { scalePos } from '../lib/scale.js'
	import { resolveLabel } from './lib/aesthetics.js'

	type Row = Record<string, unknown>
	type Props = {
		x?: string
		y?: string
		highlight?: 'first' | 'last' | 'min' | 'max' | number | ((row: Row, i: number) => boolean)
		label?: boolean | string | ((row: Row) => unknown)
	}
	let { x, y, highlight = undefined, label = false }: Props = $props()

	const state = getContext<PlotState>('plot-state')

	const marks = $derived.by(() => {
		const rows = state?.data ?? []
		const xs = state?.xScale
		const ys = state?.yScale
		if (!xs || !ys || !x || !y) return []
		const selectedRows = state?.selectedRows ?? []
		const selectedSet = new Set(selectedRows)
		const out = []
		const seen = new Set()
		if (highlight !== null && highlight !== undefined && rows.length) {
			for (const i of resolveHighlight(rows, highlight, { y })) {
				const row = rows[i]
				out.push({
					key: `h${i}`,
					cx: scalePos(xs, row[x]),
					cy: ys(Number(row[y])),
					row,
					// A statically-highlighted point that is also selected renders as
					// selected — selection is the stronger, interactive state.
					selected: selectedSet.has(row)
				})
				seen.add(row)
			}
		}
		selectedRows.forEach((row, j) => {
			if (seen.has(row)) return
			out.push({
				key: `s${j}`,
				cx: scalePos(xs, row[x]),
				cy: ys(Number(row[y])),
				row,
				selected: true
			})
		})
		return out.filter((m) => Number.isFinite(m.cx) && Number.isFinite(m.cy))
	})

</script>

{#if marks.length}
	<g data-plot-geom="highlight">
		{#each marks as m (m.key)}
			<circle
				cx={m.cx}
				cy={m.cy}
				data-plot-highlight
				data-plot-selected={m.selected ? 'true' : undefined}
			/>
			{#if label}
				{@const text = resolveLabel(label, m.row, y)}
				{#if text}
					<text x={m.cx} y={m.cy} dy="-8" text-anchor="middle" data-plot-highlight-label
						>{text}</text
					>
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
		/* Visual only — let clicks pass through to the data hit target beneath so the
		   highlighted/selected observation stays selectable (and de-selectable). */
		pointer-events: none;
	}
	[data-plot-highlight-label] {
		fill: currentColor;
		font-size: 11px;
	}
	[data-plot-highlight][data-plot-selected='true'] {
		stroke: var(
			--chart-selected-ring,
			var(--chart-highlight-color, rgb(var(--color-accent-500, 194 65 12)))
		);
		stroke-width: var(--chart-selected-ring-width, 2);
		fill: var(--chart-selected-fill, var(--color-paper, #fff));
	}
</style>
