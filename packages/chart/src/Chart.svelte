<script>
	import { setContext } from 'svelte'
	import { writable } from 'svelte/store'
	import { chart } from './lib'

	let config = writable({})
	setContext('chart', config)

	export let data
	export let x
	export let y
	export let value = y
	export let color = x
	export let fill = x
	// export let pattern = x
	export let width = 2048
	export let height = 2048
	export let padding = height / 16
	export let marginLeft = 0
	export let marginRight = 0
	export let marginTop = 0
	export let marginBottom = 0
	export let flipCoords = false
	export let spacing = 0.1

	$: margin = {
		left: marginLeft,
		right: marginRight,
		top: marginTop,
		bottom: marginBottom
	}
	// $: patterns = [...new Set(data.map((d) => d[pattern]))]
	// $: fills = [...new Set(data.map((d) => d[fill]))]
	// $: colors = [...new Set(data.map((d) => d[color]))]
	$: config.set(
		chart(data, {
			x,
			y,
			value,
			color,
			fill,
			width,
			height,
			padding,
			margin,
			flipCoords,
			spacing
		})
	)
</script>

<svg
	viewBox="0 0 {$config.width} {$config.height}"
	width={$config.width}
	height={$config.height}
	class="w-full h-full chart"
>
	<rect
		x="0"
		y="0"
		width={$config.width}
		height={$config.height}
		fill="none"
		stroke="currentColor"
	/>
	<slot />
</svg>
