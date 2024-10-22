<script>
	import { run } from 'svelte/legacy';

	import { setContext } from 'svelte'
	import { writable } from 'svelte/store'
	import { chart } from './lib'

	let config = writable({})
	setContext('chart', config)

	
	/**
	 * @typedef {Object} Props
	 * @property {any} data
	 * @property {any} x
	 * @property {any} y
	 * @property {any} [value]
	 * @property {any} [color]
	 * @property {any} [fill]
	 * @property {number} [width] - export let pattern = x
	 * @property {number} [height]
	 * @property {any} [padding]
	 * @property {number} [marginLeft]
	 * @property {number} [marginRight]
	 * @property {number} [marginTop]
	 * @property {number} [marginBottom]
	 * @property {boolean} [flipCoords]
	 * @property {number} [spacing]
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let {
		data,
		x,
		y,
		value = y,
		color = x,
		fill = x,
		width = 2048,
		height = 2048,
		padding = height / 16,
		marginLeft = 0,
		marginRight = 0,
		marginTop = 0,
		marginBottom = 0,
		flipCoords = false,
		spacing = 0.1,
		children
	} = $props();

	let margin = $derived({
		left: marginLeft,
		right: marginRight,
		top: marginTop,
		bottom: marginBottom
	})
	// $: patterns = [...new Set(data.map((d) => d[pattern]))]
	// $: fills = [...new Set(data.map((d) => d[fill]))]
	// $: colors = [...new Set(data.map((d) => d[color]))]
	run(() => {
		config.set(
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
	});
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
	{@render children?.()}
</svg>
