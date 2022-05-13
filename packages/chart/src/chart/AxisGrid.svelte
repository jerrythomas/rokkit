<script>
	import { getContext } from 'svelte'

	const axis = getContext('axis')
	const chart = getContext('chart')

	let [y1, y2] = $chart.scale.y.range()
	let [x1, x2] = $chart.scale.x.range()
	$: dx = $axis.name === 'x' ? 0 : 1
	$: dy = $axis.name === 'x' ? 1 : 0
</script>

{#each $axis.ticks as tick}
	<line
		x1={tick.x + tick.offset.x}
		y1={tick.y + tick.offset.y}
		x2={tick.x + tick.offset.x + dx * (x2 - x1)}
		y2={tick.y + tick.offset.y + dy * (y2 - y1)}
		class="grid"
	/>
{/each}
