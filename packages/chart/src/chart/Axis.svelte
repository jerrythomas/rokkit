<script>
	import { getContext } from 'svelte'
	const chart = getContext('chart')

	export let orient = 'bottom'
	export let majorTickStep = 0
	export let minorTickStep = 0
	export let lower = 0
	export let upper = 100

	function getTicks(lower, upper, majorTickStep, minorTickStep) {
		if (majorTickStep === 0 && minorTickStep === 0) return []
		const minorTicks = Array.from(
			{ length: Math.floor((upper - lower) / minorTickStep) + 1 },
			(_, i) => ({
				position: i * minorTickStep,
				label: i * minorTickStep,
				type: 'minor'
			})
		)
		const majorTicks = Array.from(
			{ length: Math.floor((upper - lower) / majorTickStep) + 1 },
			(_, i) => ({
				position: i * majorTickStep,
				label: i * majorTickStep,
				type: 'major'
			})
		)
		const end = [
			{ position: upper, label: upper, type: 'end' },
			{ position: lower, label: lower, type: 'end' }
		]

		return [...minorTicks, ...majorTicks, ...end].sort((a, b) => a.position - b.position)
	}

	let top = orient === 'bottom' ? $chart.height - $chart.margin.bottom : $chart.margin.top
	let left = orient === 'right' ? $chart.width - $chart.margin.right : $chart.margin.left

	let tickPadding = $chart.theme.tick.size.padding

	function axisPath(vertical) {
		const range = [lower, upper]
		const size = $chart.theme.tick.size.end
		return vertical
			? `M${k * size},${range[0]}H0V${range[1]}H${k * size}`
			: `M${range[0]},${k * size}V0H${range[1]}V${k * size}`
	}

	$: anchor = orient === 'right' ? 'start' : orient === 'left' ? 'end' : 'middle'
	$: k = orient === 'top' || orient === 'left' ? -1 : 1
	$: dy = orient === 'top' ? '0em' : orient === 'bottom' ? '0.71em' : '0.32em'
	$: vertical = orient === 'left' || orient === 'right'
	$: ticks = getTicks(lower, upper, majorTickStep, minorTickStep)
</script>

<g
	transform="translate({vertical ? left : 0},{vertical ? 0 : top})"
	fill="none"
	font-size="10"
	font-family="sans-serif"
	text-anchor={anchor}
	class="axis"
>
	<path class="domain" stroke="currentColor" d="{axisPath(vertical)}}" />
	{#each ticks as tick}
		{@const size = $chart.theme.tick.size[tick.type]}
		<g
			class="tick"
			transform="translate({vertical ? 0 : tick.position},{vertical ? tick.position : 0})"
		>
			<line stroke="currentColor" y2={vertical ? 0 : k * size} x2={vertical ? k * size : 0} />
			<text
				fill="currentColor"
				y={vertical ? 0 : k * (size + tickPadding)}
				x={vertical ? k * (size + tickPadding) : 0}
				{dy}>{tick.label}</text
			>
		</g>
	{/each}
</g>
