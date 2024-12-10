<script>
	import { DefinePatterns } from '@rokkit/chart/elements'
	import { swatch, swatchGrid } from '@rokkit/chart/lib'

	/**
	 * @typedef {Object} Props
	 * @property {string} [base]
	 * @property {number} [fill]
	 * @property {number} [stroke]
	 * @property {number} [outline]
	 */

	/** @type {Props} */
	let { base = 'gold', fill = 300, stroke = 500, outline = 600 } = $props()

	let patterns = $derived(
		$swatch.keys.pattern.map((id) => ({
			id: `${base}-${fill}-${id}`,
			component: $swatch.patterns[id],
			fill: $swatch.palette[base][fill],
			stroke: $swatch.palette[base][stroke]
		}))
	)
	let grid = $derived(swatchGrid(patterns.length, 30, 10))
</script>

<svg viewBox="0 0 {grid.width} {grid.height}">
	<DefinePatterns {patterns} size={10} />
	{#each grid.data as { x, y, r }, index}
		<rect
			x={x - r}
			y={y - r}
			width={r * 2}
			height={r * 2}
			fill="url(#{patterns[index].id})"
			stroke={$swatch.palette[base][outline]}
			stroke-width="0.5"
		/>
	{/each}
</svg>
