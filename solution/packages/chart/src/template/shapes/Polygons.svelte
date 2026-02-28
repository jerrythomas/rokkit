<script>
	let { size = 10, thickness = 0.5, fill = 'currentColor', stroke = 'currentColor', data = [] } = $props()

	let polygons = $derived(data.map((points) => points.map((point) => point * size).join(', ')))
</script>

{#each polygons as points, index (index)}
	<polygon {points} {fill} {stroke} stroke-width={thickness} />
{/each}
