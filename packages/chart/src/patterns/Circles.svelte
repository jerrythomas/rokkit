<script>
	let { size = 10, fill = 'currentColor', stroke = 'none' } = $props()

	let dots = $derived([
		{ cx: size * 0.5, cy: size * 0.5, r: size * 0.2 },
		{ cx: 0, cy: 0, r: size * 0.2 },
		{ cx: size, cy: 0, r: size * 0.2 },
		{ cx: 0, cy: size, r: size * 0.2 },
		{ cx: size, cy: size, r: size * 0.2 }
	])
</script>

{#each dots as { cx, cy, r }, index (index)}
	<circle {cx} {cy} {r} {fill} stroke={stroke} />
{/each}
