<script>
	import { getContext, onMount, onDestroy } from 'svelte'
	import { buildAreas, buildStackedAreas } from './lib/areas.js'

	let { x, y, color, pattern, stat = 'identity', options = {} } = $props()

	const plotState = getContext('plot-state')
	let id = $state(null)

	onMount(() => {
		id = plotState.registerGeom({
			type: 'area',
			channels: { x, y, color, pattern },
			stat,
			options: { stack: options?.stack ?? false }
		})
	})
	onDestroy(() => {
		if (id) plotState.unregisterGeom(id)
	})

	$effect(() => {
		if (id)
			plotState.updateGeom(id, {
				channels: { x, y, color, pattern },
				stat,
				options: { stack: options?.stack ?? false }
			})
	})

	const data = $derived(id ? plotState.geomData(id) : [])
	const xScale = $derived(plotState.xScale)
	const yScale = $derived(plotState.yScale)
	const colors = $derived(plotState.colors)
	const patterns = $derived(plotState.patterns)

	const areas = $derived.by(() => {
		if (!data?.length || !xScale || !yScale) return []
		const channels = { x, y, color, pattern }
		if (options.stack) {
			return buildStackedAreas(data, channels, xScale, yScale, colors, options.curve, patterns)
		}
		return buildAreas(data, channels, xScale, yScale, colors, options.curve, patterns)
	})
</script>

{#if areas.length > 0}
	<g data-plot-geom="area">
		{#each areas as seg (seg.key ?? seg.d)}
			<path
				d={seg.d}
				fill={seg.fill}
				fill-opacity={seg.patternId ? 1 : (options.opacity ?? plotState.chartPreset.opacity.area)}
				stroke={seg.stroke ?? 'none'}
				data-plot-element="area"
			/>
			{#if seg.patternId}
				<path d={seg.d} fill="url(#{seg.patternId})" data-plot-element="area" />
			{/if}
		{/each}
		<!-- Invisible hit circles for tooltip: one per data point -->
		{#each data as d, i (`hover::${i}`)}
			{@const px = typeof xScale?.bandwidth === 'function' ? (xScale(d[x]) ?? 0) + xScale.bandwidth() / 2 : (xScale?.(d[x]) ?? 0)}
			{@const py = yScale?.(d[y]) ?? 0}
			<circle
				cx={px}
				cy={py}
				r="8"
				fill="transparent"
				stroke="none"
				role="presentation"
				data-plot-element="area-hover"
				onmouseenter={() => plotState.setHovered(d)}
				onmouseleave={() => plotState.clearHovered()}
			/>
		{/each}
	</g>
{/if}
