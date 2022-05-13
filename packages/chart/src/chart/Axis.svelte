<script>
	import { setContext, getContext } from 'svelte'
	import { writable } from 'svelte/store'

	const chart = getContext('chart')
	let config = writable({})
	setContext('axis', config)

	export let name = 'x'
	export let fontSize = $chart.height / 32
	export let count = null
	export let gap = 0

	function axisOffset(axis, origin, range, gap) {
		// let
		let offset =
			gap *
			(origin[axis] == range[axis + '1']
				? 1
				: origin[axis] == range[axis + '2']
				? -1
				: 0)
		return offset
	}

	function axisDomain(axis, origin, range, offset) {
		let coords = { ...range }
		let d = axis === 'x' ? -1 : 1
		coords[axis + '1'] = coords[axis + '2'] = origin[axis] + d * offset
		return coords
	}
	$: otherAxis = name === 'x' ? 'y' : 'x'
	$: offset = axisOffset(name, $chart.origin, $chart.range, gap)
	$: line = axisDomain(otherAxis, $chart.origin, $chart.range, offset)

	$: config.set({
		ticks: $chart.ticks(name, count, fontSize),
		scale: $chart.scale,
		name,
		fontSize,
		offset: offset
	})
</script>

<g class="axis">
	<line {...line} class="domain" />
	<slot />
</g>
