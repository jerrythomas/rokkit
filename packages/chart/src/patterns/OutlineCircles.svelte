<script>
	/**
	 * @typedef {Object} Props
	 * @property {number} [size]
	 * @property {string} [fill]
	 * @property {string} [stroke]
	 */

	/** @type {Props} */
	let { size = 10, fill = 'currentColor', stroke = 'currentColor' } = $props()

	const centres = [
		{ cx: 0, cy: 0 },
		{ cx: size, cy: size }
	]
	let r = $derived(0.5 * size)
</script>

{#each centres as { cx, cy }}
	<circle {cx} {cy} {r} {fill} {stroke} />
{/each}
