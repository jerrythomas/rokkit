<script lang="ts">
	import Select from '../src/components/Select.svelte'

	const {
		items = []
	}: {
		items?: unknown[]
	} = $props()
</script>

{#snippet header(proxy)}
	<span data-named-group>Observatory: {proxy.label}</span>
{/snippet}
{#snippet pinned(proxy)}
	<span data-named-item>Pinned: {proxy.label}</span>
{/snippet}

<Select {items} snippets={{ header, pinned }}>
	{#snippet groupContent(proxy)}
		<span data-default-group>Group: {proxy.label}</span>
	{/snippet}
	{#snippet itemContent(proxy)}
		<span data-default-item>Item: {proxy.label}</span>
	{/snippet}
</Select>
