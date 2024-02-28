<script>
	import { swatch, swatchGrid } from '../lib'
	import Symbol from '../Symbol.svelte'

	export let base = 'teal'
	export let size = 4
	export let shade = 600

	$: grid = swatchGrid(Object.keys($swatch.symbols).length, size, 10)
</script>

<svg viewBox="0 0 {grid.width} {grid.height}">
	{#each grid.data as { x, y, r }, index}
		<Symbol
			{x}
			{y}
			r={(index + 1) / 2}
			shape={$swatch.keys.symbol[6]}
			fill={$swatch.palette[base][shade]}
			stroke={$swatch.palette[base][shade]}
		/>
	{/each}
</svg>
