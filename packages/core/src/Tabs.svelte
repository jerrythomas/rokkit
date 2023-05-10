<script>
	import { defaultFields, defaultStateIcons } from './constants'
	import Icon from './Icon.svelte'
	import { ItemWrapper } from './items'
	import { navigator } from './actions'
	import { createEventDispatcher } from 'svelte'

	const dispatch = createEventDispatcher()

	let className = ''
	export { className as class }
	export let items = []
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
			items = items.filter((i) => i !== item)
		}

		dispatch('remove', { item })
	}
	function handleNav(event) {
		value = event.detail.node
		cursor = event.detail.path

		dispatch('select', { item: value, indices: cursor })
	}
	// $: using = {default: Item, ...using}
	$: icons = { ...defaultStateIcons.action, ...icons }
	$: filtered = items.filter((item) => !item[fields.isDeleted])
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
		items,
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
