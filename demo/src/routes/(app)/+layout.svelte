<script>
	import { page } from '$app/state'
	import { mainNav, projectGroups, settingsNav } from '$lib/data/navigation'
	import ThemePanel from '$lib/components/ThemePanel.svelte'

	let { children } = $props()
	let sidebarCollapsed = $state(false)
	let themePanelOpen = $state(false)

	const activeId = $derived(
		mainNav.find((n) => page.url.pathname.startsWith(n.href))?.id ?? 'observatory'
	)
</script>

<div class="app-layout" class:collapsed={sidebarCollapsed}>

	<!-- ─── Sidebar ────────────────────────────────────────────────────────── -->
	<aside class="sidebar">

		<!-- Logo -->
		<div class="sidebar-header">
			<span class="kanji" style="font-size: 20px; color: var(--shu);">先</span>
			{#if !sidebarCollapsed}
				<span class="sidebar-title">Sensei</span>
			{/if}
			<button
				class="sidebar-collapse-btn"
				onclick={() => (sidebarCollapsed = !sidebarCollapsed)}
				title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
			>
				{sidebarCollapsed ? '›' : '‹'}
			</button>
		</div>

		<!-- Main navigation -->
		<nav class="sidebar-nav">
			<div class="nav-section">
				{#each mainNav as item (item.id)}
					<a
						href={item.href}
						class="nav-item"
						class:active={activeId === item.id}
						title={sidebarCollapsed ? item.label : undefined}
					>
						<span class="kanji nav-kanji">{item.kanji}</span>
						{#if !sidebarCollapsed}
							<span class="nav-label">{item.label}</span>
						{/if}
					</a>
				{/each}
			</div>

			<!-- Project groups -->
			{#each projectGroups as group (group.label)}
				<div class="nav-section">
					{#if !sidebarCollapsed}
						<span class="nav-group-label">{group.label}</span>
					{/if}
					{#if !group.collapsed}
						{#each group.items as item (item.id)}
							<a href={item.href} class="nav-item" title={sidebarCollapsed ? item.label : undefined}>
								<span class="kanji nav-kanji">{item.kanji}</span>
								{#if !sidebarCollapsed}
									<span class="nav-label">{item.label}</span>
									{#if item.badge}
										<span class="nav-badge mono">{item.badge}</span>
									{/if}
								{/if}
							</a>
						{/each}
					{/if}
				</div>
			{/each}
		</nav>

		<!-- Footer -->
		<div class="sidebar-footer">
			<a href={settingsNav.href} class="nav-item" title={sidebarCollapsed ? 'Settings' : undefined}>
				<span class="kanji nav-kanji">{settingsNav.kanji}</span>
				{#if !sidebarCollapsed}
					<span class="nav-label">{settingsNav.label}</span>
				{/if}
			</a>
			<button
				class="nav-item"
				onclick={() => (themePanelOpen = true)}
				title="Theme settings"
			>
				<span class="kanji nav-kanji">彩</span>
				{#if !sidebarCollapsed}
					<span class="nav-label">Theme</span>
				{/if}
			</button>
			{#if !sidebarCollapsed}
				<div class="sidebar-status">
					<span class="status-dot"></span>
					<span class="status-text">Daemon running</span>
				</div>
			{/if}
		</div>
	</aside>

	<!-- ─── Main content ───────────────────────────────────────────────────── -->
	<main class="main-content">
		{@render children?.()}
	</main>
</div>

<ThemePanel bind:open={themePanelOpen} />

<style>
	.app-layout {
		display: grid;
		grid-template-columns: 240px 1fr;
		min-height: 100vh;
		transition: grid-template-columns 200ms ease;
	}
	.app-layout.collapsed {
		grid-template-columns: 64px 1fr;
	}

	/* ── Sidebar ────────────────────────────────────────────────── */
	.sidebar {
		background: color-mix(in srgb, var(--paper-2) 85%, transparent);
		backdrop-filter: blur(20px) saturate(180%);
		-webkit-backdrop-filter: blur(20px) saturate(180%);
		border-right: var(--hairline);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		padding: 22px 14px;
		gap: 0;
	}

	.sidebar-header {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 0 10px 18px;
	}

	.sidebar-title {
		font-family: var(--font-display);
		font-size: 17px;
		font-weight: 500;
		color: var(--sumi);
		letter-spacing: -0.02em;
		flex: 1;
	}

	.sidebar-collapse-btn {
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--sumi-3);
		font-size: 14px;
		border-radius: 4px;
		flex-shrink: 0;
	}
	.sidebar-collapse-btn:hover {
		background: oklch(0.22 0.012 50 / 0.04);
		color: var(--sumi);
	}

	/* ── Navigation ─────────────────────────────────────────────── */
	.sidebar-nav {
		flex: 1;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.nav-section {
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.nav-group-label {
		font-size: 9.5px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--sumi-4);
		padding: 12px 10px 4px;
	}

	.nav-item {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 10px;
		padding: 7px 10px;
		border-radius: var(--radius);
		color: var(--sumi-2);
		text-decoration: none;
		font-size: 13px;
		font-weight: 400;
		transition: background 120ms ease, color 120ms ease;
		cursor: pointer;
	}
	.nav-item:hover {
		background: oklch(0.22 0.012 50 / 0.04);
		color: var(--sumi);
	}
	.nav-item.active {
		background: var(--paper-3);
		color: var(--sumi);
	}
	.nav-item.active .nav-kanji {
		color: var(--shu);
	}

	.nav-kanji {
		font-size: 14px;
		color: var(--sumi-3);
		width: 18px;
		text-align: center;
	}

	.nav-label {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.nav-badge {
		font-size: 10px;
		color: var(--sumi-3);
	}

	/* ── Footer ─────────────────────────────────────────────────── */
	.sidebar-footer {
		border-top: var(--ink-line);
		padding-top: 8px;
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.sidebar-status {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 10px 0;
	}

	.status-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--jade);
	}

	.status-text {
		font-size: 10px;
		color: var(--sumi-4);
	}

	/* ── Main content ───────────────────────────────────────────── */
	.main-content {
		overflow-y: auto;
		padding: 32px 48px;
		max-height: 100vh;
	}
</style>
