<script>
	let { size = 10, fill = 'currentColor', stroke = 'currentColor' } = $props()

	let polygons = $derived([
		[0, 0.5 * size, 0.5 * size, size, 0, size],
		[0.5 * size, 0, 0, 0, 0, 0.5 * size],
		[size, 0, 0.5 * size, 0.5 * size, size, size]
	])
</script>

{#each polygons as points, index (index)}
	<polygon points={points.join(', ')} {fill} {stroke} stroke-width="0" />
{/each}
