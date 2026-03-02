<script lang="ts">
	// @ts-nocheck
	/**
	 * LazyTree — Tree + lazy loading.
	 *
	 * Same as Tree but uses LazyProxyItem via createProxy factory
	 * so nodes with children: true fetch on expand.
	 *
	 * Default item content: icon + label + badge + shortcut (no avatar/description).
	 * Parent nodes hide their icon by default.
	 */
	import type { ProxyItem } from '@rokkit/states'
	import { LazyWrapper, LazyProxyItem, ProxyTree } from '@rokkit/states'
	import { Navigator } from '@rokkit/actions'
	import { DEFAULT_STATE_ICONS, resolveSnippet, ITEM_SNIPPET } from '@rokkit/core'
	import ItemContent from './ItemContent.svelte'
	import Connector from './Connector.svelte'

	let {
		items = [],
		fields = {},
		value,
		size = 'md',
		lineStyle = 'solid',
		icons: userIcons = {},
		onselect,
		onlazyload,
		hasMore = false,
		class: className = '',
		...snippets
	}: {
		items?: unknown[]
		fields?: Record<string, string>
		value?: unknown
		size?: string
		lineStyle?: 'none' | 'solid' | 'dashed' | 'dotted'
		icons?: { opened?: string; closed?: string }
		onselect?: (value: unknown, proxy: ProxyItem) => void
		onlazyload?: (current?: unknown) => Promise<unknown[]>
		hasMore?: boolean
		class?: string
		[key: string]: unknown
	} = $props()

	const icons = $derived({ ...DEFAULT_STATE_ICONS.folder, ...userIcons })


	const proxyTree = $derived(
		new ProxyTree(items, fields, {
			createProxy: (raw, f, key, level) =>
				new LazyProxyItem(raw, f, key, level, onlazyload
					? async (_value, rawItem) => onlazyload(rawItem)
					: null
				)
		})
	)
	const wrapper = $derived(new LazyWrapper(proxyTree, { onselect, onlazyload }))

	let treeRef = $state<HTMLElement | null>(null)

	$effect(() => {
		if (!treeRef) return
		const dir = getComputedStyle(treeRef).direction || 'ltr'
		const nav = new Navigator(treeRef, wrapper, { collapsible: true, dir })
		return () => nav.destroy()
	})

	$effect(() => {
		wrapper.moveToValue(value)
	})
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	bind:this={treeRef}
	data-tree
	data-size={size}
	data-line-style={lineStyle !== 'none' ? lineStyle : undefined}
	class={className || undefined}
	role="tree"
	tabindex="0"
	aria-label="Tree"
>
	{#each wrapper.flatView as node (node.key)}
		{@const proxy = node.proxy}
		{@const isActive = proxy.value === value}
		{@const isLoading = proxy.loading}
		{@const content = resolveSnippet(snippets, proxy, ITEM_SNIPPET)}

		<div
				data-tree-node
				data-tree-path={node.key}
				data-tree-level={node.level - 1}
				data-tree-has-children={node.isExpandable || undefined}
				data-tree-loading={isLoading || undefined}
				data-active={isActive || undefined}
				role="treeitem"
				aria-expanded={node.isExpandable ? proxy.expanded : undefined}
				aria-selected={isActive}
				aria-busy={isLoading || undefined}
				aria-level={node.level}
			>
				<div data-tree-node-row>
					{#if lineStyle !== 'none'}
						{#each node.lineTypes as lineType, lineIndex (lineIndex)}
							{#if lineType === 'icon'}
								<button
									type="button"
									data-tree-toggle-btn
									onclick={() => wrapper.toggle(node.key)}
									aria-label={isLoading ? 'Loading' : proxy.expanded ? 'Collapse' : 'Expand'}
									tabindex={-1}
								>
									{#if isLoading}
										<span data-tree-spinner aria-hidden="true"></span>
									{:else}
										<span class={proxy.expanded ? icons.opened : icons.closed} aria-hidden="true"></span>
									{/if}
								</button>
							{:else}
								<Connector type={lineType} />
							{/if}
						{/each}
					{:else}
						<span data-tree-indent style="width: {(node.level - 1) * 1.25}rem"></span>
						{#if node.isExpandable}
							<button
								type="button"
								data-tree-toggle-btn
								onclick={() => wrapper.toggle(node.key)}
								aria-label={isLoading ? 'Loading' : proxy.expanded ? 'Collapse' : 'Expand'}
								tabindex={-1}
							>
								{#if isLoading}
									<span data-tree-spinner aria-hidden="true"></span>
								{:else}
									<span class={proxy.expanded ? icons.opened : icons.closed} aria-hidden="true"></span>
								{/if}
							</button>
						{/if}
					{/if}

					{#if proxy.get('href')}
						<a
							href={proxy.get('href')}
							data-tree-item-content
							data-path={node.key}
							data-active={isActive || undefined}
							aria-label={proxy.label}
							aria-current={isActive ? 'page' : undefined}
						>
							{#if content}
								{@render content(proxy)}
							{:else}
								<ItemContent {proxy} showIcon={!node.isExpandable} showSubtext={false} />
							{/if}
						</a>
					{:else}
						<button
							type="button"
							data-tree-item-content
							data-path={node.key}
							data-active={isActive || undefined}
							aria-label={proxy.label}
						>
							{#if content}
								{@render content(proxy)}
							{:else}
								<ItemContent {proxy} showIcon={!node.isExpandable} showSubtext={false} />
							{/if}
						</button>
					{/if}
				</div>
			</div>
	{/each}
	{#if hasMore}
		<button
			type="button"
			data-tree-load-more
			onclick={() => wrapper.loadMore()}
		>
			Load More
		</button>
	{/if}
</div>
