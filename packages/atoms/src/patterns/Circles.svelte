<script>
	export let size = 10
	export let fill = 'currentColor'
	export let stroke = 'currentColor'

	const centres = [
		{ cx: 0, cy: 0 },
		{ cx: size, cy: size }
	]
</script>

{#each centres as { cx, cy }}
	<circle {cx} {cy} r={0.5 * size} {fill} {stroke} />
{/each}
