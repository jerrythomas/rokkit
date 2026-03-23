<script>
	const thickness = 0.5
	let { size = 10, stroke = 'currentColor' } = $props()

	// Square tile grid: symmetric cross lines dividing into 4 equal tiles
	let lines = $derived([
		{ x1: 0, y1: size * 0.5, x2: size, y2: size * 0.5 }, // horizontal midline
		{ x1: size * 0.5, y1: 0, x2: size * 0.5, y2: size }  // vertical midline
	])
</script>

{#each lines as line, index (index)}
	<line {...line} {stroke} stroke-width={thickness} stroke-linecap="round" />
{/each}
