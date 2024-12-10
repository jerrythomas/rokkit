<script>
	import NestedList from './NestedList.svelte'
	import { run } from 'svelte/legacy'

	import { defaultFields, defaultStateIcons, getLineTypes } from '@rokkit/core'
	import { Node, Item } from '@rokkit/molecules'

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [items]
	 * @property {import('@rokkit/core').FieldMapping} [fields]
	 * @property {any} [using]
	 * @property {any} [types]
	 * @property {any} [value]
	 * @property {boolean} [rtl]
	 * @property {any} [hierarchy]
	 * @property {any} icons
	 */

	/** @type {Props} */
	let {
		class: className = 'list',
		items = [],
		fields = $bindable(defaultFields),
		using = $bindable({}),
		types = [],
		value = $bindable(null),
		rtl = false,
		hierarchy = [],
		icons = $bindable()
	} = $props()

	run(() => {
		icons = { ...defaultStateIcons.node, ...icons }
	})
	run(() => {
		using = { default: Item, ...using }
	})
	run(() => {
		fields = { ...defaultFields, ...fields }
	})
	let nodeTypes = $derived(items.map((_, index) => (index === items.length - 1 ? 'last' : 'child')))
</script>

<nested-list class="nested-list flex w-full flex-col {className}" class:rtl role="tree">
	{#each items as item, index}
		{@const hasChildren = fields.children in item}
		{@const path = [...hierarchy, index]}
		{@const connectors = getLineTypes(hasChildren, types, nodeTypes[index])}

		<Node
			bind:value={items[index]}
			{fields}
			{using}
			types={connectors}
			{rtl}
			{path}
			stateIcons={icons}
			selected={value === item}
		>
			{#if hasChildren && item[fields.isOpen]}
				<!-- <div role="treeitem" aria-selected={false}> -->
				<NestedList
					items={item[fields.children]}
					bind:value
					{fields}
					{using}
					{icons}
					types={connectors}
					hierarchy={path}
				/>
				<!-- </div> -->
			{/if}
		</Node>
	{/each}
</nested-list>
