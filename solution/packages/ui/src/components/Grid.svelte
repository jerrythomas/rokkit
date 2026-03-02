<script lang="ts">
	/**
	 * Grid — Responsive tile grid with Wrapper + Navigator horizontal navigation.
	 *
	 * Architecture:
	 *   Wrapper       — owns focusedKey $state + flatView $derived
	 *   Navigator     — attaches DOM event handlers, calls wrapper[action](path)
	 *                   horizontal orientation (ArrowLeft/ArrowRight navigation)
	 *   flatView loop — single flat {#each} rendering items as grid tiles
	 *
	 * Snippet customization:
	 *   itemContent   — replaces inner content of <button> for each tile
	 *   [named]       — per-item override via item.snippet = 'name'; falls back to itemContent
	 *
	 *   Snippets receive (proxy) only — the <button> wrapper with data-path is
	 *   always rendered by this component, so snippets never need to handle navigation.
	 *
	 * Data attributes on rendered elements:
	 *   data-grid           — root container
	 *   data-grid-item      — each tile button
	 *   data-path           — required by Navigator for click detection + scroll
	 *   data-active         — highlights current value match
	 *   data-disabled       — disabled state
	 *   data-size           — size variant
	 *
	 * CSS custom properties:
	 *   --grid-min-size     — minimum tile width for auto-fill
	 *   --grid-gap          — grid gap
	 */
	import type { ProxyItem } from '@rokkit/states'
	import { Wrapper, ProxyTree, messages } from '@rokkit/states'
	import { Navigator } from '@rokkit/actions'
	import { resolveSnippet, ITEM_SNIPPET } from '@rokkit/core'
	import ItemContent from './ItemContent.svelte'

	let {
		items = [],
		fields = {},
		value = $bindable(),
		size = 'md',
		disabled = false,
		minSize = '120px',
		gap = '1rem',
		label = messages.current.grid.label,
		onselect,
		class: className = '',
		...snippets
	}: {
		items?: unknown[]
		fields?: Record<string, string>
		value?: unknown
		size?: string
		disabled?: boolean
		minSize?: string
		gap?: string
		label?: string
		onselect?: (value: unknown, proxy: ProxyItem) => void
		class?: string
		[key: string]: unknown
	} = $props()

	// ─── Wrapper ──────────────────────────────────────────────────────────────

	const proxyTree = $derived(new ProxyTree(items, fields))
	const wrapper = $derived(new Wrapper(proxyTree, { onselect: handleSelect }))

	// ─── Navigator (horizontal) ───────────────────────────────────────────────

	let gridRef = $state<HTMLElement | null>(null)

	$effect(() => {
		if (!gridRef || disabled) return
		const dir = getComputedStyle(gridRef).direction || 'ltr'
		const nav = new Navigator(gridRef, wrapper, { orientation: 'horizontal', dir })
		return () => nav.destroy()
	})

	// ─── Sync external value → focused key ────────────────────────────────────

	$effect(() => {
		wrapper.moveToValue(value)
	})

	// ─── Selection handler ─────────────────────────────────────────────────────

	function handleSelect(extractedValue: unknown, proxy: ProxyItem) {
		if (proxy.disabled || disabled) return
		value = extractedValue
		onselect?.(extractedValue, proxy)
	}
</script>

<div
	bind:this={gridRef}
	data-grid
	data-size={size}
	data-disabled={disabled || undefined}
	class={className || undefined}
	role="grid"
	aria-label={label}
	style:--grid-min-size={minSize}
	style:--grid-gap={gap}
>
	{#each wrapper.flatView as node (node.key)}
		{@const proxy = node.proxy}
		{@const sel = proxy.value === value}
		{@const content = resolveSnippet(snippets as Record<string, unknown>, proxy, ITEM_SNIPPET)}
		<button
			type="button"
			data-grid-item
			data-path={node.key}
			data-active={sel || undefined}
			data-disabled={proxy.disabled || undefined}
			role="gridcell"
			aria-selected={sel}
			aria-label={proxy.label}
			disabled={proxy.disabled || disabled}
			tabindex="-1"
		>
			{#if content}
				{@render content(proxy)}
			{:else}
				<ItemContent {proxy} />
			{/if}
		</button>
	{/each}
</div>
