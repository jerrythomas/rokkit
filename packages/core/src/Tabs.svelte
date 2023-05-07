<script>
	import { TableIndex } from './../../../shared/config/dist/tableIndex.d.ts'
	import { defaultFields, defaultStateIcons } from './constants'
	import { Text } from './items'
	import { navigator } from './actions'
	import { createEventDispatcher } from 'svelte'
	import TabItem from './TabItem.svelte'

	const dispatch = createEventDispatcher()

	let className = ''
	export { className as class }
	export let items = []
	export let fields = {}
	export let using = {}
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
	$: icons = { ...defaultStateIcons.action, ...icons }
	$: filtered = items.filter((item) => !item[fields.isDeleted])
	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Text, ...using }
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
		<TabItem
			value={item}
			{index}
			{fields}
			{using}
			removable={editable}
			selected={item === value}
			{icons}
		/>
		<!-- {@const component = item[fields.component]
			? using[item[fields.component]] || using.default
			: using.default}

		<item
			class="flex"
			role="option"
			aria-selected={item === value}
			class:is-selected={item === value}
			data-path={index}
		>
			<svelte:component this={component} value={item} {fields} />
			{#if editable}
				<icon class={icons.close} on:click={() => handleRemove(item)} />
			{/if}
		</item> -->
	{/each}
	{#if editable}
		<add-tab
			class="flex items-center"
			role="button"
			on:click={() => dispatch('add')}
			on:keydown={(e) => e.key === 'Enter' && e.currentTarget.click()}
			tabindex="0"
		>
			<icon class={icons.add} />
		</add-tab>
	{/if}
</tabs>
