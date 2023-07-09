<script>
	export let size = 10
	export let fill = 'currentColor'

	const centres = [
		{ cx: 0.2 * size, cy: 0.2 * size },
		{ cx: 0.4 * size, cy: 0.4 * size },
		{ cx: 0.6 * size, cy: 0.6 * size },
		{ cx: 0.8 * size, cy: 0.8 * size },
		{ cx: 0.8 * size, cy: 0.2 * size },
		{ cx: 0.6 * size, cy: 0.4 * size },
		{ cx: 0.4 * size, cy: 0.6 * size },
		{ cx: 0.2 * size, cy: 0.8 * size }
	]
</script>

{#each centres as { cx, cy }}
	<circle {cx} {cy} r={0.08 * size} {fill} />
{/each}
