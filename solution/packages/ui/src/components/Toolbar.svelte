<script lang="ts">
	import type {
		ToolbarProps,
		ToolbarItem,
		ToolbarItemSnippet,
		ToolbarItemHandlers
	} from '../types/toolbar.js'
	import { getSnippet } from '../types/menu.js'
	import { ProxyItem } from '@rokkit/states'
	import { ListController } from '@rokkit/states'
	import { navigator } from '@rokkit/actions'
	import { untrack } from 'svelte'

	const {
		items = [],
		fields: userFields,
		position = 'top',
		size = 'md',
		sticky = false,
		compact = false,
		showDividers = true,
		disabled = false,
		onclick,
		class: className = '',
		item: itemSnippet,
		start,
		center,
		end,
		children,
		...snippets
	}: ToolbarProps & { [key: string]: ToolbarItemSnippet | unknown } = $props()

	/**
	 * Create a ProxyItem for the given item
	 */
	function createProxy(item: ToolbarItem): ProxyItem {
		return new ProxyItem(item, userFields)
	}

	// ─── Controller + Navigator ────────────────────────────────────

	/** Only interactive items are tracked by the controller */
	function isInteractive(item: ToolbarItem): boolean {
		const proxy = createProxy(item)
		const type = proxy.type
		return type !== 'separator' && type !== 'spacer'
	}

	const interactiveItems = $derived(items.filter(isInteractive))

	/** Map from item → its data-path key (index within interactive items) */
	const itemPathMap = $derived.by(() => {
		const map = new Map<unknown, string>()
		let idx = 0
		for (const item of items) {
			if (isInteractive(item)) {
				map.set(item, String(idx))
				idx++
			}
		}
		return map
	})

	const orientation = $derived<'horizontal' | 'vertical'>(
		position === 'left' || position === 'right' ? 'vertical' : 'horizontal'
	)

	let controller = untrack(() => {
		const c = new ListController(interactiveItems, undefined, userFields)
		c.moveFirst()
		return c
	})
	let containerRef: HTMLElement | null = $state(null)

	$effect(() => {
		controller.update(interactiveItems)
	})

	// Sync controller position when a toolbar item receives focus (e.g. Tab from outside)
	$effect(() => {
		if (!containerRef) return
		const el = containerRef

		function onFocusIn(event: Event) {
			const target = event.target as HTMLElement
			const path = target.closest('[data-path]')?.getAttribute('data-path')
			if (path) {
				controller.moveTo(path)
			}
		}

		el.addEventListener('focusin', onFocusIn)
		return () => el.removeEventListener('focusin', onFocusIn)
	})

	// Focus the item matching controller.focusedKey on navigator action events
	$effect(() => {
		if (!containerRef) return
		const el = containerRef

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
		handleItemClick(itemProxy)
	}

	/**
	 * Get the data-path key for an item
	 */
	function getPathKey(item: ToolbarItem): string | undefined {
		return itemPathMap.get(item)
	}

	// ─── Item Handlers ─────────────────────────────────────────────

	function handleItemClick(proxy: ProxyItem) {
		if (proxy.disabled || disabled) return
		onclick?.(proxy.value, proxy.original as ToolbarItem)
	}

	function handleItemKeyDown(event: KeyboardEvent, proxy: ProxyItem) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			handleItemClick(proxy)
		}
	}

	/**
	 * Create handlers object for custom snippets
	 */
	function createHandlers(proxy: ProxyItem): ToolbarItemHandlers {
		return {
			onclick: () => handleItemClick(proxy),
			onkeydown: (event: KeyboardEvent) => handleItemKeyDown(event, proxy)
		}
	}

	/**
	 * Resolve which snippet to use for an item
	 */
	function resolveItemSnippet(proxy: ProxyItem): ToolbarItemSnippet | null {
		// Check for per-item snippet name
		const snippetName = proxy.get('snippet')
		if (snippetName) {
			const namedSnippet = getSnippet(snippets, snippetName)
			if (namedSnippet) {
				return namedSnippet as ToolbarItemSnippet
			}
		}

		// Fall back to the generic item snippet
		return itemSnippet ?? null
	}

	// Check if we have data-driven items or slot-based content
	const hasItems = $derived(items.length > 0)
	const hasSlots = $derived(start || center || end || children)

	// Determine if toolbar is horizontal or vertical
	const isHorizontal = $derived(position === 'top' || position === 'bottom')
