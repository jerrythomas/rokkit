<script lang="ts">
	import type {
		MenuProps,
		MenuItem,
		MenuItemSnippet,
		MenuItemHandlers,
		MenuStateIcons
	} from '../types/menu.js'
	import { getSnippet, defaultMenuStateIcons } from '../types/menu.js'
	import { ItemProxy } from '../types/item-proxy.js'

	const {
		options = [],
		fields: userFields,
		label = 'Menu',
		icon,
		showArrow = true,
		size = 'md',
		align = 'left',
		direction = 'down',
		disabled = false,
		onselect,
		class: className = '',
		icons: userIcons,
		item: itemSnippet,
		groupLabel: groupLabelSnippet,
		...snippets
	}: MenuProps & { [key: string]: MenuItemSnippet | unknown } = $props()

	// Merge icons with defaults
	const icons = $derived<MenuStateIcons>({ ...defaultMenuStateIcons, ...userIcons })

	// Normalize alignment value (support both start/end and left/right)
	const normalizedAlign = $derived(align === 'left' || align === 'start' ? 'left' : 'right')

	/**
	 * Create an ItemProxy for the given item
	 */
	function createProxy(item: MenuItem): ItemProxy {
		return new ItemProxy(item, userFields)
	}

	// Dropdown state
	let isOpen = $state(false)
	let menuRef = $state<HTMLDivElement | null>(null)
	let focusedIndex = $state(-1)

	// Flatten all selectable items for keyboard navigation
	const flatItems = $derived.by(() => {
		const items: ItemProxy[] = []
		for (const option of options) {
			const proxy = createProxy(option)
			if (proxy.hasChildren) {
				for (const child of proxy.children) {
					const childProxy = proxy.createChildProxy(child)
					if (!childProxy.disabled) {
						items.push(childProxy)
					}
				}
			} else if (!proxy.disabled) {
				items.push(proxy)
			}
		}
		return items
	})

	function toggleMenu() {
		if (disabled) return
		isOpen = !isOpen
		if (!isOpen) {
			focusedIndex = -1
		}
	}

	function openMenu() {
		if (disabled || isOpen) return
		isOpen = true
	}

	function closeMenu() {
		isOpen = false
		focusedIndex = -1
	}

	function handleItemClick(proxy: ItemProxy) {
		if (proxy.disabled) return
		onselect?.(proxy.itemValue, proxy.original as MenuItem)
		closeMenu()
	}

	function focusItem(index: number) {
		if (index < 0 || index >= flatItems.length) return
		focusedIndex = index
		// Focus the actual DOM element
		const dropdown = menuRef?.querySelector('[data-menu-dropdown]')
		if (dropdown) {
			const items = dropdown.querySelectorAll('[data-menu-item]:not([data-disabled])')
			const item = items[index] as HTMLElement | undefined
			item?.focus()
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (!isOpen) return

		switch (event.key) {
			case 'Escape':
				event.preventDefault()
				closeMenu()
				// Return focus to trigger
				const trigger = menuRef?.querySelector('[data-menu-trigger]') as HTMLElement | undefined
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

	function handleTriggerKeyDown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			openMenu()
			requestAnimationFrame(() => focusItem(0))
		} else if (event.key === 'ArrowUp') {
			event.preventDefault()
			openMenu()
			requestAnimationFrame(() => focusItem(flatItems.length - 1))
		}
	}

	function handleItemKeyDown(event: KeyboardEvent, proxy: ItemProxy) {
		// Enter/Space handled by global handleKeyDown, but keep for direct item interaction
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			handleItemClick(proxy)
		}
	}

	function handleClickOutside(event: MouseEvent) {
		if (menuRef && !menuRef.contains(event.target as Node)) {
			closeMenu()
		}
	}

	/**
	 * Create handlers object for custom snippets
	 */
	function createHandlers(proxy: ItemProxy): MenuItemHandlers {
		return {
			onclick: () => handleItemClick(proxy),
			onkeydown: (event: KeyboardEvent) => handleItemKeyDown(event, proxy)
		}
	}

	/**
	 * Resolve which snippet to use for an item:
	 * 1. Check for per-item snippet override via snippet field
	 * 2. Fall back to the item snippet prop
	 * 3. Return null if no custom snippet (use default rendering)
	 */
	function resolveItemSnippet(proxy: ItemProxy): MenuItemSnippet | null {
		// Check for per-item snippet name
		const snippetName = proxy.snippetName
		if (snippetName) {
			const namedSnippet = getSnippet(snippets, snippetName)
			if (namedSnippet) {
				return namedSnippet as MenuItemSnippet
			}
		}

		// Fall back to the generic item snippet
		return itemSnippet ?? null
	}

	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleClickOutside, true)
			document.addEventListener('keydown', handleKeyDown)
		}
		return () => {
			document.removeEventListener('click', handleClickOutside, true)
			document.removeEventListener('keydown', handleKeyDown)
		}
	})

	// Track option index for divider logic - show divider before groups that aren't the first item
	function shouldShowDivider(optionIndex: number, isGroup: boolean): boolean {
		return isGroup && optionIndex > 0
	}
