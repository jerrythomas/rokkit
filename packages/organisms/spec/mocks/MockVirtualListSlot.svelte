<script>
	import VirtualList from '../../src/VirtualList.svelte'

	let { items, limit } = $props();
</script>

<VirtualList {items} {limit} >
	{#snippet children({ item })}
		<div>{item}</div>
	{/snippet}
</VirtualList>
