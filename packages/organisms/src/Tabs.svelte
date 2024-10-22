<script>
	import { run } from 'svelte/legacy';

	import { createEventDispatcher } from 'svelte'
	import { defaultFields, defaultStateIcons } from '@rokkit/core'
	import { navigator } from '@rokkit/actions'
	import { Icon } from '@rokkit/atoms'
	import { ItemWrapper, Item } from '@rokkit/molecules'

	const dispatch = createEventDispatcher()

	
	
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [options]
	 * @property {import('@rokkit/core').FieldMapping} [fields]
	 * @property {any} using
	 * @property {any} [value]
	 * @property {boolean} [below]
	 * @property {string} [align]
	 * @property {boolean} [editable]
	 * @property {any} [icons]
	 */

	/** @type {Props} */
	let {
		class: className = '',
		options = $bindable([]),
		fields = $bindable({}),
		using = $bindable(),
		value = $bindable(null),
		below = false,
		align = 'left',
		editable = false,
		icons = $bindable(defaultStateIcons.action)
	} = $props();

	let cursor = $state([])

	function handleRemove(event) {
		if (typeof event.detail === Object) {
			event.detail[fields.isDeleted] = true
		} else {
			options = options.filter((i) => i !== event.detail)
		}

		dispatch('remove', { item: event.detail })
	}
	function handleAdd(event) {
		event.stopPropagation()
		dispatch('add')
	}
	function handleNav(event) {
		value = event.detail.node
		cursor = event.detail.path

		dispatch('select', { item: value, indices: cursor })
	}
	run(() => {
		using = { default: Item, ...using }
	});
	run(() => {
		icons = { ...defaultStateIcons.action, ...icons }
	});
	let filtered = $derived(options.filter((item) => !item[fields.isDeleted]))
	run(() => {
		fields = { ...defaultFields, ...fields }
	});
</script>

<tabs
	class="flex w-full {className}"
	class:is-below={below}
	class:justify-center={align === 'center'}
	class:justify-end={align === 'right'}
	tabindex="0"
	role="listbox"
	use:navigator={{
		items: options,
		fields,
		vertical: false,
		indices: cursor
	}}
	onmove={handleNav}
	onselect={handleNav}
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
		<Icon name="add" role="button" label="Add Tab" size="small" on:click={handleAdd} />
	{/if}
</tabs>
