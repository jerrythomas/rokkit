<script>
	import { createEventDispatcher } from 'svelte'
	import { defaultFields, defaultStateIcons } from '@rokkit/core'
	import { navigator } from '@rokkit/actions'
	import { Icon } from '@rokkit/atoms'
	import { ItemWrapper, Item } from '@rokkit/molecules'

	const dispatch = createEventDispatcher()

	let className = ''
	export { className as class }
	export let options = []
	/** @type {import('@rokkit/core').FieldMapping} */
	export let fields = {}
	export let using
	export let value = null
	export let below = false
	export let align = 'left'
	export let editable = false
	export let icons = defaultStateIcons.action

	let cursor = []

	function handleRemove(item) {
		if (typeof item === Object) {
			item[fields.isDeleted] = true
		} else {
			options = options.filter((i) => i !== item)
		}

		dispatch('remove', { item })
	}
	function handleNav(event) {
		value = event.detail.node
		cursor = event.detail.path

		dispatch('select', { item: value, indices: cursor })
	}
	$: using = { default: Item, ...using }
	$: icons = { ...defaultStateIcons.action, ...icons }
	$: filtered = options.filter((item) => !item[fields.isDeleted])
	$: fields = { ...defaultFields, ...fields }
</script>

<tabs
	class="flex w-full {className}"
	class:is-below={below}
	class:justify-center={align == 'center'}
	class:justify-end={align == 'right'}
	tabindex="0"
	role="listbox"
	use:navigator={{
		items: options,
		fields,
		vertical: false,
		indices: cursor
	}}
	on:move={handleNav}
	on:select={handleNav}
>
	{#each filtered as item, index}
		<ItemWrapper
			value={item}
			{index}
			{fields}
			{using}
			removable={editable}
			selected={item === value}
			{icons}
			class="tab"
			on:remove={handleRemove}
		/>
	{/each}
	{#if editable}
		<Icon
			name="add"
			role="button"
			label="Add Tab"
			size="small"
			on:click={() => dispatch('add')}
		/>
	{/if}
</tabs>
