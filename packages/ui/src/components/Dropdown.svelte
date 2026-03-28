<script lang="ts">
	/**
	 * Dropdown — Trigger that shows the selected value + dropdown panel with options.
	 *
	 * Similar to Menu but the trigger label reflects the currently selected value
	 * instead of a static label prop.
	 *
	 * Data attributes:
	 *   data-dropdown          — root container
	 *   data-dropdown-trigger  — trigger button
	 *   data-dropdown-icon     — optional icon in trigger
	 *   data-dropdown-label    — selected value text in trigger
	 *   data-dropdown-arrow    — expand/collapse chevron
	 *   data-dropdown-panel    — dropdown options panel
	 *   data-dropdown-option   — each option item
	 *   data-dropdown-separator — separator between options
	 *   data-active            — marks the currently selected option
	 *   data-open              — present on root when panel is open
	 *   data-size              — size variant (sm | md | lg)
	 *   data-align             — panel alignment (start | end)
	 *   data-direction         — panel direction (down | up)
	 */
	// @ts-nocheck
	import { ProxyTree, Wrapper, messages } from '@rokkit/states'
	import { Navigator, Trigger } from '@rokkit/actions'
	import { DEFAULT_STATE_ICONS } from '@rokkit/core'

	interface DropdownIcons {
		opened?: string
		closed?: string
	}

	let {
		items = [],
		fields = {},
		value = $bindable(),
		placeholder = messages.select,
		icon,
		size = 'md',
		disabled = false,
		showArrow = true,
		align = 'start',
		direction = 'down',
		icons: userIcons = {} as DropdownIcons,
		onchange,
		class: className = ''
	}: {
		items?: unknown[]
		fields?: Record<string, string>
		value?: unknown
		placeholder?: string
		icon?: string
		size?: string
		disabled?: boolean
		showArrow?: boolean
		align?: 'start' | 'end'
		direction?: 'up' | 'down'
		icons?: DropdownIcons
		onchange?: (value: unknown, item: unknown) => void
		class?: string
	} = $props()

	const icons = $derived({ ...DEFAULT_STATE_ICONS.selector, ...userIcons })

	// ─── State ────────────────────────────────────────────────────────────────

	let isOpen = $state(false)
	let rootRef = $state<HTMLElement | null>(null)
	let triggerRef = $state<HTMLElement | null>(null)
	let panelRef = $state<HTMLElement | null>(null)

	// ─── Wrapper ──────────────────────────────────────────────────────────────

	function handleSelect(v: unknown, proxy: unknown) {
		if ((proxy as { disabled?: boolean }).disabled) return
		value = v
		onchange?.(v, (proxy as { original: unknown }).original)
		isOpen = false
		triggerRef?.focus()
	}

	const proxyTree = $derived(new ProxyTree(items, fields))
	const wrapper = $derived(new Wrapper(proxyTree, { onselect: handleSelect }))

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

	$effect(() => {
		const _w = wrapper
		if (isOpen) _w.first(null)
	})

	// ─── Trigger action ───────────────────────────────────────────────────────

	$effect(() => {
		if (!triggerRef || !rootRef || disabled) return
		const t = new Trigger(triggerRef, rootRef, {
			isOpen: () => isOpen,
			onopen: () => {
				isOpen = true
				requestAnimationFrame(() => wrapper.first(null))
			},
			onclose: () => {
				isOpen = false
			},
			onlast: () => requestAnimationFrame(() => wrapper.last(null))
		})
		return () => t.destroy()
	})

	// ─── Navigator on panel ───────────────────────────────────────────────────

	$effect(() => {
		if (!isOpen || !panelRef) return
		const nav = new Navigator(panelRef, wrapper, {})
		return () => nav.destroy()
	})

	// Focus sync — move DOM focus to focusedKey in panel
	$effect(() => {
		const key = wrapper.focusedKey
		if (!isOpen || !panelRef || !key) return
		requestAnimationFrame(() => {
			const target = panelRef?.querySelector(`[data-path="${key}"]`) as HTMLElement | null
			if (target && target !== document.activeElement) target.focus()
		})
	})

	// ─── Selected label ───────────────────────────────────────────────────────

	const selectedLabel = $derived.by(() => {
		if (value === undefined || value === null) return null
		for (const node of wrapper.flatView) {
			if (node.proxy.value === value) return node.proxy.label
		}
		return String(value)
	})
</script>

<div
	bind:this={rootRef}
	data-dropdown
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
		data-dropdown-trigger
		{disabled}
		aria-haspopup="listbox"
		aria-expanded={isOpen}
	>
		{#if icon}
			<span data-dropdown-icon class={icon} aria-hidden="true"></span>
		{/if}
		<span data-dropdown-label>{selectedLabel ?? placeholder}</span>
		{#if showArrow}
			<span data-dropdown-arrow class={isOpen ? icons.opened : icons.closed} aria-hidden="true"
			></span>
		{/if}
	</button>

	{#if isOpen}
		<div bind:this={panelRef} data-dropdown-panel role="listbox">
			{#each wrapper.flatView as node (node.key)}
				{@const proxy = node.proxy}
				{@const isActive = proxy.value === value}

				{#if node.type === 'separator'}
					<hr data-dropdown-separator />
				{:else}
					<button
						type="button"
						data-dropdown-option
						data-path={node.key}
						data-active={isActive || undefined}
						data-disabled={proxy.disabled || undefined}
						disabled={proxy.disabled || disabled}
						role="option"
						aria-selected={isActive}
						tabindex="-1"
					>
						<span data-dropdown-option-label>{proxy.label}</span>
					</button>
				{/if}
			{/each}
		</div>
	{/if}
</div>
