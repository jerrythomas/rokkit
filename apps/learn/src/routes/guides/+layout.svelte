<script lang="ts">
	import { page } from '$app/state'
	import { guidesByCategory } from '$lib/guides'
	import Search from '$lib/guides/Search.svelte'

	const { children } = $props()

	const grouped = guidesByCategory()
	const categories = ['basics', 'data', 'design', 'workflows', 'advanced'] as const
	const categoryLabels: Record<(typeof categories)[number], string> = {
		basics: 'basics',
		data: 'data',
		design: 'design',
		workflows: 'workflows',
		advanced: 'advanced'
	}

	const activeSlug = $derived(page.params.slug ?? null)
</script>

<div class="guides-shell">
	<header class="topbar">
		<a href="/" class="brand">道 Rokkit</a>
		<nav class="topnav" aria-label="Sections">
			<a href="/guides" class:active={!activeSlug}>Guides</a>
			<a href="/app">Koan</a>
		</nav>
		<div class="search-slot"><Search /></div>
	</header>

	<div class="body">
		<nav class="rail" aria-label="Guides table of contents">
			{#each categories as cat (cat)}
				{#if grouped[cat].length > 0}
					<div class="cat-label">{categoryLabels[cat]}</div>
					<ul>
						{#each grouped[cat] as g (g.slug)}
							<li>
								<a
									href={`/guides/${g.slug}`}
									class:active={activeSlug === g.slug}
									aria-current={activeSlug === g.slug ? 'page' : undefined}
								>
									{g.title}
								</a>
							</li>
						{/each}
					</ul>
				{/if}
			{/each}
		</nav>
		<main class="content">
			{@render children?.()}
		</main>
	</div>
</div>

<style>
	/* Scroll architecture — load-bearing.
	   Every flex/grid ancestor on the path to a scroll container needs
	   min-height: 0, or the flex item refuses to shrink below content
	   height and scrollbars disappear.
	   See docs/backlog/2026-06-01-guides-section-split.md. */
	.guides-shell {
		height: 100dvh;
		display: flex;
		flex-direction: column;
		min-height: 0;
		background: var(--paper, #fff);
	}
	.topbar {
		flex: 0 0 auto;
		display: flex;
		align-items: center;
		gap: 24px;
		padding: 12px 24px;
		border-bottom: 1px solid var(--paper-edge, #e0dccc);
	}
	.brand {
		font: 600 16px var(--font-display);
		color: var(--ink);
		text-decoration: none;
		letter-spacing: -0.01em;
	}
	.topnav {
		display: flex;
		gap: 16px;
		margin-right: auto;
	}
	.topnav a {
		font: 400 13px var(--font-ui);
		color: var(--ink-soft, #666);
		text-decoration: none;
		padding: 4px 0;
		border-bottom: 1px solid transparent;
	}
	.topnav a:hover {
		color: var(--ink);
	}
	.topnav a.active {
		color: var(--ink);
		border-bottom-color: var(--ink);
	}
	.search-slot {
		flex: 0 0 auto;
	}
	.body {
		flex: 1 1 auto;
		min-height: 0;
		display: grid;
		grid-template-columns: 240px 1fr;
		overflow: hidden;
	}
	.rail {
		overflow-y: auto;
		min-height: 0;
		padding: 16px 12px;
		border-right: 1px solid var(--paper-edge, #e0dccc);
		background: var(--paper-soft, #faf8f3);
	}
	.cat-label {
		font: 500 10px var(--font-mono);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--ink-soft, #888);
		margin: 14px 8px 6px;
	}
	.rail ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.rail li a {
		display: block;
		padding: 6px 8px;
		font: 400 13px var(--font-ui);
		color: var(--ink, #1a1a1a);
		text-decoration: none;
		border-radius: 4px;
	}
	.rail li a:hover {
		background: var(--paper-edge, #ece7d6);
	}
	.rail li a.active {
		background: var(--ink, #1a1a1a);
		color: var(--paper, #fff);
	}
	.content {
		overflow-y: auto;
		min-height: 0;
		padding: 32px 48px 64px;
	}
</style>
