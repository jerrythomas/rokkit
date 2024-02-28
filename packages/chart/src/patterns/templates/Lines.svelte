<script>
	export let size = 10
	export let thickness = 0.5
	export let stroke = 'currentColor'
	export let data = []

	$: lines = data.map(({ x1, y1, x2, y2 }) => ({
		x1: x1 * size,
		y1: y1 * size,
		x2: x2 * size,
		y2: y2 * size
	}))
</script>

{#each lines as line}
	<line {...line} {stroke} stroke-width={thickness} stroke-linecap="round" />
{/each}
