<script>
	// @ts-nocheck
	import 'uno.css'
	import '../app.css'

	import { vibe } from '@rokkit/states'
	import { themable } from '@rokkit/actions'
	import { List } from '@rokkit/ui'
	import { page } from '$app/state'
	import ThemePanel from '$lib/components/ThemePanel.svelte'

	let { children } = $props()

	let themePanelOpen = $state(false)

	const navItems = [
		{ id: 'dashboard',     label: 'Dashboard',     icon: 'i-glyph:home',       href: '/dashboard' },
		{ id: 'explorer',      label: 'Data Explorer', icon: 'i-glyph:table',       href: '/explorer' },
		{ id: 'analytics',     label: 'Analytics',     icon: 'i-glyph:chart',       href: '/analytics' },
		{ id: 'operations',    label: 'Operations',    icon: 'i-glyph:list-items',  href: '/operations' },
		{ id: 'notifications', label: 'Notifications', icon: 'i-glyph:bell',        href: '/notifications' }
	]

	const navFields = { label: 'label', icon: 'icon', value: 'id' }

	// Active item follows current route
	const activeSection = $derived(
		navItems.find((n) => page.url.pathname.startsWith(n.href))?.id ?? 'dashboard'
	)
</script>

<svelte:body use:themable={{ theme: vibe, storageKey: 'rokkit-demo-theme' }} />

<div class="flex h-screen overflow-hidden" data-density={vibe.density}>

	<!-- Sidebar -->
	<aside
		class="flex w-56 flex-shrink-0 flex-col border-r"
		style="background: var(--color-surface-z1); border-color: var(--color-surface-z3)"
	>
		<!-- Logo -->
		<div
			class="flex items-center gap-2 border-b px-4 py-4"
			style="border-color: var(--color-surface-z3)"
		>
			<span class="i-glyph:rocket text-primary-z6 text-xl"></span>
			<span class="text-surface-z8 font-semibold tracking-tight">Rokkit Demo</span>
		</div>

		<!-- Navigation -->
		<div class="flex-1 overflow-y-auto py-3">
			<List
				items={navItems}
				fields={navFields}
				value={activeSection}
				onselect={(item) => { window.location.href = item.href }}
			/>
		</div>

		<!-- Footer -->
		<div class="border-t px-4 py-3" style="border-color: var(--color-surface-z3)">
			<span class="text-surface-z4 text-xs">@rokkit/demo</span>
		</div>
	</aside>

	<!-- Main -->
	<div class="flex min-w-0 flex-1 flex-col overflow-hidden">

		<!-- Header -->
		<header
			class="flex h-12 flex-shrink-0 items-center justify-between border-b px-6"
			style="background: var(--color-surface-z1); border-color: var(--color-surface-z3)"
		>
			<div class="text-surface-z6 text-sm">Business Analytics</div>
			<button
				type="button"
				onclick={() => (themePanelOpen = true)}
				class="text-surface-z5 hover:text-surface-z8 flex items-center gap-1.5 rounded px-2 py-1 text-xs transition-colors"
				title="Theme settings"
			>
				<span class="i-glyph:palette text-base"></span>
				Theme
			</button>
		</header>

		<!-- Page content -->
		<main class="flex-1 overflow-y-auto">
			{@render children?.()}
		</main>

	</div>
</div>

<ThemePanel bind:open={themePanelOpen} />
