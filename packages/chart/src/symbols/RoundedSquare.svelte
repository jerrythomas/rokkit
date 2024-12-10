<script>
	import { createBubbler } from 'svelte/legacy'

	const bubble = createBubbler()
	/**
	 * @typedef {Object} Props
	 * @property {number} [x]
	 * @property {number} [y]
	 * @property {number} [size]
	 * @property {string} [fill]
	 * @property {string} [stroke]
	 */

	/** @type {Props & { [key: string]: any }} */
	let { x = 0, y = 0, size = 1, fill = 'currentColor', stroke = 'currentColor', ...rest } = $props()

	let r = $derived(size * 3.534)
	let props = $derived({ rx: r * 0.1, ry: r * 0.1, ...rest })
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<rect
	x={x - r}
	y={y - r}
	width={r * 2}
	height={r * 2}
	{fill}
	{stroke}
	{...props}
	role="button"
	onclick={bubble('click')}
	onmouseover={bubble('mouseover')}
	onmouseleave={bubble('mouseleave')}
	onfocus={bubble('focus')}
	tabindex="0"
/>
