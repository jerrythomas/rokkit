<script>
	import List from './List.svelte'
	import FieldLayout from './FieldLayout.svelte'
	import { defaultFields } from '@rokkit/core'
	import { createEventDispatcher, getContext } from 'svelte'

	const dispatch = createEventDispatcher()
	const registry = getContext('registry')

	let className = ''
	export { className as class }
	export let value = []
	export let fields = defaultFields
	export let schema
	export let path = []
	export let below = false

	let index = 0
	let item = value[index]

	function handleSelect(event) {
		index = event.detail.indices[0]
		item = event.detail.item
		location = [...path, ...event.detail.indices]
		dispatch('select', { item: value, indices: path })
	}

	$: location = [...path, index]
</script>

<list-editor class="flex {className}">
	<List
		bind:items={value}
		value={item}
		{fields}
		using={$registry.components}
		on:select={handleSelect}
	/>
	<item-editor class="flex" class:below>
		<slot />
		<FieldLayout bind:value={item} {schema} path={location} />
	</item-editor>
</list-editor>
