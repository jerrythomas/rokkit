<script lang="ts">
	/**
	 * Tabs — Wrapper + Navigator + ProxyItem implementation.
	 *
	 * Architecture:
	 *   Wrapper       — owns focusedKey $state + flatView $derived
	 *   Navigator     — attaches DOM event handlers, calls wrapper[action](path)
	 *                   owns focus + scrollIntoView after every keyboard action
	 *   flatView loop — single flat {#each} for tab triggers
	 *
	 * Snippet customization:
	 *   itemContent   — replaces inner content of <button> for tab triggers
	 *   tabPanel      — replaces panel content
	 *   [named]       — per-item override via item.snippet = 'name'; falls back to itemContent
	 *   empty         — rendered when no options
	 *
	 * Tab panels are rendered separately from triggers. Only the active panel
	 * receives data-panel-active. Navigator ignores panels (no data-path on them).
	 */
	// @ts-nocheck
	import type { TabsProps } from '../types/tabs.js'
	import type { ProxyItem } from '@rokkit/states'
	import { Wrapper, ProxyTree, messages } from '@rokkit/states'
	import { Navigator } from '@rokkit/actions'
	import { resolveSnippet, ITEM_SNIPPET, DEFAULT_STATE_ICONS } from '@rokkit/core'

	let {
		options = [],
		fields: userFields = {},
		value = $bindable(),
		orientation = 'horizontal',
		position = 'before',
		align = 'start',
		name = 'tabs',
		editable = false,
		placeholder = 'Select a tab to view its content.',
		disabled = false,
		labels: userLabels = {},
		class: className = '',
		onchange,
		onselect,
		onadd,
		onremove,
		...snippets
	}: TabsProps & { labels?: Record<string, string>; [key: string]: unknown } = $props()

	const labels = $derived({ ...messages.current.tabs, ...userLabels })

	// ─── Wrapper ──────────────────────────────────────────────────────────────

	const proxyTree = $derived(new ProxyTree(options, userFields))
	const wrapper = $derived(
		new Wrapper(proxyTree, {
			onchange: (v, proxy) => {
				value = v
				onchange?.(v, proxy)
			},
			onselect
		})
	)

	// ─── Navigator ────────────────────────────────────────────────────────────

	let containerRef = $state<HTMLElement | null>(null)

	$effect(() => {
		if (!containerRef) return
		const nav = new Navigator(containerRef, wrapper, { orientation })
		return () => nav.destroy()
	})

	// ─── Sync external value → focused key ────────────────────────────────────

	$effect(() => {
		wrapper.moveToValue(value)
	})

	// ─── Editable handlers ────────────────────────────────────────────────────

	function handleAdd() {
		onadd?.()
	}

	function handleRemove(proxy: ProxyItem) {
		onremove?.(proxy.value)
	}
</script>

{#snippet defaultTabContent(proxy: ProxyItem)}
	{#if proxy.get('icon')}
		<span data-tabs-icon class={proxy.get('icon')} aria-hidden="true"></span>
	{/if}
	<span data-tabs-label>{proxy.label}</span>
	{#if editable}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<span
			data-tabs-remove
			role="button"
			tabindex="-1"
			aria-label={labels.remove}
			onclick={(e) => { e.stopPropagation(); handleRemove(proxy) }}
			onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); handleRemove(proxy) } }}
		>
			<span class={DEFAULT_STATE_ICONS.action.close} aria-hidden="true"></span>
		</span>
	{/if}
{/snippet}

{#snippet defaultPanel(proxy: ProxyItem)}
	<div data-tabs-content>
		{proxy.get('content')}
	</div>
{/snippet}

{#snippet defaultEmpty()}
	No tabs available.
{/snippet}

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	bind:this={containerRef}
	data-tabs
	data-orientation={orientation}
	data-position={position}
	data-align={align}
	data-disabled={disabled || undefined}
	class={className || undefined}
	aria-label={name}
>
	{#if options.length === 0}
		<div data-tabs-empty>
			{#if snippets.empty}
				{@render snippets.empty()}
			{:else}
				{@render defaultEmpty()}
			{/if}
		</div>
	{:else}
		<div data-tabs-list role="tablist" aria-orientation={orientation}>
			{#each wrapper.flatView as node (node.key)}
				{@const proxy = node.proxy}
				{@const sel = proxy.value === value}
				{@const content = resolveSnippet(snippets, proxy, ITEM_SNIPPET)}

				<button
					type="button"
					data-tabs-trigger
					data-path={node.key}
					data-selected={sel || undefined}
					data-disabled={proxy.disabled || undefined}
					role="tab"
					aria-selected={sel}
					aria-label={proxy.get('label') || proxy.label}
					disabled={proxy.disabled || disabled}
				>
					{#if content}
						{@render content(proxy, sel)}
					{:else}
						{@render defaultTabContent(proxy)}
					{/if}
				</button>
			{/each}
			{#if editable}
				<button
					type="button"
					data-tabs-add
					aria-label={labels.add}
					onclick={handleAdd}
				>
					<span class="i-lucide:plus" aria-hidden="true"></span>
				</button>
			{/if}
		</div>

		{#each wrapper.flatView as node (node.key)}
			{@const proxy = node.proxy}
			{@const active = proxy.value === value}

			<div
				data-tabs-panel
				data-panel-active={active || undefined}
				role="tabpanel"
				id="tab-panel-{node.key}"
				aria-labelledby="tab-{node.key}"
			>
				{#if snippets.tabPanel}
					{@render snippets.tabPanel(proxy)}
				{:else}
					{@render defaultPanel(proxy)}
				{/if}
			</div>
		{/each}

		{#if value === undefined}
			<div data-tabs-placeholder>
				{placeholder}
			</div>
		{/if}
	{/if}
</div>
