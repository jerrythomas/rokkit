<script>
	import { getContext, onMount, onDestroy } from 'svelte'
	import { buildViolins } from '../lib/brewing/marks/violins.js'

	let { x, y, fill, stat = 'boxplot', options = {} } = $props()

	const plotState = getContext('plot-state')
	let id = $state(null)

	// fill ?? x drives the colors map for both violin interior and outline
	const fillChannel = $derived(fill ?? x)

	onMount(() => {
		id = plotState.registerGeom({
			type: 'violin',
			channels: { x, y, color: fillChannel },
			stat,
			options
		})
	})
	onDestroy(() => {
		if (id) plotState.unregisterGeom(id)
	})

	$effect(() => {
		if (id) plotState.updateGeom(id, { channels: { x, y, color: fillChannel }, stat })
	})

	const data = $derived(id ? plotState.geomData(id) : [])
	const xScale = $derived(plotState.xScale)
	const yScale = $derived(plotState.yScale)
	const colors = $derived(plotState.colors)

	const violins = $derived.by(() => {
		if (!data?.length || !xScale || !yScale) return []
		return buildViolins(data, { x, fill: fillChannel }, xScale, yScale, colors)
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
		{/each}
	</g>
{/if}
