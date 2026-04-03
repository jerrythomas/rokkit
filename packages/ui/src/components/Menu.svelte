<script lang="ts">
	/**
	 * Menu — Trigger + dropdown with List-identical content.
	 *
	 * Architecture:
	 *   Trigger      — manages open/close from trigger button (click, Enter, Escape, click-outside)
	 *   Wrapper      — owns focusedKey $state + flatView $derived (cancel/blur overridden to close)
	 *   Navigator    — attaches DOM event handlers on dropdown, calls wrapper[action](path)
	 *   flatView loop — single flat {#each}, same as List
	 *
	 * The dropdown content is identical to List: same flatView loop, same snippet system,
	 * same collapsible groups. The only additions are trigger, alignment, and direction.
	 *
	 * Snippet customization (same as List):
	 *   itemContent   — replaces inner content of <button> for leaf items
	 *   groupContent  — replaces inner content of group header <button>
	 *   [named]       — per-item override via item.snippet = 'name'; falls back to itemContent
	 *
	 * Data attributes on rendered elements:
	 *   data-menu               — root container
	 *   data-menu-trigger       — trigger button
	 *   data-menu-label         — trigger label text
	 *   data-menu-icon          — trigger icon
	 *   data-menu-arrow         — trigger dropdown arrow
	 *   data-menu-dropdown      — dropdown container
	 *   data-menu-item          — leaf items (like data-list-item)
	 *   data-menu-item-icon     — icon span inside leaf items
	 *   data-menu-item-text     — text span inside leaf items
	 *   data-menu-group         — group headers (like data-list-group)
	 *   data-menu-group-icon    — icon span inside group headers
	 *   data-menu-group-text    — text span inside group headers
	 *   data-menu-expand-icon   — expand/collapse chevron in group headers
	 *   data-menu-separator     — separator
	 *   data-menu-spacer        — spacer
	 *   data-path               — required by Navigator for click detection + scroll
	 *   data-level              — nesting depth (1=root)
	 *   data-accordion-trigger  — tells Navigator to dispatch toggle on click
	 *   data-active             — highlights current value match
	 *   data-disabled           — disabled state
	 *   data-open               — dropdown is open
	 *   data-size               — size variant
	 *   data-align              — dropdown alignment
	 *   data-direction          — dropdown direction
	 */
	// @ts-nocheck
	import type { ProxyItem } from '@rokkit/states'
	import { Wrapper, ProxyTree, messages } from '@rokkit/states'
	import { Navigator, Trigger } from '@rokkit/actions'
	import { DEFAULT_STATE_ICONS, resolveSnippet, ITEM_SNIPPET, GROUP_SNIPPET } from '@rokkit/core'
	import ItemContent from './ItemContent.svelte'

	interface MenuIcons {
		opened?: string
		closed?: string
	}

	let {
		items = [],
		fields = {},
		value,
		size = 'md',
		disabled = false,
		collapsible = false,
		label = messages.menu.label,
		icon,
		showArrow = true,
		align = 'start',
		direction = 'down',
		icons: userIcons = {} as MenuIcons,
		onselect,
		class: className = '',
		...snippets
	}: {
		items?: unknown[]
		fields?: Record<string, string>
		value?: unknown
		size?: string
		disabled?: boolean
		collapsible?: boolean
		label?: string
		icon?: string
		showArrow?: boolean
		align?: 'start' | 'end'
		direction?: 'up' | 'down'
		icons?: MenuIcons
		onselect?: (value: unknown, proxy: ProxyItem) => void
		class?: string
		[key: string]: unknown
	} = $props()

	const icons = $derived({ ...DEFAULT_STATE_ICONS.selector, ...userIcons })

	// ─── Dropdown state ───────────────────────────────────────────────────────

	let isOpen = $state(false)
	let menuRef = $state<HTMLElement | null>(null)
	let triggerRef = $state<HTMLElement | null>(null)
	let dropdownRef = $state<HTMLElement | null>(null)

	// ─── Wrapper ──────────────────────────────────────────────────────────────

	function handleSelect(extractedValue: unknown, proxy: ProxyItem) {
		if (proxy.disabled) return
		onselect?.(extractedValue, proxy)
		isOpen = false
		triggerRef?.focus()
	}

	const proxyTree = $derived(new ProxyTree(items, fields))
	const wrapper = $derived(new Wrapper(proxyTree, { onselect: handleSelect, collapsible }))

	// Override cancel/blur to close dropdown (Navigator dispatches these on Escape/focusout)
	$effect(() => {
		const w = wrapper
		w.cancel = () => {
			isOpen = false
			triggerRef?.focus()
		}
		w.blur = () => {
			isOpen = false
		}
	})

	// When wrapper recreates while open, focus first item
	$effect(() => {
		const _w = wrapper
		if (isOpen) _w.first(null)
	})

	// ─── Trigger action ───────────────────────────────────────────────────────

	$effect(() => {
		if (!triggerRef || !menuRef || disabled) return
		const t = new Trigger(triggerRef, menuRef, {
			isOpen: () => isOpen,
			onopen: () => {
				isOpen = true
				requestAnimationFrame(() => wrapper.first(null))
			},
			onclose: () => {
				isOpen = false
			},
			onlast: () => requestAnimationFrame(() => wrapper.last(null))
		})
		return () => t.destroy()
	})

	// ─── Navigator on dropdown ────────────────────────────────────────────────

	$effect(() => {
		if (!isOpen || !dropdownRef) return
		const dir = getComputedStyle(dropdownRef).direction || 'ltr'
		const nav = new Navigator(dropdownRef, wrapper, { collapsible, dir, containScroll: true })
		return () => nav.destroy()
	})

	// DOM focus sync — move focus to focusedKey in dropdown
	$effect(() => {
		const key = wrapper.focusedKey
		if (!isOpen || !dropdownRef || !key) return
		requestAnimationFrame(() => {
			const target = dropdownRef?.querySelector(`[data-path="${key}"]`) as HTMLElement | null
			if (target && target !== document.activeElement) {
				target.focus()
			}
		})
	})
