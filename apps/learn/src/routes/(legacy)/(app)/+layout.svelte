<script>
	import { page } from '$app/state'
	import { onMount } from 'svelte'
	import { getSidebarNav, getSettingsNav } from '$lib/data/navigation'
	import { m } from '$lib/paraglide/messages.js'
	import { List } from '@rokkit/ui'
	import ListItem from '$lib/components/ListItem.svelte'
	import { theme } from '$lib/stores/theme.svelte'

	let { children } = $props()

	onMount(() => theme.restoreSkin())
	let sidebarCollapsed = $state(false)

	const sidebarNav = $derived(getSidebarNav())
	const settingsNav = $derived(getSettingsNav())

	function findActiveId(nav, pathname) {
		const roots = nav.filter((i) => i.href && pathname.startsWith(i.href))
		if (roots.length) return roots[0].id
		const nested = nav.flatMap((i) => i.children ?? [])
		const match = nested.find((i) => pathname.startsWith(i.href))
		return match?.id ?? 'observatory'
	}

	const activeId = $derived(findActiveId(sidebarNav, page.url.pathname))
</script>

<div
	class="grid min-h-screen transition-[grid-template-columns] duration-200 ease-in-out"
	style="grid-template-columns: {sidebarCollapsed ? 'var(--layout-sidebar-collapsed)' : 'var(--layout-sidebar-width)'} 1fr"
	data-radius="soft"
>
	<!-- ─── Sidebar ────────────────────────────────────────────────────────── -->
	<aside
		class="sidebar flex flex-col overflow-hidden px-3.5 py-5.5 bg-paper-soft border-r border-paper-mute"
	>
		<!-- Logo -->
		<div class="flex items-center gap-2.5 px-2.5 pb-4.5">
			<span class="kanji text-[20px] text-primary">先</span>
			{#if !sidebarCollapsed}
				<span class="font-display text-[17px] font-medium text-ink-mute tracking-[-0.02em] flex-1">Sensei</span>
			{/if}
			<button
				class="w-6 h-6 flex items-center justify-center text-paper-edge text-[14px] rounded flex-shrink-0 hover:bg-paper-soft hover:text-ink-mute transition-colors"
				onclick={() => (sidebarCollapsed = !sidebarCollapsed)}
				title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
			>
				{sidebarCollapsed ? '›' : '‹'}
			</button>
		</div>

		<!-- Main navigation -->
		<div class="flex-1 overflow-y-auto">
			<List
				items={sidebarNav}
				fields={{ value: 'id', label: 'label', icon: 'kanji', href: 'href', badge: 'badge' }}
				value={activeId}
				label="Main navigation"
				size="sm"
				class="gap-px"
			>
				{#snippet itemContent(proxy)}
					<ListItem {proxy} collapsed={sidebarCollapsed} />
				{/snippet}
				{#snippet groupContent(proxy)}
					{#if !sidebarCollapsed}
						<span data-item-label>{proxy.label}</span>
					{/if}
				{/snippet}
			</List>
		</div>

		<!-- Footer -->
		<div class="border-t border-paper-mute pt-2 flex flex-col gap-px">
			<a
				href={settingsNav.href}
				class="group grid items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] font-normal no-underline cursor-pointer transition-colors duration-[120ms] text-ink-soft hover:bg-paper-soft hover:text-ink-mute"
				style="grid-template-columns: auto 1fr auto"
				title={sidebarCollapsed ? 'Settings' : undefined}
			>
				<span class="kanji text-[14px] w-[18px] text-center text-paper-edge group-hover:text-ink-soft">{settingsNav.kanji}</span>
				{#if !sidebarCollapsed}
					<span class="whitespace-nowrap overflow-hidden text-ellipsis">{settingsNav.label}</span>
				{/if}
			</a>

			{#if !sidebarCollapsed}
				<div class="flex items-center gap-1.5 pt-2 px-2.5">
					<span class="w-[6px] h-[6px] rounded-full bg-success flex-shrink-0"></span>
					<span class="text-[10px] text-paper-edge">{m.daemon_running()}</span>
				</div>
			{/if}
		</div>
	</aside>

	<!-- ─── Main content ───────────────────────────────────────────────────── -->
	<main class="overflow-y-auto max-h-screen relative">
		{@render children?.()}
	</main>
</div>
