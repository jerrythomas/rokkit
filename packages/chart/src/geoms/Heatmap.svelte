<script lang="ts">
	import { getContext, onMount, onDestroy } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'
	import { GeomState } from './lib/GeomState.svelte.js'
	import { buildHeatmapMarks } from './lib/marks/heatmap.js'

	type Props = {
		x?: string
		y?: string
		color?: string
		fill?: string
		/** Fixed cell opacity 0–1; defaults to the per-geom preset (heatmap = 1). */
		alpha?: number
		stat?: string
		options?: { rounded?: number }
	}

	let { x, y, color, fill, alpha, stat = 'identity', options = {} }: Props = $props()

	const colorField = $derived(fill ?? color)
	const plotState = getContext<PlotState>('plot-state')

	const geom = new GeomState(plotState, () => ({
		type: 'heatmap',
		channels: { x, y, color: colorField },
		stat,
		options,
		alpha,
		build: buildHeatmapMarks
	}))
	onMount(geom.register)
	onDestroy(geom.destroy)
	$effect(geom.sync)

	const cells = $derived(geom.marks)
	const rx = $derived(options.rounded ?? 0)
</script>

{#if cells.length > 0}
	<g data-plot-geom="heatmap">
		{#each cells as cell (cell.key)}
			<rect
				x={cell.x}
				y={cell.y}
				width={Math.max(0, cell.width)}
				height={Math.max(0, cell.height)}
				fill={cell.fill}
				fill-opacity={cell.alpha}
				rx={rx}
				data-plot-element="cell"
				role="img"
				onmouseenter={() => plotState.setHovered(cell.data)}
				onmouseleave={() => plotState.clearHovered()}
			>
				<title>{cell.data[x ?? '']}, {cell.data[y ?? '']}: {colorField ? cell.data[colorField] : ''}</title>
			</rect>
		{/each}
	</g>
{/if}
