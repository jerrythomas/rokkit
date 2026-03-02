<script lang="ts">
	import type { FloatingNavigationProps, FloatingNavigationIcons } from '../types/floating-navigation.js'
	import { ProxyItem, messages } from '@rokkit/states'
	import { DEFAULT_STATE_ICONS } from '@rokkit/core'

	let {
		items = [],
		fields: userFields,
		icons: userIcons = {} as FloatingNavigationIcons,
		value = $bindable(),
		position = 'right',
		pinned = $bindable(false),
		observe = true,
		observerOptions = { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
		size = 'md',
		label = messages.current.floatingNav.label,
		labels: userLabels = {},
		onselect,
		onpinchange,
		item: itemSnippet,
		class: className = ''
	}: FloatingNavigationProps & { labels?: Record<string, string> } = $props()

	const labels = $derived({ ...messages.current.floatingNav, ...userLabels })

	const icons = $derived({ pin: DEFAULT_STATE_ICONS.action.pin, unpin: DEFAULT_STATE_ICONS.action.unpin, ...userIcons })

	let navRef = $state<HTMLElement | null>(null)
	let expanded = $state(false)
	let focusedIndex = $state(-1)

	const isVertical = $derived(position === 'left' || position === 'right')

	const itemProxies = $derived(
		items.map((item) => ({
			proxy: new ProxyItem(item, userFields),
			original: item
		}))
	)

	const activeIndex = $derived(
		itemProxies.findIndex((item) => item.proxy.value === value)
	)

	function togglePin() {
		pinned = !pinned
		if (!pinned) expanded = false
		onpinchange?.(pinned)
	}

	function handleMouseEnter() {
		if (!pinned) expanded = true
	}

	function handleMouseLeave() {
		if (!pinned) expanded = false
	}

	function handleItemClick(item: { proxy: ProxyItem; original: Record<string, unknown> }) {
		value = item.proxy.value
		onselect?.(item.proxy.value, item.original)

		// Smooth scroll to target section
		const href = item.proxy.get('href') !== undefined ? String(item.original[userFields?.href ?? 'href'] ?? '') : ''
		const targetId = href.startsWith('#') ? href.slice(1) : String(item.proxy.value)
		const el = document.getElementById(targetId)
		el?.scrollIntoView({ behavior: 'smooth' })
	}

	function handleKeyDown(event: KeyboardEvent) {
		const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight'
		const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft'

		switch (event.key) {
			case nextKey:
				event.preventDefault()
				focusItem(focusedIndex < itemProxies.length - 1 ? focusedIndex + 1 : 0)
				break
			case prevKey:
				event.preventDefault()
				focusItem(focusedIndex > 0 ? focusedIndex - 1 : itemProxies.length - 1)
				break
			case 'Home':
				event.preventDefault()
				focusItem(0)
				break
			case 'End':
				event.preventDefault()
				focusItem(itemProxies.length - 1)
				break
			case 'Enter':
			case ' ':
				event.preventDefault()
				if (focusedIndex >= 0 && focusedIndex < itemProxies.length) {
					handleItemClick(itemProxies[focusedIndex])
				}
				break
			case 'Escape':
				if (!pinned) {
					event.preventDefault()
					expanded = false
				}
				break
		}
	}

	function focusItem(index: number) {
		if (index < 0 || index >= itemProxies.length) return
		focusedIndex = index
		const itemsContainer = navRef?.querySelector('[data-floating-nav-items]')
		if (itemsContainer) {
			const navItems = itemsContainer.querySelectorAll('[data-floating-nav-item]')
			const item = navItems[index] as HTMLElement | undefined
			item?.focus()
		}
	}

	// IntersectionObserver for active section tracking
	$effect(() => {
		if (!observe || itemProxies.length === 0) return

		const observer = new IntersectionObserver((entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					const match = itemProxies.find((item) => {
						const href = item.proxy.get('href') !== undefined
							? String(item.original[userFields?.href ?? 'href'] ?? '')
							: ''
						const targetId = href.startsWith('#') ? href.slice(1) : String(item.proxy.value)
						return targetId === entry.target.id
					})
					if (match) {
						value = match.proxy.value
					}
				}
			}
		}, observerOptions)

		for (const item of itemProxies) {
			const href = item.proxy.get('href') !== undefined
				? String(item.original[userFields?.href ?? 'href'] ?? '')
				: ''
			const targetId = href.startsWith('#') ? href.slice(1) : String(item.proxy.value)
			const el = document.getElementById(targetId)
			if (el) observer.observe(el)
		}

		return () => observer.disconnect()
	})
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<nav
	bind:this={navRef}
	data-floating-nav
	data-position={position}
	data-expanded={expanded || pinned || undefined}
	data-pinned={pinned || undefined}
	data-size={size}
	aria-label={label}
	class={className || undefined}
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	onkeydown={handleKeyDown}
>
	<div data-floating-nav-header>
		{#if expanded || pinned}
			<span data-floating-nav-title>{label}</span>
		{/if}
		<button
			type="button"
			data-floating-nav-pin
			aria-pressed={pinned}
			aria-label={pinned ? labels.unpin : labels.pin}
			onclick={togglePin}
		>
			<span data-floating-nav-pin-icon class={pinned ? icons.unpin : icons.pin} aria-hidden="true"></span>
		</button>
	</div>

	<div data-floating-nav-items>
		{#each itemProxies as item, index (item.proxy.value ?? index)}
			{@const isActive = item.proxy.value === value}
			{@const isLink = item.proxy.get('href') !== undefined}
			{#if itemSnippet}
				{@render itemSnippet(item.original, {
					text: item.proxy.label,
					icon: item.proxy.get('icon'),
					active: isActive
				})}
			{:else if isLink}
				<a
					data-floating-nav-item
					data-active={isActive || undefined}
					href={String(item.original[userFields?.href ?? 'href'] ?? '')}
					aria-current={isActive ? 'true' : undefined}
					tabindex={index === 0 ? 0 : -1}
					style="--fn-index: {index}; --fn-total: {itemProxies.length}"
					onclick={(e) => {
						e.preventDefault()
						handleItemClick(item)
					}}
				>
					{#if item.proxy.get('icon')}
						<span data-floating-nav-icon class={item.proxy.get('icon')} aria-hidden="true"></span>
					{/if}
					<span data-floating-nav-label>{item.proxy.label}</span>
				</a>
			{:else}
				<button
					type="button"
					data-floating-nav-item
					data-active={isActive || undefined}
					aria-current={isActive ? 'true' : undefined}
					tabindex={index === 0 ? 0 : -1}
					style="--fn-index: {index}; --fn-total: {itemProxies.length}"
					onclick={() => handleItemClick(item)}
				>
					{#if item.proxy.get('icon')}
						<span data-floating-nav-icon class={item.proxy.get('icon')} aria-hidden="true"></span>
					{/if}
					<span data-floating-nav-label>{item.proxy.label}</span>
				</button>
			{/if}
		{/each}

		{#if activeIndex >= 0}
			<span
				data-floating-nav-indicator
				style="--fn-active-index: {activeIndex}"
				aria-hidden="true"
			></span>
		{/if}
	</div>
</nav>
