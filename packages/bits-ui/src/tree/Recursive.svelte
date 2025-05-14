<script>
	import NodeList from './NodeList.svelte'
	import Recursive from './Recursive.svelte'

	let { items = [], nodeIcon, depth = 0, path = [] } = $props()
</script>

<NodeList>
	{#each items as item, index (item.id)}
		{@const childPath = [...path, index]}
		<Item>
			{@render child(item)}
		</Item>
		{#if item.hasChildren}
			<Recursive items={item.children} {nodeIcon} depth={depth + 1}></Recursive>
		{/if}
	{/each}
</NodeList>
