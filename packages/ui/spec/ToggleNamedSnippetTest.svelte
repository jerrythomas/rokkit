<script lang="ts">
	import Toggle from '../src/components/Toggle.svelte'

	const { options = [] }: { options?: unknown[] } = $props()
</script>

<Toggle {options}>
	{#snippet pinned(proxy, _sel)}
		<span data-named-item>Pinned: {proxy.label}</span>
	{/snippet}
	{#snippet itemContent(proxy, _sel)}
		<span data-default-item>Item: {proxy.label}</span>
	{/snippet}
</Toggle>
