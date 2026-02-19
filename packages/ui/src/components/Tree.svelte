<script lang="ts">
	import type {
		TreeProps,
		TreeItem,
		TreeItemSnippet,
		TreeItemHandlers,
		TreeFields,
		TreeLineType,
		TreeStateIcons
	} from '../types/tree.js'
	import {
		defaultTreeFields,
		defaultTreeStateIcons,
		getLineTypes,
		getNodeKey,
		getSnippet
	} from '../types/tree.js'
	import { ItemProxy } from '../types/item-proxy.js'
	import Connector from './Connector.svelte'
	import ItemContent from './ItemContent.svelte'

	let {
		items = [],
		fields: userFields,
		value = $bindable(),
		size = 'md',
		showLines = true,
		expanded = $bindable({}),
		expandAll = false,
		active,
		icons: userIcons,
		onselect,
		onexpandedchange,
		ontoggle,
		class: className = '',
		item: itemSnippet,
		toggle: toggleSnippet,
		connector: connectorSnippet,
		...snippets
	}: TreeProps & { [key: string]: TreeItemSnippet | unknown } = $props()

	// Merge fields with defaults
	const fields = $derived<TreeFields>({ ...defaultTreeFields, ...userFields })
	const icons = $derived<TreeStateIcons>({ ...defaultTreeStateIcons, ...userIcons })

	/**
	 * Create an ItemProxy for the given item
	 */
	function createProxy(item: TreeItem): ItemProxy {
		return new ItemProxy(item, fields)
	}

	// Internal expanded state management
	let internalExpanded = $state<Record<string, boolean>>({})

	// Use external expanded if provided, else internal
	const effectiveExpanded = $derived(Object.keys(expanded).length > 0 ? expanded : internalExpanded)

	/**
	 * Check if a node is expanded
	 */
	function isNodeExpanded(proxy: ItemProxy): boolean {
		const key = getNodeKey(proxy)
		// Check explicit state first
		if (key in effectiveExpanded) {
			return effectiveExpanded[key]
		}
		// Default to expandAll setting
		return expandAll
	}

	/**
	 * Toggle node expansion
	 */
	function toggleNode(proxy: ItemProxy) {
		if (!proxy.hasChildren) return

		const key = getNodeKey(proxy)
		const newState = !isNodeExpanded(proxy)

		if (Object.keys(expanded).length > 0) {
			// Using external state
			expanded = { ...expanded, [key]: newState }
			onexpandedchange?.(expanded)
		} else {
			// Using internal state
			internalExpanded = { ...internalExpanded, [key]: newState }
		}

		ontoggle?.(proxy.itemValue, proxy.original as TreeItem, newState)
	}

	/**
	 * Check if an item is currently active/selected
	 */
	function checkIsActive(proxy: ItemProxy): boolean {
		if (active !== undefined) {
			return proxy.itemValue === active
		}
		return value !== undefined && proxy.itemValue === value
	}

	/**
	 * Handle item selection
	 */
	function handleItemClick(proxy: ItemProxy) {
		value = proxy.itemValue
		onselect?.(proxy.itemValue, proxy.original as TreeItem)
	}

	/**
	 * Handle Enter/Space to select item
	 */
	function handleItemSelect(event: KeyboardEvent, proxy: ItemProxy) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			handleItemClick(proxy)
		}
	}

	/**
	 * Create handlers object for custom snippets
	 */
	function createHandlers(proxy: ItemProxy): TreeItemHandlers {
		return {
			onclick: () => handleItemClick(proxy),
			ontoggle: () => toggleNode(proxy),
			onkeydown: (event: KeyboardEvent) => handleItemSelect(event, proxy)
		}
	}

	// ==========================================================================
	// Flattened tree structure for rendering
	// ==========================================================================

	interface FlatNode {
		proxy: ItemProxy
		level: number
		lineTypes: TreeLineType[]
		path: string
		isLast: boolean
	}

	/**
	 * Flatten the tree into a list of visible nodes with their line types.
	 * Uses the same algorithm as @rokkit/ui NestedList.
	 *
	 * @param treeItems - Items at current level
	 * @param level - Current depth (0 = root)
	 * @param types - Line types inherited from parents (passed to getLineTypes)
	 * @param pathPrefix - Path prefix for generating unique keys
	 */
	function flattenTree(
		treeItems: TreeItem[],
		level: number = 0,
		types: TreeLineType[] = [],
		pathPrefix: string = ''
	): FlatNode[] {
		const result: FlatNode[] = []

		treeItems.forEach((item, index) => {
			const proxy = createProxy(item)
			const isLast = index === treeItems.length - 1
			const nodeType: 'child' | 'last' = isLast ? 'last' : 'child'
			const path = pathPrefix ? `${pathPrefix}-${index}` : String(index)

			// Calculate connectors using Rokkit algorithm
			// getLineTypes(hasChildren, parentTypes, position)
			const connectors = getLineTypes(proxy.hasChildren, types, nodeType)

			result.push({
				proxy,
				level,
				lineTypes: connectors,
				path,
				isLast
			})

			// If expanded, recurse into children with updated types
			if (proxy.hasChildren && isNodeExpanded(proxy)) {
				// Pass connectors as parent types for children
				const childNodes = flattenTree(proxy.children as TreeItem[], level + 1, connectors, path)
				result.push(...childNodes)
			}
		})

		return result
	}

	const flatNodes = $derived(flattenTree(items))

	// ==========================================================================
	// Keyboard Navigation
	// ==========================================================================

	let treeRef = $state<HTMLElement | null>(null)
	let focusedPath = $state<string | null>(null)

	/**
	 * Focus a node's item content by its path and scroll into view if needed
	 */
	function focusPath(path: string) {
		if (!treeRef) return
		focusedPath = path
		// Focus the item content button, not the node container
		const element = treeRef.querySelector(
			`[data-tree-node][data-tree-path="${path}"] [data-tree-item-content]`
		) as HTMLElement | null
		if (element) {
			element.focus()
			// Scroll into view with minimal movement
			element.scrollIntoView({ block: 'nearest', inline: 'nearest' })
		}
	}

	/**
	 * Handle focus events to track focused path
	 */
	function handleFocusIn(event: FocusEvent) {
		const target = event.target as HTMLElement
		// Find the parent node to get the path
		const node = target.closest('[data-tree-node]') as HTMLElement | null
		const path = node?.dataset.treePath
		if (path !== undefined) {
			focusedPath = path
		}
	}

	/**
	 * Handle keyboard navigation on item content
	 */
	function handleItemKeyDown(event: KeyboardEvent) {
		if (flatNodes.length === 0) return

		// If no focused path, initialize to first node
		if (!focusedPath) {
			if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
				event.preventDefault()
				focusPath(flatNodes[0]?.path ?? '0')
			}
			return
		}

		const currentIndex = flatNodes.findIndex((n) => n.path === focusedPath)
		if (currentIndex === -1) return

		const currentNode = flatNodes[currentIndex]

		switch (event.key) {
			case 'ArrowDown':
				event.preventDefault()
				if (currentIndex < flatNodes.length - 1) {
					focusPath(flatNodes[currentIndex + 1].path)
				}
				break

			case 'ArrowUp':
				event.preventDefault()
				if (currentIndex > 0) {
					focusPath(flatNodes[currentIndex - 1].path)
				}
				break

			case 'ArrowRight':
				event.preventDefault()
				if (currentNode.proxy.hasChildren) {
					if (!isNodeExpanded(currentNode.proxy)) {
						// Expand
						toggleNode(currentNode.proxy)
					} else {
						// Move to first child
						const nextIndex = currentIndex + 1
						if (nextIndex < flatNodes.length && flatNodes[nextIndex].level > currentNode.level) {
							focusPath(flatNodes[nextIndex].path)
						}
					}
				}
				break

			case 'ArrowLeft':
				event.preventDefault()
				if (currentNode.proxy.hasChildren && isNodeExpanded(currentNode.proxy)) {
					// Collapse
					toggleNode(currentNode.proxy)
				} else if (currentNode.level > 0) {
					// Move to parent
					const parentPath = currentNode.path.substring(0, currentNode.path.lastIndexOf('-'))
					if (parentPath) {
						focusPath(parentPath)
					}
				}
				break

			case 'Home':
				event.preventDefault()
				focusPath(flatNodes[0].path)
				break

			case 'End':
				event.preventDefault()
				focusPath(flatNodes[flatNodes.length - 1].path)
				break

			case 'Enter':
			case ' ':
				event.preventDefault()
				handleItemClick(currentNode.proxy)
				break
		}
	}

	/**
	 * Resolve which snippet to use for an item
	 */
	function resolveItemSnippet(proxy: ItemProxy): TreeItemSnippet | null {
		const snippetName = proxy.snippetName
		if (snippetName) {
			const namedSnippet = getSnippet(snippets, snippetName)
			if (namedSnippet) {
				return namedSnippet as TreeItemSnippet
			}
		}
		return itemSnippet ?? null
	}
