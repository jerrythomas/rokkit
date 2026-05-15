<script lang="ts">
	import { Button } from '@rokkit/ui'
	import DownloadModal from '../../components/DownloadModal.svelte'
	import type { SavedTheme, WizardState } from '../../types'
	import { saveTheme, setActiveTheme } from '../../theme-store.svelte'

	let {
		wizardState = $bindable<WizardState>(),
		onsaved
	}: {
		wizardState?: WizardState
		onsaved?: (t: SavedTheme) => void
	} = $props()

	let savedTheme = $state<SavedTheme | null>(null)
	let downloadOpen = $state(false)
	let saveError = $state('')

	function persist() {
		if (!wizardState) return
		if (!wizardState.name.trim()) {
			saveError = 'Name is required.'
			return
		}
		saveError = ''
		const theme = saveTheme(wizardState)
		savedTheme = theme
		setActiveTheme(theme.id)
		onsaved?.(theme)
	}
</script>

<section class="step">
	<h2>Name and save</h2>
	<label class="field">
		<span>Theme name</span>
		<input
			type="text"
			bind:value={wizardState.name}
			placeholder="e.g. My Theme"
			aria-required="true"
		/>
	</label>
	{#if saveError}
		<p class="error">{saveError}</p>
	{/if}
	<div class="actions">
		<Button label="Save" onclick={persist} />
		<Button label="Download" style="outline" disabled={!savedTheme} onclick={() => (downloadOpen = true)} />
	</div>
	{#if savedTheme}
		<DownloadModal bind:open={downloadOpen} theme={savedTheme} />
	{/if}
</section>

<style>
	.step h2 {
		@apply text-ink-z1;
		margin: 0 0 16px;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 6px;
		max-width: 360px;
	}
	.field span {
		@apply text-ink-z3;
		font-size: 12px;
	}
	.field input {
		@apply bg-surface-z1 border border-surface-z2 text-ink-z1;
		padding: 8px 12px;
		border-radius: var(--radius-md, 6px);
		font: inherit;
	}
	.error {
		@apply text-danger-z5;
		margin: 0;
		font-size: 13px;
	}
	.actions {
		display: flex;
		gap: 12px;
		margin-top: 16px;
	}
</style>
