<script>
	import { getContext } from 'svelte'

	const axis = getContext('axis')
	const ticks = getContext('ticks')

	export let gap = 2
	export let fontSize = $axis.fontSize || 8
	export let format = (l) => l
	export let angle = 0

	$: textHeight = angle == 0 ? fontSize / 2 : 0
	$: xOffset = $ticks.dx * ($ticks.size + gap + $axis.offset)
	$: yOffset = $ticks.dy * ($ticks.size + gap + $axis.offset + textHeight)
	$: labels = $axis.ticks.map(({ x, y, offset, label }) => ({
		x: x + offset.x + xOffset,
		y: y + offset.y + yOffset,
		label
	}))

	$: labelXAnchor =
		$ticks.side === 'left' || angle != 0
			? 'end'
			: $ticks.side === 'right'
			? 'start'
			: 'middle'
</script>

<g name="axis-labels">
	{#each labels as { x, y, label }}
		<text
			{x}
			{y}
			transform="rotate({angle},{x},{y})"
			font-size={fontSize}
			alignment-baseline="middle"
			text-anchor={labelXAnchor}
			class="label">{format(label)}</text
		>
	{/each}
</g>
