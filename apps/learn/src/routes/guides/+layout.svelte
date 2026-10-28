<script lang="ts">
	import { page } from '$app/state'
	import { afterNavigate } from '$app/navigation'
	import { TableOfContents } from '@rokkit/app'
	import { List } from '@rokkit/ui'
	import { guidesByCategory, type GuideCategory } from '$lib/guides'
	import Search from '$lib/guides/Search.svelte'

	const { children } = $props()

	// The reading pane is an inner scroll container (<main>), which SvelteKit's
	// window-level scroll restoration doesn't manage — so its scroll position
	// carries over when you switch guides. Reset it to the top on a real page
	// change (pathname differs), leaving same-page hash navigation (TOC anchor
	// clicks) untouched.
	let mainEl = $state<HTMLElement | null>(null)
	afterNavigate(({ from, to }) => {
		if (to && from?.url.pathname !== to.url.pathname) mainEl?.scrollTo({ top: 0 })
	})

	const grouped = guidesByCategory()
	const categories: GuideCategory[] = ['basics', 'data', 'design', 'workflows', 'advanced']

	const activeSlug = $derived(page.params.slug ?? null)

	// The rail is a rokkit List: one non-collapsible group per category, each guide a link
	// whose value is its slug, so `value={activeSlug}` marks the current guide active.
	const railItems = categories
		.filter((cat) => grouped[cat].length > 0)
		.map((cat) => ({
			label: cat,
			children: grouped[cat].map((g) => ({ label: g.title, value: g.slug, href: `/guides/${g.slug}` }))
		}))

	// The TableOfContents component re-renders when activeSlug changes
	// (different guide loaded = different headings). Force a re-mount via
	// keyed block in the template.
</script>

<div class="guides-shell">
	<aside class="rail" aria-label="Guides table of contents">
		<div class="search-slot"><Search /></div>
		<List items={railItems} value={activeSlug} label="Guides" />
	</aside>

	<main id="guides-main" class="content" bind:this={mainEl}>
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
		background: var(--paper);
		overflow: hidden;
	}

	.rail {
		overflow-y: auto;
		min-height: 0;
		padding: 16px 12px;
		border-right: 1px solid var(--paper-edge);
		background: var(--paper-soft);
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
		border-left: 1px solid var(--paper-edge);
	}
</style>