</script>

{#snippet defaultItem(proxy: ItemProxy, handlers: MenuItemHandlers)}
	<button
		type="button"
		data-menu-item
		data-disabled={proxy.disabled || undefined}
		role="menuitem"
		disabled={proxy.disabled}
		aria-label={proxy.label}
		onclick={handlers.onclick}
		onkeydown={handlers.onkeydown}
	>
		{#if proxy.icon}
			<span data-menu-item-icon class={proxy.icon} aria-hidden="true"></span>
		{/if}
		<span data-menu-item-content>
			<span data-menu-item-label>{proxy.text}</span>
			{#if proxy.description}
				<span data-menu-item-description>{proxy.description}</span>
			{/if}
		</span>
		{#if proxy.shortcut}
			<kbd data-menu-item-shortcut aria-label="Keyboard shortcut: {proxy.shortcut}"
				>{proxy.shortcut}</kbd
			>
		{/if}
	</button>
{/snippet}

{#snippet defaultGroupLabel(proxy: ItemProxy)}
	<div data-menu-group-label role="presentation">
		{#if proxy.icon}
			<span data-menu-group-icon class={proxy.icon} aria-hidden="true"></span>
		{/if}
		<span>{proxy.text}</span>
	</div>
{/snippet}

{#snippet renderItem(proxy: ItemProxy)}
	{@const customSnippet = resolveItemSnippet(proxy)}
	{@const handlers = createHandlers(proxy)}
	{#if customSnippet}
		<div data-menu-item data-menu-item-custom data-disabled={proxy.disabled || undefined}>
			<svelte:boundary>
				{@render customSnippet(proxy.original as MenuItem, proxy.fields, handlers)}
				{#snippet failed()}
					{@render defaultItem(proxy, handlers)}
				{/snippet}
			</svelte:boundary>
		</div>
	{:else}
		{@render defaultItem(proxy, handlers)}
	{/if}
{/snippet}

{#snippet renderGroupLabel(proxy: ItemProxy)}
	{#if groupLabelSnippet}
		<svelte:boundary>
			{@render groupLabelSnippet(proxy.original as MenuItem, proxy.fields)}
			{#snippet failed()}
				{@render defaultGroupLabel(proxy)}
			{/snippet}
		</svelte:boundary>
	{:else}
		{@render defaultGroupLabel(proxy)}
	{/if}
{/snippet}

<div
	bind:this={menuRef}
	data-menu
	data-open={isOpen || undefined}
	data-size={size}
	data-disabled={disabled || undefined}
	data-align={normalizedAlign}
	data-direction={direction}
	class={className || undefined}
	aria-label="Menu"
>
	<button
		type="button"
		data-menu-trigger
		{disabled}
		aria-haspopup="menu"
		aria-expanded={isOpen}
		aria-label={label}
		onclick={toggleMenu}
		onkeydown={handleTriggerKeyDown}
	>
		{#if icon}
			<span data-menu-icon class={icon} aria-hidden="true"></span>
		{/if}
		<span data-menu-label>{label}</span>
		{#if showArrow}
			<span data-menu-arrow class={icons.opened} aria-hidden="true"></span>
		{/if}
	</button>

	{#if isOpen}
		<div data-menu-dropdown role="menu" aria-orientation="vertical">
			{#each options as option, optionIndex (optionIndex)}
				{@const proxy = createProxy(option)}

				{#if proxy.hasChildren}
					<!-- Group with children -->
					{#if shouldShowDivider(optionIndex, true)}
						<div data-menu-divider role="separator"></div>
					{/if}

					<div data-menu-group>
						{@render renderGroupLabel(proxy)}

						{#each proxy.children as child, childIndex (childIndex)}
							{@const childProxy = proxy.createChildProxy(child)}
							{@render renderItem(childProxy)}
						{/each}
					</div>
				{:else}
					<!-- Standalone item (no children) -->
					{@render renderItem(proxy)}
				{/if}
			{/each}
		</div>
	{/if}
</div>
