<script lang="ts">
	import { getContext, onMount, onDestroy } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'
	import { GeomState } from './lib/GeomState.svelte.js'
	import { buildHexbinMarks, hexPath } from './lib/marks/hexbin.js'

	type Props = {
		x?: string
		y?: string
		color?: string
		fill?: string
		/** Fixed hex opacity 0–1; defaults to the per-geom preset (hexbin = 1). */
		alpha?: number
		stat?: string
		options?: { radius?: number }
	}

	let { x, y, color, fill, alpha, stat = 'identity', options = {} }: Props = $props()

	const colorField = $derived(fill ?? color)
	const radius = $derived(options.radius ?? 20)
	const plotState = getContext<PlotState>('plot-state')

	const geom = new GeomState(plotState, () => ({
		type: 'hexbin',
		channels: { x, y, color: colorField },
		stat,
		options,
		alpha,
		build: buildHexbinMarks
	}))
	onMount(geom.register)
	onDestroy(geom.destroy)
	$effect(geom.sync)

	const hexes = $derived(geom.marks)
	const hex = $derived(hexPath(radius))
</script>

{#if hexes.length > 0}
	<g data-plot-geom="hexbin">
		{#each hexes as h (h.key)}
			<path
				transform="translate({h.cx},{h.cy})"
				d={hex}
				fill={h.fill}
				fill-opacity={h.alpha}
				stroke="white"
				stroke-width="0.5"
				data-plot-element="hex"
				role="img"
				onmouseenter={() => plotState.setHovered(h.data)}
				onmouseleave={() => plotState.clearHovered()}
			>
				<title>{h.count} points</title>
			</path>
		{/each}
	</g>
{/if}
