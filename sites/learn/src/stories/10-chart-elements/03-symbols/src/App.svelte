<script>
	import { Symbol } from '@rokkit/chart'
	import { swatch, swatchGrid } from '@rokkit/chart/lib'

	$: grid = swatchGrid($swatch.keys.symbol.length, 10, 10)
</script>

<svg viewBox="0 0 {grid.width} {grid.height}">
	{#each grid.data as { x, y, r },index}
		<Symbol
			{x}
			{y}
			size={r*2}
			shape={$swatch.keys.symbol[index]}
			fill={$swatch.palette['teal'][500	]}
			stroke={$swatch.palette['teal'][500]}
		/>
	{/each}
</svg>