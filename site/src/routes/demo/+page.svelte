<script>
	// @ts-nocheck
	import { onMount } from 'svelte'
	import { page } from '$app/state'
	import { ThemeSwitcherToggle } from '@rokkit/app'
	import { media } from '$lib/media.js'

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

	// Sidebar positioning — inline styles because assetsInclude: ['**/*.svelte'] in
	// vite.config breaks Svelte's CSS sub-resource loading on the learn site
	let sidebarStyle = $derived.by(() => {
		if (media.large.current) return 'position:static;width:15rem;flex-shrink:0'
		return sidebarOpen
			? 'position:fixed;top:3.5rem;left:0;bottom:0;z-index:45;width:15rem;transform:translateX(0);transition:transform 250ms ease'
			: 'position:fixed;top:3.5rem;left:0;bottom:0;z-index:45;width:15rem;transform:translateX(-100%);transition:transform 250ms ease'
	})

	// ─── TOC ──────────────────────────────────────────────────────────────────────
	let headings = $state([])
	let activeId = $state('')
	let observer = null

	function slugify(text) {
		return (text ?? '')
			.toLowerCase()
			.trim()
			.replace(/\s+/g, '-')
			.replace(/[^a-z0-9-]/g, '')
			.replace(/-+/g, '-')
	}

	function scanHeadings() {
		const root = document.getElementById('demo-scroll')
		if (!root) return
		const els = [...root.querySelectorAll('h2, h3')]
		headings = els.map((el, i) => {
			if (!el.id) el.id = slugify(el.textContent) || `s${i}`
			return { id: el.id, text: el.textContent?.trim() ?? '', level: el.tagName.toLowerCase() }
		})
	}

	function setupObserver() {
		observer?.disconnect()
		const root = document.getElementById('demo-scroll')
		if (!root || headings.length === 0) return
		observer = new IntersectionObserver(
			(entries) => {
				const visible = entries
					.filter((e) => e.isIntersecting)
					.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
				if (visible.length > 0) activeId = visible[0].target.id
			},
			{ root, rootMargin: '-5% 0px -70% 0px' }
		)
		headings.forEach(({ id }) => {
			const el = document.getElementById(id)
			if (el) observer.observe(el)
		})
	}

	function scrollTo(id) {
		const el = document.getElementById(id)
		const container = document.getElementById('demo-scroll')
		if (!el || !container) return
		container.scrollTo({ top: el.offsetTop - 16, behavior: 'smooth' })
	}

	onMount(() => {
		scanHeadings()
		setupObserver()
		return () => observer?.disconnect()
	})
</script>

