<script>
	export let size = 10
	export let fill = 'currentColor'

	$: data = [
		{ cx: 0.2 * size, cy: 0.2 * size },
		{ cx: 0.4 * size, cy: 0.4 * size },
		{ cx: 0.6 * size, cy: 0.6 * size },
		{ cx: 0.8 * size, cy: 0.8 * size },
		{ cx: 0.8 * size, cy: 0.2 * size },
		{ cx: 0.6 * size, cy: 0.4 * size },
		{ cx: 0.4 * size, cy: 0.6 * size },
		{ cx: 0.2 * size, cy: 0.8 * size }
	].map((x) => ({ ...x, r: 0.08 * size }))
</script>

{#each data as { cx, cy, r }}
	<circle {cx} {cy} {r} {fill} />
{/each}
