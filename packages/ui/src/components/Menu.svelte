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
	import { ListController } from '@rokkit/states'
	import { navigator } from '@rokkit/actions'

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

	// ─── Flatten options into navigable items for the controller ────
	// Groups are presentation-only; only leaf items are navigable.

	/** Flat array of raw selectable items (for controller) */
	const flatItems = $derived.by(() => {
		const items: MenuItem[] = []
		for (const option of options) {
			const proxy = createProxy(option)
			if (proxy.hasChildren) {
				for (const child of proxy.children) {
					items.push(child as MenuItem)
				}
			} else {
				items.push(option)
			}
		}
		return items
	})

	/** Map from raw item object → flat index key (for data-path) */
	const itemPathMap = $derived.by(() => {
		const map = new WeakMap<object, string>()
		flatItems.forEach((item, index) => {
			if (item && typeof item === 'object') {
				map.set(item, String(index))
			}
		})
		return map
	})

	// ─── Controller + Navigator ────────────────────────────────────

	// Dropdown state
	let isOpen = $state(false)
	let menuRef = $state<HTMLDivElement | null>(null)
	let dropdownRef = $state<HTMLDivElement | null>(null)

	 
	let controller = new ListController(flatItems, undefined, userFields)

	$effect(() => {
		controller.update(flatItems)
	})

	// Focus the element matching controller.focusedKey on navigator action events
	// and handle select action (fire onselect + close menu)
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
			onselect?.(itemProxy.itemValue, proxy.value as MenuItem)
		}
		closeMenu()
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

	function toggleMenu() {
		if (disabled) return
		if (isOpen) {
			closeMenu()
		} else {
			openMenu()
		}
	}

	function openMenu() {
		if (disabled || isOpen) return
		isOpen = true
	}

	function closeMenu() {
		isOpen = false
		controller.moveToValue(undefined)
	}

	// ─── Trigger keyboard handling ─────────────────────────────────

	function handleTriggerKeyDown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			openMenu()
			requestAnimationFrame(() => focusFirstItem())
		} else if (event.key === 'ArrowUp') {
			event.preventDefault()
			openMenu()
			requestAnimationFrame(() => focusLastItem())
		}
	}

	function focusFirstItem() {
		controller.moveFirst()
		focusCurrentItem()
	}

	function focusLastItem() {
		controller.moveLast()
		focusCurrentItem()
	}

	function focusCurrentItem() {
		if (!dropdownRef || !controller.focusedKey) return
		const target = dropdownRef.querySelector(
			`[data-path="${controller.focusedKey}"]`
		) as HTMLElement | null
		target?.focus()
	}

	// ─── Escape + click-outside ────────────────────────────────────

	function handleEscapeKey(event: KeyboardEvent) {
		if (!isOpen) return
		if (event.key === 'Escape') {
			event.preventDefault()
			closeMenu()
			// Return focus to trigger
			const trigger = menuRef?.querySelector('[data-menu-trigger]') as HTMLElement | undefined
			trigger?.focus()
		}
	}

	function handleClickOutside(event: MouseEvent) {
		if (menuRef && !menuRef.contains(event.target as Node)) {
			closeMenu()
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

	// ─── Snippet + rendering helpers (unchanged) ───────────────────

	/**
	 * Handle direct Enter/Space on a menu item (for items without data-path or custom snippets).
	 * Stops propagation to prevent navigator from double-handling.
	 */
	function handleItemSelect(proxy: ItemProxy) {
		if (proxy.disabled) return
		onselect?.(proxy.itemValue, proxy.original as MenuItem)
		closeMenu()
	}

	/**
	 * Create handlers object for custom snippets
	 */
	function createHandlers(proxy: ItemProxy): MenuItemHandlers {
		return {
			onclick: () => handleItemSelect(proxy),
			onkeydown: (event: KeyboardEvent) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault()
					event.stopPropagation()
					handleItemSelect(proxy)
				}
			}
		}
	}

	/**
	 * Resolve which snippet to use for an item
	 */
	function resolveItemSnippet(proxy: ItemProxy): MenuItemSnippet | null {
		const snippetName = proxy.snippetName
		if (snippetName) {
			const namedSnippet = getSnippet(snippets, snippetName)
			if (namedSnippet) {
				return namedSnippet as MenuItemSnippet
			}
		}
		return itemSnippet ?? null
	}

	// Track option index for divider logic - show divider before groups that aren't the first item
	function shouldShowDivider(optionIndex: number, isGroup: boolean): boolean {
		return isGroup && optionIndex > 0
	}

	/**
	 * Get the data-path key for a raw item (looks up in the pre-computed map)
	 */
	function getPathKey(item: MenuItem): string | undefined {
		if (item && typeof item === 'object') {
			return itemPathMap.get(item)
		}
		return undefined
	}
</script>

{#snippet defaultItem(proxy: ItemProxy, handlers: MenuItemHandlers, pathKey: string | undefined)}
	<button
		type="button"
		data-menu-item
		data-path={pathKey}
		data-disabled={proxy.disabled || undefined}
		role="menuitem"
		tabindex="-1"
		disabled={proxy.disabled}
		aria-label={proxy.label}
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

{#snippet renderItem(proxy: ItemProxy, pathKey: string | undefined)}
	{@const customSnippet = resolveItemSnippet(proxy)}
	{@const handlers = createHandlers(proxy)}
	{#if customSnippet}
		<div data-menu-item data-menu-item-custom data-path={pathKey} data-disabled={proxy.disabled || undefined}>
			<svelte:boundary>
				{@render customSnippet(proxy.original as MenuItem, proxy.fields, handlers)}
				{#snippet failed()}
					{@render defaultItem(proxy, handlers, pathKey)}
				{/snippet}
			</svelte:boundary>
		</div>
	{:else}
		{@render defaultItem(proxy, handlers, pathKey)}
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
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			bind:this={dropdownRef}
			data-menu-dropdown
			role="menu"
			aria-orientation="vertical"
			onfocusin={handleFocusIn}
			use:navigator={{ wrapper: controller, orientation: 'vertical' }}
		>
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
							{@const pathKey = getPathKey(child as MenuItem)}
							{@render renderItem(childProxy, pathKey)}
						{/each}
					</div>
				{:else}
					<!-- Standalone item (no children) -->
					{@const pathKey = getPathKey(option)}
					{@render renderItem(proxy, pathKey)}
				{/if}
			{/each}
		</div>
	{/if}
</div>
