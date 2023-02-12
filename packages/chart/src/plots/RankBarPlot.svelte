<script>
	import Bar from '../elements/Bar.svelte'
	import { max } from 'd3-array'
	import { writable } from 'svelte/store'
	import { tweened } from 'svelte/motion'
	import { scaleLinear } from 'd3-scale'

	export let data
	export let colors
	export let width = 800
	export let limit = 8
	export let duration = 300
	const h = 50
	let height
	const pad = 5

	const xMax = tweened(null, { duration })
	const scales = writable({})

	$: xMax.set(max(data.map((d) => d.value)))
	$: height = pad + (h + pad) * limit
	$: scales.set({
		x: scaleLinear()
			.domain([0, $xMax])
			.range([10, width - 10]),
		y: scaleLinear().domain([0, limit]).range([0, height])
	})
</script>

<svg viewBox="0 0 {width} {height}">
	{#if Array.isArray(data)}
		{#each data as item, i}
			{#if item.rank < limit}
				<Bar {...item} fill={colors[item.name]} {scales} />
			{/if}
		{/each}
	{/if}
</svg>
