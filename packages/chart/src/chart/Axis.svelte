<script>
	import { setContext, getContext } from 'svelte'
	import { writable } from 'svelte/store'

	const chart = getContext('chart')
	let config = writable({})
	setContext('axis', config)

	export let name = 'x'
	export let fontSize = 8
	export let count = null

	let scale = $chart.scale
	let [y1, y2] = scale.y.range()
	let [x1, x2] = scale.x.range()

	$: config.set({ ticks: $chart.ticks(name, count, fontSize), name, fontSize })
</script>

<g class="axis">
	{#if name === 'x'}
		<line {x1} {x2} y1={$chart.origin.y} y2={$chart.origin.y} class="domain" />
	{:else}
		<line x1={$chart.origin.x} x2={$chart.origin.x} {y1} {y2} class="domain" />
	{/if}
	<slot />
</g>
