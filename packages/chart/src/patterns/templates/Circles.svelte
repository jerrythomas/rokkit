<script>
	export let size = 10
	export let fill = 'currentColor'
	export let stroke = 'currentColor'
	export let data

	$: circles = data.map(({ cx, cy, r }) => ({
		cx: cx * size,
		cy: cy * size,
		r: r * size
	}))
</script>

{#each circles as { cx, cy, r }}
	<circle {cx} {cy} {r} {fill} {stroke} />
{/each}
