<script lang="ts">
	import MiniSearch from 'minisearch'
	import { goto } from '$app/navigation'
	import { guides, type GuideCategory } from './index'

	interface SearchResult {
		slug: string
		title: string
		description: string
		category: GuideCategory
		score: number
	}

	const index = new MiniSearch({
		fields: ['title', 'description', 'content'],
		storeFields: ['slug', 'title', 'description', 'category'],
		idField: 'slug',
		searchOptions: { boost: { title: 3, description: 2 }, fuzzy: 0.2, prefix: true }
	})
	index.addAll(guides)

	let query = $state('')
	let open = $state(false)

	const results = $derived<SearchResult[]>(
		query.trim()
			? index.search(query.trim()).slice(0, 8).map((r) => ({
					slug: r.id as string,
					title: r.title as string,
					description: r.description as string,
					category: r.category as GuideCategory,
					score: r.score
				}))
			: []
	)

	function select(slug: string) {
		open = false
		query = ''
		goto(`/guides/${slug}`)
	}

	function onKey(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			open = false
			query = ''
		}
		if (e.key === 'Enter' && results.length > 0) {
			e.preventDefault()
			select(results[0].slug)
		}
	}
</script>

<div class="search" role="search">
	<input
		type="search"
		placeholder="Search guides…"
		bind:value={query}
		onfocus={() => (open = true)}
		onblur={() => setTimeout(() => (open = false), 120)}
		onkeydown={onKey}
		aria-label="Search guides"
	/>
	{#if open && results.length > 0}
		<ul class="results" role="listbox">
			{#each results as r (r.slug)}
				<li role="option" aria-selected="false">
					<button type="button" onclick={() => select(r.slug)}>
						<strong>{r.title}</strong>
						<span>{r.description}</span>
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

<style>
	.search {
		position: relative;
		width: 100%;
		max-width: 360px;
	}
	input {
		width: 100%;
		padding: 8px 12px;
		font: 400 13px var(--font-ui);
		background: var(--paper-soft, #f6f4ef);
		border: 1px solid var(--paper-edge, #e0dccc);
		border-radius: 6px;
		color: var(--ink, #1a1a1a);
		outline: none;
	}
	input:focus {
		border-color: var(--ink-soft, #555);
	}
	.results {
		position: absolute;
		top: calc(100% + 4px);
		left: 0;
		right: 0;
		list-style: none;
		margin: 0;
		padding: 4px;
		background: var(--paper, #fff);
		border: 1px solid var(--paper-edge, #e0dccc);
		border-radius: 6px;
		box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
		max-height: 320px;
		overflow-y: auto;
		z-index: 10;
	}
	.results li button {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		width: 100%;
		padding: 8px 10px;
		background: transparent;
		border: 0;
		cursor: pointer;
		text-align: left;
		border-radius: 4px;
	}
	.results li button:hover {
		background: var(--paper-soft, #f6f4ef);
	}
	.results li strong {
		font: 600 13px var(--font-display);
		color: var(--ink);
	}
	.results li span {
		font: 400 11px/1.4 var(--font-ui);
		color: var(--ink-soft, #666);
		margin-top: 2px;
	}
</style>
