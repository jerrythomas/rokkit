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
	<polygon points={points.join(', ')} {fill} {stroke} />
{/each}
<!-- <pattern id="bg_pattern" width="100" height="100" patternUnits="userSpaceOnUse"
	><polygon points="0,50 50,100, 0,100" fill="#3D348B" />
	<polygon points="0,50 50,100, 0,100" fill="#3D348B" />
	<polygon points="50,0 0,0, 0,50" fill="#3D348B" />
	<polygon points="100,0 50,50, 100,100" fill="#3D348B" /></pattern
> -->
