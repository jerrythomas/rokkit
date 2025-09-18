<script>
	import { onMount } from 'svelte'
	import List from './List.svelte'
	import { Icon } from '@rokkit/ui'
	import { defaultStateIcons } from '@rokkit/core'
	import { pick } from 'ramda'

	/**
	 * @typedef {Object} NavigationItem
	 * @property {string} id - Unique identifier for the navigation item
	 * @property {string} label - Display text for the navigation item
	 * @property {string} href - URL or anchor link for the navigation item
	 * @property {string} [icon] - Optional icon name
	 */

	/**
	 * @typedef {Object} FloatingNavProps
	 * @property {string} [class] - Additional CSS class names
	 * @property {NavigationItem[]} [items] - Array of navigation items
	 * @property {string} [activeSection] - Currently active section ID (bindable)
	 * @property {boolean} [isExpanded] - Whether the nav is expanded (bindable)
	 * @property {boolean} [isPinned] - Whether the nav is pinned open (bindable)
	 * @property {string} [position] - Position of the nav ('right' | 'left')
	 * @property {Object} [icons] - Custom icon overrides
	 * @property {Function} [onNavigate] - Callback when navigation item is clicked
	 */

	/** @type {FloatingNavProps} */
	let {
		class: classNames = '',
		items = [],
		activeSection = $bindable(''),
		isExpanded = $bindable(false),
		isPinned = $bindable(false),
		position = 'right',
		icons,
		onNavigate
	} = $props()

	let intersectionObserver = $state(null)
	let navContainer = $state(null)

	// Field mappings for List component
	const fields = {
		id: 'id',
		label: 'label',
		value: 'id',
		href: 'href'
	}

	// Icon configuration using defaultStateIcons pattern
	let navIcons = $derived({
		...pick(['close'], defaultStateIcons.action),
		...pick(['right', 'left'], defaultStateIcons.navigate),
		pin: 'action-close', // Using close icon for pin
		pinOff: 'action-add', // Using add icon for pin-off
		...icons
	})

	// Set up intersection observer to track active sections
	onMount(() => {
		if (typeof window === 'undefined') return

		const observerOptions = {
			root: null,
			rootMargin: '-20% 0px -70% 0px',
			threshold: 0.1
		}

		intersectionObserver = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					activeSection = entry.target.id
				}
			})
		}, observerOptions)

		// Observe all navigation target elements
		items.forEach(({ id }) => {
			const element = document.getElementById(id)
			if (element) {
				intersectionObserver.observe(element)
			}
		})

		return () => {
			if (intersectionObserver) {
				intersectionObserver.disconnect()
			}
		}
	})

	function handleNavClick(item) {
		const element = document.querySelector(item.href)
		if (element) {
			element.scrollIntoView({ behavior: 'smooth' })
		}

		onNavigate?.(item)

		// Close nav if not pinned
		if (!isPinned) {
			isExpanded = false
		}
	}

	function togglePin() {
		isPinned = !isPinned
		if (!isPinned) {
			isExpanded = true
		}
	}

	function handleMouseEnter() {
		if (!isPinned) {
			isExpanded = true
		}
	}

	function handleMouseLeave() {
		if (!isPinned) {
			isExpanded = false
		}
	}

	// Reactive styles for positioning
	let positionClasses = $derived(position === 'left' ? 'left-6' : 'right-6')
	let containerWidth = $derived(isExpanded ? '280px' : '60px')
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	bind:this={navContainer}
	class="fixed {positionClasses} top-1/2 z-40 -translate-y-1/2 {classNames}"
	onmouseenter={handleMouseEnter}
	onmouseleave={handleMouseLeave}
	style="transition: all 0.3s ease-in-out;"
>
	<!-- Main Navigation Container -->
	<div
		class="bg-background/95 border-border overflow-hidden rounded-2xl border shadow-lg backdrop-blur-md transition-all duration-300 ease-in-out"
		style="width: {containerWidth}"
	>
		<!-- Header with Pin/Unpin Button -->
		<div class="border-border/50 flex items-center justify-between border-b p-3">
			{#if isExpanded}
				<span class="text-foreground text-sm font-medium transition-opacity duration-200">
					Navigation
				</span>
			{/if}
			<button
				class="hover:bg-primary/10 h-8 w-8 rounded-md p-0 transition-colors"
				onclick={togglePin}
				aria-label={isPinned ? 'Unpin navigation' : 'Pin navigation'}
			>
				<Icon
					name={isPinned ? navIcons.pinOff : navIcons.pin}
					class={isPinned ? 'text-primary' : 'text-muted-foreground'}
					size={14}
				/>
			</button>
		</div>

		<!-- Navigation Items using List component -->
		<div class="p-2">
			<List
				{items}
				{fields}
				value={activeSection}
				onselect={handleNavClick}
				class="floating-nav-list [&>*]:space-y-1"
			>
				{#snippet child(item)}
					<div class="relative flex w-full items-center">
						<div class="flex h-5 w-5 flex-shrink-0 items-center justify-center">
							{#if item.get('icon')}
								<Icon name={item.get('icon')} size={16} />
							{/if}
						</div>

						{#if isExpanded}
							<div
								class="ml-3 flex w-full items-center justify-between transition-opacity duration-200"
							>
								<span class="truncate text-sm font-medium">{item.get('label')}</span>
								<Icon
									name={navIcons.right}
									size={12}
									class="ml-2 transition-transform duration-200 {activeSection === item.id
										? 'text-primary'
										: 'text-muted-foreground group-hover:text-foreground'}"
								/>
							</div>
						{/if}

						<!-- Active indicator dot for collapsed state -->
						{#if !isExpanded && activeSection === item.id}
							<div
								class="absolute right-1 h-2 w-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 transition-all duration-300"
							/>
						{/if}
					</div>
				{/snippet}
			</List>
		</div>
	</div>

	<!-- Floating indicator when collapsed -->
	{#if !isExpanded}
		<div
			class="absolute -left-3 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b from-orange-500 to-pink-500 shadow-md transition-all duration-200"
		/>
	{/if}
</div>

<style>
	:global(.floating-nav-list [data-cmdk-item]) {
		@apply group mb-1 flex w-full cursor-pointer items-center rounded-xl p-3 transition-all duration-200;
	}

	:global(.floating-nav-list [data-cmdk-item][data-selected='true']) {
		@apply text-primary border-primary/20 border bg-gradient-to-r from-orange-500/10 to-pink-500/10;
	}

	:global(.floating-nav-list [data-cmdk-item]:not([data-selected='true'])) {
		@apply hover:bg-muted text-muted-foreground hover:text-foreground;
	}

	:global(.floating-nav-list [data-cmdk-item]:hover) {
		transform: scale(1.02);
	}

	:global(.floating-nav-list [data-cmdk-item]:active) {
		transform: scale(0.98);
	}

	:global(.floating-nav-list [data-cmdk-list]) {
		@apply max-h-none;
	}

	:global(.floating-nav-list [data-cmdk-viewport]) {
		@apply max-h-none;
	}
</style>
