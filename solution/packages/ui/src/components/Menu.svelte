<script lang="ts">
	// @ts-nocheck
	import type { MenuProps, MenuStateIcons } from '../types/menu.js'
	import { defaultMenuStateIcons, getSnippet } from '../types/menu.js'
	import { Wrapper, ProxyItem, PROXY_ITEM_FIELDS } from '@rokkit/states'
	import { Navigator } from '@rokkit/actions'

	let {
		options = [],
		fields: userFields = {},
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
		...extraSnippets
	}: MenuProps & { [key: string]: unknown } = $props()

	const icons = $derived<MenuStateIcons>({ ...defaultMenuStateIcons, ...userIcons })
	const mergedFields = $derived({ ...PROXY_ITEM_FIELDS, ...userFields })
	const normalizedAlign = $derived(align === 'left' || align === 'start' ? 'left' : 'right')

	// ─── Flat items for Wrapper (groups pre-flattened — only leaf items) ────────

	const flatItems = $derived.by(() => {
		const items = []
		const childrenField = mergedFields.children
		for (const option of options) {
			const children = option[childrenField]
			if (Array.isArray(children) && children.length > 0) {
				for (const child of children) items.push(child)
			} else {
				items.push(option)
			}
		}
		return items
	})

	/** item → key string matching Wrapper keys */
	const itemPathMap = $derived.by(() => {
		const map = new Map()
		flatItems.forEach((item, i) => map.set(item, String(i)))
		return map
	})

	// ─── Wrapper ──────────────────────────────────────────────────────────────

	const wrapper = $derived(new Wrapper(flatItems, mergedFields, { onselect: handleSelect }))

	// When wrapper recreates while open, focus first item
	$effect(() => {
		const w = wrapper
		if (isOpen) w.first(null)
	})

	// ─── Dropdown state ───────────────────────────────────────────────────────

	let isOpen = $state(false)
	let menuRef = $state<HTMLDivElement | null>(null)
	let dropdownRef = $state<HTMLDivElement | null>(null)

	// ─── Navigator ────────────────────────────────────────────────────────────

	$effect(() => {
		if (!isOpen || !dropdownRef) return
		const nav = new Navigator(dropdownRef, wrapper, { orientation: 'vertical' })
		return () => nav.destroy()
	})

	// DOM focus sync
	$effect(() => {
		const key = wrapper.focusedKey
		if (!isOpen || !dropdownRef || !key) return
		requestAnimationFrame(() => {
			const target = dropdownRef?.querySelector(`[data-path="${key}"]`)
			if (target && target !== document.activeElement) {
				target.focus()
			}
		})
	})

	// ─── Selection handler ────────────────────────────────────────────────────

	function handleSelect(extractedValue, proxy) {
		if (proxy.disabled) return
		const rawItem = flatItems[parseInt(proxy.key)] ?? null
		onselect?.(extractedValue, rawItem)
		closeMenu()
		const trigger = menuRef?.querySelector('[data-menu-trigger]')
		trigger?.focus()
	}

	// ─── Dropdown control ─────────────────────────────────────────────────────

	function toggleMenu() {
		if (disabled) return
		if (isOpen) closeMenu()
		else openMenu()
	}

	function openMenu() {
		if (disabled || isOpen) return
		isOpen = true
		requestAnimationFrame(() => wrapper.first(null))
	}

	function closeMenu() {
		isOpen = false
	}

	// ─── Keyboard handlers ────────────────────────────────────────────────────

	function handleTriggerKeyDown(event) {
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			if (!isOpen) {
				openMenu()
			} else {
				wrapper.first(null)
			}
		} else if (event.key === 'ArrowUp') {
			event.preventDefault()
			if (!isOpen) {
				openMenu()
				requestAnimationFrame(() => wrapper.last(null))
			}
		} else if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			toggleMenu()
		}
	}

	function handleEscapeKey(event) {
		if (!isOpen || event.key !== 'Escape') return
		event.preventDefault()
		closeMenu()
		menuRef?.querySelector('[data-menu-trigger]')?.focus()
	}

	function handleClickOutside(event) {
		if (menuRef && !menuRef.contains(event.target)) closeMenu()
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

	// ─── Rendering helpers ────────────────────────────────────────────────────

	function getOptionProxy(item) {
		const key = itemPathMap.get(item)
		return (key !== undefined ? wrapper.lookup.get(key) : null) ?? new ProxyItem(item, mergedFields)
	}

	function getGroupProxy(group) {
		return new ProxyItem(group, mergedFields)
	}

	function resolveItemSnippet(proxy) {
		const name = proxy.snippet
		if (name && typeof name === 'string') {
			const named = getSnippet(extraSnippets, name)
			if (named) return named
		}
		return itemSnippet ?? null
	}
</script>

{#snippet defaultItemContent(proxy)}
	{#if proxy.icon}
		<span data-menu-item-icon class={proxy.icon} aria-hidden="true"></span>
	{/if}
	<span data-menu-item-content>
		<span data-menu-item-label>{proxy.text}</span>
		{#if proxy.get('description')}
			<span data-menu-item-description>{proxy.get('description')}</span>
		{/if}
	</span>
	{#if proxy.get('shortcut')}
		<kbd data-menu-item-shortcut aria-label="Keyboard shortcut: {proxy.get('shortcut')}"
			>{proxy.get('shortcut')}</kbd
		>
	{/if}
{/snippet}

{#snippet defaultGroupContent(proxy)}
	{#if proxy.icon}
		<span data-menu-group-icon class={proxy.icon} aria-hidden="true"></span>
	{/if}
	<span>{proxy.text}</span>
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
			<span data-menu-arrow class={isOpen ? icons.opened : icons.closed} aria-hidden="true"></span>
		{/if}
	</button>

	{#if isOpen}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			bind:this={dropdownRef}
			data-menu-dropdown
			role="menu"
			aria-orientation="vertical"
		>
			{#each options as option, oi (oi)}
				{@const childrenField = mergedFields.children}
				{@const children = option[childrenField]}

				{#if Array.isArray(children) && children.length > 0}
					{@const groupProxy = getGroupProxy(option)}
					{#if oi > 0}
						<div data-menu-divider role="separator"></div>
					{/if}
					<div data-menu-group>
						<div data-menu-group-label role="presentation">
							{#if groupLabelSnippet}
								{@render groupLabelSnippet(groupProxy)}
							{:else}
								{@render defaultGroupContent(groupProxy)}
							{/if}
						</div>
						{#each children as child, ci (ci)}
							{@const proxy = getOptionProxy(child)}
							{@const pathKey = itemPathMap.get(child)}
							{@const customSnippet = resolveItemSnippet(proxy)}
							<button
								type="button"
								title={proxy.get('title')}
								data-menu-item
								data-path={pathKey}
								data-disabled={proxy.disabled || undefined}
								role="menuitem"
								tabindex="-1"
								disabled={proxy.disabled}
							>
								{#if customSnippet}
									{@render customSnippet(proxy)}
								{:else}
									{@render defaultItemContent(proxy)}
								{/if}
							</button>
						{/each}
					</div>
				{:else}
					{@const proxy = getOptionProxy(option)}
					{@const pathKey = itemPathMap.get(option)}
					{@const customSnippet = resolveItemSnippet(proxy)}
					<button
						type="button"
						title={proxy.get('title')}
						data-menu-item
						data-path={pathKey}
						data-disabled={proxy.disabled || undefined}
						role="menuitem"
						tabindex="-1"
						disabled={proxy.disabled}
					>
						{#if customSnippet}
							{@render customSnippet(proxy)}
						{:else}
							{@render defaultItemContent(proxy)}
						{/if}
					</button>
				{/if}
			{/each}
		</div>
	{/if}
</div>
