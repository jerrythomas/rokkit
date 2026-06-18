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
	import type { ProxyItem } from '@rokkit/states'
	import { Wrapper, ProxyTree, messages } from '@rokkit/states'
	import { SvelteSet } from 'svelte/reactivity'
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
		placeholder = messages.select,
		size = 'md',
		disabled = false,
		filterable = false,
		filterPlaceholder = 'Search...',
		align = 'start',
		direction = 'down',
		maxRows = 8,
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
		maxRows?: number
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

	function childMatchesQuery(child: unknown, query: string): boolean {
		return String((child as Record<string, unknown>)[textField] ?? '')
			.toLowerCase()
			.includes(query)
	}

	function filterGroupChildren(asRecord: Record<string, unknown>, query: string): unknown | null {
		const children = asRecord[childrenField] as unknown[]
		const matching = children.filter((child: unknown) => childMatchesQuery(child, query))
		return matching.length > 0 ? { ...asRecord, [childrenField]: matching } : null
	}

	function filterItem(item: unknown, query: string): unknown | null {
		const asRecord = item as Record<string, unknown>
		const children = asRecord[childrenField]
		if (Array.isArray(children) && children.length > 0) {
			return filterGroupChildren(asRecord, query)
		}
		const text = String(asRecord[textField] ?? '').toLowerCase()
		return text.includes(query) ? item : null
	}

	const filteredItems = $derived.by(() => {
		if (!filterable || !filterQuery) return items
		const query = filterQuery.toLowerCase()
		return items.map((item) => filterItem(item, query)).filter(Boolean)
	})

	// Pre-process: force groups expanded + disabled (non-navigable labels)
	const processedItems = $derived(
		filteredItems.map((item) => {
			const asRecord = item as Record<string, unknown>
			const children = asRecord[childrenField]
			if (Array.isArray(children) && children.length > 0) {
				return { ...asRecord, expanded: true, disabled: true }
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

	function isValueUnset(): boolean {
		return value === undefined || value === null
	}

	function isMatchingLeaf(proxy: ProxyItem): boolean {
		return !proxy.hasChildren && proxy.value === value
	}

	function findSelectedProxy(): ProxyItem | null {
		if (isValueUnset()) return null
		for (const [, proxy] of wrapper.lookup) {
			if (isMatchingLeaf(proxy)) return proxy
		}
		return null
	}

	const selectedProxy = $derived.by(findSelectedProxy)

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
						return
					}
					focusSelectedOrFirst()
					// Move DOM focus to the wrapper's focused item so subsequent
					// keydown events fire inside the dropdown (Navigator is
					// listening there). preventScroll + dropdown-only scroll
					// to avoid moving ancestor containers.
					requestAnimationFrame(() => {
						if (!dropdownRef) return
						const key = wrapper.focusedKey
						if (!key) return
						const el = dropdownRef.querySelector(`[data-path="${key}"]`) as HTMLElement | null
						if (el) {
							el.focus({ preventScroll: true })
							const top = el.offsetTop
							const bottom = top + el.offsetHeight
							if (top < dropdownRef.scrollTop) {
								dropdownRef.scrollTop = top
							} else if (bottom > dropdownRef.scrollTop + dropdownRef.clientHeight) {
								dropdownRef.scrollTop = bottom - dropdownRef.clientHeight
							}
						}
					})
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

	function moveToSelectedValue(): boolean {
		for (const node of wrapper.flatView) {
			if (!node.proxy.disabled && node.proxy.value === value) {
				wrapper.moveTo(node.key)
				return true
			}
		}
		return false
	}

	function focusSelectedOrFirst() {
		if (value !== undefined && value !== null && moveToSelectedValue()) return
		wrapper.first(null)
	}

	// ─── Navigator on dropdown ────────────────────────────────────────────────

	$effect(() => {
		if (!isOpen || !dropdownRef) return
		const dir = getComputedStyle(dropdownRef).direction || 'ltr'
		const nav = new Navigator(dropdownRef, wrapper, { dir, containScroll: true })
		return () => nav.destroy()
	})

	// Apply maxRows by measuring a real option after open and capping max-height.
	// Runs once per open to avoid jitter; the CSS var still wins if the consumer
	// sets --select-dropdown-max-height explicitly.
	$effect(() => {
		if (!isOpen || !dropdownRef) return
		requestAnimationFrame(() => {
			if (!dropdownRef) return
			const firstOption = dropdownRef.querySelector('[data-select-option]') as HTMLElement | null
			if (!firstOption) return
			const itemH = firstOption.offsetHeight
			if (itemH > 0) {
				dropdownRef.style.setProperty(
					'--select-dropdown-max-height',
					`${maxRows * itemH}px`
				)
			}
		})
	})

	// Position the dropdown relative to the trigger using `position: fixed`
	// so it escapes any ancestor `overflow: auto/hidden` clipping (common
	// when Select lives inside a scrollable card/modal/canvas). Reposition
	// on resize and ancestor scroll; close on the same so it doesn't drift
	// away from the trigger.
	function positionDropdown() {
		if (!dropdownRef || !triggerRef) return
		const r = triggerRef.getBoundingClientRect()
		const gap = 4
		dropdownRef.style.position = 'fixed'
		dropdownRef.style.minWidth = `${r.width}px`
		if (direction === 'up') {
			dropdownRef.style.top = 'auto'
			dropdownRef.style.bottom = `${window.innerHeight - r.top + gap}px`
		} else {
			dropdownRef.style.top = `${r.bottom + gap}px`
			dropdownRef.style.bottom = 'auto'
		}
		if (align === 'end') {
			dropdownRef.style.left = 'auto'
			dropdownRef.style.right = `${window.innerWidth - r.right}px`
		} else {
			dropdownRef.style.left = `${r.left}px`
			dropdownRef.style.right = 'auto'
		}
	}

	$effect(() => {
		if (!isOpen || !dropdownRef || !triggerRef) return
		positionDropdown()
		const onResize = () => positionDropdown()
		const onScroll = (e: Event) => {
			// Don't close on the dropdown's OWN internal scroll (mouse wheel
			// inside the list, or scrollItemIntoView from keyboard nav).
			// Only close when an ANCESTOR / outer container scrolls — at that
			// point the trigger has moved and the fixed-position dropdown
			// would drift away from it.
			if (dropdownRef && e.target instanceof Node && dropdownRef.contains(e.target)) return
			isOpen = false
		}
		window.addEventListener('resize', onResize)
		window.addEventListener('scroll', onScroll, true)
		return () => {
			window.removeEventListener('resize', onResize)
			window.removeEventListener('scroll', onScroll, true)
		}
	})

	// Focus sync is owned by Navigator (#syncFocus). The previous duplicate
	// $effect here competed with Navigator's own focus + scroll logic and
	// caused race conditions (page-scroll on arrow nav, layout shift on
	// reopen). Single source of truth lives in the Navigator class.

	// ─── Filter keyboard (native listener, fires before Navigator) ───────────

	function selectFocused() {
		if (wrapper.focusedKey) wrapper.select(null)
	}

	function handleFilterKeyDown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			event.stopPropagation()
			wrapper.first(null)
		} else if (event.key === 'Escape' && filterQuery) {
			event.preventDefault()
			event.stopPropagation()
			filterQuery = ''
		} else if (event.key === 'Enter') {
			event.preventDefault()
			event.stopPropagation()
			selectFocused()
		}
	}

	$effect(() => {
		if (!isOpen || !filterable || !filterInputRef) return
		const el = filterInputRef
		el.addEventListener('keydown', handleFilterKeyDown)
		return () => el.removeEventListener('keydown', handleFilterKeyDown)
	})

	// ─── Helpers ──────────────────────────────────────────────────────────────

	/** Set of group keys that need a divider before them (not the first group) */
	const groupDividers = $derived.by(() => {
		const set = new SvelteSet<string>()
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
		<div bind:this={dropdownRef} data-select-dropdown role="listbox" aria-orientation="vertical">
			{#if filterable}
				<div data-select-filter>
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
