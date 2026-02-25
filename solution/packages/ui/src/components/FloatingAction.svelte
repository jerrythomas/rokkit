<script lang="ts">
	import type {
		FloatingActionProps,
		FloatingActionItem,
		FloatingActionItemSnippet,
		FloatingActionItemHandlers
	} from '../types/floating-action.js'
	import { getSnippet } from '../types/floating-action.js'
	import { ItemProxy } from '../types/item-proxy.js'

	let {
		items = [],
		fields: userFields,
		icon = 'i-lucide:plus',
		closeIcon = 'i-lucide:x',
		label = 'Actions',
		size = 'md',
		position = 'bottom-right',
		expand = 'vertical',
		itemAlign = 'center',
		disabled = false,
		open = $bindable(false),
		backdrop = true,
		contained = false,
		onselect,
		onopen,
		onclose,
		class: className = '',
		item: itemSnippet,
		...snippets
	}: FloatingActionProps & { [key: string]: FloatingActionItemSnippet | unknown } = $props()

	/**
	 * Create an ItemProxy for the given item
	 */
	function createProxy(item: FloatingActionItem): ItemProxy {
		return new ItemProxy(item, userFields)
	}

	let fabRef = $state<HTMLDivElement | null>(null)
	let focusedIndex = $state(-1)

	// Flatten items for keyboard navigation (excluding disabled)
	const flatItems = $derived.by(() => {
		return items
			.map((item) => ({ proxy: createProxy(item), original: item }))
			.filter((item) => !item.proxy.disabled)
	})

	/**
	 * Toggle the FAB open/closed
	 */
	function toggle() {
		if (disabled) return
		if (open) {
			close()
		} else {
			openMenu()
		}
	}

	/**
	 * Open the FAB menu
	 */
	function openMenu() {
		if (disabled || open) return
		open = true
		focusedIndex = 0
		onopen?.()
	}

	/**
	 * Close the FAB menu
	 */
	function close() {
		if (!open) return
		open = false
		focusedIndex = -1
		onclose?.()
	}

	/**
	 * Handle item selection
	 */
	function handleItemClick(item: { proxy: ItemProxy; original: FloatingActionItem }) {
		if (item.proxy.disabled) return
		onselect?.(item.proxy.itemValue, item.original)
		close()
		// Return focus to trigger
		const trigger = fabRef?.querySelector('[data-fab-trigger]') as HTMLElement | undefined
		trigger?.focus()
	}

	/**
	 * Focus an item by index
	 */
	function focusItem(index: number) {
		if (index < 0 || index >= flatItems.length) return
		focusedIndex = index
		const menu = fabRef?.querySelector('[data-fab-menu]')
		if (menu) {
			const menuItems = menu.querySelectorAll('[data-fab-item]:not([data-disabled])')
			const menuItem = menuItems[index] as HTMLElement | undefined
			menuItem?.focus()
		}
	}

	/**
	 * Handle keyboard navigation on trigger
	 */
	function handleTriggerKeyDown(event: KeyboardEvent) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			toggle()
		} else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
			event.preventDefault()
			openMenu()
		}
	}

	/**
	 * Handle keyboard navigation when menu is open
	 */
	function handleKeyDown(event: KeyboardEvent) {
		if (!open) return

		switch (event.key) {
			case 'Escape':
				event.preventDefault()
				close()
				const trigger = fabRef?.querySelector('[data-fab-trigger]') as HTMLElement | undefined
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
					handleItemClick(flatItems[focusedIndex])
				}
				break
		}
	}

	/**
	 * Handle item-specific keyboard events
	 */
	function handleItemKeyDown(
		event: KeyboardEvent,
		item: { proxy: ItemProxy; original: FloatingActionItem }
	) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			handleItemClick(item)
		}
	}

	/**
	 * Handle click outside to close
	 */
	function handleClickOutside(event: MouseEvent) {
		if (fabRef && !fabRef.contains(event.target as Node)) {
			close()
		}
	}

	/**
	 * Handle backdrop click
	 */
	function handleBackdropClick() {
		close()
	}

	/**
	 * Create handlers object for custom snippets
	 */
	function createHandlers(item: {
		proxy: ItemProxy
		original: FloatingActionItem
	}): FloatingActionItemHandlers {
		return {
			onclick: () => handleItemClick(item),
			onkeydown: (event: KeyboardEvent) => handleItemKeyDown(event, item)
		}
	}

	/**
	 * Resolve which snippet to use for an item
	 */
	function resolveItemSnippet(proxy: ItemProxy): FloatingActionItemSnippet | null {
		const snippetName = proxy.snippetName
		if (snippetName) {
			const namedSnippet = getSnippet(snippets, snippetName)
			if (namedSnippet) {
				return namedSnippet as FloatingActionItemSnippet
			}
		}
		return itemSnippet ?? null
	}

	/**
	 * Calculate item animation delay for stagger effect
	 */
	function getItemDelay(index: number): string {
		return `${index * 50}ms`
	}

	// Set up click outside listener when open
	$effect(() => {
		if (open) {
			document.addEventListener('click', handleClickOutside, true)
			document.addEventListener('keydown', handleKeyDown)
			// Focus first item after animation starts
			requestAnimationFrame(() => {
				if (flatItems.length > 0) {
					focusItem(0)
				}
			})
		}
		return () => {
			document.removeEventListener('click', handleClickOutside, true)
			document.removeEventListener('keydown', handleKeyDown)
		}
	})
