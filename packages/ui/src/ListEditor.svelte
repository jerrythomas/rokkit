<script>
	import List from './List.svelte'
	import FieldLayout from './FieldLayout.svelte'
	import { defaultFields } from '@rokkit/core'
	import { getContext } from 'svelte'

	// const dispatch = createEventDispatcher()
	const registry = getContext('registry')

	let {
		class: className,
		value,
		fields = defaultFields,
		schema,
		path = [],
		below = false,
		children
	} = $props()

	let index = 0
	let item = $state(value[index])
	let location = $state([...path, index])

	function handleSelect(event) {
		index = event.detail.indices[0]
		item = event.detail.item
		location = [...path, ...event.detail.indices]
		dispatch('select', { item: value, indices: path })
	}
</script>

<list-editor class="flex {className}">
	<List
		bind:items={value}
		bind:value={item}
		{fields}
		using={registry.components}
		on:select={handleSelect}
	/>
	<item-editor class="flex" class:below>
		{@render children?.()}
		<FieldLayout bind:value={item} {schema} path={location} />
	</item-editor>
</list-editor>
