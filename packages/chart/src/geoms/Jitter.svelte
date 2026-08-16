<script lang="ts">
	import { getContext, onMount, onDestroy } from 'svelte'
	import type { PlotState } from '../PlotState.svelte.js'
	import { buildSwarm } from '../lib/brewing/marks/swarm.js'

	type Props = {
		x?: string
		y?: string
		fill?: string
		r?: number
		method?: 'jitter' | 'swarm'
		/** Confine points to one half of the band (raincloud/split plots). Default 'center'. */
		side?: 'left' | 'right' | 'center'
		options?: { opacity?: number }
	}

	let { x, y, fill, r = 2, method = 'jitter', side = 'center', options = {} }: Props = $props()

	const plotState = getContext<PlotState>('plot-state')
	let id = $state<string | null>(null)

	// Fall back to the root Plot channels when the geom omits x/y (composes under
	// <Plot.Root x y> without silently NaN-ing).
	const xf = $derived(x ?? plotState.channels?.x)
	const yf = $derived(y ?? plotState.channels?.y)
	// fill ?? effective-x drives the color lookup
	const fillChannel = $derived(fill ?? xf)

	onMount(() => {
		id = plotState.registerGeom({
			type: 'jitter',
			channels: { x: xf, y: yf, color: fillChannel },
			stat: 'identity',
			options
		})
	})
	onDestroy(() => {
		if (id) plotState.unregisterGeom(id)
	})

	$effect(() => {
		if (id) plotState.updateGeom(id, { channels: { x: xf, y: yf, color: fillChannel }, stat: 'identity' })
	})

	const data = $derived(id ? plotState.geomData(id) : [])
	const xScale = $derived(plotState.xScale)
	const yScale = $derived(plotState.yScale)
	const colors = $derived(plotState.colors)

	const points = $derived.by(() => {
		if (!data?.length || !xScale || !yScale) return []
		const raw = buildSwarm(data, { x: xf, y: yf, fill: fillChannel }, xScale, yScale, colors, { method, r, side })
		if (!plotState.isFlipped) return raw
		// Horizontal: the band axis (swarm spread) stands up on screen-Y and the value
		// axis runs along screen-X — swap the computed coords through place().
		return raw.map((p) => {
			const s = plotState.place(p.cx, p.cy)
			return { ...p, cx: s.x, cy: s.y }
		})
	})
</script>

{#if points.length > 0}
	<g data-plot-geom="jitter">
		{#each points as pt, i (`${String(pt.cx)}::${i}`)}
			<circle
				cx={pt.cx}
				cy={pt.cy}
				{r}
				fill={pt.fill}
				fill-opacity={options?.opacity ?? plotState.chartPreset.opacity.point}
				stroke={pt.stroke}
				stroke-width="0.5"
				data-plot-element="jitter-point"
				role="graphics-symbol"
				aria-label={`(${String(pt.data[xf ?? ''])}, ${String(pt.data[yf ?? ''])})`}
				onmouseenter={() => plotState.setHovered(pt.data)}
				onmouseleave={() => plotState.clearHovered()}
			/>
		{/each}
	</g>
{/if}
