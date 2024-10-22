<script>
	import { run, stopPropagation } from 'svelte/legacy';

	import { defaultFields, defaultStateIcons } from '@rokkit/core'
	import { Slider, Icon } from '@rokkit/atoms'
	import { dismissable, navigable } from '@rokkit/actions'
	import { createEventDispatcher } from 'svelte'
	import List from './List.svelte'
	// import ListItems from './ListItems.svelte'
	import { Item } from '@rokkit/molecules'

	const dispatch = createEventDispatcher()

	
	
	/**
	 * @typedef {Object} Props
	 * @property {string} [class]
	 * @property {any} [name]
	 * @property {any} [options]
	 * @property {import('@rokkit/core').FieldMapping} [fields]
	 * @property {any} [using]
	 * @property {any} [value]
	 * @property {string} [placeholder]
	 * @property {import('svelte').Snippet} [children]
	 */

	/** @type {Props} */
	let {
		class: className = '',
		name = null,
		options = [],
		fields = $bindable({}),
		using = $bindable({}),
		value = $bindable(null),
		placeholder = '',
		children
	} = $props();

	let activeIndex = $state()
	let open = $state(false)
	let offsetTop = $derived(activeItem?.offsetTop + activeItem?.clientHeight ?? 0)
	let icons = defaultStateIcons.selector
	let activeItem = $state()

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

	run(() => {
		fields = { ...defaultFields, ...fields }
	});
	run(() => {
		using = { default: Item, ...using }
	});
	run(() => {
		activeIndex = options.findIndex((item) => item === value)
	});
	
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<input-select
	class="flex flex-col relative {className}"
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
		onclick={stopPropagation(() => (open = !open))}
		class="w-full flex items-center"
		bind:this={activeItem}
		role="option"
		tabindex="-1"
		aria-selected={value !== null && !open}
	>
		{#if children}{@render children()}{:else}
			<item>
				<using.default value={value ?? placeholder} {fields} />
			</item>
		{/if}
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
			<List items={options} {fields} {using} bind:value on:select={handleSelect} tabindex="-1" />
		</Slider>
	{/if}
</input-select>
