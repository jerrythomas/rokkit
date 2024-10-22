<script>
	import { swatch, swatchGrid } from '../lib'
	import Symbol from '../Symbol.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {string} [base]
	 * @property {number} [size]
	 * @property {number} [shade]
	 */

	/** @type {Props} */
	let { base = 'teal', size = 4, shade = 600 } = $props();

	let grid = $derived(swatchGrid($swatch.keys.symbol.length, size, 10))
</script>

<svg viewBox="0 0 {grid.width} {grid.height}">
	{#each grid.data as { x, y, r }, index}
		<Symbol
			{x}
			{y}
			size={r * 2}
			name={$swatch.keys.symbol[index]}
			fill={$swatch.palette[base][shade]}
			stroke={$swatch.palette[base][shade]}
		/>
	{/each}
</svg>
