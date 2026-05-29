<script>
	// @ts-nocheck
	import { page } from '$app/state'
	import { beforeNavigate, afterNavigate } from '$app/navigation'
	import Sidebar from './Sidebar.svelte'
	import { TableOfContents } from '@rokkit/app'
	import { media } from '$lib/media.js'
	import { findSection, findGroupForSection } from '$lib/stories.js'

	let { data, children } = $props()
	let sections = $derived(data.sections)
	let canonicalPath = $derived(page.url.pathname.replace(/\/play$/, ''))
	let currentSection = $derived(findSection(sections, canonicalPath))
	let { title, description, icon = '?', llms = false } = $derived(currentSection)
	let componentSlug = $derived(
		canonicalPath.includes('/docs/components/') || canonicalPath.includes('/docs/charts/')
			? canonicalPath.split('/').pop()
			: null
	)
	const playHref = $derived(
		canonicalPath.includes('/docs/components/') && componentSlug
			? `/playground/components/${componentSlug}`
			: null
	)
	const llmsHref = $derived(llms && componentSlug ? `/llms/components/${componentSlug}.txt` : null)

	let breadcrumbs = $derived.by(() => {
		const group = findGroupForSection(sections, canonicalPath)
		if (!group) return []
		const crumbs = [{ label: 'Learn', href: '/' }]
		if (group.title) {
			crumbs.push({ label: group.title })
		}
		if (title && title !== group?.title) {
			crumbs.push({ label: title })
		}
		return crumbs
	})

	let sidebarOpen = $state(typeof window !== 'undefined' ? window.innerWidth >= 1024 : false)
	let _loading = $state(false)
	let sidebarRef = $state(null)
	let toc = $state(null)

	function handleKeydown(e) {
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault()
			if (!sidebarOpen) sidebarOpen = true
			// Small delay to let sidebar render if it was closed
			setTimeout(() => sidebarRef?.focusSearch(), 50)
		}
	}

	// Sidebar positioning — inline styles because assetsInclude: ['**/*.svelte'] in
	// vite.config breaks Svelte's CSS sub-resource loading on the learn site
	let sidebarStyle = $derived.by(() => {
		const large =
			media.large.current ?? (typeof window !== 'undefined' ? window.innerWidth >= 1024 : false)
		if (large) {
			return sidebarOpen
				? 'position:static;flex:0 0 18rem;min-width:18rem;overflow-y:auto'
				: 'position:static;flex:0 0 0px;min-width:0;overflow:hidden'
		}
		return sidebarOpen
			? 'position:fixed;top:5.5rem;left:0;bottom:0;z-index:45;width:18rem;overflow-y:auto;transform:translateX(0);transition:transform 250ms ease'
			: 'position:fixed;top:5.5rem;left:0;bottom:0;z-index:45;width:18rem;overflow:hidden;transform:translateX(-100%);transition:transform 250ms ease'
	})

	// Auto-close when resizing down to mobile (only when definitively not large)
	$effect(() => {
		if (media.large.current === false) sidebarOpen = false
	})

	beforeNavigate(() => {
		_loading = true
	})
	afterNavigate(() => {
		_loading = false
		if (media.large.current === false) sidebarOpen = false
		toc?.rescan()
	})
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>{title}</title>
	<meta name="tutorial" content={description} />
</svelte:head>

<div class="flex min-h-0 flex-1 flex-col overflow-hidden">
	<!-- ── Mobile sidebar toggle (hidden on desktop) ──────────────────────────── -->
	<div
		class="border-surface-z2 bg-surface-z1 flex h-10 flex-shrink-0 items-center border-b px-3 lg:hidden"
	>
		<button
			class="text-surface-z6 hover:bg-surface-z3 flex h-8 w-8 items-center justify-center rounded-md"
			onclick={() => (sidebarOpen = !sidebarOpen)}
			aria-label="Toggle navigation"
			aria-expanded={sidebarOpen}
		>
			<span class="i-glyph:hamburger-menu inline-block text-lg" aria-hidden="true"></span>
		</button>
	</div>

	<!-- ── Body ──────────────────────────────────────────────────────────────────── -->
	<div class="relative flex min-h-0 flex-1 overflow-hidden">
		<!-- Backdrop (mobile only) -->
		{#if sidebarOpen && !media.large.current}
			<div
				class="fixed inset-x-0 bottom-0 z-40 bg-black/50 lg:hidden"
				style="top: 5.5rem"
				role="presentation"
				onclick={() => (sidebarOpen = false)}
			></div>
		{/if}

		<!-- ── Sidebar ─────────────────────────────────────────────────────────── -->
		<aside
			class="bg-surface-z1 border-surface-z2 flex flex-col border-r"
			style={sidebarStyle}
			aria-label="Site navigation"
		>
			<Sidebar bind:this={sidebarRef} {sections} fields={data.fields} />
		</aside>

		<!-- ── Main column ──────────────────────────────────────────────────────── -->
		<div class="flex min-w-0 flex-1 flex-col overflow-hidden">
			<div class="flex min-h-0 flex-1 overflow-hidden">
				<main id="main-content" class="relative min-w-0 flex-1 overflow-y-auto p-8">
					{#if playHref || llmsHref}
						<div class="absolute top-4 right-4 z-10 flex items-center gap-1">
							{#if playHref}
								<a
									href={playHref}
									class="text-surface-z5 hover:bg-surface-z3 hover:text-surface-z8 flex h-8 w-8 items-center justify-center rounded-md no-underline"
									title="Open in Playground"
									aria-label="Open in Playground"
								>
									<span class="i-glyph:gamepad inline-block text-lg" aria-hidden="true"></span>
								</a>
							{/if}
							{#if llmsHref}
								<a
									href={llmsHref}
									target="_blank"
									rel="noopener noreferrer"
									class="text-surface-z5 hover:bg-surface-z3 hover:text-surface-z8 flex h-8 w-8 items-center justify-center rounded-md no-underline"
									title="View llms.txt"
									aria-label="View llms.txt"
								>
									<span class="i-glyph:file-text inline-block text-lg" aria-hidden="true"></span>
								</a>
							{/if}
						</div>
					{/if}
					{#if breadcrumbs.length > 0}
						<nav class="mb-2 flex items-center gap-1 text-sm" aria-label="Breadcrumb">
							{#each breadcrumbs as crumb, i (i)}
								{#if i > 0}<span class="text-surface-z3 mx-1">/</span>{/if}
								{#if crumb.href}
									<a href={crumb.href} class="text-surface-z5 hover:text-surface-z8"
										>{crumb.label}</a
									>
								{:else}
									<span class="text-surface-z7">{crumb.label}</span>
								{/if}
							{/each}
						</nav>
					{/if}
					<h1
						class="text-surface-z8 mb-1 flex items-center gap-3 text-[1.75rem] font-bold tracking-tight"
					>
						{#if icon}
							<span class="{icon} text-secondary-z7 text-4xl" aria-hidden="true"></span>
						{/if}
						{title}
					</h1>
					{#if description}
						<p class="text-surface-z5 mb-6 text-sm">{description}</p>
					{/if}
					{@render children?.()}
				</main>
				<aside
					class="border-surface-z2 hidden w-52 flex-shrink-0 flex-col overflow-y-auto border-l px-5 py-6 xl:flex"
				>
					<TableOfContents bind:this={toc} />
				</aside>
			</div>
		</div>
	</div>
</div>
