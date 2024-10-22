<script>
	/**
	 * @typedef {Object} Props
	 * @property {number} [size]
	 * @property {number} [thickness]
	 * @property {string} [stroke]
	 * @property {any} [data]
	 */

	/** @type {Props} */
	let {
		size = 10,
		thickness = 0.5,
		stroke = 'currentColor',
		data = []
	} = $props();

	let lines = $derived(data.map(({ x1, y1, x2, y2 }) => ({
		x1: x1 * size,
		y1: y1 * size,
		x2: x2 * size,
		y2: y2 * size
	})))
</script>

{#each lines as line}
	<line {...line} {stroke} stroke-width={thickness} stroke-linecap="round" />
{/each}
