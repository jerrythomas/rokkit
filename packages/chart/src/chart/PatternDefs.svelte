<script>
	import Texture from './Texture.svelte'
	const size = 10

	export let thickness = 0.5
	export let patterns
</script>

<defs>
	{#each patterns as pattern}
		<Texture {...pattern} {thickness} {size} />
	{/each}
</defs>
