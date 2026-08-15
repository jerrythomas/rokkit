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
		options?: { opacity?: number }
	}

	let { x, y, fill, r = 2, method = 'jitter', options = {} }: Props = $props()

	const plotState = getContext<PlotState>('plot-state')
	let id = $state<string | null>(null)

	// fill ?? x drives the color lookup
	const fillChannel = $derived(fill ?? x)

	onMount(() => {
		id = plotState.registerGeom({
			type: 'jitter',
			channels: { x, y, color: fillChannel },
			stat: 'identity',
			options
		})
	})
	onDestroy(() => {
		if (id) plotState.unregisterGeom(id)
	})

	$effect(() => {
		if (id) plotState.updateGeom(id, { channels: { x, y, color: fillChannel }, stat: 'identity' })
	})

	const data = $derived(id ? plotState.geomData(id) : [])
	const xScale = $derived(plotState.xScale)
	const yScale = $derived(plotState.yScale)
	const colors = $derived(plotState.colors)

	const points = $derived.by(() => {
		if (!data?.length || !xScale || !yScale) return []
		return buildSwarm(data, { x, y, fill: fillChannel }, xScale, yScale, colors, { method, r })
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
				aria-label={`(${String(pt.data[x ?? ''])}, ${String(pt.data[y ?? ''])})`}
				onmouseenter={() => plotState.setHovered(pt.data)}
				onmouseleave={() => plotState.clearHovered()}
			/>
		{/each}
	</g>
{/if}
