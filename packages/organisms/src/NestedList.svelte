<script>
	import NestedList from './NestedList.svelte'

	import { defaultStateIcons, getLineTypes } from '@rokkit/core'
	import { Node } from '@rokkit/molecules'
	import { defaultMapping } from '@rokkit/molecules/constants'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {Array<any>} [items]
	 * @property {import('@rokkit/core').FieldMapping} [mapping]
	 * @property {any} [types]
	 * @property {any} [value]
	 * @property {any} [hierarchy]
	 * @property {any} icons
	 */

	/** @type {Props} */
	let {
		class: classes = '',
		items = [],
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

		<Node
			value={items[index]}
			{mapping}
			types={connectors}
			path={indexPath}
			{stateIcons}
			selected={value === item}
		>
			{#if mapping.isExpanded(item)}
				<!-- <div role="treeitem" aria-selected={false}> -->
				<NestedList
					items={item[mapping.fields.children]}
					bind:value
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