</script>

{#snippet defaultItem(
	proxy: ItemProxy,
	handlers: FloatingActionItemHandlers,
	index: number,
	total: number
)}
	<button
		type="button"
		data-fab-item
		data-fab-index={index}
		data-disabled={proxy.disabled || undefined}
		disabled={proxy.disabled || disabled}
		aria-label={proxy.label || proxy.text}
		style="--fab-index: {index}; --fab-total: {total}; --fab-delay: {getItemDelay(index)}"
		onclick={handlers.onclick}
		onkeydown={handlers.onkeydown}
	>
		{#if proxy.icon}
			<span data-fab-item-icon class={proxy.icon} aria-hidden="true"></span>
		{/if}
		{#if proxy.text}
			<span data-fab-item-label>{proxy.text}</span>
		{/if}
	</button>
{/snippet}

{#snippet renderItem(
	item: { proxy: ItemProxy; original: FloatingActionItem },
	index: number,
	total: number
)}
	{@const customSnippet = resolveItemSnippet(item.proxy)}
	{@const handlers = createHandlers(item)}
	{#if customSnippet}
		<div
			data-fab-item
			data-fab-item-custom
			data-fab-index={index}
			data-disabled={item.proxy.disabled || undefined}
			style="--fab-index: {index}; --fab-total: {total}; --fab-delay: {getItemDelay(index)}"
		>
			<svelte:boundary>
				{@render customSnippet(item.original, item.proxy.fields, handlers)}
				{#snippet failed()}
					{@render defaultItem(item.proxy, handlers, index, total)}
				{/snippet}
			</svelte:boundary>
		</div>
	{:else}
		{@render defaultItem(item.proxy, handlers, index, total)}
	{/if}
{/snippet}

<div
	bind:this={fabRef}
	data-fab
	data-open={open || undefined}
	data-size={size}
	data-position={position}
	data-expand={expand}
	data-item-align={itemAlign}
	data-disabled={disabled || undefined}
	data-contained={contained || undefined}
	class={className || undefined}
>
	{#if backdrop && open}
		<div data-fab-backdrop role="presentation" onclick={handleBackdropClick}></div>
	{/if}

	{#if open}
		<div data-fab-menu role="menu" aria-label={label}>
			{#each flatItems as item, index (index)}
				{@render renderItem(item, index, flatItems.length)}
			{/each}
		</div>
	{/if}

	<button
		type="button"
		data-fab-trigger
		{disabled}
		aria-label={label}
		aria-haspopup="menu"
		aria-expanded={open}
		onclick={toggle}
		onkeydown={handleTriggerKeyDown}
	>
		<span data-fab-icon class={open ? closeIcon : icon} aria-hidden="true"></span>
	</button>
</div>
