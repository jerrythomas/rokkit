<script lang="ts">
	import type { TabsProps, TabsItem, TabsItemHandlers } from '../types/tabs.js'
	import { ItemProxy } from '../types/item-proxy.js'
	import { ListController } from '@rokkit/states'
	import { navigator } from '@rokkit/actions'
	import { untrack } from 'svelte'

	let {
		options = [],
		fields: userFields,
		value = $bindable(),
		orientation = 'horizontal',
		position = 'before',
		align = 'start',
		name = 'tabs',
		editable = false,
		placeholder = 'Select a tab to view its content.',
		disabled = false,
		class: className = '',
		onchange,
		onselect,
		onadd,
		onremove,
		tabItem: tabItemSnippet,
		tabPanel: tabPanelSnippet,
		empty: emptySnippet
	}: TabsProps = $props()

	/** Content field name from user fields or default */
	const contentField = $derived((userFields as Record<string, string> | undefined)?.content ?? 'content')

	let controller = untrack(() => new ListController(options, value, userFields))
	let containerRef: HTMLElement | null = $state(null)
	let lastSyncedValue: unknown = value

	$effect(() => {
		controller.update(options)
	})

	// Sync controller focus when value changes externally
	$effect(() => {
		if (value !== lastSyncedValue) {
			lastSyncedValue = value
			controller.moveToValue(value)
		}
	})

	// Focus the tab matching controller.focusedKey on navigator move events
	$effect(() => {
		if (!containerRef) return
		const el = containerRef

		function handleAction(event: Event) {
			const detail = (event as CustomEvent).detail

			if (detail.name === 'move') {
				const key = controller.focusedKey
				if (key) {
					const target = el.querySelector(`[data-path="${key}"]`) as HTMLElement | null
					if (target && target !== document.activeElement) {
						target.focus()
					}
				}
			}

			if (detail.name === 'select') {
				handleSelectAction()
			}
		}

		el.addEventListener('action', handleAction)
		return () => el.removeEventListener('action', handleAction)
	})

	/**
	 * Create an ItemProxy for the given item
	 */
	function createProxy(item: TabsItem): ItemProxy {
		return new ItemProxy(item, userFields)
	}

	/**
	 * Check if an item is currently selected
	 */
	function isSelected(proxy: ItemProxy): boolean {
		return proxy.itemValue === value
	}

	/**
	 * Handle tab selection via navigator select action
	 */
	function handleSelectAction() {
		const key = controller.focusedKey
		if (!key) return

		const proxy = controller.lookup.get(key)
		if (!proxy) return

		const itemProxy = createProxy(proxy.value)
		selectTab(itemProxy)
	}

	/**
	 * Select a tab by its proxy
	 */
	function selectTab(proxy: ItemProxy) {
		if (proxy.disabled || disabled) return
		const itemValue = proxy.itemValue
		if (itemValue !== value) {
			value = itemValue
			lastSyncedValue = itemValue
			controller.moveToValue(itemValue)
			onchange?.(itemValue, proxy.original as TabsItem)
		}
		onselect?.(itemValue, proxy.original as TabsItem)
	}

	/**
	 * Handle keyboard events on individual tabs (Enter/Space)
	 */
	function handleKeyDown(event: KeyboardEvent, proxy: ItemProxy) {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			selectTab(proxy)
		}
	}

	/**
	 * Create handlers object for custom snippets
	 */
	function createHandlers(proxy: ItemProxy): TabsItemHandlers {
		return {
			onclick: () => selectTab(proxy),
			onkeydown: (event: KeyboardEvent) => handleKeyDown(event, proxy)
		}
	}

	function handleAdd() {
		onadd?.()
	}

	function handleRemove(proxy: ItemProxy) {
		onremove?.(proxy.itemValue)
	}

	/**
	 * Get the panel content for a tab item
	 */
	function getContent(item: TabsItem): unknown {
		return item[contentField]
	}
</script>

{#snippet defaultTabItem(proxy: ItemProxy, handlers: TabsItemHandlers, selected: boolean, key: string)}
	<button
		type="button"
		data-tabs-trigger
		data-path={key}
		data-selected={selected || undefined}
		data-disabled={proxy.disabled || undefined}
		role="tab"
		aria-selected={selected}
		aria-label={proxy.label}
		disabled={proxy.disabled || disabled}
		onkeydown={handlers.onkeydown}
	>
		{#if proxy.icon}
			<span data-tabs-icon class={proxy.icon} aria-hidden="true"></span>
		{/if}
		<span data-tabs-label>{proxy.text}</span>
		{#if editable}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<span
				data-tabs-remove
				role="button"
				tabindex="-1"
				aria-label="Remove tab"
				onclick={(e) => { e.stopPropagation(); handleRemove(proxy) }}
				onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); e.preventDefault(); handleRemove(proxy) } }}
			>
				<span class="i-lucide:x" aria-hidden="true"></span>
			</span>
		{/if}
	</button>
{/snippet}

{#snippet defaultPanel(item: TabsItem)}
	<div data-tabs-content>
		{getContent(item)}
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
	use:navigator={{ wrapper: controller, orientation }}
>
	{#if options.length === 0}
		<div data-tabs-empty>
			{#if emptySnippet}
				{@render emptySnippet()}
			{:else}
				{@render defaultEmpty()}
			{/if}
		</div>
	{:else}
		<div data-tabs-list role="tablist" aria-orientation={orientation}>
			{#each options as option, index (index)}
				{@const proxy = createProxy(option)}
				{@const selected = isSelected(proxy)}
				{@const handlers = createHandlers(proxy)}
				{@const key = String(index)}

				{#if tabItemSnippet}
					{@render tabItemSnippet(option, userFields ?? {}, handlers, selected)}
				{:else}
					{@render defaultTabItem(proxy, handlers, selected, key)}
				{/if}
			{/each}
			{#if editable}
				<button
					type="button"
					data-tabs-add
					aria-label="Add tab"
					onclick={handleAdd}
				>
					<span class="i-lucide:plus" aria-hidden="true"></span>
				</button>
			{/if}
		</div>

		{#each options as option, index (index)}
			{@const proxy = createProxy(option)}
			{@const active = isSelected(proxy)}

			<div
				data-tabs-panel
				data-panel-active={active || undefined}
				role="tabpanel"
				id="tab-panel-{index}"
				aria-labelledby="tab-{index}"
			>
				{#if tabPanelSnippet}
					{@render tabPanelSnippet(option, userFields ?? {})}
				{:else}
					{@render defaultPanel(option)}
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
