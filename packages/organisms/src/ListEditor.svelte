<script>
	import { run } from 'svelte/legacy'

	import List from './List.svelte'
	import FieldLayout from './FieldLayout.svelte'
	import { defaultFields } from '@rokkit/core'
	import { createEventDispatcher, getContext } from 'svelte'

	const dispatch = createEventDispatcher()
	const registry = getContext('registry')

	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [value]
	 * @property {any} [fields]
	 * @property {any} schema
	 * @property {any} [path]
	 * @property {boolean} [below]
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let {
		class: className = '',
		value = $bindable([]),
		fields = defaultFields,
		schema,
		path = [],
		below = false,
		children
	} = $props()

	let index = $state(0)
	let item = $state(value[index])

	function handleSelect(event) {
		index = event.detail.indices[0]
		item = event.detail.item
		location = [...path, ...event.detail.indices]
		dispatch('select', { item: value, indices: path })
	}

	let location
	run(() => {
		location = [...path, index]
	})
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
		{@render children?.()}
		<FieldLayout bind:value={item} {schema} path={location} />
	</item-editor>
</list-editor>