</script>

{#snippet defaultItem(proxy: ProxyItem, pathKey: string | undefined)}
	<button
		type="button"
		data-toolbar-item
		data-path={pathKey}
		data-active={proxy.get('active') || undefined}
		data-disabled={proxy.disabled || undefined}
		disabled={proxy.disabled || disabled}
		aria-label={proxy.label}
		aria-pressed={proxy.get('active')}
		title={proxy.get('shortcut') ? `${proxy.label} (${proxy.get('shortcut')})` : proxy.label}
	>
		{#if proxy.get('icon')}
			<span data-toolbar-icon class={proxy.get('icon')} aria-hidden="true"></span>
		{/if}
		{#if proxy.label && !proxy.get('icon')}
			<span data-toolbar-label>{proxy.label}</span>
		{/if}
	</button>
{/snippet}

{#snippet separator()}
	<div
		data-toolbar-separator
		role="separator"
		aria-orientation={isHorizontal ? 'vertical' : 'horizontal'}
	></div>
{/snippet}

{#snippet spacer()}
	<div data-toolbar-spacer></div>
{/snippet}

{#snippet divider()}
	<div data-toolbar-divider aria-hidden="true"></div>
{/snippet}

{#snippet renderItem(proxy: ProxyItem, item: ToolbarItem)}
	{@const customSnippet = resolveItemSnippet(proxy)}
	{@const handlers = createHandlers(proxy)}
	{@const itemType = proxy.type}
	{@const pathKey = getPathKey(item)}

	{#if itemType === 'separator'}
		{@render separator()}
	{:else if itemType === 'spacer'}
		{@render spacer()}
	{:else if customSnippet}
		<div data-toolbar-item-custom data-path={pathKey} data-disabled={proxy.disabled || undefined}>
			<svelte:boundary>
				{@render customSnippet(proxy.original as ToolbarItem, proxy.fields, handlers)}
				{#snippet failed()}
					{@render defaultItem(proxy, pathKey)}
				{/snippet}
			</svelte:boundary>
		</div>
	{:else}
		{@render defaultItem(proxy, pathKey)}
	{/if}
{/snippet}

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={containerRef}
	data-toolbar
	data-toolbar-position={position}
	data-toolbar-size={size}
	data-toolbar-sticky={sticky || undefined}
	data-toolbar-compact={compact || undefined}
	data-toolbar-disabled={disabled || undefined}
	class={className || undefined}
	role="toolbar"
	aria-label="Toolbar"
	aria-disabled={disabled || undefined}
	use:navigator={{ wrapper: controller, orientation }}
>
	{#if hasItems}
		<!-- Data-driven items -->
		{#each items as item, index (index)}
			{@const proxy = createProxy(item)}
			{@render renderItem(proxy, item)}
		{/each}
	{:else if hasSlots}
		<!-- Slot-based content -->
		{#if start}
			<div data-toolbar-section="start">
				{@render start()}
			</div>

			{#if showDividers && (center || end)}
				{@render divider()}
			{/if}
		{/if}

		{#if center}
			<div data-toolbar-section="center">
				{@render center()}
			</div>

			{#if showDividers && end}
				{@render divider()}
			{/if}
		{:else if !start && !end && children}
			<div data-toolbar-section="content">
				{@render children()}
			</div>
		{:else}
			<div data-toolbar-spacer></div>
		{/if}

		{#if end}
			<div data-toolbar-section="end">
				{@render end()}
			</div>
		{/if}
	{/if}
</div>
