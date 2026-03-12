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

<div class="flex min-h-screen flex-col">
	<!-- Top bar -->
	<header
		class="border-surface-z2 bg-surface-z1 flex h-14 flex-shrink-0 items-center justify-between border-b px-4"
	>
		<div class="flex items-center gap-3">
			<span class="i-solar:atom-bold-duotone text-primary-z6 text-2xl" aria-hidden="true"></span>
			<span class="text-surface-z8 text-lg font-bold">Nexus</span>
			<span class="text-surface-z4 hidden text-xs sm:inline">Project Workspace</span>
		</div>
		<div class="flex items-center gap-2">
			<a
				href="/"
				class="text-surface-z5 hover:text-surface-z8 flex items-center gap-1 text-xs no-underline"
			>
				<span class="i-solar:arrow-left-bold-duotone text-sm" aria-hidden="true"></span>
				Back to Docs
			</a>
		</div>
	</header>

	<!-- Body -->
	<div class="flex min-h-0 flex-1 overflow-hidden">
		<!-- Sidebar -->
		<aside
			class="border-surface-z2 bg-surface-z1 hidden w-52 flex-shrink-0 flex-col overflow-y-auto border-r md:flex"
		>
			<div class="p-3 pt-4">
				<List items={navItems} {fields} value={page.url.pathname} />
			</div>
		</aside>

		<!-- Main content -->
		<main class="bg-surface-z0 flex-1 overflow-y-auto">
			{@render children()}
		</main>
	</div>
</div>

<ThemePanel />
