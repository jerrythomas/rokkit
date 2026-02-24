<script>
	import { get } from 'svelte/store'
	import { swatch, swatchGrid } from '../old_lib'
	import Symbol from '../Symbol.svelte'

	let {
		base = 'teal',
		size = 4,
		shade = 600
	} = $props()

	let swatchValue = $derived(get(swatch))
	let grid = $derived(swatchGrid(swatchValue.keys.symbol.length, size, 10))
</script>

<svg viewBox="0 0 {grid.width} {grid.height}">
	{#each grid.data as { x, y, r }, index (index)}
		<Symbol
			{x}
			{y}
			size={r * 2}
			name={swatchValue.keys.symbol[index]}
			fill={swatchValue.palette[base][shade]}
			stroke={swatchValue.palette[base][shade]}
		/>
	{/each}
</svg>
