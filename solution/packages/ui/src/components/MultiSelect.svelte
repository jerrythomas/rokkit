<script lang="ts">
	import type {
		MultiSelectProps,
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
		icons: userIcons,
		item: itemSnippet,
		groupLabel: groupLabelSnippet,
		selectedValues: selectedValuesSnippet,
		...snippets
	}: MultiSelectProps & { [key: string]: SelectItemSnippet | unknown } = $props()

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

	/**
	 * Create an ItemProxy for the given item
	 */
	function createProxy(item: SelectItem): ItemProxy {
		return new ItemProxy(item, userFields)
	}

	// ─── Flatten options into navigable items for the controller ────

	/** Flat array of raw selectable items (for controller) */
	const flatItems = $derived.by(() => {
		const items: SelectItem[] = []
		for (const option of options) {
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

	 
	let controller = new ListController(flatItems, undefined, userFields)

	$effect(() => {
		controller.update(flatItems)
	})

	// Find selected items based on current value
	const selectedItems = $derived.by(() => {
		if (!value || value.length === 0) return [] as { proxy: ItemProxy; original: SelectItem }[]
		return flatItems
			.filter((item) => {
				const proxy = createProxy(item)
				return value.some(
					(v) => v === item || createProxy(v).itemValue === proxy.itemValue
				)
			})
			.map((item) => ({ proxy: createProxy(item), original: item }))
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
	 * Handle the navigator's select action — toggle selection (don't close)
	 */
	function handleSelectAction() {
		const key = controller.focusedKey
		if (!key) return

		const proxy = controller.lookup.get(key)
		if (!proxy) return

		const item = proxy.value as SelectItem
		toggleItemSelection(item)
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

	// ─── Selection logic ───────────────────────────────────────────

	function toggleItemSelection(item: SelectItem) {
		const proxy = createProxy(item)
		if (proxy.disabled) return

		const currentValues = value ?? []
		const itemValue = proxy.itemValue

		const isAlreadySelected = currentValues.some(
			(v) => v === item || createProxy(v).itemValue === itemValue
		)

		let newValues: SelectItem[]

		if (isAlreadySelected) {
			newValues = currentValues.filter(
				(v) => v !== item && createProxy(v).itemValue !== itemValue
			)
		} else {
			newValues = [...currentValues, item]
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
		controller.moveFirst()
		requestAnimationFrame(() => {
			measureRowHeight()
			focusCurrentItem()
		})
	}

	function closeDropdown() {
		isOpen = false
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
	 * Handle direct Enter/Space on an option.
	 * Stops propagation to prevent navigator from double-handling.
	 */
	function handleItemToggle(item: SelectItem) {
		toggleItemSelection(item)
	}

	/**
	 * Create handlers object for custom snippets
	 */
	function createHandlers(item: SelectItem): SelectItemHandlers {
		return {
			onclick: () => handleItemToggle(item),
			onkeydown: (event: KeyboardEvent) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault()
					event.stopPropagation()
					handleItemToggle(item)
				}
			}
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
		<span data-select-checkbox data-checked={isItemSelected || undefined}>
			{#if isItemSelected}
				<span class={icons.checked} aria-hidden="true"></span>
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
									<span class={icons.remove} aria-hidden="true"></span>
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
		<span data-select-arrow class={icons.opened} aria-hidden="true"></span>
	</button>

	{#if isOpen}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			bind:this={dropdownRef}
			data-select-dropdown
			role="listbox"
			aria-multiselectable="true"
			aria-orientation="vertical"
			style="max-height: {maxHeight}px"
			onfocusin={handleFocusIn}
			use:navigator={{ wrapper: controller, orientation: 'vertical' }}
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
							{@const pathKey = getPathKey(child as SelectItem)}
							{@render renderOption(child as SelectItem, childProxy, pathKey)}
						{/each}
					</div>
				{:else}
					{@const pathKey = getPathKey(option)}
					{@render renderOption(option, proxy, pathKey)}
				{/if}
			{/each}
		</div>
	{/if}
</div>
