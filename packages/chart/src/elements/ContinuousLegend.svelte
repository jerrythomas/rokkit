<script>
	import { scaleLinear } from 'd3-scale'

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
			.range([x, x + width])
			.domain(scale.domain())
	)

	let ticks = $derived.by(() => {
		// scaleSequential/scaleDiverging have .ticks(); scaleLinear does too
		const rawTicks = typeof scale.ticks === 'function'
			? scale.ticks(tickCount)
			: scale.domain()
		return rawTicks.map((d) => ({ x: scaleTicks(d), label: d }))
	})

	// Generate gradient stops by sampling the scale at even intervals.
	// Works for scaleSequential, scaleDiverging, and scaleLinear with range().
	const STOP_COUNT = 10
	let stops = $derived.by(() => {
		const domain = scale.domain()
		const min = domain[0]
		const max = domain[domain.length - 1]
		return Array.from({ length: STOP_COUNT + 1 }, (_, i) => {
			const t = i / STOP_COUNT
			const value = min + t * (max - min)
			return { offset: `${(t * 100).toFixed(1)}%`, color: scale(value) }
		})
	})
</script>

<defs>
	<linearGradient {id}>
		{#each stops as { offset, color } (offset)}
			<stop stop-color={color} {offset} />
		{/each}
	</linearGradient>
</defs>
<rect {x} y={y + height} {width} {height} fill="url(#{id})" />
{#each ticks as { x, label }, index (index)}
	<line x1={x} y1={y + (2 * height) / 3} x2={x} y2={y + height * 2} />
	<text {x} y={y + height / 2} font-size={textSize}>{label}</text>
{/each}
<line x1={x} y1={y + 2 * height} x2={x + width} y2={y + 2 * height} />

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
