<script>
	export let size = 10
	export let fill = 'currentColor'
	export let stroke = 'currentColor'

	const polygons = [
		[0, 0.5 * size, 0.5 * size, size, 0, size],
		[0.5 * size, 0, 0, 0, 0, 0.5 * size],
		[size, 0, 0.5 * size, 0.5 * size, size, size]
	]
</script>

{#each polygons as points}
	<polygon points={points.join(', ')} {fill} {stroke} stroke-width="0" />
{/each}
