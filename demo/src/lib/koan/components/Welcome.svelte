<script lang="ts">
	import { Input } from '@rokkit/forms'
	import { Button } from '@rokkit/ui'
	import EmptyState from './EmptyState.svelte'
	import AnnotationArrow from './AnnotationArrow.svelte'

	let {
		query = $bindable(''),
		onsubmit
	}: {
		query?: string
		onsubmit?: (q: string) => void
	} = $props()

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault()
		if (query.trim()) onsubmit?.(query.trim())
	}
</script>

<div class="welcome">
	<EmptyState
		icon="○"
		description="start with a word — theme, tabs, anything"
	>
		{#snippet action()}
			<form class="input-row" onsubmit={handleSubmit}>
				<Input
					bind:value={query}
					placeholder="type here…"
					aria-label="What would you like to explore?"
				/>
				<Button type="submit" label="Open" variant="primary" />
			</form>
		{/snippet}
		{#snippet annotation()}
			<AnnotationArrow direction="up" />
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
	.input-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.input-row :global([data-input-root]) {
		width: 320px;
	}
</style>
