<script>
	export let x = 0
	export let y = 0
	export let textSize = 5
	export let size = 10
	export let space = 2
	export let padding = 5
	export let scale
	export let tickCount

	$: sizeWithSpace = size + space
	$: ticks = scale.ticks.apply(scale, [tickCount])
</script>

{#each ticks as tick, i}
	<text
		x={x + padding + i * sizeWithSpace + size / 2}
		y={y + size / 2}
		font-size={textSize}>{tick}</text
	>
	<rect
		x={x + padding + i * sizeWithSpace}
		y={y + padding + textSize}
		width={size}
		height={size}
		fill={scale(tick)}
		rx="1"
		ry="1"
	/>
{/each}

<style>
	rect {
		stroke: currentColor;
		stroke-width: 0.2;
	}
	text {
		fill: currentColor;
		text-anchor: middle;
	}
</style>
