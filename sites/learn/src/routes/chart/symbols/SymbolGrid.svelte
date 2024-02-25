<script>
	import { swatch } from './utils/swatch'
	import Symbol from './Symbol.svelte'
	import { swatchGrid } from './grid'

	export let base = 'teal'
	export let size = 4
	export let shade = 600
	$: grid = swatchGrid(Object.keys($swatch.symbols).length, size, size / 4)
	$: console.log($swatch)
</script>

<svg viewBox="0 0 {grid.width} {grid.height}">
	{#each grid.data as { x, y, r }, index}
		<Symbol
			{x}
			{y}
			{r}
			shape={$swatch.keys.symbol[index]}
			fill={$swatch.palette[base][shade]}
			stroke={$swatch.palette[base][shade]}
		/>
	{/each}
</svg>
