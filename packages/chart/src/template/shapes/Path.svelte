<script>
	import { scaledPath } from '@rokkit/core'

	/**
	 * @typedef {Object} Props
	 * @property {number} [size]
	 * @property {number} [thickness]
	 * @property {string} [stroke]
	 * @property {any} [data]
	 */

	/** @type {Props} */
	let { size = 10, thickness = 0.5, stroke = 'currentColor', data = [] } = $props()

	let d = $derived(scaledPath(size, data))
</script>

<path {d} {stroke} stroke-width={thickness} fill="none" />
