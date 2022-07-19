<script>
	import PatternMask from './PatternMask.svelte'
	const size = 10

	export let thickness = 0.5
	export let patterns
</script>

<defs>
	{#each patterns as pattern}
		<PatternMask {...pattern} {thickness} {size} />
	{/each}
</defs>
