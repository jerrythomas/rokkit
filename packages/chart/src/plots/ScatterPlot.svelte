<script>
	import { clamp } from 'yootils'
	import Symbol from '../chart/Symbol.svelte'
	import { getContext } from 'svelte'

	const chart = getContext('chart')

	export let size = 8
	export let fill = '#c0c0c0'
	export let stroke = '#3c3c3c'
	export let jitterWidth = 50
	export let offset

	$: jitterWidth = clamp(jitterWidth, 0, 100 / 2)
	$: offset = clamp(offset | (jitterWidth / 2), 0, 100)
</script>

{#if $chart.data}
	{#each $chart.data as d}
		<Symbol
			x={$chart.axis.x.scale(d[$chart.x]) -
				offset +
				Math.random() * jitterWidth}
			y={$chart.axis.y.scale(d[$chart.y])}
			{fill}
			{stroke}
			{size}
		/>
	{/each}
{/if}
