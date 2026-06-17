<script lang="ts">
	import { swatch } from '../lib/swatch'
	import { swatchGrid } from '../lib/grid'
	import Symbol from '../Symbol.svelte'

	type Props = {
		base?: string
		size?: number
		shade?: number
	}

	let { base = 'teal', size = 4, shade = 600 }: Props = $props()

	let grid = $derived(swatchGrid(swatch.keys.symbol.length, size, 10))

	const palette: Record<string, Record<string, string>> = swatch.palette
	let color = $derived(palette[base]?.[shade])
</script>

<svg viewBox="0 0 {grid.width} {grid.height}">
	{#each grid.data as { x, y, r }, index (index)}
		<Symbol
			{x}
			{y}
			size={r * 2}
			name={swatch.keys.symbol[index]}
			fill={color}
			stroke={color}
		/>
	{/each}
</svg>
