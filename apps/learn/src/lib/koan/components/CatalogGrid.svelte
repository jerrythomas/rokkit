<script lang="ts">
	/**
	 * Catalog grid for the /app landing. Renders every demo as a clickable
	 * tile, grouped by category. An optional `filter` prop (typed text
	 * from the chat composer) runs through MiniSearch — when the query is
	 * empty the full catalog shows, otherwise just the matches.
	 *
	 * Each tile click navigates to the demo's route via SvelteKit's
	 * `goto`. The chat-shell's onMount on each demo route flips
	 * shell.phase back to 'response' on its own, so we don't manage that
	 * here.
	 */
	import { goto } from '$app/navigation'
	import { catalog, miniIndex, findById, routeFor } from '../catalog'
	import type { DemoMeta, DemoCategory } from '../types'

	interface Props {
		filter?: string
	}
	const { filter = '' }: Props = $props()

	const CATEGORY_ORDER: DemoCategory[] = [
		'guide',
		'theme',
		'navigation',
		'layout',
		'data',
		'forms',
		'feedback',
		'content'
	]
	const CATEGORY_LABEL: Record<DemoCategory, string> = {
		guide: 'Guides',
		theme: 'Theme',
		navigation: 'Navigation',
		layout: 'Layout',
		data: 'Data',
		forms: 'Forms',
		feedback: 'Feedback',
		content: 'Content'
	}

	const visible = $derived.by(() => {
		const q = filter.trim()
		if (!q) return catalog
		const hits = miniIndex.search(q)
		return hits.map((h) => findById(String(h.id))).filter((d): d is DemoMeta => Boolean(d))
	})

	const grouped = $derived.by(() => {
		const buckets: Partial<Record<DemoCategory, DemoMeta[]>> = {}
		for (const demo of visible) {
			const list = buckets[demo.category] ?? []
			list.push(demo)
			buckets[demo.category] = list
		}
		return CATEGORY_ORDER.flatMap((cat) => {
			const items = buckets[cat]
			return items?.length ? [{ category: cat, items }] : []
		})
	})

	function pick(demo: DemoMeta) {
		const route = routeFor(demo.id)
		if (route) goto(route)
	}
</script>

<div data-catalog-grid>
	{#if visible.length === 0}
		<div data-catalog-empty>
			<span class="i-mdi:magnify-close" aria-hidden="true"></span>
			<p>No matches for <em>“{filter}”</em>.</p>
			<p data-catalog-empty-hint>
				Try a broader term — “table”, “select”, “form”.
			</p>
		</div>
	{:else}
		{#each grouped as group (group.category)}
			<section data-catalog-group>
				<header data-catalog-group-head>
					<span data-catalog-group-label>{CATEGORY_LABEL[group.category]}</span>
					<span data-catalog-group-count>{group.items.length}</span>
				</header>
				<ul data-catalog-tiles>
					{#each group.items as demo (demo.id)}
						<li>
							<button
								type="button"
								data-catalog-tile
								onclick={() => pick(demo)}
								title={demo.title}
							>
								{#if demo.icon.startsWith('i-')}
									<span data-catalog-tile-glyph aria-hidden="true">
										<span class={demo.icon}></span>
									</span>
								{:else}
									<span data-catalog-tile-glyph aria-hidden="true">{demo.icon}</span>
								{/if}
								<span data-catalog-tile-body>
									<span data-catalog-tile-title>{demo.title}</span>
									<span data-catalog-tile-desc>{demo.description}</span>
								</span>
								<span class="i-mdi:arrow-right" data-catalog-tile-cue aria-hidden="true"></span>
							</button>
						</li>
					{/each}
				</ul>
			</section>
		{/each}
	{/if}
</div>

<style>
	[data-catalog-grid] {
		display: flex;
		flex-direction: column;
		gap: 28px;
		padding: 4px 4px 24px;
	}

	[data-catalog-group-head] {
		display: flex;
		align-items: baseline;
		gap: 8px;
		margin-bottom: 10px;
	}

	[data-catalog-group-label] {
		font: 600 12px var(--font-ui);
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: var(--ink-soft);
	}

	[data-catalog-group-count] {
		font: 500 11px var(--font-ui);
		color: var(--ink-mute);
	}

	[data-catalog-tiles] {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 10px;
		margin: 0;
		padding: 0;
		list-style: none;
	}

	[data-catalog-tile] {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 12px;
		width: 100%;
		padding: 12px 14px;
		border: 1px solid var(--paper-edge);
		border-radius: 10px;
		background: var(--paper);
		color: var(--ink);
		text-align: left;
		cursor: pointer;
		transition: border-color 120ms ease, background 120ms ease, transform 120ms ease;
	}

	[data-catalog-tile]:hover {
		border-color: var(--accent);
		background: var(--paper-soft);
	}

	[data-catalog-tile]:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 2px;
	}

	[data-catalog-tile-glyph] {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		border-radius: 8px;
		background: var(--paper-soft);
		font: 600 18px var(--font-display);
		color: var(--ink-soft);
	}

	[data-catalog-tile-glyph] [class^='i-'] {
		width: 20px;
		height: 20px;
	}

	[data-catalog-tile-body] {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	[data-catalog-tile-title] {
		font: 600 14px var(--font-ui);
		color: var(--ink);
	}

	[data-catalog-tile-desc] {
		font: 400 12px var(--font-ui);
		color: var(--ink-mute);
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	[data-catalog-tile-cue] {
		width: 16px;
		height: 16px;
		color: var(--ink-mute);
		opacity: 0;
		transition: opacity 120ms ease;
	}

	[data-catalog-tile]:hover [data-catalog-tile-cue],
	[data-catalog-tile]:focus-visible [data-catalog-tile-cue] {
		opacity: 1;
		color: var(--accent);
	}

	[data-catalog-empty] {
		text-align: center;
		padding: 48px 16px;
		color: var(--ink-mute);
	}

	[data-catalog-empty] .i-mdi\:magnify-close {
		width: 32px;
		height: 32px;
		margin-bottom: 8px;
		color: var(--ink-soft);
	}

	[data-catalog-empty] em {
		color: var(--ink);
		font-style: normal;
	}

	[data-catalog-empty-hint] {
		font: 400 12px var(--font-ui);
		margin-top: 4px;
	}
</style>
