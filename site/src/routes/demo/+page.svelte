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
<div class="flex min-h-0 flex-1 flex-col overflow-hidden">
	<!-- ── Header ──────────────────────────────────────────────────────────────── -->
	<header
		class="border-surface-z2 bg-surface-z1 flex h-14 flex-shrink-0 items-center justify-between border-b px-4"
	>
		<div class="flex items-center gap-2">
			<!-- Hamburger (mobile only) -->
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
				{#each navSections as section}
					<div class="mb-6">
						<p
							class="text-surface-z4 mb-1 px-2 text-[11px] font-bold tracking-widest uppercase opacity-60"
						>
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
		<main id="demo-scroll" class="min-w-0 flex-1 overflow-y-auto">
			<div class="mx-auto max-w-[760px] px-6 py-10 lg:px-10">
				<!-- Page header -->
				<div class="border-surface-z2 mb-8 border-b pb-8">
					<h1 class="text-surface-z8 mb-3 text-[1.75rem] font-bold tracking-tight">Introduction</h1>
					<p class="text-surface-z5 text-base leading-relaxed">
						Rokkit is a data-first Svelte 5 component library. Every component accepts your data's
						natural shape through a simple field mapping — no adapters, no transformations, no
						boilerplate.
					</p>
				</div>

				<!-- Image placeholder -->
				<div
					class="border-surface-z3 bg-surface-z2 mb-8 flex h-48 items-center justify-center rounded-xl border border-dashed"
				>
					<div class="text-surface-z4 flex flex-col items-center gap-2">
						<span class="i-glyph:widget inline-block text-5xl" aria-hidden="true"
						></span>
						<span class="text-sm">Component preview image</span>
					</div>
				</div>

				<h2
					class="border-surface-z2 text-surface-z8 mt-10 mb-3 border-b pb-2 text-xl font-semibold"
				>
					Why Rokkit?
				</h2>
				<p class="text-surface-z6 mb-4 leading-7">
					Most UI libraries define rigid data contracts. You reshape your API responses to fit their
					expectations. Rokkit flips this: you tell it which fields in your data map to which roles
					in the UI, and it adapts.
				</p>

				<h3 class="text-surface-z8 mt-6 mb-2 text-base font-semibold">Data-First</h3>
				<p class="text-surface-z6 mb-4 leading-7">
					Pass any object structure with a <code
						class="bg-surface-z3 rounded px-1.5 py-0.5 font-mono text-sm">fields</code
					>
					mapping. The same pattern works across List, Select, Table, Tabs, MultiSelect — learn it once,
					use it everywhere.
				</p>
				<div class="border-surface-z2 bg-surface-z2 mb-4 overflow-hidden rounded-lg border">
					<pre class="text-surface-z7 overflow-x-auto p-4 font-mono text-sm leading-relaxed"><code
							>const users = await fetch('/api/users').then(r => r.json())
const fields = &#123; text: 'name', value: 'id' &#125;

// No .map(), no adapter needed
&lt;List items=&#123;users&#125; &#123;fields&#125; bind:value /&gt;</code
						></pre>
				</div>

				<h3 class="text-surface-z8 mt-6 mb-2 text-base font-semibold">Composable</h3>
				<p class="text-surface-z6 mb-4 leading-7">
					Every component is extensible via Svelte snippets. Customize rendering without forking or
					wrapping. The component's data logic stays intact while you control every pixel of the
					output.
				</p>

				<h3 class="text-surface-z8 mt-6 mb-2 text-base font-semibold">Accessible</h3>
				<p class="text-surface-z6 mb-4 leading-7">
					Full keyboard navigation and ARIA support are built in via the navigator pattern. Focus
					management, arrow key routing, and screen reader announcements come with every component —
					no configuration required.
				</p>

				<h3 class="text-surface-z8 mt-6 mb-2 text-base font-semibold">Themeable</h3>
				<p class="text-surface-z6 mb-4 leading-7">
					Components expose <code class="bg-surface-z3 rounded px-1.5 py-0.5 font-mono text-sm"
						>data-*</code
					>
					attribute hooks for styling, with clean separation between layout CSS and visual theme CSS.
					Ship with the included Rokkit theme or build your own.
				</p>

				<h2
					class="border-surface-z2 text-surface-z8 mt-10 mb-3 border-b pb-2 text-xl font-semibold"
				>
					Community
				</h2>
				<p class="text-surface-z6 mb-4 leading-7">
					Rokkit is open source and welcomes contributions. File issues, submit pull requests, or
					start a discussion on GitHub.
				</p>
				<div class="mb-6 flex gap-3">
					<a
						href="https://github.com/jerrythomas/rokkit"
						target="_blank"
						rel="noopener noreferrer"
						class="border-surface-z3 text-surface-z7 hover:bg-surface-z2 inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium no-underline transition-colors"
					>
						<span class="i-logo:github inline-block text-base" aria-hidden="true"></span>
						GitHub
					</a>
				</div>

				<h2
					class="border-surface-z2 text-surface-z8 mt-10 mb-3 border-b pb-2 text-xl font-semibold"
				>
					Where to go next
				</h2>
				<p class="text-surface-z6 mb-4 leading-7">
					Pick a component and see the data-first pattern in action:
				</p>
				<div class="grid grid-cols-2 gap-3">
					{#each [{ label: 'List', href: '/elements/list', desc: 'Select from a collection using field mapping' }, { label: 'Select', href: '/elements/select', desc: 'Dropdown selection with keyboard navigation' }, { label: 'Table', href: '/elements/table', desc: 'Sortable, filterable data tables' }, { label: 'Theming', href: '/theming/colors', desc: 'Semantic color palettes and surface depth' }] as link}
						<a
							href={link.href}
							class="border-surface-z2 hover:border-surface-z4 hover:bg-surface-z2 flex flex-col gap-1 rounded-lg border p-4 no-underline transition-colors"
						>
							<span class="text-surface-z8 text-sm font-semibold">{link.label}</span>
							<span class="text-surface-z5 text-xs leading-relaxed">{link.desc}</span>
						</a>
					{/each}
				</div>
			</div>
		</main>

		<!-- ── TOC ──────────────────────────────────────────────────────────────── -->
		{#if headings.length > 1}
			<aside
				class="border-surface-z2 hidden w-52 flex-shrink-0 flex-col overflow-y-auto border-l lg:flex"
			>
				<div class="px-4 py-6">
					<p class="text-surface-z4 mb-3 text-[11px] font-bold tracking-widest uppercase">
						On this page
					</p>
					<ul class="border-surface-z3 m-0 list-none border-l p-0">
						{#each headings as h}
							<li>
								<button
									class="hover:text-surface-z8 -ml-px block w-full cursor-pointer border-l-2 border-transparent bg-transparent py-[0.3rem] text-left font-[inherit] text-[0.8125rem] leading-[1.5] transition-colors"
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
