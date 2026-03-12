<script lang="ts">
	/**
	 * Select — Trigger + dropdown with List-style flatView content.
	 *
	 * Architecture:
	 *   Trigger      — manages open/close (click, Enter, Escape, click-outside)
	 *   Wrapper      — owns focusedKey $state + flatView $derived
	 *   Navigator    — attaches DOM event handlers on dropdown
	 *   flatView loop — single flat {#each}, groups rendered as non-interactive labels
	 *
	 * Groups are pre-processed with expanded:true (always show children) and
	 * disabled:true (excluded from keyboard navigation). Group labels have no
	 * data-path so Navigator ignores them entirely.
	 *
	 * Data attributes:
	 *   data-select           — root container
	 *   data-select-trigger   — trigger button
	 *   data-select-value     — selected value display area
	 *   data-select-value-text — selected item text
	 *   data-select-value-icon — selected item icon
	 *   data-select-placeholder — placeholder text
	 *   data-select-arrow     — dropdown arrow icon
	 *   data-select-dropdown  — dropdown container
	 *   data-select-filter    — filter input wrapper
	 *   data-select-filter-input — filter text input
	 *   data-select-option    — leaf option items
	 *   data-select-group-label — group header label (non-interactive)
	 *   data-select-group-icon — icon inside group label
	 *   data-select-divider   — divider between groups
	 *   data-select-check     — check icon on selected item
	 *   data-select-empty     — no results message
	 *   data-path             — required by Navigator
	 *   data-selected         — selected state
	 *   data-disabled         — disabled state
	 *   data-open             — dropdown is open
	 *   data-size             — size variant
	 *   data-align            — dropdown alignment
	 *   data-direction        — dropdown direction
	 */
	// @ts-nocheck
	import type { ProxyItem } from '@rokkit/states'
	import { Wrapper, ProxyTree } from '@rokkit/states'
	import { Navigator, Trigger } from '@rokkit/actions'
	import { DEFAULT_STATE_ICONS, resolveSnippet, ITEM_SNIPPET, GROUP_SNIPPET } from '@rokkit/core'
	import ItemContent from './ItemContent.svelte'

	interface SelectIcons {
		opened?: string
		closed?: string
		checked?: string
	}

	let {
		items = [],
		fields = {},
		value = $bindable(),
		selected = $bindable<unknown>(null),
		placeholder = 'Select...',
		size = 'md',
		disabled = false,
		filterable = false,
		filterPlaceholder = 'Search...',
		align = 'start',
		direction = 'down',
		icons: userIcons = {} as SelectIcons,
		onchange,
		class: className = '',
		...snippets
	}: {
		items?: unknown[]
		fields?: Record<string, string>
		value?: unknown
		selected?: unknown
		placeholder?: string
		size?: string
		disabled?: boolean
		filterable?: boolean
		filterPlaceholder?: string
		align?: 'start' | 'end'
		direction?: 'up' | 'down'
		icons?: SelectIcons
		onchange?: (value: unknown, item: unknown) => void
		class?: string
		[key: string]: unknown
	} = $props()

	const icons = $derived({
		...DEFAULT_STATE_ICONS.selector,
		...DEFAULT_STATE_ICONS.checkbox,
		...userIcons
	})

	// ─── Dropdown state ───────────────────────────────────────────────────────

	let isOpen = $state(false)
	let selectRef = $state<HTMLElement | null>(null)
	let triggerRef = $state<HTMLElement | null>(null)
	let dropdownRef = $state<HTMLElement | null>(null)

	// ─── Filter ───────────────────────────────────────────────────────────────

	let filterQuery = $state('')
	let filterInputRef = $state<HTMLInputElement | null>(null)

	const textField = $derived(fields?.label || 'label')
	const childrenField = $derived(fields?.children || 'children')

	const filteredItems = $derived.by(() => {
		if (!filterable || !filterQuery) return items
		const query = filterQuery.toLowerCase()
		return items
			.map((item) => {
				const children = item[childrenField]
				if (Array.isArray(children) && children.length > 0) {
					const matching = children.filter((child) =>
						String(child[textField] ?? '')
							.toLowerCase()
							.includes(query)
					)
					return matching.length > 0 ? { ...item, [childrenField]: matching } : null
				}
				return String(item[textField] ?? '')
					.toLowerCase()
					.includes(query)
					? item
					: null
			})
			.filter(Boolean)
	})

	// Pre-process: force groups expanded + disabled (non-navigable labels)
	const processedItems = $derived(
		filteredItems.map((item) => {
			const children = item[childrenField]
			if (Array.isArray(children) && children.length > 0) {
				return { ...item, expanded: true, disabled: true }
			}
			return item
		})
	)

	// ─── Wrapper ──────────────────────────────────────────────────────────────

	function handleSelect(extractedValue: unknown, proxy: ProxyItem) {
		if (proxy.disabled) return
		value = extractedValue
		selected = proxy.original
		onchange?.(extractedValue, proxy.original)
		isOpen = false
		filterQuery = ''
		triggerRef?.focus()
	}

	const proxyTree = $derived(new ProxyTree(processedItems, fields))
	const wrapper = $derived(new Wrapper(proxyTree, { onselect: handleSelect }))

	// Override cancel/blur to close dropdown
	$effect(() => {
		const w = wrapper
		w.cancel = () => {
			isOpen = false
			filterQuery = ''
			triggerRef?.focus()
		}
		w.blur = () => {
			isOpen = false
			filterQuery = ''
		}
	})

	// When wrapper recreates while open, focus first item
	$effect(() => {
		const _w = wrapper
		if (isOpen && !filterable) _w.first(null)
	})

	// ─── Selected proxy for trigger display ───────────────────────────────────

	const selectedProxy = $derived.by(() => {
		if (value === undefined || value === null) return null
		for (const [, proxy] of wrapper.lookup) {
			if (!proxy.hasChildren && proxy.value === value) return proxy
		}
		return null
	})

	// Sync selected raw item
	$effect(() => {
		selected = selectedProxy?.original ?? null
	})

	// ─── Trigger action ───────────────────────────────────────────────────────

	$effect(() => {
		if (!triggerRef || !selectRef || disabled) return
		const t = new Trigger(triggerRef, selectRef, {
			isOpen: () => isOpen,
			onopen: () => {
				isOpen = true
				requestAnimationFrame(() => {
					if (filterable) {
						filterInputRef?.focus()
					} else {
						focusSelectedOrFirst()
					}
				})
			},
			onclose: () => {
				isOpen = false
				filterQuery = ''
			},
			onlast: () => requestAnimationFrame(() => wrapper.last(null))
		})
		return () => t.destroy()
	})

	function focusSelectedOrFirst() {
		if (value !== undefined && value !== null) {
			for (const node of wrapper.flatView) {
				if (!node.proxy.disabled && node.proxy.value === value) {
					wrapper.moveTo(node.key)
					return
				}
			}
		}
		wrapper.first(null)
	}

	// ─── Navigator on dropdown ────────────────────────────────────────────────

	$effect(() => {
		if (!isOpen || !dropdownRef) return
		const dir = getComputedStyle(dropdownRef).direction || 'ltr'
		const nav = new Navigator(dropdownRef, wrapper, { dir })
		return () => nav.destroy()
	})

	// DOM focus sync
	$effect(() => {
		const key = wrapper.focusedKey
		if (!isOpen || !dropdownRef || !key) return
		requestAnimationFrame(() => {
			const target = dropdownRef?.querySelector(`[data-path="${key}"]`) as HTMLElement | null
			if (target && target !== document.activeElement) {
				target.focus()
				target.scrollIntoView?.({ block: 'nearest' })
			}
		})
	})

	// ─── Filter keyboard (native listener, fires before Navigator) ───────────

	$effect(() => {
		if (!isOpen || !filterable || !filterInputRef) return
		const el = filterInputRef
		const handler = (event: KeyboardEvent) => {
			if (event.key === 'ArrowDown') {
				event.preventDefault()
				event.stopPropagation()
				wrapper.first(null)
			} else if (event.key === 'Escape') {
				if (filterQuery) {
					event.preventDefault()
					event.stopPropagation()
					filterQuery = ''
				}
				// Empty filter: let event bubble to Navigator/Trigger for close
			} else if (event.key === 'Enter') {
				event.preventDefault()
				event.stopPropagation()
				if (wrapper.focusedKey) wrapper.select(null)
			}
		}
		el.addEventListener('keydown', handler)
		return () => el.removeEventListener('keydown', handler)
	})

	// ─── Helpers ──────────────────────────────────────────────────────────────

	/** Set of group keys that need a divider before them (not the first group) */
	const groupDividers = $derived.by(() => {
		const set = new Set<string>()
		let foundFirst = false
		for (const node of wrapper.flatView) {
			if (node.hasChildren) {
				if (foundFirst) set.add(node.key)
				foundFirst = true
			}
		}
		return set
	})