<!-- Root: fill the body flex column -->
<div class="flex flex-col flex-1 min-h-0 overflow-hidden">

	<!-- ── Header ──────────────────────────────────────────────────────────────── -->
	<header class="flex h-14 flex-shrink-0 items-center justify-between border-b border-surface-z2 bg-surface-z1 px-4">
		<div class="flex items-center gap-2">
			<!-- Hamburger (mobile only) -->
			<button
				class="flex h-9 w-9 items-center justify-center rounded-md text-xl text-surface-z6 hover:bg-surface-z3 lg:hidden"
				onclick={() => (sidebarOpen = !sidebarOpen)}
				aria-label="Toggle navigation"
				aria-expanded={sidebarOpen}
			>
				<span class="i-solar:hamburger-menu-bold-duotone inline-block" aria-hidden="true"></span>
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
				class="flex h-9 w-9 items-center justify-center rounded-md text-xl text-surface-z5 hover:text-surface-z8 no-underline"
				aria-label="Rokkit on GitHub"
			>
				<span class="i-logo:github inline-block" aria-hidden="true"></span>
			</a>
		</div>
	</header>

	<!-- ── Body ──────────────────────────────────────────────────────────────────── -->
	<div class="flex flex-1 min-h-0 overflow-hidden relative">

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
			class="bg-surface-z1 border-r border-surface-z2"
			style={sidebarStyle}
			aria-label="Site navigation"
		>
			<div class="overflow-y-auto h-full px-3 py-6">
				{#each navSections as section}
					<div class="mb-6">
						<p class="mb-1 px-2 text-[11px] font-bold uppercase tracking-widest text-surface-z4 opacity-60">
							{section.title}
						</p>
						<div class="flex flex-col gap-0.5">
							{#each section.items as item}
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
		<main id="demo-scroll" class="flex-1 min-w-0 overflow-y-auto">
			<div class="mx-auto max-w-[760px] px-6 py-10 lg:px-10">

				<!-- Page header -->
				<div class="mb-8 border-b border-surface-z2 pb-8">
					<h1 class="mb-3 text-[1.75rem] font-bold tracking-tight text-surface-z8">Introduction</h1>
					<p class="text-base leading-relaxed text-surface-z5">
						Rokkit is a data-first Svelte 5 component library. Every component accepts your data's
						natural shape through a simple field mapping — no adapters, no transformations, no
						boilerplate.
					</p>
				</div>

				<!-- Image placeholder -->
				<div class="mb-8 flex h-48 items-center justify-center rounded-xl border border-dashed border-surface-z3 bg-surface-z2">
					<div class="flex flex-col items-center gap-2 text-surface-z4">
						<span class="i-solar:widget-bold-duotone inline-block text-5xl" aria-hidden="true"></span>
						<span class="text-sm">Component preview image</span>
					</div>
				</div>

				<h2 class="mb-3 mt-10 border-b border-surface-z2 pb-2 text-xl font-semibold text-surface-z8">
					Why Rokkit?
				</h2>
				<p class="mb-4 leading-7 text-surface-z6">
					Most UI libraries define rigid data contracts. You reshape your API responses to fit their
					expectations. Rokkit flips this: you tell it which fields in your data map to which roles
					in the UI, and it adapts.
				</p>

				<h3 class="mb-2 mt-6 text-base font-semibold text-surface-z8">Data-First</h3>
				<p class="mb-4 leading-7 text-surface-z6">
					Pass any object structure with a <code class="rounded bg-surface-z3 px-1.5 py-0.5 font-mono text-sm">fields</code>
					mapping. The same pattern works across List, Select, Table, Tabs, MultiSelect — learn it once,
					use it everywhere.
				</p>
				<div class="mb-4 overflow-hidden rounded-lg border border-surface-z2 bg-surface-z2">
					<pre class="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-surface-z7"><code>const users = await fetch('/api/users').then(r => r.json())
const fields = &#123; text: 'name', value: 'id' &#125;

// No .map(), no adapter needed
&lt;List items=&#123;users&#125; &#123;fields&#125; bind:value /&gt;</code></pre>
				</div>

				<h3 class="mb-2 mt-6 text-base font-semibold text-surface-z8">Composable</h3>
				<p class="mb-4 leading-7 text-surface-z6">
					Every component is extensible via Svelte snippets. Customize rendering without forking or
					wrapping. The component's data logic stays intact while you control every pixel of the output.
				</p>

				<h3 class="mb-2 mt-6 text-base font-semibold text-surface-z8">Accessible</h3>
				<p class="mb-4 leading-7 text-surface-z6">
					Full keyboard navigation and ARIA support are built in via the navigator pattern. Focus
					management, arrow key routing, and screen reader announcements come with every component —
					no configuration required.
				</p>

				<h3 class="mb-2 mt-6 text-base font-semibold text-surface-z8">Themeable</h3>
				<p class="mb-4 leading-7 text-surface-z6">
					Components expose <code class="rounded bg-surface-z3 px-1.5 py-0.5 font-mono text-sm">data-*</code>
					attribute hooks for styling, with clean separation between layout CSS and visual theme CSS.
					Ship with the included Rokkit theme or build your own.
				</p>

				<h2 class="mb-3 mt-10 border-b border-surface-z2 pb-2 text-xl font-semibold text-surface-z8">
					Community
				</h2>
				<p class="mb-4 leading-7 text-surface-z6">
					Rokkit is open source and welcomes contributions. File issues, submit pull requests, or
					start a discussion on GitHub.
				</p>
				<div class="mb-6 flex gap-3">
					<a
						href="https://github.com/jerrythomas/rokkit"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-2 rounded-md border border-surface-z3 px-4 py-2 text-sm font-medium text-surface-z7 no-underline hover:bg-surface-z2 transition-colors"
					>
						<span class="i-logo:github inline-block text-base" aria-hidden="true"></span>
						GitHub
					</a>
				</div>

				<h2 class="mb-3 mt-10 border-b border-surface-z2 pb-2 text-xl font-semibold text-surface-z8">
					Where to go next
				</h2>
				<p class="mb-4 leading-7 text-surface-z6">
					Pick a component and see the data-first pattern in action:
				</p>
				<div class="grid grid-cols-2 gap-3">
					{#each [
						{ label: 'List', href: '/elements/list', desc: 'Select from a collection using field mapping' },
						{ label: 'Select', href: '/elements/select', desc: 'Dropdown selection with keyboard navigation' },
						{ label: 'Table', href: '/elements/table', desc: 'Sortable, filterable data tables' },
						{ label: 'Theming', href: '/theming/colors', desc: 'Semantic color palettes and surface depth' }
					] as link}
						<a
							href={link.href}
							class="flex flex-col gap-1 rounded-lg border border-surface-z2 p-4 no-underline hover:border-surface-z4 hover:bg-surface-z2 transition-colors"
						>
							<span class="text-sm font-semibold text-surface-z8">{link.label}</span>
							<span class="text-xs leading-relaxed text-surface-z5">{link.desc}</span>
						</a>
					{/each}
				</div>

			</div>
		</main>

		<!-- ── TOC ──────────────────────────────────────────────────────────────── -->
		{#if headings.length > 1}
			<aside class="hidden lg:flex flex-col w-52 flex-shrink-0 overflow-y-auto border-l border-surface-z2">
				<div class="px-4 py-6">
					<p class="mb-3 text-[11px] font-bold uppercase tracking-widest text-surface-z4">On this page</p>
					<ul class="m-0 list-none border-l border-surface-z3 p-0">
						{#each headings as h}
							<li>
								<button
									class="block w-full cursor-pointer bg-transparent text-left font-[inherit] text-[0.8125rem] leading-[1.5] py-[0.3rem] -ml-px border-l-2 border-transparent transition-colors hover:text-surface-z8"
									class:text-surface-z5={activeId !== h.id}
									class:text-secondary-z7={activeId === h.id}
									class:border-l-secondary-z7={activeId === h.id}
									class:font-medium={activeId === h.id}
									class:pl-[1.75rem]={h.level === 'h3'}
									class:pl-[0.875rem]={h.level === 'h2'}
									onclick={() => scrollTo(h.id)}
								>
									{h.text}
								</button>
							</li>
						{/each}
					</ul>
				</div>
			</aside>
		{/if}

	</div>
</div>

