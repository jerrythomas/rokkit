<script>
	import { Node, Text } from './items'
	import { defaultFields, defaultStateIcons } from './constants'
	import { getLineTypes } from './lib/connector'

	let className = 'list'
	export { className as class }
	export let items = []
	export let fields = defaultFields
	export let using = {}
	export let types = []
	export let value = null
	export let rtl = false
	export let hierarchy = []
	export let icons

	$: using = { default: Text, ...using }
	$: fields = { ...defaultFields, ...fields }
	$: nodeTypes = items.map((_, index) =>
		index === items.length - 1 ? 'last' : 'child'
	)
	$: icons = { ...defaultStateIcons.node, ...icons }
</script>

<nested-list
	class="flex flex-col w-full {className}"
	role="listbox"
	class:rtl
	tabindex="-1"
>
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
		/>
		<!-- types={[...connectors, type, nodeTypes[index]]} -->
		{#if hasChildren && item[fields.isOpen]}
			<svelte:self
				items={item[fields.children]}
				bind:value
				{fields}
				{using}
				{icons}
				types={connectors}
				hierarchy={path}
			/>
		{/if}
	{/each}
</nested-list>
