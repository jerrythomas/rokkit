<script>
	import { getContext, onMount, onDestroy } from 'svelte'

	let {
		x,
		y,
		color,
		fill: fillProp,
		stat = 'identity',
		options = {}
	} = $props()

	const colorChannel = $derived(fillProp ?? color)

	const plotState = getContext('plot-state')
	let id = $state(null)

	onMount(() => {
		id = plotState.registerGeom({
			type: 'heatmap',
			channels: { x, y, color: colorChannel },
			stat
		})
	})
	onDestroy(() => {
		if (id) plotState.unregisterGeom(id)
	})

	$effect(() => {
		if (id)
			plotState.updateGeom(id, {
				channels: { x, y, color: colorChannel },
				stat
			})
	})

	const data = $derived(id ? plotState.geomData(id) : [])
	const xScale = $derived(plotState.xScale)
	const yScale = $derived(plotState.yScale)
	const continuousColor = $derived(plotState.continuousColorScale)
	const categoricalColors = $derived(plotState.colors)
	const rx = $derived(options.rounded ?? 0)

	const cells = $derived.by(() => {
		if (!data?.length || !xScale || !yScale) return []
		const bwX = typeof xScale.bandwidth === 'function' ? xScale.bandwidth() : 0
		const bwY = typeof yScale.bandwidth === 'function' ? yScale.bandwidth() : 0

		return data.map((d, i) => {
			const xVal = d[x]
			const yVal = d[y]
			const colorVal = colorChannel ? d[colorChannel] : null
			let cellFill = '#ccc'

			if (continuousColor) {
				cellFill = continuousColor.scale(Number(colorVal))
			} else if (categoricalColors?.has(colorVal)) {
				cellFill = categoricalColors.get(colorVal).fill
			}

			return {
				key: `${xVal}-${yVal}-${i}`,
				x: xScale(xVal) ?? 0,
				y: yScale(yVal) ?? 0,
				width: bwX,
				height: bwY,
				fill: cellFill,
				data: d
			}
		})
	})
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
				rx={rx}
				data-plot-element="cell"
				onmouseenter={() => plotState.setHovered(cell.data)}
				onmouseleave={() => plotState.clearHovered()}
			>
				<title>{cell.data[x]}, {cell.data[y]}: {colorChannel ? cell.data[colorChannel] : ''}</title>
			</rect>
		{/each}
	</g>
{/if}
