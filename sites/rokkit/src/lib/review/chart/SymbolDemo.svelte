<script>
	import { Symbol } from '@rokkit/chart'
	export let size = 40
	export let rows
	export let columns = 16
	export let spacing = 10
	export let shapes = []
	export let shades = []
	// export let prefix
	export let repeat = false

	$: rows = rows ? rows : Math.ceil(shapes.length / columns)
	$: height = (size + spacing) * rows
	$: width = spacing + (size + spacing) * columns
	$: data = shapes.map((id, index) => ({
		id,
		x: spacing / 2 + ((index % columns) + 0.5) * (size + spacing),
		y: (0.5 + Math.floor(index / columns)) * (size + spacing)
	}))
	$: shades = repeat
		? shapes.map((id, index) => shades[index % shades.length])
		: shades
</script>

<svg viewBox="0 0 {width} {height}">
	{#each data as { id, x, y }, i}
		<Symbol {id} {x} {y} {size} {...shades[i]} />
	{/each}
</svg>
