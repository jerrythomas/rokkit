<script>
	/**
	 * @typedef {Object} Props
	 * @property {number} [size]
	 * @property {string} [fill]
	 * @property {string} [stroke]
	 * @property {any} data
	 */

	/** @type {Props} */
	let { size = 10, fill = 'currentColor', stroke = 'currentColor', data } = $props()

	let circles = $derived(
		data.map(({ cx, cy, r }) => ({
			cx: cx * size,
			cy: cy * size,
			r: r * size
		}))
	)
</script>

{#each circles as { cx, cy, r }}
	<circle {cx} {cy} {r} {fill} {stroke} />
{/each}
