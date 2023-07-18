<script>
	import { defaultFields, defaultStateIcons, getId } from '@rokkit/core'
	import { Slider, Icon } from '@rokkit/atoms'
	import { dismissable, navigable } from '@rokkit/actions'
	import { createEventDispatcher } from 'svelte'
	import List from './List.svelte'
	import { Item } from '@rokkit/molecules'
  import { findItemOnValueChange } from './lib/mode'

	const dispatch = createEventDispatcher()

	let className = ''
	export { className as class }
	export let items = []
	/** @type {import('@rokkit/core').FieldMapping} */
	export let fields = {}
	export let using = {}
	export let value = null
  export let useItemAsValue = false
	let selected = {value: value, id: getId(value, fields)}
	export let placeholder = ''

	let activeIndex
	let open = false
	let offsetTop
	let icons = defaultStateIcons.selector

	function handleSelect() {
		open = false
		selected.id = getId(selected.value, fields)
		value = (useItemAsValue) ? selected.value: selected.id
		dispatch('select', selected)
	}
	function handleNext() {
		if (!open) {
			open = true
		} else if (activeIndex < items.length - 1) {
			selected = {
				value : items[activeIndex + 1],
				id: getId(items[activeIndex + 1], fields)
			}
			value = (useItemAsValue)?  selected.value: selected.id
		}
	}
	function handlePrevious() {
		if (!open) {
			open = true
		} else if (activeIndex > 0) {
			selected = {value: items[activeIndex - 1], id: getId(items[activeIndex - 1], fields)}
			value = (useItemAsValue)?  selected.value: selected.id
		}
	}
	function handleKeySelect() {
		if (open) {
			if (selected.value) {
				handleSelect()
			}
		}
	}

	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Item, ...using }
	$: activeIndex = items.findIndex((item) => item === selected.value)
	$: if (!value && !useItemAsValue && value !== selected.id ) {
		  selected.value = findItemOnValueChange(value, items, fields, useItemAsValue)
			selected.id = getId(selected.value, fields)
		}
</script>

<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<input-select
	class="flex flex-col relative {className}"
	class:open
	tabindex="0"
	use:dismissable
	use:navigable={{ horizontal: false, vertical: true }}
	on:blur={() => (open = false)}
	on:dismiss={() => (open = false)}
	on:previous={handlePrevious}
	on:next={handleNext}
	on:select={handleKeySelect}
>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<selected-item
		on:click|stopPropagation={() => (open = !open)}
		class="w-full flex items-center"
		bind:clientHeight={offsetTop}
		role="option"
		tabindex="-1"
		aria-selected={selected.value !== null && !open}
	>
		<slot>
			<item class="w-full flex">
				<svelte:component
					this={using.default}
					value={selected.value ?? placeholder}
					{fields}
				/>
			</item>
		</slot>
		{#if open}
			<Icon name={icons.opened} label="opened" role="button" tabindex="-1" />
		{:else}
			<Icon name={icons.closed} label="closed" role="button" tabindex="-1" />
		{/if}
	</selected-item>
	{#if open}
		<Slider top={offsetTop}>
			<List
				{items}
				{fields}
				{using}
				bind:value={selected.value}
				on:select={handleSelect}
				tabindex="-1"
			/>
		</Slider>
	{/if}
</input-select>
