<script>
	import { getContext } from 'svelte'
	import { colorBrewer } from '../lib/colors'

	let chart = getContext('chart')

	export let size = $chart.height / 128

	$: colors = colorBrewer($chart.data.map((d) => d.fill))
	$: points = $chart.data.map((d) => ({
		cx: $chart.scale.x(d.x),
		cy: $chart.scale.y(d.y),
		fill: colors[d.fill]
	}))
	// support shapes and sizes for scatter
</script>

{#each points as { cx, cy, fill }}
	<circle {cx} {cy} r={size} {fill} fill-opacity="0.5" />
{/each}
