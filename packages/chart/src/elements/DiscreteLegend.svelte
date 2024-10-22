<script>
	/**
	 * @typedef {Object} Props
	 * @property {number} [x]
	 * @property {number} [y]
	 * @property {number} [textSize]
	 * @property {number} [size]
	 * @property {number} [space]
	 * @property {number} [padding]
	 * @property {any} scale
	 * @property {number} [tickCount]
	 */

	/** @type {Props} */
	let {
		x = 0,
		y = 0,
		textSize = 5,
		size = 10,
		space = 2,
		padding = 5,
		scale,
		tickCount = 10
	} = $props();

	let sizeWithSpace = $derived(size + space)
	let ticks = $derived(scale.ticks.apply(scale, [tickCount]))
</script>

{#each ticks as tick, i}
	<text x={x + padding + i * sizeWithSpace + size / 2} y={y + size / 2} font-size={textSize}
		>{tick}</text
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
