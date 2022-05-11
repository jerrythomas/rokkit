<script>
	import { getContext } from 'svelte'

	const axis = getContext('axis')
	const ticks = getContext('ticks')

	export let space = 2
	export let fontSize = $axis.fontSize || 8
	export let format = (l) => l

	$: labelXAnchor =
		$ticks.side === 'left'
			? 'end'
			: $ticks.side === 'right'
			? 'start'
			: 'middle'
</script>

{#each $axis.ticks as tick}
	<text
		x={tick.x + tick.offset.x + $ticks.dx * $ticks.size + $ticks.dx * space}
		y={tick.y +
			tick.offset.y +
			$ticks.dy * $ticks.size +
			$ticks.dy * space +
			($ticks.dy * fontSize) / 2}
		font-size={fontSize}
		alignment-baseline="middle"
		text-anchor={labelXAnchor}
		class="label">{format(tick.label)}</text
	>
{/each}
