<script>
	import { swatch, swatchGrid } from '../old_lib'
	import Symbol from '../Symbol.svelte'

	export let base = 'teal'
	export let size = 4
	export let shade = 600

	$: grid = swatchGrid($swatch.keys.symbol.length, size, 10)
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
