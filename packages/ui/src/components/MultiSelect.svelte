<script lang="ts">
	import type {
		MultiSelectProps,
		SelectItem,
		SelectItemSnippet,
		SelectItemHandlers
	} from '../types/select.js'
	import { getSnippet } from '../types/select.js'
	import { ItemProxy } from '../types/item-proxy.js'
	import ItemContent from './ItemContent.svelte'

	let {
		options = [],
		fields: userFields,
		value = $bindable<SelectItem[]>([]),
		placeholder = 'Select...',
		size = 'md',
		align = 'left',
		direction = 'down',
		maxRows = 5,
		maxDisplay = 3,
		disabled = false,
		onchange,
		class: className = '',
		item: itemSnippet,
		groupLabel: groupLabelSnippet,
		selectedValues: selectedValuesSnippet,
		...snippets
	}: MultiSelectProps & { [key: string]: SelectItemSnippet | unknown } = $props()

	// Normalize alignment value
	const normalizedAlign = $derived(align === 'left' || align === 'start' ? 'left' : 'right')

	// Default row heights by size (used until we measure actual height)
	const defaultRowHeight = $derived(size === 'sm' ? 28 : size === 'lg' ? 40 : 34)

	// Measured row height (updated when dropdown opens)
	let measuredRowHeight = $state<number | null>(null)

	// Use measured height if available, otherwise fall back to default
	const maxHeight = $derived(maxRows * (measuredRowHeight ?? defaultRowHeight))

	/**
	 * Create an ItemProxy for the given item
	 */
	function createProxy(item: SelectItem): ItemProxy {
		return new ItemProxy(item, userFields)
	}

	// Dropdown state
	let isOpen = $state(false)
	let selectRef = $state<HTMLDivElement | null>(null)
	let focusedIndex = $state(-1)

	// Flatten all selectable items for keyboard navigation
	const flatItems = $derived.by(() => {
		const items: { proxy: ItemProxy; original: SelectItem }[] = []
		for (const option of options) {
			const proxy = createProxy(option)
			if (proxy.hasChildren) {
				for (const child of proxy.children) {
					const childProxy = proxy.createChildProxy(child)
					if (!childProxy.disabled) {
						items.push({ proxy: childProxy, original: child as SelectItem })
					}
				}
			} else if (!proxy.disabled) {
				items.push({ proxy, original: option })
			}
		}
		return items
	})

	// Find selected items based on current value (derived, no effects needed)
	// value now contains full item objects, so we match by reference or by itemValue
	const selectedItems = $derived.by(() => {
		if (!value || value.length === 0) return []
		return flatItems.filter((item) =>
			value.some((v) => v === item.original || createProxy(v).itemValue === item.proxy.itemValue)
		)
	})

	function toggleDropdown() {
		if (disabled) return
		isOpen = !isOpen
		if (isOpen) {
			focusedIndex = 0
		}
	}

	function openDropdown() {
		if (disabled || isOpen) return
		isOpen = true
		focusedIndex = 0
	}

	function closeDropdown() {
		isOpen = false
		focusedIndex = -1
	}

	function toggleItemSelection(item: { proxy: ItemProxy; original: SelectItem }) {
		if (item.proxy.disabled) return

		const currentValues = value ?? []
		const itemValue = item.proxy.itemValue

		// Check if already selected (by reference or by value)
		const isAlreadySelected = currentValues.some(
			(v) => v === item.original || createProxy(v).itemValue === itemValue
		)

		let newValues: SelectItem[]

		if (isAlreadySelected) {
			// Remove from selection
			newValues = currentValues.filter(
				(v) => v !== item.original && createProxy(v).itemValue !== itemValue
			)
		} else {
			// Add to selection (store the full item object)
			newValues = [...currentValues, item.original]
		}

		value = newValues
		onchange?.(newValues)
	}

	function removeItem(item: { proxy: ItemProxy; original: SelectItem }) {
		const itemValue = item.proxy.itemValue
		const newValues = (value ?? []).filter(
			(v) => v !== item.original && createProxy(v).itemValue !== itemValue
		)

		value = newValues
		onchange?.(newValues)
	}

	function focusItem(index: number) {
		if (index < 0 || index >= flatItems.length) return
		focusedIndex = index
		const dropdown = selectRef?.querySelector('[data-select-dropdown]')
		if (dropdown) {
			const items = dropdown.querySelectorAll('[data-select-option]:not([data-disabled])')
			const item = items[index] as HTMLElement | undefined
			if (item) {
				item.focus()
				item.scrollIntoView({ block: 'nearest' })
			}
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (!isOpen) return

		switch (event.key) {
			case 'Escape':
				event.preventDefault()
				closeDropdown()
				const trigger = selectRef?.querySelector('[data-select-trigger]') as HTMLElement | undefined
				trigger?.focus()
				break
			case 'ArrowDown':
				event.preventDefault()
				focusItem(focusedIndex < flatItems.length - 1 ? focusedIndex + 1 : 0)
				break
			case 'ArrowUp':
				event.preventDefault()
				focusItem(focusedIndex > 0 ? focusedIndex - 1 : flatItems.length - 1)
				break
			case 'Home':
				event.preventDefault()
				focusItem(0)
				break
			case 'End':
				event.preventDefault()
				focusItem(flatItems.length - 1)
				break
			case 'Enter':
			case ' ':
				event.preventDefault()
				if (focusedIndex >= 0 && focusedIndex < flatItems.length) {
					toggleItemSelection(flatItems[focusedIndex])
				}
				break
		}
	}

	function handleTriggerKeyDown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault()
			openDropdown()
		} else if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			toggleDropdown()
		}
	}

	function handleItemKeyDown(
		event: KeyboardEvent,
		item: { proxy: ItemProxy; original: SelectItem }
	) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			toggleItemSelection(item)
		}
	}

	function handleClickOutside(event: MouseEvent) {
		if (selectRef && !selectRef.contains(event.target as Node)) {
			closeDropdown()
		}
	}

	/**
	 * Create handlers object for custom snippets
	 */
	function createHandlers(item: { proxy: ItemProxy; original: SelectItem }): SelectItemHandlers {
		return {
			onclick: () => toggleItemSelection(item),
			onkeydown: (event: KeyboardEvent) => handleItemKeyDown(event, item)
		}
	}

	/**
	 * Resolve which snippet to use for an item
	 */
	function resolveItemSnippet(proxy: ItemProxy): SelectItemSnippet | null {
		const snippetName = proxy.snippetName
		if (snippetName) {
			const namedSnippet = getSnippet(snippets, snippetName)
			if (namedSnippet) {
				return namedSnippet as SelectItemSnippet
			}
		}
		return itemSnippet ?? null
	}

	/**
	 * Check if an item is currently selected
	 */
	function isSelected(proxy: ItemProxy): boolean {
		const itemValue = proxy.itemValue
		return (value ?? []).some((v) => v === proxy.original || createProxy(v).itemValue === itemValue)
	}

	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleClickOutside, true)
			document.addEventListener('keydown', handleKeyDown)

			// Measure actual row height after render
			requestAnimationFrame(() => {
				const dropdown = selectRef?.querySelector('[data-select-dropdown]')
				if (dropdown) {
					const firstOption = dropdown.querySelector('[data-select-option]')
					if (firstOption) {
						const height = firstOption.getBoundingClientRect().height
						if (height > 0) {
							measuredRowHeight = height
						}
					}
				}
				focusItem(0)
			})
		}
		return () => {
			document.removeEventListener('click', handleClickOutside, true)
			document.removeEventListener('keydown', handleKeyDown)
		}
	})

	function shouldShowDivider(optionIndex: number, isGroup: boolean): boolean {
		return isGroup && optionIndex > 0
	}
