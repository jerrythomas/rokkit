<script lang="ts">
	import { Stepper, Button } from '@rokkit/ui'
	import StepStart from './StepStart.svelte'
	import StepTune from './StepTune.svelte'
	import StepSave from './StepSave.svelte'
	import type { WizardState } from '../../types'
	import { themeStore, saveDraft, clearDraft, setActiveTheme } from '../../theme-store.svelte'

	const steps = [
		{ text: 'Start' },
		{ text: 'Tune' },
		{ text: 'Save' }
	]

	let stepIdx = $state(0)

	function makeBlank(): WizardState {
		return {
			preset: 'zen-sumi',
			mode: 'auto',
			density: 'normal',
			roundedness: 'soft',
			name: `My Theme ${themeStore.saved.length + 1}`
		}
	}

	let state = $state<WizardState>(themeStore.draft ?? makeBlank())

	$effect(() => {
		saveDraft($state.snapshot(state))
	})

	$effect(() => {
		// Live application of wizard state via html dataset
		document.documentElement.dataset.mode = state.mode
		document.documentElement.dataset.density = state.density
		document.documentElement.dataset.radius = state.roundedness
		document.documentElement.dataset.skin = state.preset
	})
</script>

<section class="wizard">
	<Stepper {steps} bind:current={stepIdx} />

	{#if stepIdx === 0}
		<StepStart bind:state />
	{:else if stepIdx === 1}
		<StepTune bind:state />
	{:else}
		<StepSave
			bind:state
			onsaved={(t) => {
				setActiveTheme(t.id)
				clearDraft()
			}}
		/>
	{/if}

	<div class="nav">
		<Button label="Back" style="outline" disabled={stepIdx === 0} onclick={() => (stepIdx = Math.max(0, stepIdx - 1))} />
		<Button label="Next" disabled={stepIdx === steps.length - 1} onclick={() => (stepIdx = Math.min(steps.length - 1, stepIdx + 1))} />
	</div>
</section>

<style>
	.wizard {
		display: flex;
		flex-direction: column;
		gap: 24px;
		max-width: 980px;
		margin: 0 auto;
	}
	.nav {
		display: flex;
		justify-content: space-between;
		gap: 8px;
	}
</style>
