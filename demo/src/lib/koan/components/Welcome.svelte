<script lang="ts">
	import EmptyState from './EmptyState.svelte'
	import AnnotationArrow from './AnnotationArrow.svelte'

	let {
		query = $bindable(''),
		onsubmit
	}: {
		query?: string
		onsubmit?: (q: string) => void
	} = $props()

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			if (query.trim()) onsubmit?.(query.trim())
		}
	}
</script>

<div class="welcome">
	<EmptyState
		icon="○"
		description="start with a word — theme, tabs, anything"
	>
		{#snippet action()}
			<div class="input-wrap">
				<textarea
					bind:value={query}
					rows="1"
					placeholder="type here…"
					onkeydown={handleKeydown}
					aria-label="What would you like to explore?"
				></textarea>
			</div>
		{/snippet}
		{#snippet annotation()}
			<AnnotationArrow direction="curve-tl" label="press Enter" />
		{/snippet}
	</EmptyState>
</div>

<style>
	.welcome {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
	}
	.input-wrap textarea {
		width: 360px;
		min-height: 48px;
		padding: 12px 16px;
		@apply bg-surface-z0 border border-surface-z2 text-ink-z1;
		border-radius: var(--radius-md, 6px);
		font: inherit;
		font-size: 16px;
		text-align: center;
		resize: none;
		box-sizing: border-box;
	}
	.input-wrap textarea:focus {
		outline: none;
		@apply border-accent-z5;
	}
	.input-wrap textarea::placeholder {
		font-family: var(--font-script, 'Caveat', cursive);
		font-size: 20px;
		@apply text-ink-z4;
	}
</style>
