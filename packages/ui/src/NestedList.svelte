<script>
	import { equals } from 'ramda'
	import { defaultStateIcons, getLineTypes, getKeyFromPath } from '@rokkit/core'
	import { defaultMapping } from './constants'
	import Node from './Node.svelte'
	import NestedList from './NestedList.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {Array<any>} [items]
	 * @property {import('@rokkit/core').FieldMapping} [mapping]
	 * @property {import('./types').ConnectionType[]} [types]
	 * @property {any} [value]
	 * @property {number[]} [hierarchy]
	 * @property {import('./types').NodeStateIcons} icons
	 */

	/** @type {Props} */
	let {
		class: classes = '',
		items = $bindable([]),
		wrapper = $bindable(),
		mapping = defaultMapping,
		types = [],
		value = $bindable(null),
		hierarchy = [],
		icons = {}
	} = $props()

	const stateIcons = $derived({ ...defaultStateIcons.node, ...icons })
</script>

<rk-nested-list class={classes} role="tree">
	{#each items as item, index}
		{@const hasChildren = mapping.hasChildren(item)}
		{@const indexPath = [...hierarchy, index]}
		{@const nodeType = index === items.length - 1 ? 'last' : 'child'}
		{@const connectors = getLineTypes(hasChildren, types, nodeType)}
		{@const selected = wrapper.selected.has(getKeyFromPath(indexPath))}
		{@const expanded = mapping.isExpanded(items[index])}

		<Node
			value={items[index]}
			{mapping}
			types={connectors}
			path={indexPath}
			{stateIcons}
			{selected}
			{expanded}
			current={equals(wrapper.currentNode, item)}
		>
			{#if expanded}
				<!-- <div role="treeitem" aria-selected={false}> -->
				<NestedList
					items={item[mapping.fields.children]}
					{value}
					{wrapper}
					{mapping}
					icons={stateIcons}
					types={connectors}
					hierarchy={indexPath}
				/>
				<!-- </div> -->
			{/if}
		</Node>
	{/each}
</rk-nested-list>
