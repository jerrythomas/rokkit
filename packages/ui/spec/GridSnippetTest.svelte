<script lang="ts">
	import Grid from '../src/components/Grid.svelte'

	const {
		items = []
	}: {
		items?: unknown[]
	} = $props()
</script>

{#snippet pinned(proxy)}
	<span data-named-item>Pinned: {proxy.label}</span>
{/snippet}

<Grid {items} snippets={{ pinned }}>
	{#snippet itemContent(proxy)}
		<span data-default-item>Item: {proxy.label}</span>
	{/snippet}
</Grid>
