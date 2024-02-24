<script>
	import { defaultFields, defaultStateIcons, getLineTypes } from '@rokkit/core'
	import { Node, Item } from '@rokkit/molecules'

	let className = 'list'
	export { className as class }
	export let items = []
	/** @type {import('@rokkit/core').FieldMapping} */
	export let fields = defaultFields
	export let using = {}
	export let types = []
	export let value = null
	export let rtl = false
	export let hierarchy = []
	export let icons

	$: icons = { ...defaultStateIcons.node, ...icons }
	$: using = { default: Item, ...using }
	$: fields = { ...defaultFields, ...fields }
	$: nodeTypes = items.map((_, index) => (index === items.length - 1 ? 'last' : 'child'))
</script>

<nested-list class="nested-list flex flex-col w-full {className}" class:rtl role="tree">
	{#each items as item, index}
		{@const hasChildren = fields.children in item}
		{@const path = [...hierarchy, index]}
		{@const connectors = getLineTypes(hasChildren, types, nodeTypes[index])}

		<Node
			bind:value={item}
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
				<svelte:self
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
