<script>
	import { defaultStateIcons, getLineTypes } from '@rokkit/core'
	import Node from './Node.svelte'
	import NestedList from './NestedList.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {Array<NodeProxy>} [items]
	 * @property {import('./types').ConnectionType[]} [types]
	 * @property {any} [value]
	 * @property {import('./types').NodeStateIcons} icons
	 */

	/** @type {Props} */
	let { items = $bindable([]), types = [], value = $bindable(null), icons = {} } = $props()

	const stateIcons = $derived({ ...defaultStateIcons.node, ...icons })
</script>

<rk-nested-list role="tree">
	{#each items as item, index}
		{@const hasChildren = item.hasChildren()}
		{@const nodeType = index === items.length - 1 ? 'last' : 'child'}
		{@const connectors = getLineTypes(hasChildren, types, nodeType)}

		<Node value={items[index]} types={connectors} {stateIcons}>
			{#if items[index].expanded}
				<!-- <div role="treeitem" aria-selected={false}> -->
				<NestedList items={item.children} {value} icons={stateIcons} types={connectors} />
				<!-- </div> -->
			{/if}
		</Node>
	{/each}
</rk-nested-list>
