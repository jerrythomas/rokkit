<script>
	/**
	 * @typedef {Object} Props
	 * @property {number} [size]
	 * @property {string} [fill]
	 * @property {string} [stroke]
	 */

	/** @type {Props} */
	let { size = 10, fill = 'currentColor', stroke = 'currentColor' } = $props()

	let data = $derived(
		[
			{ cx: 0, cy: 0, r: 0.5 },
			{ cx: 1, cy: 1, r: 0.5 }
		].map(({ cx, cy, r }) => ({
			cx: cx * size,
			cy: cy * size,
			r: r * size
		}))
	)
</script>

{#each data as { cx, cy, r }}
	<circle {cx} {cy} {r} {fill} {stroke} />
{/each}