</script>

{#snippet defaultOptionContent(proxy: ProxyItem)}
	<ItemContent {proxy} />
{/snippet}

{#snippet defaultGroupContent(proxy: ProxyItem)}
	{#if proxy.get('icon')}
		<span data-select-group-icon class={proxy.get('icon')} aria-hidden="true"></span>
	{/if}
	<span>{proxy.label}</span>
{/snippet}

<div
	bind:this={selectRef}
	data-select
	data-open={isOpen || undefined}
	data-size={size}
	data-disabled={disabled || undefined}
	data-align={align}
	data-direction={direction}
	class={className || undefined}
>
	<button
		bind:this={triggerRef}
		type="button"
		data-select-trigger
		{disabled}
		aria-haspopup="listbox"
		aria-expanded={isOpen}
	>
		<span data-select-value>
			{#if selectedProxy}
				{#if selectedProxy.get('icon')}
					<span data-select-value-icon class={selectedProxy.get('icon')} aria-hidden="true"></span>
				{/if}
				<span data-select-value-text>{selectedProxy.label}</span>
			{:else}
				<span data-select-placeholder>{placeholder}</span>
			{/if}
		</span>
		<span data-select-arrow class={isOpen ? icons.opened : icons.closed} aria-hidden="true"></span>
	</button>

	{#if isOpen}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div bind:this={dropdownRef} data-select-dropdown role="listbox" aria-orientation="vertical">
			{#if filterable}
				<div data-select-filter>
					<!-- svelte-ignore a11y_autofocus -->
					<input
						bind:this={filterInputRef}
						type="text"
						data-select-filter-input
						placeholder={filterPlaceholder}
						bind:value={filterQuery}
					/>
				</div>
			{/if}

			{#each wrapper.flatView as node (node.key)}
				{@const proxy = node.proxy}
				{@const sel = !node.hasChildren && proxy.value === value}
				{@const content = resolveSnippet(
					snippets as Record<string, unknown>,
					proxy,
					node.hasChildren ? GROUP_SNIPPET : ITEM_SNIPPET
				)}

				{#if node.type === 'separator'}
					<hr data-select-separator />
				{:else if node.hasChildren}
					{#if groupDividers.has(node.key)}
						<div data-select-divider></div>
					{/if}
					<div data-select-group-label role="presentation">
						{#if content}
							{@render content(proxy)}
						{:else}
							{@render defaultGroupContent(proxy)}
						{/if}
					</div>
				{:else}
					<button
						type="button"
						title={proxy.get('tooltip')}
						data-select-option
						data-path={node.key}
						data-level={node.level}
						data-selected={sel || undefined}
						data-disabled={proxy.disabled || undefined}
						role="option"
						aria-selected={sel}
						disabled={proxy.disabled || disabled}
						tabindex="-1"
					>
						{#if content}
							{@render content(proxy)}
						{:else}
							{@render defaultOptionContent(proxy)}
						{/if}
						{#if sel}
							<span data-select-check class={icons.checked} aria-hidden="true"></span>
						{/if}
					</button>
				{/if}
			{/each}

			{#if filterable && filterQuery && filteredItems.length === 0}
				<div data-select-empty>No results</div>
			{/if}
		</div>
	{/if}
</div>
