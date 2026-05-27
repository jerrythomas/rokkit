<script lang="ts">
	import { runMatch } from '../match.svelte'
	import { catalog, findById } from '../catalog'
	import type { DemoMeta } from '../types'

	interface Props {
		/** Bound composer input value. */
		query: string
		/** Demo ids surfaced as starter prompts when the composer is empty. */
		starterIds?: string[]
		/** How many live matches to show as the user types. */
		max?: number
		/** Fires when a suggestion is clicked — pass its title up to submitQuery. */
		onpick?: (demo: DemoMeta) => void
	}

	const {
		query,
		starterIds = ['tabs', 'table', 'form', 'chart', 'multi-select'],
		max = 5,
		onpick
	}: Props = $props()

	const trimmed = $derived(query.trim())

	const starterDemos = $derived(
		starterIds
			.map((id) => findById(id))
			.filter((d): d is DemoMeta => d !== undefined)
	)

	const matches = $derived(
		trimmed === '' ? [] : runMatch(trimmed).slice(0, max)
	)

	const items = $derived(trimmed === '' ? starterDemos : matches)

	const heading = $derived(
		trimmed === ''
			? 'Try one of these'
			: matches.length > 0
				? `${matches.length} match${matches.length === 1 ? '' : 'es'} for "${trimmed}"`
				: 'No exact match — closest in catalog'
	)

	const fallbackItems = $derived(
		trimmed !== '' && matches.length === 0
			? catalog.slice(0, max)
			: []
	)

	const display = $derived(items.length > 0 ? items : fallbackItems)
</script>

<div data-composer-suggestions>
	<div data-composer-suggestions-heading>{heading}</div>
	<ul data-composer-suggestions-list>
		{#each display as demo (demo.id)}
			<li>
				<button
					type="button"
					data-composer-suggestion
					onclick={() => onpick?.(demo)}
				>
					{#if demo.icon && demo.icon.startsWith('i-')}
						<span data-suggestion-icon class={demo.icon} aria-hidden="true"></span>
					{:else if demo.icon}
						<span data-suggestion-icon data-glyph>{demo.icon}</span>
					{/if}
					<span data-suggestion-body>
						<span data-suggestion-title>{demo.title}</span>
						<span data-suggestion-desc>{demo.description}</span>
					</span>
					<span data-suggestion-cue aria-hidden="true">↵</span>
				</button>
			</li>
		{/each}
	</ul>
</div>

<style>
	[data-composer-suggestions] {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	[data-composer-suggestions-heading] {
		font: 500 10.5px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.16em;
		text-transform: uppercase;
		margin-bottom: 2px;
	}

	[data-composer-suggestions-list] {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	[data-composer-suggestion] {
		display: grid;
		grid-template-columns: 20px 1fr auto;
		align-items: center;
		gap: 10px;
		width: 100%;
		padding: 8px 10px;
		border: 0;
		border-radius: var(--density-radius-base);
		background: transparent;
		text-align: left;
		cursor: pointer;
		transition:
			background 120ms ease,
			color 120ms ease;
	}

	[data-composer-suggestion]:hover {
		background: var(--paper-mute);
	}

	[data-suggestion-icon] {
		width: 16px;
		height: 16px;
		color: var(--ink-soft);
		justify-self: center;
	}

	[data-suggestion-icon][data-glyph] {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 18px;
		height: 18px;
		font: 400 13px var(--font-display);
		color: var(--ink-mute);
	}

	[data-suggestion-body] {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	[data-suggestion-title] {
		font: 500 13px var(--font-ui);
		color: var(--ink);
		letter-spacing: -0.005em;
	}

	[data-suggestion-desc] {
		font: 400 12px/1.4 var(--font-ui);
		color: var(--ink-soft);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	[data-suggestion-cue] {
		font: 500 11px var(--font-mono);
		color: var(--ink-faint);
		opacity: 0;
		transition: opacity 120ms ease;
	}

	[data-composer-suggestion]:hover [data-suggestion-cue] {
		opacity: 1;
	}
</style>
