<script lang="ts">
	import type { FloatingNavigationProps } from '../types/floating-navigation.js'
	import { ItemProxy } from '../types/item-proxy.js'

	let {
		items = [],
		fields: userFields,
		value = $bindable(),
		position = 'right',
		pinned = $bindable(false),
		observe = true,
		observerOptions = { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
		size = 'md',
		label = 'Page navigation',
		onselect,
		onpinchange,
		item: itemSnippet,
		class: className = ''
	}: FloatingNavigationProps = $props()

	let navRef = $state<HTMLElement | null>(null)
	let expanded = $state(false)
	let focusedIndex = $state(-1)

	const isVertical = $derived(position === 'left' || position === 'right')

	const itemProxies = $derived(
		items.map((item) => ({
			proxy: new ItemProxy(item, userFields),
			original: item
		}))
	)

	const activeIndex = $derived(
		itemProxies.findIndex((item) => item.proxy.itemValue === value)
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

	function handleItemClick(item: { proxy: ItemProxy; original: Record<string, unknown> }) {
		value = item.proxy.itemValue
		onselect?.(item.proxy.itemValue, item.original)

		// Smooth scroll to target section
		const href = item.proxy.has('href') ? String(item.original[userFields?.href ?? 'href'] ?? '') : ''
		const targetId = href.startsWith('#') ? href.slice(1) : String(item.proxy.itemValue)
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
						const href = item.proxy.has('href')
							? String(item.original[userFields?.href ?? 'href'] ?? '')
							: ''
						const targetId = href.startsWith('#') ? href.slice(1) : String(item.proxy.itemValue)
						return targetId === entry.target.id
					})
					if (match) {
						value = match.proxy.itemValue
					}
				}
			}
		}, observerOptions)

		for (const item of itemProxies) {
			const href = item.proxy.has('href')
				? String(item.original[userFields?.href ?? 'href'] ?? '')
				: ''
			const targetId = href.startsWith('#') ? href.slice(1) : String(item.proxy.itemValue)
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
			aria-label={pinned ? 'Unpin navigation' : 'Pin navigation'}
			onclick={togglePin}
		>
			<span class={pinned ? 'i-lucide:pin-off' : 'i-lucide:pin'} aria-hidden="true"></span>
		</button>
	</div>

	<div data-floating-nav-items>
		{#each itemProxies as item, index (item.proxy.itemValue ?? index)}
			{@const isActive = item.proxy.itemValue === value}
			{@const isLink = item.proxy.has('href')}
			{#if itemSnippet}
				{@render itemSnippet(item.original, {
					text: item.proxy.text,
					icon: item.proxy.icon,
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
					{#if item.proxy.icon}
						<span data-floating-nav-icon class={item.proxy.icon} aria-hidden="true"></span>
					{/if}
					<span data-floating-nav-label>{item.proxy.text}</span>
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
					{#if item.proxy.icon}
						<span data-floating-nav-icon class={item.proxy.icon} aria-hidden="true"></span>
					{/if}
					<span data-floating-nav-label>{item.proxy.text}</span>
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
