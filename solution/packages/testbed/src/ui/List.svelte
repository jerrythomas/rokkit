<script>
	/**
	 * List — reference implementation using the ProxyItem + Wrapper + Navigator stack.
	 *
	 * This is the testbed prototype. When proven, it replaces packages/ui/src/components/List.svelte.
	 *
	 * Architecture:
	 *   Wrapper       — owns focusedKey $state + flatView $derived, implements IWrapper
	 *   use:navigator — attaches DOM event handlers, calls wrapper[action](path)
	 *   flatView loop — single flat {#each}, no nested groups in template
	 *   Navigator     — owns focus + scrollIntoView after every keyboard action
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
	 *   data-level             — nesting depth (1=root); CSS uses for indentation
	 *   data-accordion-trigger — tells Navigator to dispatch toggle (not select) on click
	 *   data-list-item         — theme hook for leaf items
	 *   data-list-group  — theme hook for group headers
	 *   data-active            — highlights current value match
	 *   data-disabled          — disabled state
	 */

	import { Wrapper } from '../wrapper/wrapper.svelte.js'
	import { navigator } from '../navigator/navigator.js'
	import { resolveSnippet } from '../snippets.js'
	import { DEFAULT_LIST_ICONS } from '../constants.js'

	/** @type {{
	 *   items?: unknown[],
	 *   fields?: Record<string, string>,
	 *   value?: unknown,
	 *   collapsible?: boolean,
	 *   icons?: { opened?: string, closed?: string },
	 *   onselect?: (value: unknown, proxy: import('../proxy/proxy.svelte.js').ProxyItem) => void,
	 *   class?: string,
	 *   [key: string]: unknown
	 * }} */
	let {
		items = [],
		fields = {},
		value,
		collapsible = false,
		icons: userIcons = {},
		onselect,
		class: className = '',
		...snippets
	} = $props()

	const icons = $derived({ ...DEFAULT_LIST_ICONS, ...userIcons })

	// Single source of truth.
	// Navigator calls wrapper[action](path) → focusedKey / proxy.expanded updates →
	// flatView $derived re-computes → Svelte re-renders the changed nodes.
	const wrapper = new Wrapper(items, fields, { onselect })

	let listRef = $state(null)

</script>

<!--
	Default content for leaf items (icon + text).
	Used when no itemContent snippet or per-item snippet is provided.
-->
{#snippet defaultItemContent(proxy)}
	{#if proxy.icon}
		<span class={proxy.icon} aria-hidden="true"></span>
	{/if}
	<span data-list-item-text>{proxy.text}</span>
{/snippet}

<!--
	Default content for group headers (icon + text + expand chevron).
	Used when no groupContent snippet is provided.
-->
{#snippet defaultGroupContent(proxy)}
	{#if proxy.icon}
		<span class={proxy.icon} aria-hidden="true"></span>
	{/if}
	<span data-list-group-text>{proxy.text}</span>
	{#if collapsible}
		<span data-list-expand-icon class={proxy.expanded ? icons.opened : icons.closed} aria-hidden="true"></span>
	{/if}
{/snippet}

<nav
	bind:this={listRef}
	data-list
	class={className || undefined}
	use:navigator={{ wrapper, collapsible }}
>
	{#each wrapper.flatView as node (node.key)}
		{@const proxy = node.proxy}
		{@const isActive = proxy.value === value}
		{@const content = resolveSnippet(snippets, proxy, node.hasChildren ? 'groupContent' : 'itemContent')}

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
		{:else if proxy.href}
			<!--
				Navigation link — native <a> handles click; Navigator updates state.
				aria-current marks the active route for screen readers.
			-->
			<a
				href={proxy.href}
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
				data-list-item
				data-path={node.key}
				data-level={node.level}
				data-active={isActive || undefined}
				data-disabled={proxy.disabled || undefined}
				disabled={proxy.disabled}
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
