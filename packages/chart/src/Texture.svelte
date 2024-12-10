<script>
	/**
	 * @typedef {Object} Props
	 * @property {any} id
	 * @property {any} path
	 * @property {string} [fill]
	 * @property {string} [stroke]
	 * @property {number} [thickness]
	 * @property {string} [patternUnits]
	 * @property {number} [size]
	 */

	/** @type {Props} */
	let {
		id,
		path,
		fill = 'currentColor',
		stroke = 'currentColor',
		thickness = 0.5,
		patternUnits = 'userSpaceOnUse',
		size = 10
	} = $props()
</script>

<pattern {id} {patternUnits} width={size} height={size}>
	<rect width={size} height={size} {fill} />
	{#if path}
		<path d={path} fill="none" {stroke} stroke-width={thickness} />
	{/if}
</pattern>
