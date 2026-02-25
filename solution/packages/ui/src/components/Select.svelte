<script lang="ts">
	import type {
		SelectProps,
		SelectItem,
		SelectItemSnippet,
		SelectItemHandlers,
		SelectStateIcons
	} from '../types/select.js'
	import { getSnippet, defaultSelectStateIcons } from '../types/select.js'
	import { ItemProxy } from '../types/item-proxy.js'
	import ItemContent from './ItemContent.svelte'
	import { ListController } from '@rokkit/states'
	import { navigator } from '@rokkit/actions'

	let {
		options = [],
		fields: userFields,
		value = $bindable(),
		selected = $bindable<SelectItem | null>(null),
		placeholder = 'Select...',
		size = 'md',
		align = 'left',
		direction = 'down',
		maxRows = 5,
		disabled = false,
		filterable = false,
		filterPlaceholder = 'Search...',
		onchange,
		class: className = '',
		icons: userIcons,
		item: itemSnippet,
		groupLabel: groupLabelSnippet,
		selectedValue: selectedValueSnippet,
		...snippets
	}: SelectProps & { [key: string]: SelectItemSnippet | unknown } = $props()

	// Merge icons with defaults
	const icons = $derived<SelectStateIcons>({ ...defaultSelectStateIcons, ...userIcons })

	// Normalize alignment value
	const normalizedAlign = $derived(align === 'left' || align === 'start' ? 'left' : 'right')

	// Default row heights by size (used until we measure actual height)
	const defaultRowHeight = $derived(size === 'sm' ? 28 : size === 'lg' ? 40 : 34)

	// Measured row height (updated when dropdown opens)
	let measuredRowHeight = $state<number | null>(null)

	// Use measured height if available, otherwise fall back to default
	const maxHeight = $derived(maxRows * (measuredRowHeight ?? defaultRowHeight))

	// ─── Filter state (for filterable mode) ───────────────────────
	let filterQuery = $state('')
	let filterInputRef = $state<HTMLInputElement | null>(null)

	/**
	 * Create an ItemProxy for the given item
	 */
	function createProxy(item: SelectItem): ItemProxy {
		return new ItemProxy(item, userFields)
	}

	// ─── Filter options (for filterable mode) ────────────────────

	/** Filtered options — hides non-matching items and empty groups */
	const filteredOptions = $derived.by(() => {
		if (!filterable || !filterQuery) return options
		const query = filterQuery.toLowerCase()
		return options
			.map((option) => {
				const proxy = createProxy(option)
				if (proxy.hasChildren) {
					const childrenField = proxy.fields.children
					const matching = proxy.children.filter((child) => {
						const cp = proxy.createChildProxy(child)
						return cp.text.toLowerCase().includes(query)
					})
					if (matching.length === 0) return null
					return { ...option as Record<string, unknown>, [childrenField]: matching }
				}
				return proxy.text.toLowerCase().includes(query) ? option : null
			})
			.filter((x): x is SelectItem => x !== null)
	})

	// ─── Flatten options into navigable items for the controller ────

	/** Flat array of raw selectable items (for controller) */
	const flatItems = $derived.by(() => {
		const items: SelectItem[] = []
		for (const option of filteredOptions) {
			const proxy = createProxy(option)
			if (proxy.hasChildren) {
				for (const child of proxy.children) {
					items.push(child as SelectItem)
				}
			} else {
				items.push(option)
			}
		}
		return items
	})

	/** Map from raw item → flat index key (for data-path). Uses Map to support primitives. */
	const itemPathMap = $derived.by(() => {
		const map = new Map<unknown, string>()
		flatItems.forEach((item, index) => {
			map.set(item, String(index))
		})
		return map
	})

	// ─── Controller + Navigator ────────────────────────────────────

	let isOpen = $state(false)
	let selectRef = $state<HTMLDivElement | null>(null)
	let dropdownRef = $state<HTMLDivElement | null>(null)

	 
	let controller = new ListController(flatItems, value, userFields)
	let lastSyncedValue: unknown = value

	$effect(() => {
		controller.update(flatItems)
	})

	// Sync controller focus when value prop changes externally
	$effect(() => {
		if (value !== lastSyncedValue) {
			lastSyncedValue = value
			controller.moveToValue(value)
		}
	})

	// Find the selected item for display in trigger (searches all options, not filtered)
	const selectedItem = $derived.by(() => {
		if (value === undefined) return null
		for (const option of options) {
			const proxy = createProxy(option)
			if (proxy.hasChildren) {
				for (const child of proxy.children) {
					const cp = proxy.createChildProxy(child)
					if (cp.itemValue === value) {
						return { proxy: cp, original: child as SelectItem }
					}
				}
			} else if (proxy.itemValue === value) {
				return { proxy, original: option }
			}
		}
		return null
	})

	// Sync selected prop with value
	$effect(() => {
		selected = selectedItem?.original ?? null
	})

	// Sync value when selected changes externally
	$effect(() => {
		if (selected !== null && selected !== selectedItem?.original) {
			const proxy = createProxy(selected)
			value = proxy.itemValue
		}
	})

	// Focus the element matching controller.focusedKey on navigator action events
	$effect(() => {
		if (!dropdownRef) return
		const el = dropdownRef

		function onAction(event: Event) {
			const detail = (event as CustomEvent).detail

			if (detail.name === 'move') {
				const key = controller.focusedKey
				if (key) {
					const target = el.querySelector(`[data-path="${key}"]`) as HTMLElement | null
					if (target && target !== document.activeElement) {
						target.focus()
						target.scrollIntoView?.({ block: 'nearest' })
					}
				}
			}

			if (detail.name === 'select') {
				handleSelectAction()
			}
		}

		el.addEventListener('action', onAction)
		return () => el.removeEventListener('action', onAction)
	})

	/**
	 * Handle the navigator's select action (Enter/Space or click on data-path item)
	 */
	function handleSelectAction() {
		const key = controller.focusedKey
		if (!key) return

		const proxy = controller.lookup.get(key)
		if (!proxy) return

		const itemProxy = createProxy(proxy.value)
		if (!itemProxy.disabled) {
			const itemValue = itemProxy.itemValue
			value = itemValue
			lastSyncedValue = itemValue
			selected = proxy.value as SelectItem
			onchange?.(itemValue, proxy.value as SelectItem)
		}
		closeDropdown()
		// Return focus to trigger
		const trigger = selectRef?.querySelector('[data-select-trigger]') as HTMLElement | undefined
		trigger?.focus()
	}

	/**
	 * Sync DOM focus to controller state
	 */
	function handleFocusIn(event: FocusEvent) {
		const target = event.target as HTMLElement
		if (!target) return
		const path = target.dataset.path
		if (path !== undefined) {
			controller.moveTo(path)
		}
	}

	// ─── Dropdown open/close ───────────────────────────────────────

	function toggleDropdown() {
		if (disabled) return
		if (isOpen) {
			closeDropdown()
		} else {
			openDropdown()
		}
	}

	function openDropdown() {
		if (disabled || isOpen) return
		isOpen = true
		// Focus selected item or first item
		if (value !== undefined) {
			controller.moveToValue(value)
		} else {
			controller.moveFirst()
		}
		requestAnimationFrame(() => {
			measureRowHeight()
			if (filterable) {
				filterInputRef?.focus()
			} else {
				focusCurrentItem()
			}
		})
	}

	function closeDropdown() {
		isOpen = false
		filterQuery = ''
	}

	function focusCurrentItem() {
		if (!dropdownRef || !controller.focusedKey) return
		const target = dropdownRef.querySelector(
			`[data-path="${controller.focusedKey}"]`
		) as HTMLElement | null
		if (target) {
			target.focus()
			target.scrollIntoView?.({ block: 'nearest' })
		}
	}

	function measureRowHeight() {
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
	}

	// ─── Trigger keyboard handling ─────────────────────────────────

	function handleTriggerKeyDown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault()
			openDropdown()
		} else if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			toggleDropdown()
		}
	}

	// ─── Filter keyboard handling ─────────────────────────────────

	function handleFilterKeyDown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			controller.moveFirst()
			focusCurrentItem()
		} else if (event.key === 'Escape') {
			event.preventDefault()
			if (filterQuery) {
				filterQuery = ''
				event.stopPropagation()
			} else {
				closeDropdown()
				const trigger = selectRef?.querySelector('[data-select-trigger]') as HTMLElement | undefined
				trigger?.focus()
			}
		} else if (event.key === 'Enter') {
			event.preventDefault()
			if (controller.focusedKey) {
				handleSelectAction()
			}
		}
	}

	// ─── Escape + click-outside ────────────────────────────────────

	function handleEscapeKey(event: KeyboardEvent) {
		if (!isOpen) return
		if (event.key === 'Escape') {
			event.preventDefault()
			closeDropdown()
			const trigger = selectRef?.querySelector('[data-select-trigger]') as HTMLElement | undefined
			trigger?.focus()
		}
	}

	function handleClickOutside(event: MouseEvent) {
		if (selectRef && !selectRef.contains(event.target as Node)) {
			closeDropdown()
		}
	}

	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleClickOutside, true)
			document.addEventListener('keydown', handleEscapeKey)
		}
		return () => {
			document.removeEventListener('click', handleClickOutside, true)
			document.removeEventListener('keydown', handleEscapeKey)
		}
	})

	// ─── Snippet + rendering helpers ───────────────────────────────

	/**
	 * Handle direct Enter/Space on a select option.
	 * Stops propagation to prevent navigator from double-handling.
	 */
	function handleItemSelect(item: SelectItem) {
		const proxy = createProxy(item)
		if (proxy.disabled) return
		const itemValue = proxy.itemValue
		value = itemValue
		lastSyncedValue = itemValue
		selected = item
		onchange?.(itemValue, item)
		closeDropdown()
		const trigger = selectRef?.querySelector('[data-select-trigger]') as HTMLElement | undefined
		trigger?.focus()
	}

	/**
	 * Create handlers object for custom snippets
	 */
	function createHandlers(item: SelectItem): SelectItemHandlers {
		return {
			onclick: () => handleItemSelect(item),
			onkeydown: (event: KeyboardEvent) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault()
					event.stopPropagation()
					handleItemSelect(item)
				}
			}
		}
	}

	/** No-op handlers for rendering item snippet in the trigger (selected value display) */
	const noopHandlers: SelectItemHandlers = {
		onclick: () => {},
		onkeydown: () => {}
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
		return proxy.itemValue === value
	}

	function shouldShowDivider(optionIndex: number, isGroup: boolean): boolean {
		return isGroup && optionIndex > 0
	}

	/**
	 * Get the data-path key for a raw item
	 */
	function getPathKey(item: SelectItem): string | undefined {
		return itemPathMap.get(item)
	}
