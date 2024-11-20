<script>
	import { isNotNil, equals } from 'ramda'
	import { defaultFields, defaultStateIcons, createEmitter } from '@rokkit/core'
	import { Slider, Icon } from '@rokkit/atoms'
	import { dismissable, navigable } from '@rokkit/actions'
	import { Item } from '@rokkit/molecules'
	import List from './List.svelte'

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
		options = $bindable([]),
		fields = $bindable({}),
		using = $bindable({}),
		value = $bindable(null),
		placeholder = '',
		children,
		...events
	} = $props()

	let activeIndex = $state()
	let open = $state(false)
	let offsetTop = $derived(activeItem?.offsetTop + activeItem?.clientHeight ?? 0)
	let icons = defaultStateIcons.selector
	let activeItem = $state()
	let emitter = createEmitter(events, ['change', 'select'])

	function handleSelect() {
		open = false
		emitter.select(value)
		emitter.change(value)
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
	function toggleOnClick(event) {
		event.stopPropagation()
		open = !open
	}

	$effect.pre(() => {
		fields = { ...defaultFields, ...fields }
		using = { default: Item, ...using }
		activeIndex = options.findIndex((item) => equals(item, value))
	})
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
		onclick={toggleOnClick}
		class="w-full flex items-center"
		bind:this={activeItem}
		role="option"
		tabindex="-1"
		aria-selected={isNotNil(value) && !open}
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
			<List items={options} {fields} {using} bind:value onselect={handleSelect} tabindex="-1" />
		</Slider>
	{/if}
</input-select>
