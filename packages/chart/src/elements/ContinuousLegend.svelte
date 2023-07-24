<script>
	import { scaleLinear } from 'd3-scale'
	import { uniqueId } from '../lib/utils-2'

	export let x = 0
	export let y = 0
	export let textSize = 5
	export let height = 10
	export let width = 100
	export let tickCount = 5
	export let scale

	$: scaleTicks = scaleLinear()
		.range([x, x + 100])
		.domain(scale.domain())
	$: ticks = scale.ticks
		.apply(scale, [tickCount])
		.map((d) => ({ x: scaleTicks(d), label: d }))

	$: colors = scale.range()
	$: id = uniqueId('legend-')
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
