<script>
	import { setContext } from 'svelte'
	import { writable } from 'svelte/store'
	import { compact } from '../lib/utils'
	import { builtIn } from '../lib/theme'

	let chart = writable({})

	setContext('chart', chart)

	export let width = 800
	export let height = 450
	export let data
	export let theme = builtIn
	export let x
	export let y
	export let fill
	export let color
	export let padding = 20
	export let curve = 'basis'
	export let stat = 'identity'

	$: aes = compact({ x, y, fill, color, stat, curve, padding })
	$: chart.set({
		width,
		height,
		data,
		theme,
		aes
	})
</script>

<svg viewBox="0 0 {width} {height}" class="chart" width="100%">
	<slot />
</svg>
