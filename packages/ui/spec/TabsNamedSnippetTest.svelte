<script lang="ts">
	import Tabs from '../src/components/Tabs.svelte'

	const { options = [], value }: { options?: unknown[]; value?: unknown } = $props()
</script>

{#snippet pinned(proxy, _sel)}
	<span data-named-item>Pinned: {proxy.label}</span>
{/snippet}

<Tabs {options} {value} snippets={{ pinned }}>
	{#snippet itemContent(proxy, _sel)}
		<span data-default-item>Item: {proxy.label}</span>
	{/snippet}
</Tabs>
