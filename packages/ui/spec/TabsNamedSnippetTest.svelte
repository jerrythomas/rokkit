<script lang="ts">
	import Tabs from '../src/components/Tabs.svelte'

	const { options = [], value }: { options?: unknown[]; value?: unknown } = $props()
</script>

<Tabs {options} {value}>
	{#snippet pinned(proxy, _sel)}
		<span data-named-item>Pinned: {proxy.label}</span>
	{/snippet}
	{#snippet itemContent(proxy, _sel)}
		<span data-default-item>Item: {proxy.label}</span>
	{/snippet}
</Tabs>
