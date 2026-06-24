<script lang="ts">
	import { List, Button } from '@rokkit/ui'
	import ListItem from '$lib/components/ListItem.svelte'
	import StepStart from './StepStart.svelte'
	import StepTheme from './StepTheme.svelte'
	import StepTune from './StepTune.svelte'
	import StepSave from './StepSave.svelte'
	import type { WizardState } from '../../types'
	import { themeStore, saveDraft, clearDraft, setActiveTheme } from '../../theme-store.svelte'
	import { theme } from '$lib/stores/theme.svelte'

	let stepIdx = $state(0)

	const wizardItems = $derived([
		{ id: 'skin',  kanji: '色', label: 'Skin',   description: 'Pick a palette',  status: stepIdx > 0 ? 'done' : undefined,        disabled: false },
		{ id: 'theme', kanji: '型', label: 'Theme',  description: 'Pick a style',    status: stepIdx > 1 ? 'done' : undefined,        disabled: stepIdx < 1 },
		{ id: 'tune',  kanji: '調', label: 'Tune',   description: 'Mode + size',     status: stepIdx > 2 ? 'done' : undefined,        disabled: stepIdx < 2 },
		{ id: 'save',  kanji: '結', label: 'Save',   description: 'Name & download', status: undefined,                               disabled: stepIdx < 3 }
	])

	const isLastStep = $derived(stepIdx === wizardItems.length - 1)

	function makeBlank(): WizardState {
		return {
			preset: 'default',
			style: 'zen-sumi',
			mode: 'auto',
			density: 'comfortable',
			roundedness: 'soft',
			name: `My Theme ${themeStore.saved.length + 1}`
		}
	}

	// Named `wizard` (not `state`) so the local binding does not shadow the
	// `$state` rune in svelte-check's type resolution.
	let wizard = $state<WizardState>(themeStore.draft ?? makeBlank())

	$effect(() => {
		saveDraft({ ...wizard })
	})

	$effect(() => {
		// Live application via theme store — handles colormap + CSS vars + localStorage
		theme.setSkin(wizard.preset)
		theme.setStyle(wizard.style)
		theme.setMode(wizard.mode)
		theme.setDensity(wizard.density)
		theme.setRadius(wizard.roundedness)
	})
</script>

<div class="wizard-layout">
	<aside class="wiz-rail">
		<List
			items={wizardItems}
			fields={{ value: 'id', label: 'label', icon: 'kanji', subtext: 'description', disabled: 'disabled' }}
			value={wizardItems[stepIdx]?.id}
			label="Wizard steps"
			size="sm"
			class="gap-px wiz-steps"
			onselect={(v) => {
				const i = wizardItems.findIndex((s) => s.id === v)
				if (i !== -1 && i < stepIdx) stepIdx = i
			}}
		>
			{#snippet itemContent(proxy)}
				<ListItem {proxy} />
			{/snippet}
		</List>
	</aside>

	<div class="wiz-main">
		<div class="wiz-content">
			{#if stepIdx === 0}
				<StepStart bind:state={wizard} />
			{:else if stepIdx === 1}
				<StepTheme bind:state={wizard} />
			{:else if stepIdx === 2}
				<StepTune bind:state={wizard} />
			{:else}
				<StepSave
					bind:wizardState={wizard}
					onsaved={(t) => {
						setActiveTheme(t.id)
						clearDraft()
					}}
				/>
			{/if}
		</div>

		<div class="wiz-footer">
			<Button
				label="Back"
				style="outline"
				disabled={stepIdx === 0}
				onclick={() => (stepIdx = Math.max(0, stepIdx - 1))}
			/>
			<div class="progress" aria-label="Step {stepIdx + 1} of {wizardItems.length}">
				{#each wizardItems as _, i (i)}
					<span class="bar" class:done={i <= stepIdx}></span>
				{/each}
			</div>
			<Button
				label={isLastStep ? 'Done' : 'Next'}
				disabled={isLastStep}
				onclick={() => (stepIdx = Math.min(wizardItems.length - 1, stepIdx + 1))}
			/>
		</div>
	</div>
</div>

<style>
	.wizard-layout {
		display: grid;
		grid-template-columns: 260px 1fr;
		min-height: 480px;
		max-width: 980px;
		margin: 0 auto;
		@apply border border-paper-mute;
		border-radius: var(--radius-md, 6px);
		overflow: hidden;
	}
	.wiz-rail {
		@apply bg-paper-soft border-r border-paper-mute;
		padding: 16px 12px;
	}
	.wiz-main {
		display: flex;
		flex-direction: column;
	}
	.wiz-content {
		flex: 1;
		padding: 24px 32px;
		overflow: auto;
	}
	.wiz-footer {
		display: flex;
		align-items: center;
		gap: 20px;
		padding: 14px 32px;
		@apply border-t border-paper-mute bg-paper;
	}
	.progress {
		flex: 1;
		display: flex;
		gap: 4px;
		align-items: center;
	}
	.bar {
		flex: 1;
		height: 2px;
		border-radius: 1px;
		transition: background-color 200ms ease;
		@apply bg-paper-mute;
	}
	.bar.done {
		@apply bg-ink-mute;
	}
</style>