</script>

{#snippet defaultItemContent(proxy: ProxyItem)}
	<ItemContent {proxy} />
{/snippet}

{#snippet defaultGroupContent(proxy: ProxyItem)}
	{#if proxy.get('icon')}
		<span data-menu-group-icon class={proxy.get('icon')} aria-hidden="true"></span>
	{/if}
	<span data-menu-group-text>{proxy.label}</span>
	{#if collapsible}
		<span
			data-menu-expand-icon
			class={proxy.expanded ? icons.opened : icons.closed}
			aria-hidden="true"
		></span>
	{/if}
{/snippet}

<div
	bind:this={menuRef}
	data-menu
	data-open={isOpen || undefined}
	data-size={size}
	data-disabled={disabled || undefined}
	data-align={align}
	data-direction={direction}
	class={className || undefined}
>
	<button
		bind:this={triggerRef}
		type="button"
		data-menu-trigger
		{disabled}
		aria-haspopup="menu"
		aria-expanded={isOpen}
		aria-label={label}
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
		<div bind:this={dropdownRef} data-menu-dropdown role="menu" aria-orientation="vertical">
			{#each wrapper.flatView as node (node.key)}
				{@const proxy = node.proxy}
				{@const isActive = proxy.value === value}
				{@const content = resolveSnippet(
					snippets as Record<string, unknown>,
					proxy,
					node.hasChildren ? GROUP_SNIPPET : ITEM_SNIPPET
				)}

				{#if node.type === 'separator'}
					<hr data-menu-separator />
				{:else if node.type === 'spacer'}
					<div data-menu-spacer></div>
				{:else if node.hasChildren}
					<button
						type="button"
						data-menu-group
						data-path={node.key}
						data-accordion-trigger
						data-level={node.level}
						aria-expanded={proxy.expanded}
						disabled={!collapsible}
					>
						{#if content}
							{@render content(proxy)}
						{:else}
							{@render defaultGroupContent(proxy)}
						{/if}
					</button>
				{:else}
					<button
						type="button"
						title={proxy.get('tooltip')}
						data-menu-item
						data-path={node.key}
						data-level={node.level}
						data-active={isActive || undefined}
						data-disabled={proxy.disabled || undefined}
						disabled={proxy.disabled || disabled}
						role="menuitem"
						tabindex="-1"
					>
						{#if content}
							{@render content(proxy)}
						{:else}
							{@render defaultItemContent(proxy)}
						{/if}
					</button>
				{/if}
			{/each}
		</div>
	{/if}
</div>