</script>

{#snippet defaultToggle(isExpanded: boolean, hasChildren: boolean, stateIcons: TreeStateIcons)}
	<span data-tree-toggle data-tree-has-children={hasChildren || undefined}>
		{#if hasChildren}
			{#if isExpanded}
				<span class={stateIcons.expanded} aria-hidden="true"></span>
			{:else}
				<span class={stateIcons.collapsed} aria-hidden="true"></span>
			{/if}
		{:else if stateIcons.leaf}
			<span class={stateIcons.leaf} aria-hidden="true"></span>
		{/if}
	</span>
{/snippet}

{#snippet defaultItem(
	proxy: ItemProxy,
	handlers: TreeItemHandlers,
	isActive: boolean,
	_isExpanded: boolean,
	_level: number,
	_path: string
)}
	{@const href = proxy.get<string>('href')}
	{#if href}
		<a
			{href}
			data-tree-item-content
			data-active={isActive || undefined}
			aria-label={proxy.label}
			aria-current={isActive ? 'page' : undefined}
			onkeydown={handleItemKeyDown}
		>
			<ItemContent {proxy} />
		</a>
	{:else}
		<button
			type="button"
			data-tree-item-content
			data-active={isActive || undefined}
			aria-label={proxy.label}
			aria-pressed={isActive}
			onclick={handlers.onclick}
			onkeydown={handleItemKeyDown}
		>
			<ItemContent {proxy} />
		</button>
	{/if}
{/snippet}

{#snippet renderNode(node: FlatNode)}
	{@const proxy = node.proxy}
	{@const isActive = checkIsActive(proxy)}
	{@const isExpanded = isNodeExpanded(proxy)}
	{@const handlers = createHandlers(proxy)}
	{@const customSnippet = resolveItemSnippet(proxy)}

	<div
		data-tree-node
		data-tree-path={node.path}
		data-tree-level={node.level}
		data-tree-expanded={isExpanded || undefined}
		data-tree-has-children={proxy.hasChildren || undefined}
		data-active={isActive || undefined}
		role="treeitem"
		aria-expanded={proxy.hasChildren ? isExpanded : undefined}
		aria-selected={isActive}
		aria-level={node.level + 1}
	>
		<div data-tree-node-row>
			<!-- Tree lines/connectors -->
			{#if showLines}
				{#each node.lineTypes as lineType, lineIndex (lineIndex)}
					{#if lineType === 'icon'}
						<!-- Render toggle icon instead of connector -->
						<button
							type="button"
							data-tree-toggle-btn
							onclick={() => toggleNode(proxy)}
							aria-label={isExpanded ? 'Collapse' : 'Expand'}
							tabindex={-1}
						>
							{#if toggleSnippet}
								{@render toggleSnippet(isExpanded, proxy.hasChildren, icons)}
							{:else}
								{@render defaultToggle(isExpanded, proxy.hasChildren, icons)}
							{/if}
						</button>
					{:else if connectorSnippet}
						{@render connectorSnippet(lineType)}
					{:else}
						<Connector type={lineType} />
					{/if}
				{/each}
			{:else}
				<!-- No lines - just indent and toggle -->
				<span data-tree-indent style="width: {node.level * 1.25}rem"></span>
				<button
					type="button"
					data-tree-toggle-btn
					onclick={() => toggleNode(proxy)}
					aria-label={isExpanded ? 'Collapse' : 'Expand'}
					tabindex={-1}
				>
					{#if toggleSnippet}
						{@render toggleSnippet(isExpanded, proxy.hasChildren, icons)}
					{:else}
						{@render defaultToggle(isExpanded, proxy.hasChildren, icons)}
					{/if}
				</button>
			{/if}

			<!-- Node content -->
			{#if customSnippet}
				<svelte:boundary>
					{@render customSnippet(
						proxy.original as TreeItem,
						fields,
						handlers,
						isActive,
						isExpanded,
						node.level
					)}
					{#snippet failed()}
						{@render defaultItem(proxy, handlers, isActive, isExpanded, node.level, node.path)}
					{/snippet}
				</svelte:boundary>
			{:else}
				{@render defaultItem(proxy, handlers, isActive, isExpanded, node.level, node.path)}
			{/if}
		</div>
	</div>
{/snippet}

<div
	bind:this={treeRef}
	data-tree
	data-size={size}
	data-show-lines={showLines || undefined}
	class={className || undefined}
	role="tree"
	aria-label="Tree"
	onfocusin={handleFocusIn}
>
	{#each flatNodes as node (node.path)}
		{@render renderNode(node)}
	{/each}
</div>
