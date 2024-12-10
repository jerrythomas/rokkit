<script>
	import { scaleLinear } from 'd3-scale'

	/**
	 * @typedef {Object} Props
	 * @property {number} [x] - import { id as uniqueId } from '@rokkit/core'
	 * @property {number} [y]
	 * @property {number} [textSize]
	 * @property {number} [height]
	 * @property {number} [width]
	 * @property {number} [tickCount]
	 * @property {any} scale
	 * @property {string} [id]
	 */

	/** @type {Props} */
	let {
		x = 0,
		y = 0,
		textSize = 5,
		height = 10,
		width = 100,
		tickCount = 5,
		scale,
		id = 'legend'
	} = $props()

	let scaleTicks = $derived(
		scaleLinear()
			.range([x, x + 100])
			.domain(scale.domain())
	)
	let ticks = $derived(
		scale.ticks.apply(scale, [tickCount]).map((d) => ({ x: scaleTicks(d), label: d }))
	)

	let colors = $derived(scale.range())
	// $: id = uniqueId('legend-')
</script>

<defs>
	<linearGradient {id}>
		<stop stop-color={colors[0]} offset="0%" />
		<stop stop-color={colors[1]} offset="100%" />
	</linearGradient>
</defs>
<rect {x} y={y + height} {width} {height} fill="url(#{id})" />
{#each ticks as { x, label }}
	<line x1={x} y1={y + (2 * height) / 3} x2={x} y2={y + height * 2} />
	<text {x} y={y + height / 2} font-size={textSize}>{label}</text>
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
