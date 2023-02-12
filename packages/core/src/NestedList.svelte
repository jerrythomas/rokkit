<script>
	import { Node, Text } from './items'
	import { defaultFields } from './constants'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	export let items = []
	export let fields = {}
	export let using = {}
	export let types = []
	export let value
	export let linesVisible = true
	export let rtl = false

	function handleSelect(event) {
		value = event.detail
		dispatch('select', value)
	}
	$: using = { default: Text, ...using }
	$: fields = { ...defaultFields, ...fields }
	$: nodeTypes = items.map((_, index) =>
		index === items.length - 1 ? 'last' : 'middle'
	)
</script>

<nested-list class="flex flex-col w-full" class:rtl>
	{#each items as content, index}
		{@const type = nodeTypes[index] === 'middle' ? 'line' : 'empty'}
		{@const hasChildren = fields.children in content}
		{@const connectors = types.slice(0, -1)}

		<Node
			bind:content
			{fields}
			{using}
			types={[...connectors, nodeTypes[index]]}
			{linesVisible}
			{rtl}
			selected={value === content}
			on:select={handleSelect}
		/>
		{#if hasChildren && content.isOpen}
			<svelte:self
				items={content[fields.children]}
				bind:value
				{fields}
				{using}
				types={[...connectors, type, nodeTypes[index]]}
				{linesVisible}
			/>
		{/if}
	{/each}
</nested-list>
