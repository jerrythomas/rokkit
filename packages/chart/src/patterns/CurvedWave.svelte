<script>
	import NamedPattern from './paths/NamedPattern.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {number} [size]
	 * @property {number} [thickness]
	 * @property {string} [stroke]
	 */

	/** @type {Props} */
	let { size = 10, thickness = 0.5, stroke = 'currentColor' } = $props()
</script>

<NamedPattern {size} {thickness} {stroke} name="curvedWave" />
