<script>
	import { createBubbler } from 'svelte/legacy'

	const bubble = createBubbler()
	import { namedShapes } from './constants'

	/**
	 * @typedef {Object} Props
	 * @property {number} [x]
	 * @property {number} [y]
	 * @property {number} [size]
	 * @property {string} [fill]
	 * @property {string} [stroke]
	 * @property {number} [thickness]
	 * @property {string} [name]
	 */

	/** @type {Props} */
	let {
		x = 0,
		y = 0,
		size = 1,
		fill = 'none',
		stroke = 'currentColor',
		thickness = 1,
		name = 'circle'
	} = $props()

	let d = $derived(name in namedShapes ? namedShapes[name](size) : namedShapes['circle'](size))
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<path
	{d}
	{fill}
	{stroke}
	transform="translate({x},{y})"
	stroke-width={thickness}
	fill-rule="evenodd"
	role="button"
	onclick={bubble('click')}
	onmouseover={bubble('mouseover')}
	onmouseleave={bubble('mouseleave')}
	onfocus={bubble('focus')}
	onblur={bubble('blur')}
	tabindex="0"
/>
