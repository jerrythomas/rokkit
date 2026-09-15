<script lang="ts">
	/**
	 * Tree — Hierarchical data navigation with tree lines and keyboard navigation.
	 *
	 * Architecture:
	 *   LazyWrapper  — owns focusedKey $state + flatView $derived (with lineTypes)
	 *   Navigator    — attaches DOM event handlers, calls wrapper[action](path)
	 *   flatView     — single flat {#each}, connectors rendered from node.lineTypes
	 *
	 * Default item content: icon + label + badge + shortcut (no avatar/description).
	 * Parent nodes hide their icon by default (showIcon=false) so only the
	 * expand/collapse chevron + label are shown, aligning with leaf icon + label.
	 */
	import type { ProxyItem } from '@rokkit/states'
	import { LazyWrapper, ProxyTree, messages } from '@rokkit/states'
	import { Navigator } from '@rokkit/actions'
	import { DEFAULT_STATE_ICONS, resolveSnippet, ITEM_SNIPPET } from '@rokkit/core'
	import ItemContent from './ItemContent.svelte'
	import Connector from './Connector.svelte'
	import type { TreeProps } from '../types/tree.js'

	let {
		items = [],
		fields = {},
		value = $bindable(),
		size = 'md',
		lineStyle = 'solid',
		labels: userLabels = {},
		icons: userIcons = {},
		onselect,
		class: className = '',
		itemContent,
		groupContent,
		snippets = {}
	}: TreeProps = $props()

	// What resolveSnippet searches: the per-item named snippets plus the two
	// defaults it falls back to. Named snippets arrive as a declared `snippets`
	// prop now, so a misspelled prop name is a type error rather than a no-op.
	const snippetBag = $derived({ ...snippets, itemContent, groupContent })

	const labels = $derived({ ...messages.tree, ...userLabels })

	const icons = $derived({ ...DEFAULT_STATE_ICONS.folder, ...userIcons })

	/**
	 * The outbound half of `value` — see List's handleSelect for the full
	 * reasoning; the contract is identical. Skips disabled nodes, skips a write
	 * that wouldn't change anything, and writes before notifying so a consumer's
	 * own assignment in `onselect` still wins.
	 *
	 * Runs from a DOM event rather than an effect, so writing the prop here cannot
	 * re-enter the moveToValue effect below.
	 */
	function handleSelect(next: unknown, proxy: ProxyItem) {
		if (proxy.disabled) return
		if (next !== value) value = next
		onselect?.(next, proxy)
	}

	const proxyTree = $derived(new ProxyTree(items, fields))
	const wrapper = $derived(new LazyWrapper(proxyTree, { onselect: handleSelect }))

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

<div
	bind:this={treeRef}
	data-tree
	data-size={size}
	data-line-style={lineStyle}
	class={className || undefined}
	role="tree"
	tabindex="0"
	aria-label={labels.label}
>
	{#each wrapper.flatView as node (node.key)}
		{@const proxy = node.proxy}
		{@const isActive = proxy.value === value}
		{@const content = resolveSnippet(snippetBag, proxy, ITEM_SNIPPET)}

		<div
			data-tree-node
			data-tree-path={node.key}
			data-tree-level={node.level - 1}
			data-tree-has-children={node.isExpandable || undefined}
			data-active={isActive || undefined}
			role="treeitem"
			aria-expanded={node.isExpandable ? proxy.expanded : undefined}
			aria-selected={isActive}
			aria-level={node.level}
		>
			<div data-tree-node-row>
				{#each node.lineTypes as lineType, lineIndex (lineIndex)}
					{#if lineType === 'icon'}
						<button
							type="button"
							data-tree-toggle-btn
							onclick={() => wrapper.toggle(node.key)}
							aria-label={proxy.expanded ? labels.collapse : labels.expand}
							tabindex={-1}
						>
							<span class={proxy.expanded ? icons.opened : icons.closed} aria-hidden="true"></span>
						</button>
					{:else}
						<Connector type={lineType} />
					{/if}
				{/each}

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
</div>