</script>

{#snippet defaultOption(proxy: ItemProxy, handlers: SelectItemHandlers, isItemSelected: boolean)}
	<button
		type="button"
		data-select-option
		data-disabled={proxy.disabled || undefined}
		data-selected={isItemSelected || undefined}
		role="option"
		aria-selected={isItemSelected}
		disabled={proxy.disabled}
		aria-label={proxy.label}
		onclick={handlers.onclick}
		onkeydown={handlers.onkeydown}
	>
		<span data-select-checkbox data-checked={isItemSelected || undefined}>
			{#if isItemSelected}
				<span class="i-lucide:check" aria-hidden="true"></span>
			{/if}
		</span>
		<ItemContent {proxy} />
	</button>
{/snippet}

{#snippet defaultGroupLabel(proxy: ItemProxy)}
	<div data-select-group-label role="presentation">
		{#if proxy.icon}
			<span data-select-group-icon class={proxy.icon} aria-hidden="true"></span>
		{/if}
		<span>{proxy.text}</span>
	</div>
{/snippet}

{#snippet renderOption(item: { proxy: ItemProxy; original: SelectItem })}
	{@const customSnippet = resolveItemSnippet(item.proxy)}
	{@const handlers = createHandlers(item)}
	{@const isItemSelected = isSelected(item.proxy)}
	{#if customSnippet}
		<div
			data-select-option
			data-select-option-custom
			data-disabled={item.proxy.disabled || undefined}
			data-selected={isItemSelected || undefined}
		>
			<svelte:boundary>
				{@render customSnippet(item.original, item.proxy.fields, handlers, isItemSelected)}
				{#snippet failed()}
					{@render defaultOption(item.proxy, handlers, isItemSelected)}
				{/snippet}
			</svelte:boundary>
		</div>
	{:else}
		{@render defaultOption(item.proxy, handlers, isItemSelected)}
	{/if}
{/snippet}

{#snippet renderGroupLabel(proxy: ItemProxy)}
	{#if groupLabelSnippet}
		<svelte:boundary>
			{@render groupLabelSnippet(proxy.original as SelectItem, proxy.fields)}
			{#snippet failed()}
				{@render defaultGroupLabel(proxy)}
			{/snippet}
		</svelte:boundary>
	{:else}
		{@render defaultGroupLabel(proxy)}
	{/if}
{/snippet}

<div
	bind:this={selectRef}
	data-select
	data-multiselect
	data-open={isOpen || undefined}
	data-size={size}
	data-disabled={disabled || undefined}
	data-align={normalizedAlign}
	data-direction={direction}
	class={className || undefined}
>
	<button
		type="button"
		data-select-trigger
		{disabled}
		aria-haspopup="listbox"
		aria-expanded={isOpen}
		onclick={toggleDropdown}
		onkeydown={handleTriggerKeyDown}
	>
		<span data-select-value>
			{#if selectedValuesSnippet && selectedItems.length > 0}
				{@render selectedValuesSnippet(
					selectedItems.map((item) => item.original),
					selectedItems[0]?.proxy.fields ?? {}
				)}
			{:else if selectedItems.length > 0}
				{#if selectedItems.length <= maxDisplay}
					<span data-select-tags>
						{#each selectedItems as item (item.proxy.itemValue)}
							<span data-select-tag>
								<span data-select-tag-text>{item.proxy.text}</span>
								<span
									role="button"
									tabindex="0"
									data-select-tag-remove
									aria-label="Remove {item.proxy.text}"
									onclick={(e) => {
										e.stopPropagation()
										removeItem(item)
									}}
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault()
											e.stopPropagation()
											removeItem(item)
										}
									}}
								>
									<span class="i-lucide:x" aria-hidden="true"></span>
								</span>
							</span>
						{/each}
					</span>
				{:else}
					<span data-select-count>{selectedItems.length} selected</span>
				{/if}
			{:else}
				<span data-select-placeholder>{placeholder}</span>
			{/if}
		</span>
		<span data-select-arrow class="i-lucide:chevron-down" aria-hidden="true"></span>
	</button>

	{#if isOpen}
		<div
			data-select-dropdown
			role="listbox"
			aria-multiselectable="true"
			aria-orientation="vertical"
			style="max-height: {maxHeight}px"
		>
			{#each options as option, optionIndex (optionIndex)}
				{@const proxy = createProxy(option)}

				{#if proxy.hasChildren}
					{#if shouldShowDivider(optionIndex, true)}
						<div data-select-divider role="separator"></div>
					{/if}

					<div data-select-group>
						{@render renderGroupLabel(proxy)}

						{#each proxy.children as child, childIndex (childIndex)}
							{@const childProxy = proxy.createChildProxy(child)}
							{@render renderOption({ proxy: childProxy, original: child as SelectItem })}
						{/each}
					</div>
				{:else}
					{@render renderOption({ proxy, original: option })}
				{/if}
			{/each}
		</div>
	{/if}
</div>
