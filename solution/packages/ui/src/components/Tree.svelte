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
	import { NestedController } from '@rokkit/states'
	import { navigator } from '@rokkit/actions'
	import { untrack } from 'svelte'

	let {
		items = [],
		fields: userFields,
		value = $bindable(),
		size = 'md',
		showLines = true,
		multiselect = false,
		expanded = $bindable({}),
		selected = $bindable([]),
		expandAll = false,
		active,
		icons: userIcons,
		onselect,
		onselectedchange,
		onexpandedchange,
		ontoggle,
		onloadchildren,
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

	// ─── NestedController for keyboard navigation ───────────────────

	let controller = untrack(() => new NestedController(items, value, userFields, { multiselect }))
	let treeRef = $state<HTMLElement | null>(null)
	let loadingPaths = $state(new Set<string>())
	let loadVersion = $state(0)

	/**
	 * Get expanded state for a node key from the expanded prop.
	 * Default to expandAll setting when not explicitly set.
	 */
	function getExpandedState(nodeKey: string): boolean {
		const externalKeys = Object.keys(expanded)
		if (externalKeys.length > 0) {
			if (nodeKey in expanded) return expanded[nodeKey]
		}
		return expandAll
	}

	/**
	 * Sync expansion state: expanded prop + expandAll → controller.expandedKeys
	 */
	function syncExpandedToController() {
		for (const [key, proxy] of controller.lookup.entries()) {
			if (!proxy.hasChildren) continue
			const itemProxy = createProxy(proxy.value)
			const nodeKey = getNodeKey(itemProxy)
			const shouldExpand = getExpandedState(nodeKey)
			if (shouldExpand) {
				controller.expandedKeys.add(key)
			} else {
				controller.expandedKeys.delete(key)
			}
		}
	}

	// Sync on init
	syncExpandedToController()

	$effect(() => {
		controller.update(items)
		syncExpandedToController()
	})

	// Sync expanded prop / expandAll changes → controller
	$effect(() => {
		void expanded
		void expandAll
		syncExpandedToController()
	})

	/**
	 * Derive expanded prop from controller.expandedKeys (pathKey → nodeKey mapping)
	 */
	function deriveExpandedFromController(): Record<string, boolean> {
		const result: Record<string, boolean> = {}
		function walk(treeItems: TreeItem[], pathPrefix: string) {
			treeItems.forEach((item, index) => {
				const proxy = createProxy(item)
				if (!proxy.hasChildren) return
				const pathKey = pathPrefix ? `${pathPrefix}-${index}` : String(index)
				const nodeKey = getNodeKey(proxy)
				result[nodeKey] = controller.expandedKeys.has(pathKey)
				if (controller.expandedKeys.has(pathKey)) {
					walk(proxy.children as TreeItem[], pathKey)
				}
			})
		}
		walk(items, '')
		return result
	}

	// Focus the element matching controller.focusedKey on navigator action events
	$effect(() => {
		if (!treeRef) return
		const el = treeRef

		function onAction(event: Event) {
			const detail = (event as CustomEvent).detail

			if (detail.name === 'move') {
				const key = controller.focusedKey
				if (key) {
					const target = el.querySelector(`[data-path="${key}"]`) as HTMLElement | null
					if (target && target !== document.activeElement) {
						target.focus()
						target.scrollIntoView?.({ block: 'nearest', inline: 'nearest' })
					}
				}
			}

			if (detail.name === 'select') {
				handleSelectAction()
				syncSelectedFromController()
			}

			if (detail.name === 'toggle') {
				// Controller already toggled expandedKeys. Derive the expanded prop.
				handleToggleAction()
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
		const href = itemProxy.get<string>('href')
		if (!href) {
			onselect?.(itemProxy.itemValue, proxy.value as TreeItem)
		}
	}

	/**
	 * Handle the navigator's toggle action (ArrowLeft collapse / ArrowRight expand)
	 */
	function handleToggleAction() {
		const key = controller.focusedKey
		if (!key) return

		const proxy = controller.lookup.get(key)
		if (!proxy) return

		const itemProxy = createProxy(proxy.value)
		const isExpanded = controller.expandedKeys.has(key)
		const newExpanded = deriveExpandedFromController()
		expanded = newExpanded
		onexpandedchange?.(newExpanded)
		ontoggle?.(itemProxy.itemValue, proxy.value as TreeItem, isExpanded)
	}

	// ─── Lazy loading helpers ──────────────────────────────────────

	/**
	 * Load children for a lazy node (children: true → children: [...]).
	 * Returns true if children were loaded successfully.
	 */
	async function loadLazyChildren(pathKey: string): Promise<boolean> {
		const proxy = controller.lookup.get(pathKey)
		if (!proxy) return false
		const itemProxy = createProxy(proxy.value)
		if (!itemProxy.canLoadChildren || !onloadchildren) return false

		loadingPaths = new Set([...loadingPaths, pathKey])
		try {
			const children = await onloadchildren(itemProxy.itemValue, proxy.value as TreeItem)
			const childrenField = fields.children ?? 'children'
			;(proxy.value as Record<string, unknown>)[childrenField] = children
			controller.update(items)
			syncExpandedToController()
			loadVersion++
		} catch {
			loadingPaths = new Set([...loadingPaths].filter((p) => p !== pathKey))
			return false
		}
		loadingPaths = new Set([...loadingPaths].filter((p) => p !== pathKey))
		return true
	}

	/**
	 * Toggle expansion of a node by its path key (for toggle button clicks)
	 */
	async function toggleNodeByKey(pathKey: string) {
		// Collapsing — toggle normally
		if (controller.expandedKeys.has(pathKey)) {
			controller.toggleExpansion(pathKey)
			const proxy = controller.lookup.get(pathKey)
			if (!proxy) return
			const itemProxy = createProxy(proxy.value)
			const newExpanded = deriveExpandedFromController()
			expanded = newExpanded
			onexpandedchange?.(newExpanded)
			ontoggle?.(itemProxy.itemValue, proxy.value as TreeItem, false)
			return
		}

		// Expanding — check if lazy load is needed
		const proxy = controller.lookup.get(pathKey)
		let lazyLoaded = false
		if (proxy) {
			const itemProxy = createProxy(proxy.value)
			if (itemProxy.canLoadChildren && onloadchildren) {
				const loaded = await loadLazyChildren(pathKey)
				if (!loaded) return // Error — stay collapsed
				lazyLoaded = true
			}
		}

		// After lazy load, syncExpandedToController may have already expanded the node
		// (e.g. when expandAll=true). Only toggle if not already expanded.
		if (!lazyLoaded || !controller.expandedKeys.has(pathKey)) {
			controller.toggleExpansion(pathKey)
		}
		const updatedProxy = controller.lookup.get(pathKey)
		if (!updatedProxy) return
		const updatedItemProxy = createProxy(updatedProxy.value)
		const isExpanded = controller.expandedKeys.has(pathKey)
		const newExpanded = deriveExpandedFromController()
		expanded = newExpanded
		onexpandedchange?.(newExpanded)
		ontoggle?.(updatedItemProxy.itemValue, updatedProxy.value as TreeItem, isExpanded)
	}

	/**
	 * Sync DOM focus to controller state
	 */
	function handleFocusIn(event: FocusEvent) {
		const target = event.target as HTMLElement
		if (!target) return
		const path = target.dataset.path
		if (path !== undefined) {
			controller.moveTo(path)
		}
	}

	/**
	 * Handle keyboard events the navigator doesn't cover:
	 * - Enter/Space on link items: let native <a> behavior through
	 * - ArrowRight on lazy nodes: trigger async load before expand
	 */
	function handleTreeKeyDown(event: KeyboardEvent) {
		// ArrowRight on lazy node: intercept before navigator
		if (event.key === 'ArrowRight') {
			const key = controller.focusedKey
			if (!key) return
			const proxy = controller.lookup.get(key)
			if (!proxy) return
			const itemProxy = createProxy(proxy.value)
			if (itemProxy.canLoadChildren && onloadchildren) {
				event.preventDefault()
				event.stopPropagation()
				loadLazyChildren(key).then((loaded) => {
					if (loaded) {
						controller.expand(key)
						handleToggleAction()
						const target = treeRef?.querySelector(`[data-path="${key}"]`) as HTMLElement
						target?.focus()
					}
				})
				return
			}
		}

		if (event.key !== 'Enter' && event.key !== ' ') return

		const key = controller.focusedKey
		if (!key) return

		const proxy = controller.lookup.get(key)
		if (!proxy) return

		const itemProxy = createProxy(proxy.value)
		const href = itemProxy.get<string>('href')
		if (href) {
			event.stopPropagation()
		}
	}

	// ─── Multi-selection helpers ────────────────────────────────────

	/**
	 * Sync the selected bindable prop from controller.selected
	 */
	function syncSelectedFromController() {
		if (!multiselect) return
		selected = [...controller.selected]
		onselectedchange?.(selected)
	}

	/**
	 * Check if an item is in the current selection (for data-selected attribute)
	 */
	function isItemSelected(pathKey: string): boolean {
		if (!multiselect) return false
		return controller.selectedKeys.has(pathKey)
	}

	// ─── Check active ──────────────────────────────────────────────

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
	 * Handle item click (for button items)
	 */
	function handleItemClick(proxy: ItemProxy) {
		value = proxy.itemValue
		onselect?.(proxy.itemValue, proxy.original as TreeItem)
	}

	/**
	 * Create handlers object for custom snippets
	 */
	function createHandlers(proxy: ItemProxy, pathKey: string): TreeItemHandlers {
		return {
			onclick: () => handleItemClick(proxy),
			ontoggle: () => toggleNodeByKey(pathKey),
			onkeydown: (event: KeyboardEvent) => {
				if (event.key === 'Enter' || event.key === ' ') {
					event.preventDefault()
					event.stopPropagation()
					handleItemClick(proxy)
				}
			}
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
		isExpandable: boolean
	}

	/**
	 * Flatten the tree into a list of visible nodes with their line types.
	 * Reads expansion state from controller.expandedKeys.
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
			const isExpandable = proxy.hasChildren || proxy.canLoadChildren

			const connectors = getLineTypes(isExpandable, types, nodeType)

			result.push({
				proxy,
				level,
				lineTypes: connectors,
				path,
				isLast,
				isExpandable
			})

			// If expanded (read from controller), recurse into children
			if (proxy.hasChildren && controller.expandedKeys.has(path)) {
				const childNodes = flattenTree(proxy.children as TreeItem[], level + 1, connectors, path)
				result.push(...childNodes)
			}
		})

		return result
	}

	 
	const flatNodes = $derived((void loadVersion, flattenTree(items)))

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
				<span class={stateIcons.opened} aria-hidden="true"></span>
			{:else}
				<span class={stateIcons.closed} aria-hidden="true"></span>
			{/if}
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
			data-path={_path}
			data-active={isActive || undefined}
			aria-label={proxy.label}
			aria-current={isActive ? 'page' : undefined}
		>
			<ItemContent {proxy} />
		</a>
	{:else}
		<button
			type="button"
			data-tree-item-content
			data-path={_path}
			data-active={isActive || undefined}
			aria-label={proxy.label}
			aria-pressed={isActive}
			onkeydown={handlers.onkeydown}
		>
			<ItemContent {proxy} />
		</button>
	{/if}
{/snippet}

{#snippet renderNode(node: FlatNode)}
	{@const proxy = node.proxy}
	{@const isActive = checkIsActive(proxy)}
	{@const nodeSelected = isItemSelected(node.path)}
	{@const isExpanded = controller.expandedKeys.has(node.path)}
	{@const isLoading = loadingPaths.has(node.path)}
	{@const handlers = createHandlers(proxy, node.path)}
	{@const customSnippet = resolveItemSnippet(proxy)}

	<div
		data-tree-node
		data-tree-path={node.path}
		data-tree-level={node.level}
		data-tree-expanded={isExpanded || undefined}
		data-tree-has-children={node.isExpandable || undefined}
		data-tree-loading={isLoading || undefined}
		data-active={isActive || undefined}
		data-selected={nodeSelected || undefined}
		role="treeitem"
		aria-expanded={node.isExpandable ? isExpanded : undefined}
		aria-selected={multiselect ? nodeSelected : isActive}
		aria-busy={isLoading || undefined}
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
							onclick={() => toggleNodeByKey(node.path)}
							aria-label={isLoading ? 'Loading' : isExpanded ? 'Collapse' : 'Expand'}
							tabindex={-1}
						>
							{#if isLoading}
								<span data-tree-spinner aria-hidden="true"></span>
							{:else if toggleSnippet}
								{@render toggleSnippet(isExpanded, node.isExpandable, icons)}
							{:else}
								{@render defaultToggle(isExpanded, node.isExpandable, icons)}
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
					onclick={() => toggleNodeByKey(node.path)}
					aria-label={isLoading ? 'Loading' : isExpanded ? 'Collapse' : 'Expand'}
					tabindex={-1}
				>
					{#if isLoading}
						<span data-tree-spinner aria-hidden="true"></span>
					{:else if toggleSnippet}
						{@render toggleSnippet(isExpanded, node.isExpandable, icons)}
					{:else}
						{@render defaultToggle(isExpanded, node.isExpandable, icons)}
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

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<div
	bind:this={treeRef}
	data-tree
	data-size={size}
	data-show-lines={showLines || undefined}
	data-multiselect={multiselect || undefined}
	class={className || undefined}
	role="tree"
	aria-label="Tree"
	aria-multiselectable={multiselect || undefined}
	onkeydown={handleTreeKeyDown}
	onfocusin={handleFocusIn}
	use:navigator={{ wrapper: controller, orientation: 'vertical', nested: true, typeahead: true }}
>
	{#each flatNodes as node (node.path)}
		{@render renderNode(node)}
	{/each}
</div>
