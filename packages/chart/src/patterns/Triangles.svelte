<script>
	/**
	 * @typedef {Object} Props
	 * @property {number} [size]
	 * @property {string} [fill]
	 * @property {string} [stroke]
	 */

	/** @type {Props} */
	let { size = 10, fill = 'currentColor', stroke = 'currentColor' } = $props();

	const polygons = [
		[0, 0.5 * size, 0.5 * size, size, 0, size],
		[0.5 * size, 0, 0, 0, 0, 0.5 * size],
		[size, 0, 0.5 * size, 0.5 * size, size, size]
	]
</script>

{#each polygons as points}
	<polygon points={points.join(', ')} {fill} {stroke} stroke-width="0" />
{/each}
