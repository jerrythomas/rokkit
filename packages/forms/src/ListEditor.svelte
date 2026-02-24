<script>
	import List from './List.svelte'
	import FieldLayout from './FieldLayout.svelte'
	import { defaultFields } from '@rokkit/core'
	import { getContext } from 'svelte'

	const registry = getContext('registry')

	let {
		class: className,
		value = $bindable(),
		fields = defaultFields,
		schema,
		path = [],
		below = false,
		children
	} = $props()

	let index = $state(0)
	let item = $derived(value[index])
	let location = $derived([...path, index])

	function handleSelect(event) {
		index = event.detail.indices[0]
	}
</script>

<list-editor class="flex {className}">
	<List
		bind:items={value}
		bind:value={item}
		{fields}
		using={registry.components}
		onselect={handleSelect}
	/>
	<item-editor class="flex" class:below>
		{@render children?.()}
		<FieldLayout bind:value={item} {schema} path={location} />
	</item-editor>
</list-editor>
