<script>
	/**
	 * @typedef {Object} Props
	 * @property {number} [size]
	 * @property {number} [thickness]
	 * @property {string} [stroke]
	 */

	/** @type {Props} */
	let { size = 10, thickness = 0.5, stroke = 'currentColor' } = $props();

	let lines = $derived([
		{ x1: 0, y1: 0, x2: size, y2: size },
		{ x1: 0, y1: size, x2: size, y2: 0 }
	])
</script>

{#each lines as line}
	<line {...line} {stroke} stroke-width={thickness} stroke-linecap="round" />
{/each}
