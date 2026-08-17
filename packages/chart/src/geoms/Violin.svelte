<script lang="ts">
	import { getContext, onMount, onDestroy } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'
	import { GeomState } from './lib/GeomState.svelte.js'
	import { buildViolinMarks } from './lib/marks/violin.js'

	type Props = {
		x?: string
		y?: string
		/** Violin interior aesthetic (field); defaults to `x`. */
		fill?: string
		/** Outline aesthetic (field); overrides the silhouette stroke when set. */
		color?: string
		stat?: string
		/** Half-violin: 'left'/'right' draw one side (flat edge at the band centre) for
		 *  raincloud/split plots; 'center' (default) is the full symmetric silhouette. */
		side?: 'left' | 'right' | 'center'
		/** Data field driving a texture fill (from the shared pattern set) instead of a solid fill. */
		pattern?: string
		/** Fixed violin opacity 0–1; defaults to the per-geom preset (violin = 0.5). */
		alpha?: number
	}

	let { x, y, fill, color, stat = 'boxplot', side = 'center', pattern, alpha }: Props = $props()

	const plotState = getContext<PlotState>('plot-state')

	// Fall back to the root Plot channels when the geom omits x/y (composes under
	// <Plot.Root x y> without silently NaN-ing).
	const xf = $derived(x ?? plotState.channels?.x)
	const yf = $derived(y ?? plotState.channels?.y)
	// fill ?? effective-x drives the colors map for both violin interior and outline
	const fillChannel = $derived(fill ?? xf)

	const geom = new GeomState(plotState, () => ({
		type: 'violin',
		channels: { x: xf, y: yf, fill: fillChannel, color, pattern },
		stat,
		options: { side },
		alpha,
		build: buildViolinMarks
	}))
	onMount(geom.register)
	onDestroy(geom.destroy)
	$effect(geom.sync)

	const violins = $derived(geom.marks)
</script>

{#if violins.length > 0}
	<g data-plot-geom="violin">
		{#each violins as v, i (`${String(v.cx)}::${i}`)}
			<path
				d={v.d}
				fill={v.fill}
				fill-opacity={v.alpha}
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
