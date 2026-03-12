<script>
	let { size = 10, fill = 'currentColor', stroke = 'currentColor', data } = $props()

	let circles = $derived(
		data.map(({ cx, cy, r }) => ({
			cx: cx * size,
			cy: cy * size,
			r: r * size
		}))
	)
</script>

{#each circles as { cx, cy, r }, index (index)}
	<circle {cx} {cy} {r} {fill} {stroke} />
{/each}
