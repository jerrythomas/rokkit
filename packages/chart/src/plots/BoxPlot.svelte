<script>
	import { getContext } from 'svelte'

	let chart = getContext('chart')

	export let whisker = true
	export let boxWidth = 150
	export let stroke = 'green'
	export let fill = '#69b3a2' // fixed color or attribute to be used for color
	export let scaleFill = () => fill // defaults to fill color

	$: data = $chart.summary()
</script>

{#each data as { key, value }}
	<rect
		width={boxWidth}
		height={$chart.axis.y.scale(value.q1) - $chart.axis.y.scale(value.q3)}
		x={$chart.axis.x.scale(key) - boxWidth / 2}
		y={$chart.axis.y.scale(value.q3)}
		fill={scaleFill(value[fill])}
		{stroke}
	/>
	<line
		x1={$chart.axis.x.scale(key) - boxWidth / 2}
		x2={$chart.axis.x.scale(key) + boxWidth / 2}
		y1={$chart.axis.y.scale(value.median)}
		y2={$chart.axis.y.scale(value.median)}
		{stroke}
	/>
	<line
		x1={$chart.axis.x.scale(key)}
		x2={$chart.axis.x.scale(key)}
		y1={$chart.axis.y.scale(value.min)}
		y2={$chart.axis.y.scale(value.max)}
		{stroke}
	/>
	{#if whisker}
		<line
			x1={$chart.axis.x.scale(key) - boxWidth / 8}
			x2={$chart.axis.x.scale(key) + boxWidth / 8}
			y1={$chart.axis.y.scale(value.min)}
			y2={$chart.axis.y.scale(value.min)}
			{stroke}
		/>
		<line
			x1={$chart.axis.x.scale(key) - boxWidth / 8}
			x2={$chart.axis.x.scale(key) + boxWidth / 8}
			y1={$chart.axis.y.scale(value.max)}
			y2={$chart.axis.y.scale(value.max)}
			{stroke}
		/>
	{/if}
{/each}
