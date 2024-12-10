<script>
	/**
	 * @typedef {Object} Props
	 * @property {number} [size]
	 * @property {string} [fill]
	 */

	/** @type {Props} */
	let { size = 10, fill = 'currentColor' } = $props()

	let data = $derived(
		[
			{ cx: 0.2 * size, cy: 0.2 * size },
			{ cx: 0.4 * size, cy: 0.4 * size },
			{ cx: 0.6 * size, cy: 0.6 * size },
			{ cx: 0.8 * size, cy: 0.8 * size },
			{ cx: 0.8 * size, cy: 0.2 * size },
			{ cx: 0.6 * size, cy: 0.4 * size },
			{ cx: 0.4 * size, cy: 0.6 * size },
			{ cx: 0.2 * size, cy: 0.8 * size }
		].map((x) => ({ ...x, r: 0.08 * size }))
	)
</script>

{#each data as { cx, cy, r }}
	<circle {cx} {cy} {r} {fill} />
{/each}
