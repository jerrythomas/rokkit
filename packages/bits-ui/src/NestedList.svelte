<script>
	import Tree from './tree'
	import NestedList from './NestedList.svelte'

	let { items = [], nodeIcon, depth = 0, path = [] } = $props()
</script>

<Tree.NodeList>
	{#each items as item, index (item.id)}
		{@const childPath = [...path, index]}
		<Tree.Node path={childPath}>
			<Tree.Item>
				{@render child(item)}
			</Tree.Item>
			{#if item.hasChildren}
				<NestedList items={item.children} {nodeIcon} depth={depth + 1}></NestedList>
			{/if}
		</Tree.Node>
	{/each}
</Tree.NodeList>
