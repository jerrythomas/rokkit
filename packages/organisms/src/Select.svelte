<script>
	import { defaultFields, defaultStateIcons } from '@rokkit/core'
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
  export let useSelectedItemValue = true
	let selectedValue = null
	export let placeholder = ''

	let activeIndex
	let selectedId = null
	let open = false
	let offsetTop
	let icons = defaultStateIcons.selector

	function handleSelect() {
		open = false
		dispatch('select', selectedValue)
	}
	function handleNext() {
		if (!open) {
			open = true
		} else if (activeIndex < items.length - 1) {
			selectedValue = items[activeIndex + 1]
		}
	}
	function handlePrevious() {
		if (!open) {
			open = true
		} else if (activeIndex > 0) {
			selectedValue = items[activeIndex - 1]
		}
	}
	function handleKeySelect() {
		if (open) {
			if (selectedValue) {
				handleSelect()
			}
		}
	}

	function handleChange(selectedValue) {
		if (!useSelectedItemValue && typeof selectedValue === 'object' && selectedValue !== null) {
			activeIndex = items.findIndex((item) =>  item[fields.id] ?? items[fields.text] === selectedValue )
			selectedId = selectedValue[fields.id] ?? selectedValue[fields.text]
			value =  selectedId
		} else {
			activeIndex = items.findIndex((item) => item === selectedValue)
			value = selectedValue
		}

	}
	$: fields = { ...defaultFields, ...fields }
	$: using = { default: Item, ...using }
	$: handleChange(selectedValue)
	$: if (!value && !useSelectedItemValue && value !== selectedId ) {
		  selectedValue = findItemOnValueChange(value, items, fields, useSelectedItemValue)
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
		aria-selected={selectedValue !== null && !open}
	>
		<slot>
			<item class="w-full flex">
				<svelte:component
					this={using.default}
					value={selectedValue ?? placeholder}
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
				bind:value={selectedValue}
				on:select={handleSelect}
				tabindex="-1"
			/>
		</Slider>
	{/if}
</input-select>
