<script>
	import { scaleLinear } from 'd3-scale'
	import { id as uniqueId } from '@rokkit/core'

	/**
	 * @typedef {Object} Props
	 * @property {number} [x]
	 * @property {number} [y]
	 * @property {number} [textSize]
	 * @property {number} [height]
	 * @property {number} [width]
	 * @property {number} [tickCount]
	 * @property {any} scale
	 */

	/** @type {Props} */
	let {
		x = 0,
		y = 0,
		textSize = 5,
		height = 10,
		width = 100,
		tickCount = 5,
		scale
	} = $props();

	let scaleTicks = $derived(scaleLinear()
		.range([x, x + width])
		.domain(scale.domain()))
	let scalePercent = $derived(scaleLinear().range([0, 100]).domain(scale.domain()))
	let ticks = $derived(scale.ticks.apply(scale, [tickCount]).map((d) => ({ x: scaleTicks(d), value: d })))

	let colors = $derived(ticks.map(({ value }) => ({
		color: scale(value),
		offset: `${scalePercent(value)}%`
	})))
	let id = $derived(uniqueId('legend-'))
</script>

<defs>
	<linearGradient {id}>
		{#each colors as { color, offset }}
			<stop stop-color={color} {offset} />
		{/each}
	</linearGradient>
</defs>
<rect {x} y={y + height} {width} {height} fill="url(#{id})" />
{#each ticks as { x, value }}
	<line x1={x} y1={y + (2 * height) / 3} x2={x} y2={y + height * 2} />
	<text {x} y={y + height / 2} font-size={textSize}>{value}</text>
{/each}
<line x1={x} y1={y + 2 * height} x2={x + 100} y2={y + 2 * height} />

<style>
	line {
		stroke: currentColor;
		stroke-width: 0.2;
	}
	text {
		fill: currentColor;
		text-anchor: middle;
	}
</style>
