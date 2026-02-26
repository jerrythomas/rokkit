<script>
	// @ts-nocheck
	import { page } from '$app/state'
	import { beforeNavigate, afterNavigate } from '$app/navigation'
	import Sidebar from './Sidebar.svelte'
	import { ThemeSwitcherToggle } from '@rokkit/app'
	import { Button, ProgressBar } from '@rokkit/ui'
	import { media } from '$lib/media.js'
	import { findSection, findGroupForSection } from '$lib/stories.js'

	let { data, children } = $props()
	let sections = $derived(data.sections)
	let canonicalPath = $derived(page.url.pathname.replace(/\/play$/, ''))
	let currentSection = $derived(findSection(sections, canonicalPath))
	let { title, description, icon = '?' } = $derived(currentSection)

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

	let sidebarOpen = $state(false)
	let loading = $state(false)

	beforeNavigate(() => {
		loading = true
	})
	afterNavigate(() => {
		loading = false
		sidebarOpen = false
	})
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="tutorial" content={description} />
</svelte:head>

<div class="flex h-full overflow-hidden">
	<!-- Backdrop: mobile/tablet only, shown when sidebar open -->
	{#if sidebarOpen}
		<div
			class="fixed inset-0 z-20 bg-black/50 lg:hidden"
			role="presentation"
			onclick={() => (sidebarOpen = false)}
		></div>
	{/if}

	<!-- Sidebar (overlay on mobile, inline on desktop) -->
	<aside class="sidebar bg-surface-z0 border-r border-surface-z2" class:is-open={sidebarOpen} aria-label="Site navigation">
		<Sidebar {sections} fields={data.fields} />
	</aside>

	<!-- Content column -->
	<div class="flex min-w-0 flex-1 flex-col overflow-hidden">
		<!-- Top bar -->
		<header
			class="bg-surface-z1 border-surface-z2 relative flex min-h-12 flex-shrink-0 items-center justify-between border-b px-4"
		>
			{#if loading}
				<ProgressBar class="absolute inset-x-0 top-0 z-10" />
			{/if}
			<div class="flex items-center gap-3">
				<button
					class="rounded-md p-2 text-surface-z6 hover:bg-surface-z2 lg:hidden"
					onclick={() => (sidebarOpen = !sidebarOpen)}
					aria-label="Toggle navigation"
					aria-expanded={sidebarOpen}
				>
					<span class="i-solar:hamburger-menu-bold-duotone text-xl" aria-hidden="true"></span>
				</button>
				<a href="/" class="flex items-center gap-2">
					{#if media.small.current}
						<img src="/rokkit-icon.svg" alt="Rokkit" class="h-10" />
					{:else}
						<img src="/rokkit-light.svg" alt="Rokkit" class="h-8" />
					{/if}
				</a>
				{#if !media.small.current}
					<small class="text-surface-z5 hidden sm:inline">{data.app.version}</small>
				{/if}
			</div>
			<div class="flex items-center gap-3">
				<ThemeSwitcherToggle size="sm" />
				<Button
					icon="i-logo:github"
					href="https://github.com/jerrythomas/rokkit"
					target="_blank"
					aria-label="Rokkit on Github"
					style="ghost"
				/>
			</div>
		</header>

		<!-- Sub-header: breadcrumbs + page identity -->
		<div class="border-surface-z2 bg-surface-z2 flex-shrink-0 border-b px-6 py-4">
			{#if breadcrumbs.length > 0}
				<nav class="mb-2 flex items-center gap-1 text-sm" aria-label="Breadcrumb">
					{#each breadcrumbs as crumb, i}
						{#if i > 0}<span class="text-surface-z3 mx-1">/</span>{/if}
						{#if crumb.href}
							<a href={crumb.href} class="text-surface-z5 hover:text-surface-z8">{crumb.label}</a>
						{:else}
							<span class="text-surface-z7">{crumb.label}</span>
						{/if}
					{/each}
				</nav>
			{/if}
			<h1 class="flex items-center gap-3 text-xl font-semibold text-surface-z8">
				{#if icon}
					<span class="{icon} text-secondary-z7 text-4xl" aria-hidden="true"></span>
				{/if}
				{title}
			</h1>
			{#if description}
				<p class="mt-1 text-sm text-surface-z5">{description}</p>
			{/if}
		</div>

		<!-- Scrollable page content -->
		<main class="flex-1 overflow-y-auto p-8">{@render children?.()}</main>
	</div>
</div>

<style>
	.sidebar {
		position: fixed;
		inset-block: 0;
		left: 0;
		z-index: 30;
		width: 16rem;
		overflow-y: auto;
		transform: translateX(-100%);
		transition: transform 300ms ease-in-out;
	}
	.sidebar.is-open {
		transform: translateX(0);
	}
	@media (min-width: 1024px) {
		.sidebar {
			position: static;
			z-index: auto;
			transform: none;
			flex-shrink: 0;
		}
	}
</style>
