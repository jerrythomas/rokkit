<script lang="ts">
	// @ts-nocheck
	import type { SelectProps, SelectStateIcons, SelectItem } from '../types/select.js'
	import { defaultSelectStateIcons, getSnippet } from '../types/select.js'
	import { Wrapper, ProxyItem, PROXY_ITEM_FIELDS } from '@rokkit/states'
	import { Navigator } from '@rokkit/actions'

	let {
		options = [],
		fields: userFields = {},
		value = $bindable(),
		selected = $bindable<SelectItem | null>(null),
		placeholder = 'Select...',
		size = 'md',
		align = 'left',
		direction = 'down',
		maxRows = 5,
		disabled = false,
		filterable = false,
		filterPlaceholder = 'Search...',
		onchange,
		class: className = '',
		icons: userIcons,
		option: optionSnippet,
		groupLabel: groupLabelSnippet,
		selectedValue: selectedValueSnippet,
		...extraSnippets
	}: SelectProps & { [key: string]: unknown } = $props()

	const icons = $derived<SelectStateIcons>({ ...defaultSelectStateIcons, ...userIcons })
	const mergedFields = $derived({ ...PROXY_ITEM_FIELDS, ...userFields })
	const normalizedAlign = $derived(align === 'left' || align === 'start' ? 'left' : 'right')
	const defaultRowHeight = $derived(size === 'sm' ? 28 : size === 'lg' ? 40 : 34)
	let measuredRowHeight = $state<number | null>(null)
	const maxHeight = $derived(maxRows * (measuredRowHeight ?? defaultRowHeight))

	// ─── Filter ───────────────────────────────────────────────────────────────

	let filterQuery = $state('')
	let filterInputRef = $state<HTMLInputElement | null>(null)

	const filteredOptions = $derived.by(() => {
		if (!filterable || !filterQuery) return options
		const query = filterQuery.toLowerCase()
		const { children: childrenField, text: textField } = mergedFields
		return options
			.map((option) => {
				const children = option[childrenField]
				if (Array.isArray(children) && children.length > 0) {
					const matching = children.filter((child) =>
						String(child[textField] ?? '').toLowerCase().includes(query)
					)
					return matching.length > 0 ? { ...option, [childrenField]: matching } : null
				}
				return String(option[textField] ?? '').toLowerCase().includes(query) ? option : null
			})
			.filter(Boolean)
	})

	// ─── Flat items for Wrapper (groups pre-flattened — only leaf items) ───────

	const flatItems = $derived.by(() => {
		const items = []
		const childrenField = mergedFields.children
		for (const option of filteredOptions) {
			const children = option[childrenField]
			if (Array.isArray(children) && children.length > 0) {
				for (const child of children) items.push(child)
			} else {
				items.push(option)
			}
		}
		return items
	})

	/** item → key string (flat index '0','1',...) matching Wrapper keys */
	const itemPathMap = $derived.by(() => {
		const map = new Map()
		flatItems.forEach((item, i) => map.set(item, String(i)))
		return map
	})

	// ─── Wrapper ──────────────────────────────────────────────────────────────

	const wrapper = $derived(new Wrapper(flatItems, mergedFields, { onselect: handleSelect }))

	// When wrapper recreates (filter changed) while open, focus first item
	$effect(() => {
		const w = wrapper
		if (isOpen) w.first(null)
	})

	// ─── Dropdown state ───────────────────────────────────────────────────────

	let isOpen = $state(false)
	let selectRef = $state<HTMLDivElement | null>(null)
	let dropdownRef = $state<HTMLDivElement | null>(null)

	// ─── Selected item display ────────────────────────────────────────────────

	const selectedProxy = $derived.by(() => {
		if (value === undefined || value === null) return null
		const { children: childrenField, value: valueField } = mergedFields
		for (const option of options) {
			const children = option[childrenField]
			if (Array.isArray(children) && children.length > 0) {
				for (const child of children) {
					const v = child[valueField]
					if (v === value || (v === undefined && child === value)) {
						return new ProxyItem(child, mergedFields)
					}
				}
			} else {
				const v = option[valueField]
				if (v === value || (v === undefined && option === value)) {
					return new ProxyItem(option, mergedFields)
				}
			}
		}
		return null
	})

	$effect(() => {
		if (!selectedProxy) { selected = null; return }
		const { children: childrenField, value: valueField } = mergedFields
		for (const option of options) {
			const children = option[childrenField]
			if (Array.isArray(children) && children.length > 0) {
				for (const child of children) {
					const v = child[valueField]
					if (v === value || (v === undefined && child === value)) { selected = child; return }
				}
			} else {
				const v = option[valueField]
				if (v === value || (v === undefined && option === value)) { selected = option; return }
			}
		}
		selected = null
	})

	// ─── Navigator ────────────────────────────────────────────────────────────

	$effect(() => {
		if (!isOpen || !dropdownRef) return
		const nav = new Navigator(dropdownRef, wrapper, { orientation: 'vertical' })
		return () => nav.destroy()
	})

	// DOM focus sync
	$effect(() => {
		const key = wrapper.focusedKey
		if (!isOpen || !dropdownRef || !key) return
		requestAnimationFrame(() => {
			const target = dropdownRef?.querySelector(`[data-path="${key}"]`)
			if (target && target !== document.activeElement) {
				target.focus()
				target.scrollIntoView?.({ block: 'nearest' })
			}
		})
	})

	// ─── Selection handler ────────────────────────────────────────────────────

	function handleSelect(extractedValue, proxy) {
		if (proxy.disabled) return
		const rawItem = flatItems[parseInt(proxy.key)] ?? null
		value = extractedValue
		selected = rawItem
		onchange?.(extractedValue, rawItem)
		closeDropdown()
		const trigger = selectRef?.querySelector('[data-select-trigger]')
		trigger?.focus()
	}

	// ─── Dropdown control ─────────────────────────────────────────────────────

	function toggleDropdown() {
		if (disabled) return
		if (isOpen) closeDropdown()
		else openDropdown()
	}

	function openDropdown() {
		if (disabled || isOpen) return
		isOpen = true
		requestAnimationFrame(() => {
			measureRowHeight()
			if (filterable) {
				filterInputRef?.focus()
			} else {
				focusSelectedOrFirst()
			}
		})
	}

	function closeDropdown() {
		isOpen = false
		filterQuery = ''
	}

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

	function measureRowHeight() {
		const firstOption = selectRef?.querySelector('[data-select-dropdown] [data-select-option]')
		if (firstOption) {
			const h = firstOption.getBoundingClientRect().height
			if (h > 0) measuredRowHeight = h
		}
	}

	// ─── Keyboard handlers ────────────────────────────────────────────────────

	function handleTriggerKeyDown(event) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault()
			openDropdown()
		} else if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault()
			toggleDropdown()
		}
	}

	function handleFilterKeyDown(event) {
		if (event.key === 'ArrowDown') {
			event.preventDefault()
			wrapper.first(null)
		} else if (event.key === 'Escape') {
			event.preventDefault()
			if (filterQuery) {
				filterQuery = ''
				event.stopPropagation()
			} else {
				closeDropdown()
				selectRef?.querySelector('[data-select-trigger]')?.focus()
			}
		} else if (event.key === 'Enter') {
			event.preventDefault()
			if (wrapper.focusedKey) wrapper.select(null)
		}
	}

	function handleEscapeKey(event) {
		if (!isOpen || event.key !== 'Escape') return
		event.preventDefault()
		closeDropdown()
		selectRef?.querySelector('[data-select-trigger]')?.focus()
	}

	function handleClickOutside(event) {
		if (selectRef && !selectRef.contains(event.target)) closeDropdown()
	}

	$effect(() => {
		if (isOpen) {
			document.addEventListener('click', handleClickOutside, true)
			document.addEventListener('keydown', handleEscapeKey)
		}
		return () => {
			document.removeEventListener('click', handleClickOutside, true)
			document.removeEventListener('keydown', handleEscapeKey)
		}
	})

	// ─── Rendering helpers ────────────────────────────────────────────────────

	function getOptionProxy(item) {
		const key = itemPathMap.get(item)
		return (key !== undefined ? wrapper.lookup.get(key) : null) ?? new ProxyItem(item, mergedFields)
	}

	function getGroupProxy(group) {
		return new ProxyItem(group, mergedFields)
	}

	function resolveOptionSnippet(proxy) {
		const name = proxy.snippet
		if (name && typeof name === 'string') {
			const named = getSnippet(extraSnippets, name)
			if (named) return named
		}
		return optionSnippet ?? null
	}

	function isItemSelected(proxy) {
		return proxy.value === value
	}
