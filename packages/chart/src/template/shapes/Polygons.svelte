<script>
	export let size = 10
	export let thickness = 0.5
	export let fill = 'currentColor'
	export let stroke = 'currentColor'
	export let data = []

	const polygons = data.map((points) => points.map((point) => point * size).join(', '))
	// [
	// 	[0, 0.5 * size, 0.5 * size, size, 0, size],
	// 	[0.5 * size, 0, 0, 0, 0, 0.5 * size],
	// 	[size, 0, 0.5 * size, 0.5 * size, size, size]
	// ]
</script>

{#each polygons as points}
	<polygon {points} {fill} {stroke} stroke-width={thickness} />
{/each}
