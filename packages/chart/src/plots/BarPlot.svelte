<script>
	import { getContext } from 'svelte'

	let chart = getContext('chart')

	// export let limit = 8

	$: data = $chart.data.map((d) => ({
		x: $chart.flipCoords ? $chart.scale.x(0) : $chart.scale.x(d.x),
		y: $chart.flipCoords ? $chart.scale.y(d.y) : $chart.scale.y(d.y),
		y0: $chart.scale.y(0),
		width: $chart.flipCoords
			? $chart.scale.x(d.x) - $chart.scale.x(0)
			: $chart.scale.x.bandwidth(),
		height: $chart.flipCoords
			? $chart.scale.y.bandwidth()
			: $chart.scale.y(0) - $chart.scale.y(d.y),
		fill: 'red',
		xlabel: d.x,
		ylabel: d.y
	}))

	$: console.log(data)
</script>

{#each data as { x, y, width, height, fill }}
	<rect {x} {y} {width} {height} {fill} />
	<!-- <text
		x={size(item[fields.x])}
		y={top(item[fields.y])}
		font-size="8"
		text-anchor="middle"
	>
		{item[fields.y]}
	</text> -->
	<!-- <text x="10" y={top(item[fields.y]) + 10}>{item[fields.x]}</text> -->
{/each}
