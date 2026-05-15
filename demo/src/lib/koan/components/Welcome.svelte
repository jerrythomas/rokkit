<script lang="ts">
	import { Input } from '@rokkit/forms'
	import { Button } from '@rokkit/ui'
	import EmptyState from './EmptyState.svelte'
	import AnnotationArrow from './AnnotationArrow.svelte'
	import { theme } from '$lib/stores/theme.svelte'

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

	function cycleMode() {
		const order = ['light', 'dark', 'auto'] as const
		const idx = order.indexOf(theme.mode as 'light' | 'dark' | 'auto')
		theme.setMode(order[(idx + 1) % order.length])
	}

	function modeIcon(mode: string): string {
		switch (mode) {
			case 'light': return 'i-glyph:sun'
			case 'dark': return 'i-glyph:moon'
			default: return 'i-glyph:monitor'
		}
	}
</script>

<div class="welcome">
	<div class="toolbar" aria-label="Welcome controls">
		<Button
			icon={modeIcon(theme.mode)}
			variant="default"
			style="ghost"
			size="sm"
			title="Toggle theme mode (currently {theme.mode})"
			aria-label="Toggle theme mode"
			onclick={cycleMode}
		/>
		<Button
			icon="i-glyph:share"
			variant="default"
			style="ghost"
			size="sm"
			href="https://github.com/jerrythomas/rokkit"
			target="_blank"
			title="View Rokkit on GitHub"
			aria-label="GitHub"
		/>
	</div>

	<EmptyState
		icon="○"
		description="start with a word — theme, tabs, anything"
	>
		{#snippet action()}
			<div class="action-area">
				<div class="arrow-wrap" aria-hidden="true">
					<AnnotationArrow direction="curve-down-right" width={120} height={64} />
				</div>
				<form class="input-row" onsubmit={handleSubmit}>
					<Input
						bind:value={query}
						placeholder="type here…"
						aria-label="What would you like to explore?"
					/>
					<Button icon="i-glyph:plain" variant="primary" type="submit" title="Send" aria-label="Send" />
				</form>
			</div>
		{/snippet}
	</EmptyState>
</div>

<style>
	.welcome {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
	}
	.toolbar {
		position: absolute;
		top: 24px;
		right: 24px;
		display: flex;
		gap: 8px;
		z-index: 10;
	}
	.action-area {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 4px;
		position: relative;
	}
	.arrow-wrap {
		align-self: flex-end;
		padding-right: 48px;
		@apply text-accent-z5;
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
