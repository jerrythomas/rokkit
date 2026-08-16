<script lang="ts">
	import { getContext, onMount, onDestroy } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'
	import { buildViolins } from '../lib/brewing/marks/violins.js'

	type Props = {
		x?: string
		y?: string
		fill?: string
		stat?: string
		/** Half-violin: 'left'/'right' draw one side (flat edge at the band centre) for
		 *  raincloud/split plots; 'center' (default) is the full symmetric silhouette. */
		side?: 'left' | 'right' | 'center'
		/** Data field driving a texture fill (from the shared pattern set) instead of a solid fill. */
		pattern?: string
		options?: { opacity?: number }
	}

	let { x, y, fill, stat = 'boxplot', side = 'center', pattern, options = {} }: Props = $props()

	const plotState = getContext<PlotState>('plot-state')
	let id = $state<string | null>(null)

	// Fall back to the root Plot channels when the geom omits x/y (composes under
	// <Plot.Root x y> without silently NaN-ing).
	const xf = $derived(x ?? plotState.channels?.x)
	const yf = $derived(y ?? plotState.channels?.y)
	// fill ?? effective-x drives the colors map for both violin interior and outline
	const fillChannel = $derived(fill ?? xf)

	onMount(() => {
		id = plotState.registerGeom({
			type: 'violin',
			channels: { x: xf, y: yf, color: fillChannel, pattern },
			stat,
			options
		})
	})
	onDestroy(() => {
		if (id) plotState.unregisterGeom(id)
	})

	$effect(() => {
		if (id)
			plotState.updateGeom(id, { channels: { x: xf, y: yf, color: fillChannel, pattern }, stat })
	})

	const data = $derived(id ? plotState.geomData(id) : [])
	const xScale = $derived(plotState.xScale)
	const yScale = $derived(plotState.yScale)
	const colors = $derived(plotState.colors)
	const patterns = $derived(plotState.patterns)

	const violins = $derived.by(() => {
		if (!data?.length || !xScale || !yScale) return []
		return buildViolins(
			data,
			{ x: xf, fill: fillChannel, pattern },
			xScale,
			yScale,
			colors,
			plotState.place.bind(plotState),
			side,
			patterns
		)
	})
</script>

{#if violins.length > 0}
	<g data-plot-geom="violin">
		{#each violins as v, i (`${String(v.cx)}::${i}`)}
			<path
				d={v.d}
				fill={v.fill}
				fill-opacity={options?.opacity ?? plotState.chartPreset.opacity.violin}
				stroke={v.stroke}
				stroke-width="1.5"
				data-plot-element="violin"
				role="presentation"
				onmouseenter={() => plotState.setHovered(v.data)}
				onmouseleave={() => plotState.clearHovered()}
			/>
			{#if v.patternId}
				<!-- Texture fill overlay (matches the violin silhouette) -->
				<path d={v.d} fill="url(#{v.patternId})" pointer-events="none" />
			{/if}
		{/each}
	</g>
{/if}
