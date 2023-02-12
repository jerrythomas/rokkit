<script>
	import { getContext } from 'svelte'
	export let orient = 'bottom'

	let chart = getContext('chart')

	let top =
		orient === 'bottom'
			? $chart.height - $chart.margin.bottom
			: $chart.margin.top
	let left =
		orient === 'right' ? $chart.width - $chart.margin.right : $chart.margin.left
	let tickSizeInner = $chart.theme.tick.size.inner || 6
	let tickSizeOuter = $chart.theme.tick.size.outer || 6
	let tickPadding = $chart.theme.tick.size.padding || 3

	function axisPath(vertical, scale) {
		const range = scale.range()
		return vertical
			? `M${k * tickSizeOuter},${range[0]}H0V${range[1]}H${k * tickSizeOuter}`
			: `M${range[0]},${k * tickSizeOuter}V0H${range[1]}V${k * tickSizeOuter}`
	}

	$: anchor =
		orient === 'right' ? 'start' : orient === 'left' ? 'end' : 'middle'
	$: k = orient === 'top' || orient === 'left' ? -1 : 1
	$: dy = orient === 'top' ? '0em' : orient === 'bottom' ? '0.71em' : '0.32em'
	$: vertical = orient === 'left' || orient === 'right'
	// $: range = axis.scale.range()
	$: axis = vertical ? $chart.axis.y : $chart.axis.x
</script>

<g
	transform="translate({vertical ? left : 0},{vertical ? 0 : top})"
	fill="none"
	font-size="10"
	font-family="sans-serif"
	text-anchor={anchor}
	class="axis"
>
	<path
		class="domain"
		stroke="currentColor"
		d="{axisPath(vertical, axis.scale)}}"
	/>
	{#each axis.ticks as tick}
		<g
			class="tick"
			transform="translate({vertical ? 0 : tick.position},{vertical
				? tick.position
				: 0})"
		>
			<line
				stroke="currentColor"
				y2={vertical ? 0 : k * tickSizeInner}
				x2={vertical ? k * tickSizeInner : 0}
			/>
			<text
				fill="currentColor"
				y={vertical ? 0 : k * (tickSizeInner + tickPadding)}
				x={vertical ? k * (tickSizeInner + tickPadding) : 0}
				{dy}>{tick.label}</text
			>
		</g>
	{/each}
</g>
