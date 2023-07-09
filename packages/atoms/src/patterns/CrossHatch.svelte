<script>
	export let size = 10
	export let thickness = 0.5
	export let stroke = 'currentColor'

	const lines = [
		{ x1: 0, y1: 0, x2: size, y2: size },
		{ x1: 0, y1: size, x2: size, y2: 0 }
	]
</script>

{#each lines as line}
	<line {...line} {stroke} stroke-width={thickness} stroke-linecap="round" />
{/each}
