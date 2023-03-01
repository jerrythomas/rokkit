<script>
	import { Node, Text } from './items'
	import { defaultFields } from './constants'
	import { createEventDispatcher } from 'svelte'
	import { navigator } from './actions/navigator'

	const dispatch = createEventDispatcher()

	export let items = []
	export let fields = defaultFields
	export let using = {}
	export let types = []
	export let value
	export let linesVisible = true
	export let rtl = false
	export let hierarchy = []

	let indices = []

	function handle(event) {
		value = event.detail.node
		indices = event.detail.path
		if (['collapse', 'expand'].includes(event.type)) {
			items = items
		}
		dispatch(event.type, value)
	}
	// function handleExpand(event) {
	// 	value = event.detail.node
	// 	indices = event.detail.path
	// 	items = items // tell svelte data has changed
	// 	dispatch('expand', value)
	// }
	// function handleCollapse(event) {
	// 	// console.log(event)
	// 	value = event.detail.node
	// 	indices = event.detail.path
	// 	items = items // tell svelte data has changed
	// 	dispatch('collapse', value)
	// }
	$: using = { default: Text, ...using }
	$: fields = { ...defaultFields, ...fields }
	$: nodeTypes = items.map((_, index) =>
		index === items.length - 1 ? 'last' : 'middle'
	)
</script>

<nested-list
	class="flex flex-col w-full"
	role="listbox"
	class:rtl
	tabindex={hierarchy.length == 0 ? 0 : -1}
	use:navigator={{ items, fields, indices, enabled: hierarchy.length == 0 }}
	on:select={handle}
	on:move={handle}
	on:expand={handle}
	on:collapse={handle}
>
	{#each items as content, index}
		{@const type = nodeTypes[index] === 'middle' ? 'line' : 'empty'}
		{@const hasChildren = fields.children in content}
		{@const connectors = types.slice(0, -1)}
		{@const path = [...hierarchy, index]}

		<Node
			bind:content
			{fields}
			{using}
			types={[...connectors, nodeTypes[index]]}
			{linesVisible}
			{rtl}
			{path}
			selected={value === content}
		/>
		{#if hasChildren && content[fields.isOpen]}
			<svelte:self
				items={content[fields.children]}
				bind:value
				{fields}
				{using}
				types={[...connectors, type, nodeTypes[index]]}
				{linesVisible}
				hierarchy={path}
			/>
		{/if}
	{/each}
</nested-list>
