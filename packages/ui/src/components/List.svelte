<script lang="ts">
	import type { ListProps, ListItem, ListItemSnippet, ListItemHandlers } from '../types/list.js'
	import { getSnippet } from '../types/list.js'
	import { ItemProxy } from '../types/item-proxy.js'
	import ItemContent from './ItemContent.svelte'

	let {
		items = [],
		fields: userFields,
		value,
		size = 'md',
		disabled = false,
		collapsible = false,
		expanded = $bindable({}),
		active,
		onselect,
		onexpandedchange,
		class: className = '',
		item: itemSnippet,
		groupLabel: groupLabelSnippet,
		...snippets
	}: ListProps & { [key: string]: ListItemSnippet | unknown } = $props()

	/**
	 * Create an ItemProxy for the given item
	 */
	function createProxy(item: ListItem): ItemProxy {
		return new ItemProxy(item, userFields)
	}

	// Internal expanded state management
	let internalExpanded = $state<Record<string, boolean>>({})

	// Use external expanded if provided, else internal
	const effectiveExpanded = $derived(Object.keys(expanded).length > 0 ? expanded : internalExpanded)

	/**
	 * Get the key for a group (for expanded state tracking)
	 */
	function getGroupKey(proxy: ItemProxy): string {
		const val = proxy.itemValue
		return typeof val === 'string' ? val : proxy.text
	}

	/**
	 * Check if a group is expanded
	 */
	function isGroupExpanded(proxy: ItemProxy): boolean {
		if (!collapsible) return true
		const key = getGroupKey(proxy)
		return effectiveExpanded[key] !== false // Default to expanded
	}

	/**
	 * Toggle group expansion
	 */
	function toggleGroup(proxy: ItemProxy) {
		if (!collapsible) return
		const key = getGroupKey(proxy)
		const newState = !isGroupExpanded(proxy)

		if (Object.keys(expanded).length > 0) {
			// Using external state
			expanded = { ...expanded, [key]: newState }
			onexpandedchange?.(expanded)
		} else {
			// Using internal state
			internalExpanded = { ...internalExpanded, [key]: newState }
		}
	}

	/**
	 * Toggle group expansion by item index
	 */
	function toggleGroupByIndex(index: string, expand: boolean) {
		const itemIndex = parseInt(index, 10)
		if (isNaN(itemIndex) || itemIndex < 0 || itemIndex >= items.length) return

		const proxy = createProxy(items[itemIndex])
		const key = getGroupKey(proxy)

		if (Object.keys(expanded).length > 0) {
			expanded = { ...expanded, [key]: expand }
			onexpandedchange?.(expanded)
		} else {
			internalExpanded = { ...internalExpanded, [key]: expand }
		}
	}

	/**
	 * Check if an index represents a group (has children)
	 */
	function isGroupIndex(index: string): boolean {
		if (index.includes('-')) return false
		const itemIndex = parseInt(index, 10)
		if (isNaN(itemIndex) || itemIndex < 0 || itemIndex >= items.length) return false
		const proxy = createProxy(items[itemIndex])
		return proxy.hasChildren
	}

	/**
	 * Check if a group at index is currently expanded
	 */
	function isGroupAtIndexExpanded(index: string): boolean {
		const itemIndex = parseInt(index, 10)
		if (isNaN(itemIndex) || itemIndex < 0 || itemIndex >= items.length) return false
		const proxy = createProxy(items[itemIndex])
		return isGroupExpanded(proxy)
	}

	/**
	 * Get the parent index from a child index (e.g., "2-1" -> "2")
	 */
	function getParentIndex(index: string): string | null {
		const dashPos = index.indexOf('-')
		if (dashPos === -1) return null
		return index.substring(0, dashPos)
	}

	/**
	 * Derive visible indices in order for keyboard navigation
	 * Format: "0", "1", "2", "2-0", "2-1", "3", "3-0", etc.
	 */
	const visibleIndices = $derived.by(() => {
		const result: string[] = []
		for (let i = 0; i < items.length; i++) {
			const proxy = createProxy(items[i])
			const index = String(i)

			if (proxy.hasChildren) {
				// Add group label
				result.push(index)
				// Add children only if expanded
				if (isGroupExpanded(proxy)) {
					for (let j = 0; j < proxy.children.length; j++) {
						const childProxy = proxy.createChildProxy(proxy.children[j])
						if (!childProxy.disabled) {
							result.push(`${i}-${j}`)
						}
					}
				}
			} else if (!proxy.disabled) {
				result.push(index)
			}
		}
		return result
	})

	let listRef = $state<HTMLElement | null>(null)
	let focusedListIndex = $state<string | null>(null)

	/**
	 * Check if an item is currently active
	 */
	function checkIsActive(proxy: ItemProxy): boolean {
		// Match against active prop by item value
		if (active !== undefined) {
			return proxy.itemValue === active
		}

		// Fallback: match against value prop (for button selection)
		return value !== undefined && proxy.itemValue === value
	}

	/**
	 * Handle item click (for button items)
	 */
	function handleItemClick(proxy: ItemProxy) {
		if (proxy.disabled || disabled) return
		onselect?.(proxy.itemValue, proxy.original as ListItem)
	}

	/**
	 * Focus an element by its list index and scroll into view if needed
	 */
	function focusListIndex(index: string) {
		if (!listRef) return
		focusedListIndex = index
		const element = listRef.querySelector(`[data-list-index="${index}"]`) as HTMLElement | null
		if (element) {
			element.focus()
			// Scroll into view with minimal movement
			element.scrollIntoView({ block: 'nearest', inline: 'nearest' })
		}
	}

	/**
	 * Navigate to next/previous visible index
	 */
	function navigateRelative(direction: 'next' | 'prev') {
		if (visibleIndices.length === 0) return

		const currentPos = focusedListIndex ? visibleIndices.indexOf(focusedListIndex) : -1
		let newPos: number

		if (direction === 'next') {
			newPos = currentPos < visibleIndices.length - 1 ? currentPos + 1 : 0
		} else {
			newPos = currentPos > 0 ? currentPos - 1 : visibleIndices.length - 1
		}

		focusListIndex(visibleIndices[newPos])
	}

	/**
	 * Handle focus events to track focused index
	 */
	function handleFocusIn(event: FocusEvent) {
		const target = event.target as HTMLElement
		if (!target) return

		const listIndex = target.dataset.listIndex
		if (listIndex !== undefined) {
			focusedListIndex = listIndex
		}
	}

	/**
	 * Handle keyboard navigation
	 */
	function handleKeyDown(event: KeyboardEvent) {
		const target = event.target as HTMLElement
		const currentIndex = focusedListIndex

		if (!currentIndex) {
			// If nothing focused, focus first item on any navigation key
			if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
				event.preventDefault()
				if (visibleIndices.length > 0) {
					focusListIndex(visibleIndices[0])
				}
			}
			return
		}

		const isGroup = isGroupIndex(currentIndex)
		const parentIndex = getParentIndex(currentIndex)

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault()
				navigateRelative('next')
				break
			case 'ArrowUp':
				event.preventDefault()
				navigateRelative('prev')
				break
			case 'Home':
				event.preventDefault()
				if (visibleIndices.length > 0) {
					focusListIndex(visibleIndices[0])
				}
				break
			case 'End':
				event.preventDefault()
				if (visibleIndices.length > 0) {
					focusListIndex(visibleIndices[visibleIndices.length - 1])
				}
				break
			case 'ArrowRight':
				if (collapsible && isGroup) {
					event.preventDefault()
					if (!isGroupAtIndexExpanded(currentIndex)) {
						// Expand the group
						toggleGroupByIndex(currentIndex, true)
					} else {
						// Already expanded - move to first child
						const firstChildIndex = `${currentIndex}-0`
						if (visibleIndices.includes(firstChildIndex)) {
							focusListIndex(firstChildIndex)
						}
					}
				}
				break
			case 'ArrowLeft':
				if (collapsible) {
					event.preventDefault()
					if (isGroup) {
						// On group - collapse it
						if (isGroupAtIndexExpanded(currentIndex)) {
							toggleGroupByIndex(currentIndex, false)
						}
					} else if (parentIndex) {
						// On child item - move to parent group
						focusListIndex(parentIndex)
					}
				}
				break
			case 'Enter':
			case ' ':
				if (isGroup) {
					// Toggle group expansion
					event.preventDefault()
					const itemIndex = parseInt(currentIndex, 10)
					const proxy = createProxy(items[itemIndex])
					toggleGroup(proxy)
				} else {
					// Handle item activation
					const isOnItem = target.hasAttribute('data-list-item')
					if (isOnItem) {
						// Parse index to get proxy
						if (parentIndex) {
							// Child item
							const groupIdx = parseInt(parentIndex, 10)
							const childIdx = parseInt(currentIndex.split('-')[1], 10)
							const groupProxy = createProxy(items[groupIdx])
							const childProxy = groupProxy.createChildProxy(groupProxy.children[childIdx])
							const href = childProxy.get<string>('href')
							if (!href) {
								event.preventDefault()
								handleItemClick(childProxy)
							}
						} else {
							// Standalone item
							const itemIdx = parseInt(currentIndex, 10)
							const proxy = createProxy(items[itemIdx])
							const href = proxy.get<string>('href')
							if (!href) {
								event.preventDefault()
								handleItemClick(proxy)
							}
						}
					}
				}
				break
		}
	}

	/**
	 * Handle item-specific keyboard events
	 */
	function handleItemKeyDown(event: KeyboardEvent, proxy: ItemProxy) {
		if (event.key === 'Enter' || event.key === ' ') {
			const href = proxy.get<string>('href')
			if (!href) {
				event.preventDefault()
				handleItemClick(proxy)
			}
		}
	}

	/**
	 * Create handlers object for custom snippets
	 */
	function createHandlers(proxy: ItemProxy): ListItemHandlers {
		return {
			onclick: () => handleItemClick(proxy),
			onkeydown: (event: KeyboardEvent) => handleItemKeyDown(event, proxy)
		}
	}

	/**
	 * Resolve which snippet to use for an item
	 */
	function resolveItemSnippet(proxy: ItemProxy): ListItemSnippet | null {
		const snippetName = proxy.snippetName
		if (snippetName) {
			const namedSnippet = getSnippet(snippets, snippetName)
			if (namedSnippet) {
				return namedSnippet as ListItemSnippet
			}
		}
		return itemSnippet ?? null
	}

	// Track option index for divider logic
	function shouldShowDivider(index: number, isGroup: boolean): boolean {
		return isGroup && index > 0
	}
