<script lang="ts">
	import ChatPanel from './ChatPanel.svelte'
	import Canvas from './Canvas.svelte'
	import Welcome from './Welcome.svelte'
	import BrandMark from './BrandMark.svelte'
	import ConversationList from './ConversationList.svelte'
	import { koan, submitQuery, selectDemo } from '../store.svelte'
	import { themeStore, setMode } from '../theme-store.svelte'
	import { runMatch } from '../match.svelte'

	let hasInteracted = $state(koan.messages.length > 0)

	const matches = $derived(runMatch(koan.query))
	const suggestionItems = $derived(
		koan.query.trim() ? matches.slice(0, 3) : []
	)

	function handleSubmit(q: string) {
		hasInteracted = true
		submitQuery(q)
	}

	function pickSuggestion(id: string) {
		hasInteracted = true
		selectDemo(id)
	}

	function selectConversationDemo(demoId: string) {
		selectDemo(demoId)
	}

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
				{#if suggestionItems.length > 0}
					<div class="chips">
						{#each suggestionItems as s (s.id)}
							<button type="button" class="chip" onclick={() => pickSuggestion(s.id)}>
								<span aria-hidden="true">{s.icon}</span>
								<span>{s.title}</span>
							</button>
						{/each}
					</div>
				{/if}
			{/snippet}
			{#snippet history()}
				<ConversationList
					messages={koan.messages}
					activeId={koan.activeDemoId}
					onselect={selectConversationDemo}
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
		@apply bg-surface-z1 border border-surface-z2 text-ink-z2;
		border-radius: 999px;
		font-size: 12px;
		cursor: pointer;
	}
	.chip:hover {
		@apply border-accent-z5 text-ink-z1;
	}
	.footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 11px;
		@apply text-ink-z4 border-t border-surface-z2;
		padding-top: 8px;
	}
	.footer button {
		background: transparent;
		border: none;
		color: inherit;
		cursor: pointer;
		font: inherit;
	}
	.footer button:hover {
		@apply text-ink-z2;
	}
</style>
