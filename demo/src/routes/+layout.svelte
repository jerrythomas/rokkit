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
		{ id: 'dashboard',     label: 'Dashboard',     icon: 'i-glyph:home',        href: '/dashboard' },
		{ id: 'crossfilter',   label: 'Crossfilter',   icon: 'i-glyph:filter',      href: '/crossfilter' },
		{ id: 'showcase',      label: 'Components',    icon: 'i-glyph:widget',      href: '/showcase' },
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
	<aside class="bg-surface-z1 border-surface-z3 hidden w-56 flex-shrink-0 flex-col border-r md:flex">
		<!-- Logo -->
		<div class="border-surface-z3 flex items-center gap-2 border-b px-4 py-4">
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
		<div class="border-surface-z3 border-t px-4 py-3">
			<span class="text-surface-z4 text-xs">@rokkit/demo</span>
		</div>
	</aside>

	<!-- Main -->
	<div class="flex min-w-0 flex-1 flex-col overflow-hidden">

		<!-- Header -->
		<header class="bg-surface-z1 border-surface-z3 flex h-12 flex-shrink-0 items-center justify-between border-b px-4 md:px-6">
			<div class="flex items-center gap-3">
				<span class="i-glyph:rocket text-primary-z6 text-xl md:hidden"></span>
				<span class="text-surface-z6 text-sm">
					<span class="md:hidden">{navItems.find((n) => n.id === activeSection)?.label ?? 'Dashboard'}</span>
					<span class="hidden md:inline">Business Analytics</span>
				</span>
			</div>
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