</script>

{#snippet defaultOption(proxy: ItemProxy, handlers: SelectItemHandlers, isItemSelected: boolean, pathKey: string | undefined)}
	<button
		type="button"
		data-select-option
		data-path={pathKey}
		data-disabled={proxy.disabled || undefined}
		data-selected={isItemSelected || undefined}
		role="option"
		aria-selected={isItemSelected}
		disabled={proxy.disabled}
		aria-label={proxy.label}
		onkeydown={handlers.onkeydown}
	>
		<ItemContent {proxy} />
		{#if isItemSelected}
			<span data-select-check class={icons.checked} aria-hidden="true"></span>
		{/if}
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

{#snippet renderOption(item: SelectItem, proxy: ItemProxy, pathKey: string | undefined)}
	{@const customSnippet = resolveItemSnippet(proxy)}
	{@const handlers = createHandlers(item)}
	{@const isItemSelected = isSelected(proxy)}
	{#if customSnippet}
		<div
			data-select-option
			data-select-option-custom
			data-path={pathKey}
			data-disabled={proxy.disabled || undefined}
			data-selected={isItemSelected || undefined}
		>
			<svelte:boundary>
				{@render customSnippet(item, proxy.fields, handlers, isItemSelected)}
				{#snippet failed()}
					{@render defaultOption(proxy, handlers, isItemSelected, pathKey)}
				{/snippet}
			</svelte:boundary>
		</div>
	{:else}
		{@render defaultOption(proxy, handlers, isItemSelected, pathKey)}
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
			{#if selectedValueSnippet && selectedItem}
				{@render selectedValueSnippet(selectedItem.original, selectedItem.proxy.fields)}
			{:else if selectedItem && itemSnippet}
				<span data-select-value-custom>
					{@render itemSnippet(selectedItem.original, selectedItem.proxy.fields, noopHandlers, true)}
				</span>
			{:else if selectedItem}
				{#if selectedItem.proxy.icon}
					<span data-select-value-icon class={selectedItem.proxy.icon} aria-hidden="true"></span>
				{/if}
				<span data-select-value-text>{selectedItem.proxy.text}</span>
			{:else}
				<span data-select-placeholder>{placeholder}</span>
			{/if}
		</span>
		<span data-select-arrow class={icons.opened} aria-hidden="true"></span>
	</button>

	{#if isOpen}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			bind:this={dropdownRef}
			data-select-dropdown
			role="listbox"
			aria-orientation="vertical"
			style="max-height: {maxHeight}px"
			onfocusin={handleFocusIn}
			use:navigator={{ wrapper: controller, orientation: 'vertical' }}
		>
			{#if filterable}
				<div data-select-filter>
					<!-- svelte-ignore a11y_autofocus -->
					<input
						bind:this={filterInputRef}
						type="text"
						data-select-filter-input
						placeholder={filterPlaceholder}
						bind:value={filterQuery}
						onkeydown={handleFilterKeyDown}
					/>
				</div>
			{/if}
			{#each filteredOptions as option, optionIndex (optionIndex)}
				{@const proxy = createProxy(option)}

				{#if proxy.hasChildren}
					{#if shouldShowDivider(optionIndex, true)}
						<div data-select-divider role="separator"></div>
					{/if}

					<div data-select-group>
						{@render renderGroupLabel(proxy)}

						{#each proxy.children as child, childIndex (childIndex)}
							{@const childProxy = proxy.createChildProxy(child)}
							{@const pathKey = getPathKey(child as SelectItem)}
							{@render renderOption(child as SelectItem, childProxy, pathKey)}
						{/each}
					</div>
				{:else}
					{@const pathKey = getPathKey(option)}
					{@render renderOption(option, proxy, pathKey)}
				{/if}
			{/each}
			{#if filterable && filterQuery && filteredOptions.length === 0}
				<div data-select-empty>No results</div>
			{/if}
		</div>
	{/if}
</div>
