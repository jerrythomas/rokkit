<script lang="ts">
	import type { WizardState } from '../../types'
	import PreviewPane from './PreviewPane.svelte'

	let { state = $bindable<WizardState>() }: { state?: WizardState } = $props()

	const modes = ['light', 'dark', 'auto'] as const
	const densities = ['compact', 'comfortable', 'cozy'] as const
	const radii = ['sharp', 'soft', 'rounded', 'pill'] as const
</script>

<section class="step">
	<h2>Tune mode, density, and roundedness</h2>
	<div class="layout">
		<div class="controls">
			<fieldset>
				<legend>Mode</legend>
				<div class="chips">
					{#each modes as m (m)}
						<button
							type="button"
							class="chip"
							class:selected={state?.mode === m}
							onclick={() => state && (state.mode = m)}
							aria-pressed={state?.mode === m}
						>{m}</button>
					{/each}
				</div>
			</fieldset>
			<fieldset>
				<legend>Density</legend>
				<div class="chips">
					{#each densities as d (d)}
						<button
							type="button"
							class="chip"
							class:selected={state?.density === d}
							onclick={() => state && (state.density = d)}
							aria-pressed={state?.density === d}
						>{d}</button>
					{/each}
				</div>
			</fieldset>
			<fieldset>
				<legend>Roundedness</legend>
				<div class="chips">
					{#each radii as r (r)}
						<button
							type="button"
							class="chip"
							class:selected={state?.roundedness === r}
							onclick={() => state && (state.roundedness = r)}
							aria-pressed={state?.roundedness === r}
						>{r}</button>
					{/each}
				</div>
			</fieldset>
		</div>
		{#if state}
			<PreviewPane {state} />
		{/if}
	</div>
</section>

<style>
	.step h2 {
		@apply text-ink-z1;
		margin: 0 0 16px;
	}
	.layout {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24px;
	}
	@media (max-width: 800px) {
		.layout {
			grid-template-columns: 1fr;
		}
	}
	.controls {
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	fieldset {
		@apply border border-surface-z2;
		padding: 12px;
		border-radius: var(--radius-md, 6px);
	}
	legend {
		@apply text-ink-z3;
		padding: 0 6px;
		font-size: 12px;
	}
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.chip {
		@apply bg-surface-z1 border border-surface-z2 text-ink-z2;
		padding: 4px 12px;
		border-radius: 999px;
		cursor: pointer;
	}
	.chip.selected {
		@apply bg-primary-z5 text-surface-z0 border-primary-z5;
	}
</style>
