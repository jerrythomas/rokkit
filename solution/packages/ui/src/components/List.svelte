<script lang="ts">
	/**
	 * List — ProxyItem + Wrapper + Navigator implementation.
	 *
	 * Architecture:
	 *   Wrapper       — owns focusedKey $state + flatView $derived
	 *   Navigator     — attaches DOM event handlers, calls wrapper[action](path)
	 *                   owns focus + scrollIntoView after every keyboard action
	 *   flatView loop — single flat {#each}, no nested groups in template
	 *
	 * Snippet customization:
	 *   itemContent   — replaces inner content of <a>/<button> for leaf items
	 *   groupContent  — replaces inner content of group header <button>
	 *   [named]       — per-item override via item.snippet = 'name'; falls back to itemContent
	 *
	 *   Snippets receive (proxy) only — the <a>/<button> wrapper with data-path is
	 *   always rendered by this component, so snippets never need to handle navigation.
	 *
	 * Data attributes on rendered elements:
	 *   data-path              — required by Navigator for click detection + scroll
	 *   data-level             — nesting depth (1=root); theme CSS uses for indentation
	 *   data-accordion-trigger — tells Navigator to dispatch toggle (not select) on click
	 *   data-list-item         — theme hook for leaf items
	 *   data-list-item-icon    — icon span inside leaf items
	 *   data-list-group        — theme hook for group headers
	 *   data-list-group-icon   — icon span inside group headers
	 *   data-active            — highlights current value match
	 *   data-disabled          — disabled state
	 */
	import type { ProxyItem } from '@rokkit/states'
	import { Wrapper } from '@rokkit/states'
	import { Navigator } from '@rokkit/actions'
	import { DEFAULT_STATE_ICONS, resolveSnippet, ITEM_SNIPPET, GROUP_SNIPPET } from '@rokkit/core'

	interface ListIcons {
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
		icons: userIcons = {} as ListIcons,
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
		icons?: ListIcons
		onselect?: (value: unknown, proxy: ProxyItem) => void
		class?: string
		[key: string]: unknown
	} = $props()

	const icons = $derived({ ...DEFAULT_STATE_ICONS.accordion, ...userIcons })

	// Single source of truth.
	// Navigator calls wrapper[action](path) → focusedKey / proxy.expanded updates →
	// flatView $derived re-computes → Svelte re-renders the changed nodes.
	const wrapper = $derived(new Wrapper(items, fields, { onselect }))

	let listRef = $state<HTMLElement | null>(null)

	// Mount Navigator on the root element; destroy when component unmounts.
	$effect(() => {
		if (!listRef) return
		const dir = getComputedStyle(listRef).direction || 'ltr'
		const nav = new Navigator(listRef, wrapper, { collapsible, dir })
		return () => nav.destroy()
	})

	// ─── Sync external value → focused key ────────────────────────────────────

	$effect(() => {
		wrapper.moveToValue(value)
	})

</script>

<!--
	Default content for leaf items (icon + text).
	Used when no itemContent snippet or per-item snippet is provided.
-->
{#snippet defaultItemContent(proxy: ProxyItem)}
	{#if proxy.get('icon')}
		<span data-list-item-icon class={proxy.get('icon')} aria-hidden="true"></span>
	{/if}
	<span data-list-item-text>{proxy.text}</span>
{/snippet}

<!--
	Default content for group headers (icon + text + expand chevron).
	Used when no groupContent snippet is provided.
-->
{#snippet defaultGroupContent(proxy: ProxyItem)}
	{#if proxy.get('icon')}
		<span data-list-group-icon class={proxy.get('icon')} aria-hidden="true"></span>
	{/if}
	<span data-list-group-text>{proxy.text}</span>
	{#if collapsible}
		<span
			data-list-expand-icon
			class={proxy.expanded ? icons.opened : icons.closed}
			aria-hidden="true"
		></span>
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
>
	{#each wrapper.flatView as node (node.key)}
		{@const proxy = node.proxy}
		{@const isActive = proxy.value === value}
		{@const content = resolveSnippet(snippets as Record<string, unknown>, proxy, node.hasChildren ? GROUP_SNIPPET : ITEM_SNIPPET)}

		{#if node.type === 'separator'}
			<hr data-list-separator role="separator" />
		{:else if node.type === 'spacer'}
			<div data-list-spacer></div>
		{:else if node.hasChildren}
			<!--
				Group header — data-accordion-trigger tells Navigator to dispatch
				toggle() instead of select() when this element is clicked.
				aria-expanded reflects the reactive proxy.expanded state.
			-->
			<button
				type="button"
				data-list-group
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
		{:else if proxy.get('href')}
			<!--
				Navigation link — native <a> handles click; Navigator updates state.
				aria-current marks the active route for screen readers.
			-->
			<a
				href={proxy.get('href')}
				title={proxy.get('title')}
				data-list-item
				data-path={node.key}
				data-level={node.level}
				data-active={isActive || undefined}
				aria-current={isActive ? 'page' : undefined}
			>
				{#if content}
					{@render content(proxy)}
				{:else}
					{@render defaultItemContent(proxy)}
				{/if}
			</a>
		{:else}
			<!--
				Button item — Navigator calls wrapper.select(path) on click/Enter/Space.
				The wrapper fires the onselect callback for non-group items.
			-->
			<button
				type="button"
				title={proxy.get('title')}
				data-list-item
				data-path={node.key}
				data-level={node.level}
				data-active={isActive || undefined}
				data-disabled={proxy.disabled || undefined}
				disabled={proxy.disabled || disabled}
			>
				{#if content}
					{@render content(proxy)}
				{:else}
					{@render defaultItemContent(proxy)}
				{/if}
			</button>
		{/if}
	{/each}
</nav>
