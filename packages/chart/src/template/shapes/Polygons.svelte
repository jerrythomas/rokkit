<script>
	/**
	 * @typedef {Object} Props
	 * @property {number} [size]
	 * @property {number} [thickness]
	 * @property {string} [fill]
	 * @property {string} [stroke]
	 * @property {any} [data]
	 */

	/** @type {Props} */
	let {
		size = 10,
		thickness = 0.5,
		fill = 'currentColor',
		stroke = 'currentColor',
		data = []
	} = $props();

	const polygons = data.map((points) => points.map((point) => point * size).join(', '))
	// [
	// 	[0, 0.5 * size, 0.5 * size, size, 0, size],
	// 	[0.5 * size, 0, 0, 0, 0, 0.5 * size],
	// 	[size, 0, 0.5 * size, 0.5 * size, size, size]
	// ]
</script>

{#each polygons as points}
	<polygon {points} {fill} {stroke} stroke-width={thickness} />
{/each}
