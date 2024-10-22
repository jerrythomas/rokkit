<script>
	import { patterns } from './constants'

	/**
	 * @typedef {Object} Props
	 * @property {number} [size]
	 * @property {number} [thickness]
	 * @property {string} [stroke]
	 * @property {string} [name]
	 */

	/** @type {Props} */
	let {
		size = 10,
		thickness = 0.5,
		stroke = 'currentColor',
		name = 'cross-hatch'
	} = $props();

	let d = $derived(patterns[name](size))
</script>

<path {d} {stroke} stroke-width={thickness} fill="none" />
