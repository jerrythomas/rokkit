<script lang="ts">
	import type {
		ListProps,
		ListItem,
		ListItemSnippet,
		ListItemHandlers,
		ListStateIcons
	} from '../types/list.js'
	import { getSnippet, defaultListStateIcons } from '../types/list.js'
	import { ItemProxy } from '../types/item-proxy.js'
	import ItemContent from './ItemContent.svelte'
	import { NestedController } from '@rokkit/states'
	import { navigator } from '@rokkit/actions'

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
		icons: userIcons,
		item: itemSnippet,
		groupLabel: groupLabelSnippet,
		...snippets
	}: ListProps & { [key: string]: ListItemSnippet | unknown } = $props()

	// Merge icons with defaults
	const icons = $derived<ListStateIcons>({ ...defaultListStateIcons, ...userIcons })

	/**
	 * Create an ItemProxy for the given item
	 */
	function createProxy(item: ListItem): ItemProxy {
		return new ItemProxy(item, userFields)
	}

	// ─── NestedController for keyboard navigation ───────────────────

	// eslint-disable-next-line svelte/valid-compile -- initial capture is intentional
	let controller = new NestedController(items, value, userFields)
	let listRef = $state<HTMLElement | null>(null)

	// Reactive expansion state keyed by path key (e.g. "0", "1")
	// This is the source of truth for the template's expansion rendering.
	// We maintain this separately because Svelte 5 cannot track reactivity
	// through controller.lookup (a $derived Map) → proxy.expanded ($state).
	let expandedByPath = $state<Record<string, boolean>>({})

	/**
	 * Get expanded state for a group key from the expanded prop
	 * Default to expanded (true) when not explicitly set
	 */
	function getExpandedState(groupKey: string): boolean {
		if (!collapsible) return true
		const externalKeys = Object.keys(expanded)
		if (externalKeys.length > 0) {
			return expanded[groupKey] !== false
		}
		return true // Default: expanded
	}

	// Sync expansion state: expanded prop → controller proxies + expandedByPath
	function syncExpandedToController() {
		for (const [key, proxy] of controller.lookup.entries()) {
			if (!proxy.hasChildren) continue
			const groupProxy = createProxy(proxy.value)
			const groupKey = getGroupKey(groupProxy)
			const shouldExpand = getExpandedState(groupKey)
			if (proxy.expanded !== shouldExpand) {
				proxy.expanded = shouldExpand
			}
			expandedByPath[key] = shouldExpand
		}
	}

	// Sync on init
	syncExpandedToController()

	$effect(() => {
		controller.update(items)
		// Re-sync expansion after items update
		syncExpandedToController()
	})

	// Sync expanded prop changes → controller
	$effect(() => {
		// Track both expanded and collapsible to re-sync when either changes
		void expanded
		void collapsible
		syncExpandedToController()
	})

	// Derive expanded prop FROM expandedByPath state (pathKey → groupKey mapping)
	function deriveExpandedFromPath(): Record<string, boolean> {
		const result: Record<string, boolean> = {}
		items.forEach((item, index) => {
			const proxy = createProxy(item)
			if (!proxy.hasChildren) return
			const pathKey = String(index)
			const groupKey = getGroupKey(proxy)
			result[groupKey] = expandedByPath[pathKey] ?? true
		})
		return result
	}

	// Focus the element matching controller.focusedKey on navigator action events
	$effect(() => {
		if (!listRef) return
		const el = listRef

		function onAction(event: Event) {
			const detail = (event as CustomEvent).detail

			if (detail.name === 'move') {
				const key = controller.focusedKey
				if (key) {
					const target = el.querySelector(`[data-path="${key}"]`) as HTMLElement | null
					if (target && target !== document.activeElement) {
						target.focus()
						target.scrollIntoView({ block: 'nearest', inline: 'nearest' })
					}
				}
			}

			if (detail.name === 'select') {
				handleSelectAction()
			}

			if (detail.name === 'toggle') {
				// Controller already toggled the expansion. Sync expandedByPath + expanded prop.
				for (const [key, proxy] of controller.lookup.entries()) {
					if (!proxy.hasChildren) continue
					expandedByPath[key] = proxy.expanded
				}
				const newExpanded = deriveExpandedFromPath()
				expanded = newExpanded
				onexpandedchange?.(newExpanded)
			}
		}

		el.addEventListener('action', onAction)
		return () => el.removeEventListener('action', onAction)
	})

	/**
	 * Sync DOM focus to controller state.
	 * When a user tabs into the list or clicks an item, the controller
	 * needs to know which element is focused for arrow keys to work correctly.
	 */
	function handleFocusIn(event: FocusEvent) {
		const target = event.target as HTMLElement
		if (!target) return
		const path = target.dataset.path
		if (path !== undefined) {
			controller.moveTo(path)
		}
	}

	/**
	 * Handle the navigator's select action (Enter/Space on focused item, or click)
	 */
	function handleSelectAction() {
		const key = controller.focusedKey
		if (!key) return

		const proxy = controller.lookup.get(key)
		if (!proxy) return

		// If it's a group, toggle expansion
		if (proxy.hasChildren) {
			controller.toggleExpansion(key)
			expandedByPath[key] = proxy.expanded
			const newExpanded = deriveExpandedFromPath()
			expanded = newExpanded
			onexpandedchange?.(newExpanded)
			return
		}

		// Otherwise fire onselect for button items
		const itemProxy = createProxy(proxy.value)
		if (!itemProxy.disabled && !disabled) {
			const href = itemProxy.get<string>('href')
			if (!href) {
				onselect?.(itemProxy.itemValue, proxy.value as ListItem)
			}
		}
	}

	/**
	 * Handle keyboard events the navigator doesn't cover:
	 * - Enter/Space on link items: let native <a> behavior through
	 *
	 * Fires before navigator's keydown handler.
	 */
	function handleListKeyDown(event: KeyboardEvent) {
		if (event.key !== 'Enter' && event.key !== ' ') return

		const key = controller.focusedKey
		if (!key) return

		const proxy = controller.lookup.get(key)
		if (!proxy) return

		// Link items: stop propagation to prevent navigator's preventDefault
		const itemProxy = createProxy(proxy.value)
		const href = itemProxy.get<string>('href')
		if (href) {
			event.stopPropagation()
		}
	}

	// ─── Group helpers ──────────────────────────────────────────────

	/**
	 * Get the key for a group (for expanded state tracking)
	 */
	function getGroupKey(proxy: ItemProxy): string {
		const val = proxy.itemValue
		return typeof val === 'string' ? val : proxy.text
	}

	/**
	 * Check if a group is expanded (reads from reactive expandedByPath state)
	 */
	function isGroupExpandedByKey(pathKey: string): boolean {
		if (!collapsible) return true
		return expandedByPath[pathKey] ?? true
	}

	/**
	 * Toggle group expansion via the controller
	 */
	function toggleGroupByKey(pathKey: string) {
		if (!collapsible) return
		controller.toggleExpansion(pathKey)
		// Update reactive expandedByPath state for template re-rendering
		expandedByPath[pathKey] = !expandedByPath[pathKey]
		const newExpanded = deriveExpandedFromPath()
		expanded = newExpanded
		onexpandedchange?.(newExpanded)
	}

	// ─── Unchanged helpers ──────────────────────────────────────────

	/**
	 * Check if an item is currently active
	 */
	function checkIsActive(proxy: ItemProxy): boolean {
		if (active !== undefined) {
			return proxy.itemValue === active
		}
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
	 * Create handlers object for custom snippets
	 */
	function createHandlers(proxy: ItemProxy): ListItemHandlers {
		return {
			onclick: () => handleItemClick(proxy),
			onkeydown: () => {}
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

	/**
	 * Get the controller path key for a given item index and optional child index.
	 * Maps to the same format as getKeyFromPath: "0", "0-0", "1-2", etc.
	 */
	function getPathKey(itemIndex: number, childIndex?: number): string {
		if (childIndex !== undefined) return `${itemIndex}-${childIndex}`
		return String(itemIndex)
	}
</script>

{#snippet defaultItem(
	proxy: ItemProxy,
	handlers: ListItemHandlers,
	active: boolean,
	listIndex: string,
	pathKey: string
)}
	{@const href = proxy.get<string>('href')}
	{#if href}
		<a
			{href}
			data-list-item
			data-list-index={listIndex}
			data-path={pathKey}
			data-active={active || undefined}
			data-disabled={proxy.disabled || undefined}
			aria-label={proxy.label}
			aria-current={active ? 'page' : undefined}
		>
			<ItemContent {proxy} />
		</a>
	{:else}
		<button
			type="button"
			data-list-item
			data-list-index={listIndex}
			data-path={pathKey}
			data-active={active || undefined}
			data-disabled={proxy.disabled || undefined}
			disabled={proxy.disabled || disabled}
			aria-label={proxy.label}
			aria-pressed={active}
		>
			<ItemContent {proxy} />
		</button>
	{/if}
{/snippet}

{#snippet defaultGroupLabel(
	proxy: ItemProxy,
	toggle: () => void,
	isExpanded: boolean,
	listIndex: string,
	pathKey: string
)}
	<button
		type="button"
		data-list-group-label
		data-list-index={listIndex}
		data-path={pathKey}
		data-list-group-key={getGroupKey(proxy)}
		aria-expanded={isExpanded}
		disabled={!collapsible}
	>
		{#if proxy.icon}
			<span data-list-group-icon class={proxy.icon} aria-hidden="true"></span>
		{/if}
		<span data-list-group-text>{proxy.text}</span>
		{#if collapsible}
			<span data-list-group-arrow class={icons.opened} aria-hidden="true"></span>
		{/if}
	</button>
{/snippet}

{#snippet renderItem(proxy: ItemProxy, listIndex: string, pathKey: string)}
	{@const customSnippet = resolveItemSnippet(proxy)}
	{@const handlers = createHandlers(proxy)}
	{@const active = checkIsActive(proxy)}
	{#if customSnippet}
		<div
			data-list-item
			data-list-item-custom
			data-list-index={listIndex}
			data-path={pathKey}
			data-active={active || undefined}
			data-disabled={proxy.disabled || undefined}
		>
			<svelte:boundary>
				{@render customSnippet(proxy.original as ListItem, proxy.fields, handlers, active)}
				{#snippet failed()}
					{@render defaultItem(proxy, handlers, active, listIndex, pathKey)}
				{/snippet}
			</svelte:boundary>
		</div>
	{:else}
		{@render defaultItem(proxy, handlers, active, listIndex, pathKey)}
	{/if}
{/snippet}

{#snippet renderGroupLabel(proxy: ItemProxy, listIndex: string, pathKey: string)}
	{@const toggle = () => toggleGroupByKey(pathKey)}
	{@const isExpanded = isGroupExpandedByKey(pathKey)}
	{#if groupLabelSnippet}
		<svelte:boundary>
			{@render groupLabelSnippet(proxy.original as ListItem, proxy.fields, toggle, isExpanded)}
			{#snippet failed()}
				{@render defaultGroupLabel(proxy, toggle, isExpanded, listIndex, pathKey)}
			{/snippet}
		</svelte:boundary>
	{:else}
		{@render defaultGroupLabel(proxy, toggle, isExpanded, listIndex, pathKey)}
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
	onkeydown={handleListKeyDown}
	onfocusin={handleFocusIn}
	use:navigator={{ wrapper: controller, orientation: 'vertical', nested: collapsible }}
>
	{#each items as item, itemIndex (itemIndex)}
		{@const proxy = createProxy(item)}
		{@const listIndex = String(itemIndex)}
		{@const pathKey = getPathKey(itemIndex)}

		{#if proxy.hasChildren}
			<!-- Group with children -->
			{#if shouldShowDivider(itemIndex, true)}
				<div data-list-divider role="separator"></div>
			{/if}

			<div data-list-group data-list-group-collapsed={!isGroupExpandedByKey(pathKey) || undefined}>
				{@render renderGroupLabel(proxy, listIndex, pathKey)}

				{#if isGroupExpandedByKey(pathKey)}
					<div data-list-group-items>
						{#each proxy.children as child, childIndex (childIndex)}
							{@const childProxy = proxy.createChildProxy(child)}
							{@const childListIndex = `${itemIndex}-${childIndex}`}
							{@const childPathKey = getPathKey(itemIndex, childIndex)}
							{@render renderItem(childProxy, childListIndex, childPathKey)}
						{/each}
					</div>
				{/if}
			</div>
		{:else}
			<!-- Standalone item (no children) -->
			{@render renderItem(proxy, listIndex, pathKey)}
		{/if}
	{/each}
</nav>
