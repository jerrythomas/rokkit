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
		{ x1: 0, y1: 0.25 * size, x2: 0.5 * size, y2: 0.25 * size },
		{ x1: 0.5 * size, y1: 0.75 * size, x2: size, y2: 0.75 * size },
		{ x1: 0, y1: 0, x2: 0, y2: size },
		{ x1: size, y1: 0, x2: size, y2: size },
		{ x1: 0.5 * size, y1: 0, x2: 0.5 * size, y2: size }
	])
</script>

{#each lines as line}
	<line {...line} {stroke} stroke-width={thickness} stroke-linecap="round" />
{/each}