</script>

{#snippet defaultItem(
	proxy: ItemProxy,
	handlers: ListItemHandlers,
	active: boolean,
	listIndex: string
)}
	{@const href = proxy.get<string>('href')}
	{#if href}
		<a
			{href}
			data-list-item
			data-list-index={listIndex}
			data-active={active || undefined}
			data-disabled={proxy.disabled || undefined}
			aria-label={proxy.label}
			aria-current={active ? 'page' : undefined}
			onkeydown={handlers.onkeydown}
		>
			<ItemContent {proxy} />
		</a>
	{:else}
		<button
			type="button"
			data-list-item
			data-list-index={listIndex}
			data-active={active || undefined}
			data-disabled={proxy.disabled || undefined}
			disabled={proxy.disabled || disabled}
			aria-label={proxy.label}
			aria-pressed={active}
			onclick={handlers.onclick}
			onkeydown={handlers.onkeydown}
		>
			<ItemContent {proxy} />
		</button>
	{/if}
{/snippet}

{#snippet defaultGroupLabel(
	proxy: ItemProxy,
	toggle: () => void,
	isExpanded: boolean,
	listIndex: string
)}
	<button
		type="button"
		data-list-group-label
		data-list-index={listIndex}
		data-list-group-key={getGroupKey(proxy)}
		aria-expanded={isExpanded}
		onclick={collapsible ? toggle : undefined}
		disabled={!collapsible}
	>
		{#if proxy.icon}
			<span data-list-group-icon class={proxy.icon} aria-hidden="true"></span>
		{/if}
		<span data-list-group-text>{proxy.text}</span>
		{#if collapsible}
			<span data-list-group-arrow class="i-solar:alt-arrow-down-linear" aria-hidden="true"></span>
		{/if}
	</button>
{/snippet}

{#snippet renderItem(proxy: ItemProxy, listIndex: string)}
	{@const customSnippet = resolveItemSnippet(proxy)}
	{@const handlers = createHandlers(proxy)}
	{@const active = checkIsActive(proxy)}
	{#if customSnippet}
		<div
			data-list-item
			data-list-item-custom
			data-list-index={listIndex}
			data-active={active || undefined}
			data-disabled={proxy.disabled || undefined}
		>
			<svelte:boundary>
				{@render customSnippet(proxy.original as ListItem, proxy.fields, handlers, active)}
				{#snippet failed()}
					{@render defaultItem(proxy, handlers, active, listIndex)}
				{/snippet}
			</svelte:boundary>
		</div>
	{:else}
		{@render defaultItem(proxy, handlers, active, listIndex)}
	{/if}
{/snippet}

{#snippet renderGroupLabel(proxy: ItemProxy, listIndex: string)}
	{@const toggle = () => toggleGroup(proxy)}
	{@const isExpanded = isGroupExpanded(proxy)}
	{#if groupLabelSnippet}
		<svelte:boundary>
			{@render groupLabelSnippet(proxy.original as ListItem, proxy.fields, toggle, isExpanded)}
			{#snippet failed()}
				{@render defaultGroupLabel(proxy, toggle, isExpanded, listIndex)}
			{/snippet}
		</svelte:boundary>
	{:else}
		{@render defaultGroupLabel(proxy, toggle, isExpanded, listIndex)}
	{/if}
{/snippet}

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<nav
	bind:this={listRef}
	data-list
	data-size={size}
	data-disabled={disabled || undefined}
	data-collapsible={collapsible || undefined}
	class={className || undefined}
	aria-label="List"
	onkeydown={handleKeyDown}
	onfocusin={handleFocusIn}
>
	{#each items as item, itemIndex (itemIndex)}
		{@const proxy = createProxy(item)}
		{@const listIndex = String(itemIndex)}

		{#if proxy.hasChildren}
			<!-- Group with children -->
			{#if shouldShowDivider(itemIndex, true)}
				<div data-list-divider role="separator"></div>
			{/if}

			<div data-list-group data-list-group-collapsed={!isGroupExpanded(proxy) || undefined}>
				{@render renderGroupLabel(proxy, listIndex)}

				{#if isGroupExpanded(proxy)}
					<div data-list-group-items>
						{#each proxy.children as child, childIndex (childIndex)}
							{@const childProxy = proxy.createChildProxy(child)}
							{@const childListIndex = `${itemIndex}-${childIndex}`}
							{@render renderItem(childProxy, childListIndex)}
						{/each}
					</div>
				{/if}
			</div>
		{:else}
			<!-- Standalone item (no children) -->
			{@render renderItem(proxy, listIndex)}
		{/if}
	{/each}
</nav>
