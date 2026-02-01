<script>
	import { defaultStateIcons, createEmitter } from '@rokkit/core'
	import Slider from './Slider.svelte'
	import Icon from './Icon.svelte'
	import { dismissable, navigable } from '@rokkit/actions'
	import List from './List.svelte'
	import Item from './Item.svelte'

	/** @type {import('./types.js').SelectProps} */
	let {
		class: className = '',
		name = 'select',
		options = $bindable([]),
		fields = {},
		value = $bindable(null),
		placeholder = '',
		tabindex = 0,
		disabled = false,
		open = $bindable(false),
		direction = 'down',
		currentItem,
		onselect,
		onchange
	} = $props()

	let icons = defaultStateIcons.selector
	let activeItem = $state(null)
	let emitter = createEmitter({ onchange, onselect }, ['select', 'change'])

	function handleSelect(selectedValue) {
		value = selectedValue
		open = false
		emitter.select(value)
		emitter.change(value)
	}

	function handleListSelect(event) {
		handleSelect(event.detail?.value ?? event.detail)
	}

	function handleNext() {
		if (!open) {
			open = true
		} else {
			const currentIndex = options.findIndex((opt) => opt === value)
			if (currentIndex < options.length - 1) {
				value = options[currentIndex + 1]
			}
		}
	}

	function handlePrevious() {
		if (!open) {
			open = true
		} else {
			const currentIndex = options.findIndex((opt) => opt === value)
			if (currentIndex > 0) {
				value = options[currentIndex - 1]
			}
		}
	}

	function handleKeySelect() {
		if (open && value) {
			handleSelect(value)
		}
	}

	function handleToggle() {
		if (!disabled) {
			open = !open
		}
	}

	function handleDismiss() {
		open = false
	}

	let offsetTop = $derived(activeItem?.offsetTop + activeItem?.clientHeight ?? 0)
</script>

<input-select
	data-select
	class={className}
	class:open
	{tabindex}
	role="combobox"
	aria-label={name}
	aria-expanded={open}
	aria-disabled={disabled}
	aria-controls={open ? `${name}-listbox` : undefined}
	use:dismissable
	use:navigable={{ horizontal: false, vertical: true }}
	onfocus={() => !disabled && (open = true)}
	onblur={() => (open = false)}
	ondismiss={handleDismiss}
	onprevious={handlePrevious}
	onnext={handleNext}
	onselect={handleKeySelect}
>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<selected-item
		data-select-trigger
		onclick={handleToggle}
		bind:this={activeItem}
		role="button"
		tabindex="-1"
	>
		<item data-select-value>
			{#if currentItem}
				{@render currentItem(value, fields)}
			{:else if value}
				<Item {value} {fields} />
			{:else}
				<span data-select-placeholder>{placeholder}</span>
			{/if}
		</item>
		<Icon
			name={open ? icons.opened : icons.closed}
			label={open ? 'opened' : 'closed'}
			tabindex="-1"
		/>
	</selected-item>
	{#if open}
		<Slider top={offsetTop}>
			<List
				items={options}
				{fields}
				bind:value
				onselect={handleListSelect}
				tabindex="-1"
				name={`${name}-listbox`}
			/>
		</Slider>
	{/if}
</input-select>
