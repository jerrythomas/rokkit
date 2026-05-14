<script lang="ts">
	import ChatPanel from './ChatPanel.svelte'
	import Canvas from './Canvas.svelte'
	import Welcome from './Welcome.svelte'
	import BrandMark from './BrandMark.svelte'
	import TimelineList from './TimelineList.svelte'
	import { koan, recordVisit } from '../store.svelte'
	import { themeStore, setMode } from '../theme-store.svelte'
	import { runMatch, isStrongMatch, nextSuggestions } from '../match.svelte'
	import { findById } from '../catalog'

	let hasInteracted = $state(koan.history.length > 0)

	const matches = $derived(runMatch(koan.query))
	const suggestionItems = $derived(
		koan.query.trim() ? matches.slice(0, 3) : nextSuggestions(koan.visitedThisSession)
	)

	function handleSubmit(q: string) {
		koan.query = q
		hasInteracted = true
		const m = runMatch(q)
		if (isStrongMatch(q, m)) {
			recordVisit(m[0].id, q)
		}
	}

	function pickSuggestion(id: string) {
		const demo = findById(id)
		if (!demo) return
		hasInteracted = true
		recordVisit(id, koan.query)
	}

	function selectTimeline(item: { id: string }) {
		const demo = findById(item.id)
		if (demo) recordVisit(item.id, koan.query)
	}

	const timelineItems = $derived(
		koan.history.map((h) => {
			const demo = findById(h.demoId)
			return {
				id: h.demoId,
				icon: demo?.icon ?? '○',
				title: demo?.title ?? h.demoId,
				timestamp: h.mountedAt
			}
		})
	)

	function cycleMode() {
		const order = ['light', 'dark', 'auto'] as const
		const idx = order.indexOf(themeStore.mode)
		setMode(order[(idx + 1) % order.length])
	}
</script>

<svelte:window
	onkeydown={(e) => {
		if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
			e.preventDefault()
			hasInteracted = true
		}
	}}
/>

{#if !hasInteracted}
	<Welcome bind:query={koan.query} onsubmit={handleSubmit} />
{:else}
	<div class="shell">
		<ChatPanel
			bind:query={koan.query}
			onsubmit={handleSubmit}
		>
			{#snippet brandMark()}
				<BrandMark glyph="○" label="Koan" compact />
			{/snippet}
			{#snippet suggestions()}
				<div class="chips">
					{#each suggestionItems as s (s.id)}
						<button type="button" class="chip" onclick={() => pickSuggestion(s.id)}>
							<span aria-hidden="true">{s.icon}</span>
							<span>{s.title}</span>
						</button>
					{/each}
				</div>
			{/snippet}
			{#snippet history()}
				<TimelineList
					items={timelineItems}
					activeId={koan.activeDemoId}
					onselect={selectTimeline}
				/>
			{/snippet}
			{#snippet footer()}
				<div class="footer">
					<button type="button" class="mode" onclick={cycleMode}>
						mode: {themeStore.mode}
					</button>
					<button
						type="button"
						class="reset"
						onclick={() => {
							if (confirm('Reset Koan? Clears themes and history.')) {
								localStorage.clear()
								location.reload()
							}
						}}
					>
						reset
					</button>
				</div>
			{/snippet}
		</ChatPanel>
		<Canvas />
	</div>
{/if}

<style>
	.shell {
		display: grid;
		grid-template-columns: 360px 1fr;
		min-height: 100vh;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 4px 10px;
		background: var(--color-surface-z1);
		border: 1px solid var(--color-surface-z2);
		border-radius: 999px;
		font-size: 12px;
		color: var(--color-ink-z2);
		cursor: pointer;
	}
	.chip:hover {
		border-color: var(--color-accent-z5);
		color: var(--color-ink-z1);
	}
	.footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 11px;
		color: var(--color-ink-z4);
		padding-top: 8px;
		border-top: 1px solid var(--color-surface-z2);
	}
	.footer button {
		background: transparent;
		border: none;
		color: inherit;
		cursor: pointer;
		font: inherit;
	}
	.footer button:hover {
		color: var(--color-ink-z2);
	}
</style>
