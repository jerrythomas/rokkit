<script>
	import { setContext } from 'svelte'
	import { writable } from 'svelte/store'
	import { compact } from '@rokkit/core'
	import { builtIn } from '../lib/theme'

	let chart = writable({})

	setContext('chart', chart)

	export let data
	export let width = 800
	export let height = 450
	export let theme = builtIn
	export let x = 'x'
	export let y = 'y'
	export let fill = null
	export let color = null
	export let padding = 20
	export let curve = 'basis'
	export let stat = 'identity'

	$: aes = compact({ x, y, fill, color, stat, curve, padding })
	$: chart.set({
		width,
		height,
		data,
		theme,
		aes,
		axis: {
			x: { scale: 'linear', orient: 'bottom' },
			y: { scale: 'linear', orient: 'left' }
		},
		margin: { top: 10, right: 10, bottom: 10, left: 10 }
	})
</script>

<svg viewBox="0 0 {width} {height}" class="chart" width="100%">
	<slot />
</svg>
