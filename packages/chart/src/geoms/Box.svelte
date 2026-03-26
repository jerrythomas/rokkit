<script>
	import { getContext, onMount, onDestroy } from 'svelte'
	import { buildBoxes } from '../lib/brewing/marks/boxes.js'

	let { x, y, fill, stat = 'boxplot', options = {} } = $props()

	const plotState = getContext('plot-state')
	let id = $state(null)

	// fill ?? x drives the colors map for both box interior and whisker strokes
	const fillChannel = $derived(fill ?? x)

	onMount(() => {
		id = plotState.registerGeom({
			type: 'box',
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

	const boxes = $derived.by(() => {
		if (!data?.length || !xScale || !yScale) return []
		return buildBoxes(data, { x, fill: fillChannel }, xScale, yScale, colors)
	})
</script>

{#if boxes.length > 0}
	<g data-plot-geom="box">
		{#each boxes as box, i (`${String(box.cx)}::${i}`)}
			{@const x0 = box.cx - box.width / 2}
			{@const xMid = box.cx}
			{@const xCap0 = box.cx - box.whiskerWidth / 2}
			{@const xCap1 = box.cx + box.whiskerWidth / 2}
			<!-- Box body (IQR): lighter fill shade -->
			<rect
				x={x0}
				y={box.q3}
				width={box.width}
				height={Math.max(0, box.q1 - box.q3)}
				fill={box.fill}
				fill-opacity={options?.opacity ?? plotState.chartPreset.opacity.box}
				stroke={box.stroke}
				stroke-width="1"
				data-plot-element="box-body"
				role="presentation"
				onmouseenter={() => plotState.setHovered(box.data)}
				onmouseleave={() => plotState.clearHovered()}
			/>
			<!-- Median line: darker stroke shade -->
			<line
				x1={x0}
				y1={box.median}
				x2={x0 + box.width}
				y2={box.median}
				stroke={box.stroke}
				stroke-width="2"
				data-plot-element="box-median"
			/>
			<!-- Lower whisker (q1 to iqr_min) -->
			<line
				x1={xMid}
				y1={box.q1}
				x2={xMid}
				y2={box.iqr_min}
				stroke={box.stroke}
				stroke-width="1"
				data-plot-element="box-whisker"
			/>
			<!-- Upper whisker (q3 to iqr_max) -->
			<line
				x1={xMid}
				y1={box.q3}
				x2={xMid}
				y2={box.iqr_max}
				stroke={box.stroke}
				stroke-width="1"
				data-plot-element="box-whisker"
			/>
			<!-- Lower whisker cap -->
			<line
				x1={xCap0}
				y1={box.iqr_min}
				x2={xCap1}
				y2={box.iqr_min}
				stroke={box.stroke}
				stroke-width="1"
			/>
			<!-- Upper whisker cap -->
			<line
				x1={xCap0}
				y1={box.iqr_max}
				x2={xCap1}
				y2={box.iqr_max}
				stroke={box.stroke}
				stroke-width="1"
			/>
			<!-- Outlier rendering deferred: buildBoxes does not compute outliers yet -->
		{/each}
	</g>
{/if}
