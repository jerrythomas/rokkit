<script lang="ts">
	import { page } from '$app/state'
	import { TableOfContents } from '@rokkit/app'
	import { guidesByCategory, type GuideCategory } from '$lib/guides'
	import Search from '$lib/guides/Search.svelte'

	const { children } = $props()

	const grouped = guidesByCategory()
	const categories: GuideCategory[] = ['basics', 'data', 'design', 'workflows', 'advanced']

	const activeSlug = $derived(page.params.slug ?? null)

	// The TableOfContents component re-renders when activeSlug changes
	// (different guide loaded = different headings). Force a re-mount via
	// keyed block in the template.
</script>

<div class="guides-shell">
	<aside class="rail" aria-label="Guides table of contents">
		<div class="search-slot"><Search /></div>
		<nav>
			{#each categories as cat (cat)}
				{#if grouped[cat].length > 0}
					<div class="cat-label">{cat}</div>
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
	</aside>

	<main id="guides-main" class="content">
		<div class="content-inner">
			{@render children?.()}
		</div>
	</main>

	<aside class="page-toc" aria-label="On this page">
		{#key activeSlug}
			<TableOfContents container="guides-main" />
		{/key}
	</aside>
</div>

<style>
	/* Scroll architecture — load-bearing. Every flex/grid ancestor on
	   the path to a scroll container needs min-height: 0, or the flex
	   item refuses to shrink below content height and scroll silently
	   disappears. */
	.guides-shell {
		height: 100%;
		min-height: 0;
		display: grid;
		grid-template-columns: 260px 1fr 220px;
		background: var(--paper, #fff);
		overflow: hidden;
	}

	.rail {
		overflow-y: auto;
		min-height: 0;
		padding: 16px 12px;
		border-right: 1px solid var(--paper-edge, #e0dccc);
		background: var(--paper-soft, #faf8f3);
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.search-slot {
		flex: 0 0 auto;
	}
	.search-slot :global(.search) {
		max-width: none;
	}

	.rail nav {
		flex: 1 1 auto;
		min-height: 0;
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
	.content-inner {
		max-width: 760px;
		margin: 0 auto;
	}

	.page-toc {
		overflow-y: auto;
		min-height: 0;
		padding: 32px 16px 64px;
		border-left: 1px solid var(--paper-edge, #e0dccc);
	}
</style>
