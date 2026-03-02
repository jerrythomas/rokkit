<script lang="ts">
	/**
	 * MultiSelect — Trigger + dropdown with List-style flatView content.
	 *
	 * Same architecture as Select but with toggle selection (dropdown stays open),
	 * checkbox indicators, and tags display in trigger.
	 *
	 * Data attributes:
	 *   data-select / data-multiselect — root container (both for theme compat)
	 *   data-select-trigger     — trigger button
	 *   data-select-value       — selected value display area
	 *   data-select-tags        — tags container
	 *   data-select-tag         — individual tag
	 *   data-select-tag-text    — tag text
	 *   data-select-tag-remove  — tag remove button
	 *   data-select-count       — count indicator when exceeding maxDisplay
	 *   data-select-placeholder — placeholder text
	 *   data-select-arrow       — dropdown arrow icon
	 *   data-select-dropdown    — dropdown container
	 *   data-select-option      — option items
	 *   data-select-checkbox    — checkbox indicator
	 *   data-select-group-label — group header (non-interactive)
	 *   data-select-group-icon  — icon inside group label
	 *   data-select-divider     — divider between groups
	 *   data-path, data-selected, data-checked, data-disabled, data-open, data-size
	 */
	// @ts-nocheck
	import type { ProxyItem } from '@rokkit/states'
	import { Wrapper, ProxyTree } from '@rokkit/states'
	import { Navigator, Trigger } from '@rokkit/actions'
	import { DEFAULT_STATE_ICONS, resolveSnippet, ITEM_SNIPPET, GROUP_SNIPPET } from '@rokkit/core'
	import ItemContent from './ItemContent.svelte'

	interface MultiSelectIcons {
		opened?: string
		closed?: string
		checked?: string
		remove?: string
	}

	let {
		items = [],
		fields = {},
		value = $bindable<unknown[]>([]),
		selected = $bindable<unknown[]>([]),
		placeholder = 'Select...',
		size = 'md',
		disabled = false,
		maxDisplay = 3,
		align = 'start',
		direction = 'down',
		icons: userIcons = {} as MultiSelectIcons,
		onchange,
		class: className = '',
		...snippets
	}: {
		items?: unknown[]
		fields?: Record<string, string>
		value?: unknown[]
		selected?: unknown[]
		placeholder?: string
		size?: string
		disabled?: boolean
		maxDisplay?: number
		align?: 'start' | 'end'
		direction?: 'up' | 'down'
		icons?: MultiSelectIcons
		onchange?: (values: unknown[], items: unknown[]) => void
		class?: string
		[key: string]: unknown
	} = $props()

	const icons = $derived({ ...DEFAULT_STATE_ICONS.selector, ...DEFAULT_STATE_ICONS.checkbox, ...DEFAULT_STATE_ICONS.action, ...userIcons })

	// ─── Dropdown state ───────────────────────────────────────────────────────

	let isOpen = $state(false)
	let selectRef = $state<HTMLElement | null>(null)
	let triggerRef = $state<HTMLElement | null>(null)
	let dropdownRef = $state<HTMLElement | null>(null)

	// ─── Pre-process items ────────────────────────────────────────────────────

	const childrenField = $derived(fields?.children || 'children')

	// Force groups expanded + disabled (non-navigable labels)
	const processedItems = $derived(
		items.map((item) => {
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
		toggleItemSelection(extractedValue)
	}

	const proxyTree = $derived(new ProxyTree(processedItems, fields))
	const wrapper = $derived(new Wrapper(proxyTree, { onselect: handleSelect }))

	// Override cancel/blur to close dropdown
	$effect(() => {
		const w = wrapper
		w.cancel = () => {
			isOpen = false
			triggerRef?.focus()
		}
		w.blur = () => {
			isOpen = false
		}
	})

	// When wrapper recreates while open, focus first item
	$effect(() => {
		const _w = wrapper
		if (isOpen) _w.first(null)
	})

	// ─── Selection logic ──────────────────────────────────────────────────────

	function isItemSelected(extractedValue: unknown): boolean {
		return (value ?? []).some((v) => v === extractedValue)
	}

	function toggleItemSelection(extractedValue: unknown) {
		const currentValues = value ?? []
		const alreadySelected = currentValues.some((v) => v === extractedValue)

		let newValues: unknown[]
		let newItems: unknown[]

		if (alreadySelected) {
			newValues = currentValues.filter((v) => v !== extractedValue)
			// Rebuild selected items from remaining values
			newItems = []
			for (const [, proxy] of wrapper.lookup) {
				if (!proxy.hasChildren && newValues.some((v) => v === proxy.value)) {
					newItems.push(proxy.original)
				}
			}
		} else {
			newValues = [...currentValues, extractedValue]
			// Rebuild selected items from lookup to include all values
			newItems = []
			for (const [, proxy] of wrapper.lookup) {
				if (!proxy.hasChildren && newValues.some((v) => v === proxy.value)) {
					newItems.push(proxy.original)
				}
			}
		}

		value = newValues
		selected = newItems
		onchange?.(newValues, newItems)
	}

	function removeTag(extractedValue: unknown) {
		const currentValues = value ?? []
		const newValues = currentValues.filter((v) => v !== extractedValue)
		const newItems: unknown[] = []
		for (const [, proxy] of wrapper.lookup) {
			if (!proxy.hasChildren && newValues.some((v) => v === proxy.value)) {
				newItems.push(proxy.original)
			}
		}
		value = newValues
		selected = newItems
		onchange?.(newValues, newItems)
	}

	// ─── Selected items for tags display ──────────────────────────────────────

	const selectedProxies = $derived.by(() => {
		const vals = value ?? []
		if (vals.length === 0) return []
		const result: ProxyItem[] = []
		for (const [, proxy] of wrapper.lookup) {
			if (!proxy.hasChildren && vals.some((v) => v === proxy.value)) {
				result.push(proxy)
			}
		}
		return result
	})

	// ─── Trigger action ───────────────────────────────────────────────────────

	$effect(() => {
		if (!triggerRef || !selectRef || disabled) return
		const t = new Trigger(triggerRef, selectRef, {
			isOpen: () => isOpen,
			onopen: () => {
				isOpen = true
				requestAnimationFrame(() => wrapper.first(null))
			},
			onclose: () => { isOpen = false },
			onlast: () => requestAnimationFrame(() => wrapper.last(null))
		})
		return () => t.destroy()
	})

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

	// ─── Helpers ──────────────────────────────────────────────────────────────

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
	data-multiselect
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
			{#if selectedProxies.length > 0}
				{#if selectedProxies.length <= maxDisplay}
					<span data-select-tags>
						{#each selectedProxies as proxy (proxy.value)}
							<span data-select-tag>
								<span data-select-tag-text>{proxy.label}</span>
								<span
									role="button"
									tabindex="0"
									data-select-tag-remove
									aria-label="Remove {proxy.label}"
									onclick={(e) => {
										e.stopPropagation()
										removeTag(proxy.value)
									}}
									onkeydown={(e) => {
										if (e.key === 'Enter' || e.key === ' ') {
											e.preventDefault()
											e.stopPropagation()
											removeTag(proxy.value)
										}
									}}
								>
									<span class={icons.remove} aria-hidden="true"></span>
								</span>
							</span>
						{/each}
					</span>
				{:else}
					<span data-select-count>{selectedProxies.length} selected</span>
				{/if}
			{:else}
				<span data-select-placeholder>{placeholder}</span>
			{/if}
		</span>
		<span data-select-arrow class={icons.opened} aria-hidden="true"></span>
	</button>

	{#if isOpen}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			bind:this={dropdownRef}
			data-select-dropdown
			role="listbox"
			aria-multiselectable="true"
			aria-orientation="vertical"
		>
			{#each wrapper.flatView as node (node.key)}
				{@const proxy = node.proxy}
				{@const sel = !node.hasChildren && isItemSelected(proxy.value)}
				{@const content = resolveSnippet(snippets as Record<string, unknown>, proxy, node.hasChildren ? GROUP_SNIPPET : ITEM_SNIPPET)}

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
						data-select-option
						data-path={node.key}
						data-level={node.level}
						data-selected={sel || undefined}
						data-disabled={proxy.disabled || undefined}
						role="option"
						aria-selected={sel}
						aria-label={proxy.label}
						disabled={proxy.disabled || disabled}
						tabindex="-1"
					>
						<span data-select-checkbox data-checked={sel || undefined}>
							{#if sel}
								<span class={icons.checked} aria-hidden="true"></span>
							{/if}
						</span>
						{#if content}
							{@render content(proxy)}
						{:else}
							{@render defaultOptionContent(proxy)}
						{/if}
					</button>
				{/if}
			{/each}
		</div>
	{/if}
</div>
