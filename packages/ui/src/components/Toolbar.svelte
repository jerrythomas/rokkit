<script lang="ts">
	import type {
		ToolbarProps,
		ToolbarItem,
		ToolbarItemSnippet,
		ToolbarItemHandlers
	} from '../types/toolbar.js'
	import { getSnippet } from '../types/menu.js'
	import { ProxyItem, ProxyTree, Wrapper, messages } from '@rokkit/states'
	import { Navigator } from '@rokkit/actions'

	const {
		items = [],
		fields: userFields,
		position = 'top',
		size = 'md',
		width = 'full',
		sticky = false,
		compact = false,
		showDividers = true,
		disabled = false,
		label = messages.toolbar.label,
		onclick,
		class: className = '',
		item: itemSnippet,
		start,
		center,
		end,
		children,
		...snippets
	}: ToolbarProps & { label?: string; [key: string]: ToolbarItemSnippet | unknown } = $props()

	/**
	 * Create a ProxyItem for the given item
	 */
	function createProxy(item: ToolbarItem): ProxyItem {
		return new ProxyItem(item, userFields)
	}

	// ─── Wrapper + Navigator ────────────────────────────────────

	const orientation = $derived<'horizontal' | 'vertical'>(
		position === 'left' || position === 'right' ? 'vertical' : 'horizontal'
	)

	function handleItemClick(proxy: ProxyItem) {
		if (proxy.disabled || disabled) return
		onclick?.(proxy.value, proxy.original as ToolbarItem)
	}

	const proxyTree = $derived(new ProxyTree(items, userFields))
	const wrapper = $derived(
		new Wrapper(proxyTree, {
			onselect: (_value: unknown, proxy: ProxyItem) => handleItemClick(proxy),
			collapsible: false
		})
	)

	let containerRef: HTMLElement | null = $state(null)

	// Mount Navigator on the root; destroy + re-mount when wrapper recreates.
	$effect(() => {
		if (!containerRef) return
		const w = wrapper
		const dir = getComputedStyle(containerRef).direction === 'rtl' ? 'rtl' : 'ltr'
		const nav = new Navigator(containerRef, w, { orientation, dir })
		// Park focus on the first interactive item so Tab into the toolbar lands there.
		w.first(null)
		return () => nav.destroy()
	})

	// ─── Item Handlers ─────────────────────────────────────────────

	/**
	 * Handlers passed to custom snippets so they can wire click/keydown
	 * back through the toolbar's onclick + disabled semantics.
	 */
	function createHandlers(proxy: ProxyItem): ToolbarItemHandlers {
		return {
			onclick: () => handleItemClick(proxy),
			onkeydown: (event: KeyboardEvent) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault()
					handleItemClick(proxy)
				}
			}
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

{#snippet renderItem(proxy: ProxyItem, pathKey: string)}
	{@const customSnippet = resolveItemSnippet(proxy)}
	{@const handlers = createHandlers(proxy)}
	{@const itemType = proxy.type}

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

<div
	bind:this={containerRef}
	data-toolbar
	data-toolbar-position={position}
	data-toolbar-size={size}
	data-toolbar-width={width === 'fit' ? 'fit' : undefined}
	data-toolbar-sticky={sticky || undefined}
	data-toolbar-compact={compact || undefined}
	data-toolbar-disabled={disabled || undefined}
	class={className || undefined}
	role="toolbar"
	aria-label={label}
	aria-disabled={disabled || undefined}
>
	{#if hasItems}
		<!-- Data-driven items -->
		{#each items as item, index (index)}
			{@const proxy = createProxy(item)}
			{@render renderItem(proxy, String(index))}
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
