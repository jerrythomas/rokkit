<script lang="ts">
	import Grid from '../src/components/Grid.svelte'

	const {
		items = []
	}: {
		items?: unknown[]
	} = $props()
</script>

<Grid {items}>
	{#snippet pinned(proxy)}
		<span data-named-item>Pinned: {proxy.label}</span>
	{/snippet}
	{#snippet itemContent(proxy)}
		<span data-default-item>Item: {proxy.label}</span>
	{/snippet}
</Grid>
