<script>
	import { getContext } from 'svelte'

	let chart = getContext('chart')

	// export let data = []
	export let limit = 8
	export let fields
	// export let valueFormat
	// export let scales
	export let colors
	export let h = 10

	function size(value) {
		return $chart.axis.x.scale(value)
	}
	function top(value) {
		return $chart.axis.y.scale(value)
	}

	$: bars = $chart.data.slice(0, limit)
</script>

{#each bars as item}
	<rect
		x="0"
		y={top(item[fields.y]) + h / 2}
		width={size(item[fields.x])}
		height={h * 3}
		fill={colors[item[fields.label]]}
	/>
	<text x="10" y={top(item[fields.y]) + 2.5 * h}>{item[fields.label]}</text>
	<!-- <text x="10" y={top(item[fields.y]) + 10}>{item[fields.x]}</text> -->
{/each}
