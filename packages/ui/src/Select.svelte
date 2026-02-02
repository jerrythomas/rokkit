<script>
	import { defaultStateIcons, createEmitter, FieldMapper } from '@rokkit/core'
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
		direction = 'auto',
		searchable = false,
		searchText = $bindable(''),
		searchPlaceholder = 'Search...',
		filterFn,
		currentItem,
		onselect,
		onchange
	} = $props()

	let icons = defaultStateIcons.selector
	let selectElement = $state(null)
	let activeItem = $state(null)
	let searchInput = $state(null)
	let emitter = $derived(createEmitter({ onchange, onselect }, ['select', 'change']))
	let fm = $derived(new FieldMapper(fields))

	/**
	 * Calculate the effective direction based on viewport space
	 * @returns {'up' | 'down'}
	 */
	function calculateDirection() {
		if (direction !== 'auto') return direction
		if (!selectElement) return 'down'

		const rect = selectElement.getBoundingClientRect()
		const viewportHeight = window.innerHeight
		const spaceBelow = viewportHeight - rect.bottom
		const spaceAbove = rect.top

		// Prefer down unless there's significantly more space above
		// Use 200px as threshold for dropdown height
		const dropdownHeight = 200
		if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
			return 'up'
		}
		return 'down'
	}

	let effectiveDirection = $state('down')

	$effect(() => {
		if (open) {
			effectiveDirection = calculateDirection()
		}
	})

	/**
	 * Default filter function
	 * @param {any} item
	 * @param {string} text
	 */
	function defaultFilter(item, text) {
		const searchTerm = text.toLowerCase()
		const textValue = fm.get('text', item)
		if (textValue) {
			if (String(textValue).toLowerCase().includes(searchTerm)) return true
		}
		const keywords = fm.get('keywords', item)
		if (keywords) {
			const keywordStr = Array.isArray(keywords) ? keywords.join(' ') : String(keywords)
			if (keywordStr.toLowerCase().includes(searchTerm)) return true
		}
		return false
	}

	let filter = $derived(filterFn || defaultFilter)

	let filteredOptions = $derived.by(() => {
		if (!searchable || !searchText || searchText.trim() === '') {
			return options
		}
		return options.filter((item) => filter(item, searchText))
	})

	function handleSelect(selectedValue) {
		value = selectedValue
		open = false
		searchText = ''
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
			const currentIndex = filteredOptions.findIndex((opt) => opt === value)
			if (currentIndex < filteredOptions.length - 1) {
				value = filteredOptions[currentIndex + 1]
			}
		}
	}

	function handlePrevious() {
		if (!open) {
			open = true
		} else {
			const currentIndex = filteredOptions.findIndex((opt) => opt === value)
			if (currentIndex > 0) {
				value = filteredOptions[currentIndex - 1]
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
			if (open && searchable && searchInput) {
				setTimeout(() => searchInput?.focus(), 0)
			}
		}
	}

	function handleDismiss() {
		open = false
		searchText = ''
	}

	function handleSearchKeydown(event) {
		if (['ArrowDown', 'ArrowUp', 'Enter', 'Escape'].includes(event.key)) {
			return
		}
		event.stopPropagation()
	}

	let offsetTop = $derived(activeItem?.offsetTop + activeItem?.clientHeight ?? 0)
</script>

<input-select
	bind:this={selectElement}
	data-select
	data-searchable={searchable || undefined}
	data-direction={effectiveDirection}
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
		<Slider top={offsetTop} direction={effectiveDirection}>
			{#if searchable}
				<div data-select-search>
					<input
						bind:this={searchInput}
						data-search-input
						type="search"
						bind:value={searchText}
						placeholder={searchPlaceholder}
						aria-label={searchPlaceholder}
						onkeydown={handleSearchKeydown}
					/>
				</div>
			{/if}
			<List
				items={filteredOptions}
				{fields}
				bind:value
				onselect={handleListSelect}
				tabindex="-1"
				name={`${name}-listbox`}
			/>
		</Slider>
	{/if}
</input-select>
