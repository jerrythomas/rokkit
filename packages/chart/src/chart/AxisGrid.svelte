<script>
	import { getContext } from 'svelte'

	export let opacity = 1
	export let hideVertical = false
	export let hideHorizontal = false
	let chart = getContext('chart')

	$: opacityV = hideVertical ? 0 : opacity
	$: opacityH = hideHorizontal ? 0 : opacity
	$: xRange = $chart.axis.x.scale.range()
	$: yRange = $chart.axis.y.scale.range()
</script>

<g class="grid">
	{#each $chart.axis.x.ticks as tick}
		<line x1={tick.position} x2={tick.position} y1={yRange[0]} y2={yRange[1]} opacity={opacityV} />
	{/each}
	{#each $chart.axis.y.ticks as tick}
		<line y1={tick.position} y2={tick.position} x1={xRange[0]} x2={xRange[1]} opacity={opacityH} />
	{/each}
</g>
