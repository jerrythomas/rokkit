<script>
	import { scaledPath } from '@rokkit/core'

	/**
	 * @typedef {Object} Props
	 * @property {number} [size]
	 * @property {number} [thickness]
	 * @property {string} [stroke]
	 * @property {string} [fill]
	 * @property {any} [data]
	 */

	/** @type {Props} */
	let {
		size = 10,
		thickness = 0.5,
		stroke = 'currentColor',
		fill = 'none',
		data = []
	} = $props();

	let d = $derived(scaledPath(size, data))
</script>

<path {d} {stroke} stroke-width={thickness} {fill} />
