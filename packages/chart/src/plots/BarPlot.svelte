<script>
	import { getContext } from 'svelte'
	import { colorBrewer } from '../lib/colors'

	let chart = getContext('chart')

	export let labels = false
	export let fontSize = $chart.height / 32
	export let color = 'white'

	$: fills = colorBrewer($chart.data.map((d) => d.fill))
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
		fill: fills[d.fill],
		label: {
			x: $chart.flipCoords
				? $chart.scale.x(d.x) - $chart.scale.x(0) - 10
				: $chart.scale.x.bandwidth() / 2,
			y: $chart.flipCoords ? $chart.scale.y.bandwidth() / 2 : 10,
			angle: $chart.flipCoords ? 0 : -90,
			text: $chart.flipCoords ? d.y + ' (' + d.x + ')' : d.x + ' (' + d.y + ')'
		}
	}))

	// $: console.log(data)
</script>

{#each data as { x, y, width, height, fill, label }}
	<rect {x} {y} {width} {height} {fill} />
	{#if labels}
		{@const tx = x + label.x}
		{@const ty = y + label.y}
		<text
			x={tx}
			y={ty}
			transform="rotate({label.angle},{tx},{ty})"
			font-size={fontSize}
			text-anchor="end"
			alignment-baseline="middle"
			fill={color}
		>
			{label.text}
		</text>
	{/if}
{/each}
