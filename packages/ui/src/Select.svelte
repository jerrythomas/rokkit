<script>
	import { defaultFields, defaultStateIcons } from '@rokkit/core'
	import Slider from './Slider.svelte'
	import Icon from './Icon.svelte'
	import { dismissable, navigable } from '@rokkit/actions'

	import List from './List.svelte'
	// import ListItems from './ListItems.svelte'
	import Item from './Item.svelte'

	let {
		class: className = '',
		name = null,
		options = $bindable([]),
		fields,
		using = {},
		value = $bindable(null),
		placeholder = '',
		currentItem
	} = $props()

	let activeIndex = $state(-1)
	let open = $state(false)
	// let offsetTop
	let icons = defaultStateIcons.selector
	let activeItem = $state(null)

	function handleSelect() {
		open = false
		dispatch('select', value)
		dispatch('change', value)
	}
	function handleNext() {
		if (!open) {
			open = true
		} else if (activeIndex < options.length - 1) {
			value = options[activeIndex + 1]
		}
	}
	function handlePrevious() {
		if (!open) {
			open = true
		} else if (activeIndex > 0) {
			value = options[activeIndex - 1]
		}
	}
	function handleKeySelect() {
		if (open) {
			if (value) {
				handleSelect()
			}
		}
	}

	// $: fields = { ...defaultFields, ...fields }
	// $: using = { default: Item, ...using }
	// $: activeIndex = options.findIndex((item) => item === value)
	let offsetTop = $derived(activeItem?.offsetTop + activeItem?.clientHeight ?? 0)
</script>

<input-select
	class="relative flex flex-col {className}"
	class:open
	tabindex="0"
	role="listbox"
	aria-label={name}
	use:dismissable
	use:navigable={{ horizontal: false, vertical: true }}
	onfocus={() => (open = true)}
	onblur={() => (open = false)}
	ondismiss={() => (open = false)}
	onprevious={handlePrevious}
	onnext={handleNext}
	onselect={handleKeySelect}
>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<selected-item
		onclick={() => (open = !open)}
		class="flex w-full items-center"
		bind:this={activeItem}
		role="option"
		tabindex="-1"
		aria-selected={value !== null && !open}
	>
		<item>
			{#if currentItem}
				{@render currentItem(value, fields)}
			{/if}
			<Item value={value ?? placeholder} {fields} />
		</item>
		{#if open}
			<Icon name={icons.opened} label="opened" tabindex="-1" />
		{:else}
			<Icon name={icons.closed} label="closed" tabindex="-1" />
		{/if}
	</selected-item>
	{#if open}
		<Slider top={offsetTop}>
			<!-- <list class="flex flex-col w-full flex-shrink-0 select-none" role="listbox" tabindex="-1">
			<ListItems
				items={options}
				bind:value
				{fields}
				{using}
			/>
		</list> -->
			<List
				bind:items={options}
				{fields}
				{using}
				bind:value
				on:select={handleSelect}
				tabindex="-1"
			/>
		</Slider>
	{/if}
</input-select>
