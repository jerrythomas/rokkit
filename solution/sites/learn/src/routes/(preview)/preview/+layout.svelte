<script>
	// @ts-nocheck
	import { page } from '$app/state'
	import { List } from '@rokkit/ui'
	import ThemePanel from './ThemePanel.svelte'

	let { children } = $props()

	const navItems = [
		{ label: 'Dashboard', href: '/preview/dashboard', icon: 'i-solar:chart-square-bold-duotone' },
		{ label: 'Projects', href: '/preview/projects', icon: 'i-solar:folder-open-bold-duotone' },
		{ label: 'Reports', href: '/preview/reports', icon: 'i-solar:chart-2-bold-duotone' },
		{ label: 'Admin', href: '/preview/admin', icon: 'i-solar:settings-bold-duotone' }
	]

	const fields = { label: 'label', href: 'href', icon: 'icon', value: 'href' }
</script>

<div class="flex flex-col min-h-screen">
	<!-- Top bar -->
	<header class="h-14 flex items-center justify-between px-4 border-b border-surface-z2 bg-surface-z1 flex-shrink-0">
		<div class="flex items-center gap-3">
			<span class="i-solar:atom-bold-duotone text-2xl text-primary-z6" aria-hidden="true"></span>
			<span class="font-bold text-surface-z8 text-lg">Nexus</span>
			<span class="text-xs text-surface-z4 hidden sm:inline">Project Workspace</span>
		</div>
		<div class="flex items-center gap-2">
			<a
				href="/"
				class="text-xs text-surface-z5 hover:text-surface-z8 no-underline flex items-center gap-1"
			>
				<span class="i-solar:arrow-left-bold-duotone text-sm" aria-hidden="true"></span>
				Back to Docs
			</a>
		</div>
	</header>

	<!-- Body -->
	<div class="flex flex-1 min-h-0 overflow-hidden">
		<!-- Sidebar -->
		<aside class="w-52 flex-shrink-0 border-r border-surface-z2 bg-surface-z1 overflow-y-auto hidden md:flex flex-col">
			<div class="p-3 pt-4">
				<List items={navItems} {fields} value={page.url.pathname} />
			</div>
		</aside>

		<!-- Main content -->
		<main class="flex-1 overflow-y-auto bg-surface-z0">
			{@render children()}
		</main>
	</div>
</div>

<ThemePanel />
