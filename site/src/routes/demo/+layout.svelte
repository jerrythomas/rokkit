<script>
	// @ts-nocheck
	import { onMount } from 'svelte'
	import { page } from '$app/state'
	import { ThemeSwitcherToggle } from '@rokkit/app'
	import { media } from '$lib/media.js'

	let { children } = $props()

	// ─── Navigation ──────────────────────────────────────────────────────────────
	const navSections = [
		{
			title: 'Getting Started',
			items: [
				{ label: 'Introduction', href: '/demo' },
				{ label: 'Installation', href: '/demo/installation' },
				{ label: 'Theming', href: '/demo/theming' }
			]
		},
		{
			title: 'Showcase',
			items: [
				{ label: 'Dashboard', href: '/demo/dashboard' },
				{ label: 'Crossfilter', href: '/demo/crossfilter' },
				{ label: 'Components', href: '/demo/showcase' }
			]
		},
		{
			title: 'Components',
			items: [
				{ label: 'List', href: '/elements/list' },
				{ label: 'Select', href: '/elements/select' },
				{ label: 'Table', href: '/elements/table' },
				{ label: 'Tabs', href: '/elements/tabs' },
				{ label: 'Menu', href: '/elements/menu' },
				{ label: 'Toggle', href: '/elements/toggle' },
				{ label: 'MultiSelect', href: '/elements/multi-select' }
			]
		},
		{
			title: 'Theming',
			items: [
				{ label: 'Colors', href: '/theming/colors' },
				{ label: 'Customization', href: '/customization/colors' }
			]
		}
	]

	let currentPath = $derived(page.url.pathname)

	// ─── Mobile sidebar ───────────────────────────────────────────────────────────
	let sidebarOpen = $state(false)

	let sidebarStyle = $derived.by(() => {
		if (media.large.current) return 'position:static;width:15rem;flex-shrink:0'
		return sidebarOpen
			? 'position:fixed;top:3.5rem;left:0;bottom:0;z-index:45;width:15rem;transform:translateX(0);transition:transform 250ms ease'
			: 'position:fixed;top:3.5rem;left:0;bottom:0;z-index:45;width:15rem;transform:translateX(-100%);transition:transform 250ms ease'
	})
</script>

<!-- Root: fill the body flex column -->
<div class="flex min-h-0 flex-1 flex-col overflow-hidden">
	<!-- ── Header ──────────────────────────────────────────────────────────────── -->
	<header
		class="border-surface-z2 bg-surface-z1 flex h-14 flex-shrink-0 items-center justify-between border-b px-4"
	>
		<div class="flex items-center gap-2">
			<button
				class="text-surface-z6 hover:bg-surface-z3 flex h-9 w-9 items-center justify-center rounded-md text-xl lg:hidden"
				onclick={() => (sidebarOpen = !sidebarOpen)}
				aria-label="Toggle navigation"
				aria-expanded={sidebarOpen}
			>
				<span class="i-glyph:hamburger-menu inline-block" aria-hidden="true"></span>
			</button>
			<a href="/" class="flex items-center gap-2 no-underline">
				{#if media.small.current}
					<img src="/rokkit-icon.svg" alt="Rokkit" class="h-8" />
				{:else}
					<img src="/rokkit-light.svg" alt="Rokkit" class="h-7" />
				{/if}
			</a>
		</div>
		<div class="flex items-center gap-1">
			<ThemeSwitcherToggle size="sm" />
			<a
				href="https://github.com/jerrythomas/rokkit"
				target="_blank"
				rel="noopener noreferrer"
				class="text-surface-z5 hover:text-surface-z8 flex h-9 w-9 items-center justify-center rounded-md text-xl no-underline"
				aria-label="Rokkit on GitHub"
			>
				<span class="i-logo:github inline-block" aria-hidden="true"></span>
			</a>
		</div>
	</header>

	<!-- ── Body ──────────────────────────────────────────────────────────────────── -->
	<div class="relative flex min-h-0 flex-1 overflow-hidden">
		<!-- Backdrop (mobile only) -->
		{#if sidebarOpen}
			<div
				class="fixed inset-x-0 bottom-0 z-40 bg-black/50 lg:hidden"
				style="top: 3.5rem"
				role="presentation"
				onclick={() => (sidebarOpen = false)}
			></div>
		{/if}

		<!-- ── Sidebar ─────────────────────────────────────────────────────────── -->
		<aside
			class="bg-surface-z1 border-surface-z2 border-r"
			style={sidebarStyle}
			aria-label="Site navigation"
		>
			<div class="h-full overflow-y-auto px-3 py-6">
				{#each navSections as section (section.title)}
					<div class="mb-6">
						<p
							class="text-surface-z4 mb-1 px-2 text-[11px] font-bold tracking-widest uppercase opacity-60"
						>
							{section.title}
						</p>
						<div class="flex flex-col gap-0.5">
							{#each section.items as item (item.href)}
								<a
									href={item.href}
									class="flex items-center rounded-md px-2.5 py-1.5 text-sm no-underline transition-colors"
									class:text-surface-z5={currentPath !== item.href}
									class:hover:text-surface-z8={currentPath !== item.href}
									class:text-secondary-z7={currentPath === item.href}
									class:font-medium={currentPath === item.href}
									class:bg-surface-z3={currentPath === item.href}
									onclick={() => (sidebarOpen = false)}
								>
									{item.label}
								</a>
							{/each}
						</div>
					</div>
				{/each}
			</div>
		</aside>

		<!-- ── Main scroll area ────────────────────────────────────────────────── -->
		<main id="demo-scroll" class="min-w-0 flex-1 overflow-y-auto">
			{@render children()}
		</main>
	</div>
</div>
