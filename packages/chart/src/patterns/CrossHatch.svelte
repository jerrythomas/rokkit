<script>
	let { size = 10, thickness = 0.5, stroke = 'currentColor' } = $props()

	// Dense horizontal + vertical grid (4×4 cells)
	let lines = $derived([
		{ x1: 0, y1: size * 0.25, x2: size, y2: size * 0.25 },
		{ x1: 0, y1: size * 0.5,  x2: size, y2: size * 0.5  },
		{ x1: 0, y1: size * 0.75, x2: size, y2: size * 0.75 },
		{ x1: size * 0.25, y1: 0, x2: size * 0.25, y2: size },
		{ x1: size * 0.5,  y1: 0, x2: size * 0.5,  y2: size },
		{ x1: size * 0.75, y1: 0, x2: size * 0.75, y2: size }
	])
</script>

{#each lines as line, index (index)}
	<line {...line} {stroke} stroke-width={thickness} stroke-linecap="round" />
{/each}