</script>

{#snippet defaultOptionContent(proxy)}
	{#if proxy.icon}
		<span data-item-icon class={proxy.icon} aria-hidden="true"></span>
	{/if}
	<span data-item-text>
		<span data-item-label>{proxy.text}</span>
		{#if proxy.get('description')}
			<span data-item-description>{proxy.get('description')}</span>
		{/if}
	</span>
	{#if proxy.get('badge')}
		<span data-item-badge>{proxy.get('badge')}</span>
	{/if}
{/snippet}

{#snippet defaultGroupContent(proxy)}
	{#if proxy.icon}
		<span data-select-group-icon class={proxy.icon} aria-hidden="true"></span>
	{/if}
	<span>{proxy.text}</span>
{/snippet}

<div
	bind:this={selectRef}
	data-select
	data-open={isOpen || undefined}
	data-size={size}
	data-disabled={disabled || undefined}
	data-align={normalizedAlign}
	data-direction={direction}
	class={className || undefined}
>
	<button
		type="button"
		data-select-trigger
		{disabled}
		aria-haspopup="listbox"
		aria-expanded={isOpen}
		onclick={toggleDropdown}
		onkeydown={handleTriggerKeyDown}
	>
		<span data-select-value>
			{#if selectedProxy}
				{#if selectedValueSnippet}
					{@render selectedValueSnippet(selectedProxy)}
				{:else}
					{#if selectedProxy.icon}
						<span data-select-value-icon class={selectedProxy.icon} aria-hidden="true"></span>
					{/if}
					<span data-select-value-text>{selectedProxy.text}</span>
				{/if}
			{:else}
				<span data-select-placeholder>{placeholder}</span>
			{/if}
		</span>
		<span data-select-arrow class={isOpen ? icons.opened : icons.closed} aria-hidden="true"></span>
	</button>

	{#if isOpen}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			bind:this={dropdownRef}
			data-select-dropdown
			role="listbox"
			aria-orientation="vertical"
			style="max-height: {maxHeight}px"
		>
			{#if filterable}
				<div data-select-filter>
					<!-- svelte-ignore a11y_autofocus -->
					<input
						bind:this={filterInputRef}
						type="text"
						data-select-filter-input
						placeholder={filterPlaceholder}
						bind:value={filterQuery}
						onkeydown={handleFilterKeyDown}
					/>
				</div>
			{/if}

			{#each filteredOptions as option, oi (oi)}
				{@const childrenField = mergedFields.children}
				{@const children = option[childrenField]}

				{#if Array.isArray(children) && children.length > 0}
					{@const groupProxy = getGroupProxy(option)}
					{#if oi > 0}
						<div data-select-divider role="separator"></div>
					{/if}
					<div data-select-group>
						<div data-select-group-label role="presentation">
							{#if groupLabelSnippet}
								{@render groupLabelSnippet(groupProxy)}
							{:else}
								{@render defaultGroupContent(groupProxy)}
							{/if}
						</div>
						{#each children as child, ci (ci)}
							{@const proxy = getOptionProxy(child)}
							{@const pathKey = itemPathMap.get(child)}
							{@const sel = isItemSelected(proxy)}
							{@const customSnippet = resolveOptionSnippet(proxy)}
							<button
								type="button"
								title={proxy.get('title')}
								data-select-option
								data-path={pathKey}
								data-disabled={proxy.disabled || undefined}
								data-selected={sel || undefined}
								role="option"
								aria-selected={sel}
								disabled={proxy.disabled}
							>
								{#if customSnippet}
									{@render customSnippet(proxy)}
								{:else}
									{@render defaultOptionContent(proxy)}
									{#if sel}
										<span data-select-check class={icons.checked} aria-hidden="true"></span>
									{/if}
								{/if}
							</button>
						{/each}
					</div>
				{:else}
					{@const proxy = getOptionProxy(option)}
					{@const pathKey = itemPathMap.get(option)}
					{@const sel = isItemSelected(proxy)}
					{@const customSnippet = resolveOptionSnippet(proxy)}
					<button
						type="button"
						title={proxy.get('title')}
						data-select-option
						data-path={pathKey}
						data-disabled={proxy.disabled || undefined}
						data-selected={sel || undefined}
						role="option"
						aria-selected={sel}
						disabled={proxy.disabled}
					>
						{#if customSnippet}
							{@render customSnippet(proxy)}
						{:else}
							{@render defaultOptionContent(proxy)}
							{#if sel}
								<span data-select-check class={icons.checked} aria-hidden="true"></span>
							{/if}
						{/if}
					</button>
				{/if}
			{/each}

			{#if filterable && filterQuery && filteredOptions.length === 0}
				<div data-select-empty>No results</div>
			{/if}
		</div>
	{/if}
</div>
