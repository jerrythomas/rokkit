<script lang="ts">
	import type { Snippet } from 'svelte'

	let {
		query = $bindable(''),
		placeholder = 'try a topic — theme, tabs, toast…',
		brandMark,
		suggestions,
		history,
		footer,
		onsubmit
	}: {
		query?: string
		placeholder?: string
		brandMark?: Snippet
		suggestions?: Snippet
		history?: Snippet
		footer?: Snippet
		onsubmit?: (q: string) => void
	} = $props()

	let textarea = $state<HTMLTextAreaElement | undefined>()

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			if (query.trim()) onsubmit?.(query.trim())
		}
	}

	export function focus() {
		textarea?.focus()
	}
</script>

<aside class="chat-panel">
	{#if brandMark}
		<div class="brand-slot">{@render brandMark()}</div>
	{/if}
	<div class="input-area">
		<textarea
			bind:this={textarea}
			bind:value={query}
			{placeholder}
			rows="2"
			onkeydown={handleKeydown}
			aria-label="Type a topic to explore"
		></textarea>
	</div>
	{#if suggestions}
		<div class="suggestions">{@render suggestions()}</div>
	{/if}
	{#if history}
		<div class="history">{@render history()}</div>
	{/if}
	{#if footer}
		<div class="footer">{@render footer()}</div>
	{/if}
</aside>

<style>
	.chat-panel {
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: 360px;
		height: 100vh;
		padding: 20px 16px;
		@apply bg-paper border-r border-paper-mute;
		box-sizing: border-box;
	}
	.brand-slot {
		flex: 0 0 auto;
	}
	.input-area textarea {
		width: 100%;
		min-height: 56px;
		padding: 10px 12px;
		@apply bg-paper-soft border border-paper-mute text-ink-mute;
		border-radius: var(--radius-md, 6px);
		font: inherit;
		font-size: 14px;
		resize: none;
		box-sizing: border-box;
	}
	.input-area textarea:focus {
		outline: none;
		@apply border-accent;
	}
	.input-area textarea::placeholder {
		font-family: var(--font-script, 'Caveat', cursive);
		font-size: 18px;
		@apply text-ink-soft;
	}
	.suggestions {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.history {
		flex: 1 1 auto;
		overflow-y: auto;
	}
	.footer {
		flex: 0 0 auto;
	}
</style>
