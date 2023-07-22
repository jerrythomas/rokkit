<script>
	export let size = 10
	export let thickness = 0.5
	export let stroke = 'currentColor'

	const lines = [
		{ x1: 0, y1: 0.25 * size, x2: 0.5 * size, y2: 0.25 * size },
		{ x1: 0.5 * size, y1: 0.75 * size, x2: size, y2: 0.75 * size },
		{ x1: 0, y1: 0, x2: 0, y2: size },
		{ x1: size, y1: 0, x2: size, y2: size },
		{ x1: 0.5 * size, y1: 0, x2: 0.5 * size, y2: size }
	]
</script>

{#each lines as line}
	<line {...line} {stroke} stroke-width={thickness} stroke-linecap="round" />
{/each}
