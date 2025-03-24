<script>
	import { SvelteSet } from 'svelte/reactivity'
	import { defaultStateIcons, getLineTypes, FieldMapper, getKeyFromPath } from '@rokkit/core'
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
	let {
		items = $bindable([]),
		value = $bindable(null),
		fields,
		icons = {},
		types = [],
		path = [],
		focusedKey,
		selectedKeys = new SvelteSet(),
		expandedKeys = new SvelteSet()
	} = $props()

	const stateIcons = $derived({ ...defaultStateIcons.node, ...icons })
	const mapper = new FieldMapper(fields)
</script>

<rk-nested-list role="tree">
	{#each items as item, index}
		{@const hasChildren = mapper.hasChildren(item)}
		{@const nodeType = index === items.length - 1 ? 'last' : 'child'}
		{@const connectors = getLineTypes(hasChildren, types, nodeType)}
		{@const nodePath = [...path, index]}
		{@const key = getKeyFromPath(nodePath)}

		<Node
			value={items[index]}
			{fields}
			{stateIcons}
			types={connectors}
			{focusedKey}
			{selectedKeys}
			{expandedKeys}
			path={nodePath}
		>
			{#if expandedKeys.has(key)}
				<!-- <div role="treeitem" aria-selected={false}> -->
				<NestedList
					items={item[mapper.fields.children]}
					{value}
					{fields}
					icons={stateIcons}
					types={connectors}
					{focusedKey}
					{selectedKeys}
					{expandedKeys}
					path={nodePath}
				/>
				<!-- </div> -->
			{/if}
		</Node>
	{/each}
</rk-nested-list>
