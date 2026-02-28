<script>
	let { size = 10, fill = 'currentColor', stroke = 'currentColor' } = $props()

	let centres = $derived([
		{ cx: 0, cy: 0 },
		{ cx: size, cy: size }
	])
	let r = $derived(0.5 * size)
</script>

{#each centres as { cx, cy }, index (index)}
	<circle {cx} {cy} {r} {fill} {stroke} />
{/each}
