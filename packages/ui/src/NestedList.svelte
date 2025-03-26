<script>
	import { SvelteSet } from 'svelte/reactivity'
	import {
		defaultStateIcons,
		getLineTypes,
		getKeyFromPath,
		getNestedFields,
		hasChildren
	} from '@rokkit/core'
	import Node from './Node.svelte'
	import NestedList from './NestedList.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {Array<NodeProxy>}                   [items=[]]
	 * @property {any}                                [value=null]
	 * @property {import('./types').FieldMapping}     fields
	 * @property {number[]}                           [path=[]]
	 * @property {import('./types').NodeStateIcons}   icons
	 * @property {import('./types').ConnectionType[]} [types=[]]
	 * @property {string}                             [focusedKey]
	 * @property {SvelteSet}                          [selectedKeys]
	 */

	/** @type {Props} */
	let {
		items = $bindable([]),
		value = $bindable(null),
		fields,
		path = [],
		icons = {},
		types = [],
		focusedKey,
		selectedKeys = new SvelteSet(),
		stub,
		snippets
	} = $props()

	const stateIcons = $derived({ ...defaultStateIcons.node, ...icons })
	const childFields = $derived(getNestedFields(fields))
	// $inspect(childFields, items[0], expandedKeys)
</script>

<rk-nested-list role="tree">
	{#each items as item, index (index)}
		{@const nodePath = [...path, index]}
		{@const key = getKeyFromPath(nodePath)}
		{@const expanded = item[fields.expanded]}
		{@const nodeType = index === items.length - 1 ? 'last' : 'child'}
		{@const connectors = getLineTypes(hasChildren(item, fields), types, nodeType)}

		<Node
			value={item}
			{fields}
			{stateIcons}
			types={connectors}
			focused={focusedKey === key}
			selected={selectedKeys.has(key)}
			{expanded}
			path={nodePath}
			{stub}
			{snippets}
		>
			{#if hasChildren(item, fields) && expanded}
				<NestedList
					items={item[fields.children]}
					{value}
					fields={childFields}
					path={nodePath}
					icons={stateIcons}
					types={connectors}
					{focusedKey}
					{selectedKeys}
				/>
			{/if}
		</Node>
	{/each}
</rk-nested-list>
