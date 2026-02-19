<script lang="ts">
	import type {
		ToolbarProps,
		ToolbarItem,
		ToolbarItemSnippet,
		ToolbarItemHandlers
	} from '../types/toolbar.js'
	import { getSnippet } from '../types/menu.js'
	import { ItemProxy } from '../types/item-proxy.js'

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
	 * Create an ItemProxy for the given item
	 */
	function createProxy(item: ToolbarItem): ItemProxy {
		return new ItemProxy(item, userFields)
	}

	function handleItemClick(proxy: ItemProxy) {
		if (proxy.disabled || disabled) return
		onclick?.(proxy.itemValue, proxy.original as ToolbarItem)
	}

	function handleItemKeyDown(event: KeyboardEvent, proxy: ItemProxy) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			handleItemClick(proxy)
		}
	}

	/**
	 * Create handlers object for custom snippets
	 */
	function createHandlers(proxy: ItemProxy): ToolbarItemHandlers {
		return {
			onclick: () => handleItemClick(proxy),
			onkeydown: (event: KeyboardEvent) => handleItemKeyDown(event, proxy)
		}
	}

	/**
	 * Resolve which snippet to use for an item
	 */
	function resolveItemSnippet(proxy: ItemProxy): ToolbarItemSnippet | null {
		// Check for per-item snippet name
		const snippetName = proxy.snippetName
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

{#snippet defaultItem(proxy: ItemProxy, handlers: ToolbarItemHandlers)}
	<button
		type="button"
		data-toolbar-item
		data-active={proxy.active || undefined}
		data-disabled={proxy.disabled || undefined}
		disabled={proxy.disabled || disabled}
		aria-label={proxy.label}
		aria-pressed={proxy.active}
		title={proxy.shortcut ? `${proxy.text} (${proxy.shortcut})` : proxy.text}
		onclick={handlers.onclick}
		onkeydown={handlers.onkeydown}
	>
		{#if proxy.icon}
			<span data-toolbar-icon class={proxy.icon} aria-hidden="true"></span>
		{/if}
		{#if proxy.text && !proxy.icon}
			<span data-toolbar-label>{proxy.text}</span>
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

{#snippet renderItem(proxy: ItemProxy)}
	{@const customSnippet = resolveItemSnippet(proxy)}
	{@const handlers = createHandlers(proxy)}
	{@const itemType = proxy.itemType}

	{#if itemType === 'separator'}
		{@render separator()}
	{:else if itemType === 'spacer'}
		{@render spacer()}
	{:else if customSnippet}
		<div data-toolbar-item-custom data-disabled={proxy.disabled || undefined}>
			<svelte:boundary>
				{@render customSnippet(proxy.original as ToolbarItem, proxy.fields, handlers)}
				{#snippet failed()}
					{@render defaultItem(proxy, handlers)}
				{/snippet}
			</svelte:boundary>
		</div>
	{:else}
		{@render defaultItem(proxy, handlers)}
	{/if}
{/snippet}

<div
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
>
	{#if hasItems}
		<!-- Data-driven items -->
		{#each items as item, index (index)}
			{@const proxy = createProxy(item)}
			{@render renderItem(proxy)}
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
