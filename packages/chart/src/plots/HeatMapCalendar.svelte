<script>
	import { summarize, heatmap } from './heatmap'
	import { interpolateHsl } from 'd3-interpolate'
	import { scaleLinear } from 'd3-scale'
	import ContinuousLegend from '../elements/ContinuousLegend.svelte'
	import DiscreteLegend from '../elements/DiscreteLegend.svelte'
	import ColorRamp from '../elements/ColorRamp.svelte'

	const dayLabelWidth = 20
	const labelHeight = 6

	export let data
	export let dateField = 'date'
	export let valueField = null
	export let months = 12
	export let colors = [transparent, '#FB8C00']
	export let padding = 8
	export let space = 2
	export let size = 10
	export let maximum = 10
	export let tickCount = 5
	export let discreteLegend = false

	export let tooltipText = (d) => `${d.date} => ${d.value}`

	let tooltip = null

	function showToolTip(event, d) {
		tooltip = d
	}
	function hideToolTip() {
		tooltip = null
	}
	$: scale = scaleLinear()
		.domain([0, maximum])
		.range(colors)
		.interpolate(interpolateHsl)

	$: legendHeight = 2 * size + space * 3
	$: sizeWithSpace = size + space
	$: summary = summarize(data, dateField, valueField)
	$: datamap = heatmap(summary, months)
	$: width =
		datamap.numberOfWeeks * sizeWithSpace + dayLabelWidth + 2 * padding - space
	$: height = 7 * sizeWithSpace + labelHeight + 2 * padding + legendHeight
</script>

<div>
	<svg class="chart" viewBox="0 0 {width} {height}">
		{#if tooltip}
			<text
				x={padding + dayLabelWidth}
				y={padding + legendHeight - labelHeight}
				text-anchor="start"
				font-size={labelHeight}
			>
				{tooltipText(tooltip)}
			</text>
		{/if}
		{#if discreteLegend}
			<DiscreteLegend
				{scale}
				x={width - (tickCount + 1) * sizeWithSpace - padding - space}
				y={padding}
				{tickCount}
			/>
		{:else}
			<ColorRamp {scale} x={width - 100 - padding} y={padding} {tickCount} />
			<!-- <ContinuousLegend
				{scale}
				x={width - 100 - padding}
				y={padding}
				{tickCount}
			/> -->
		{/if}
		{#each datamap.weekdays as name, i}
			<text
				x={padding + dayLabelWidth - 2 * space}
				y={padding +
					legendHeight +
					i * sizeWithSpace +
					labelHeight +
					(size - labelHeight) / 2}
				text-anchor="end"
				font-size={labelHeight}>{name}</text
			>
		{/each}

		{#each datamap.grid as d}
			<rect
				x={d.x * sizeWithSpace + padding + dayLabelWidth}
				y={d.y * sizeWithSpace + padding + legendHeight}
				width={size}
				height={size}
				fill={scale(d.value)}
				rx="1"
				ry="1"
				on:mouseover={(e) => showToolTip(e, d)}
				on:focus={(e) => showToolTip(e, d)}
				on:blur={hideToolTip}
				on:mouseout={hideToolTip}
			/>
		{/each}

		{#each Object.keys(datamap.months) as name}
			<text
				x={padding + dayLabelWidth + datamap.months[name] * sizeWithSpace}
				y={padding + legendHeight + 7 * sizeWithSpace + 3 * space}
				text-anchor="start"
				font-size={labelHeight}
				fill="currentColor">{name}</text
			>
		{/each}
	</svg>
</div>

<style>
	div {
		position: relative;
	}
	rect {
		stroke: currentColor;
		stroke-width: 0.5;
		stroke-opacity: 0.1;
	}
	text {
		fill: currentColor;
	}
</style>
