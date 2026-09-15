<script lang="ts">
	import Toggle from '../src/components/Toggle.svelte'

	const { options = [] }: { options?: unknown[] } = $props()
</script>

{#snippet pinned(proxy, _sel)}
	<span data-named-item>Pinned: {proxy.label}</span>
{/snippet}

<Toggle {options} snippets={{ pinned }}>
	{#snippet itemContent(proxy, _sel)}
		<span data-default-item>Item: {proxy.label}</span>
	{/snippet}
</Toggle>
