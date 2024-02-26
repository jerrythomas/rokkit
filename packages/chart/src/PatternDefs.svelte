<script>
	import Texture from './Texture.svelte'

	export let thickness = 0.5
	export let patterns = []
	export let size = 10
</script>

<defs>
	{#each patterns as { id, path, fill, stroke }}
		{@const p = typeof path === 'function' ? path(size) : path}
		<Texture {id} path={p} {fill} {stroke} {thickness} {size} />
	{/each}
</defs>
