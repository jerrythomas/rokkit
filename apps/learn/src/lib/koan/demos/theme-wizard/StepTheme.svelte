<script lang="ts">
	import type { WizardState, WizardStyle } from '../../types'

	let { state = $bindable<WizardState>() }: { state?: WizardState } = $props()

	const styles: { id: WizardStyle; name: string; tagline: string }[] = [
		{ id: 'zen-sumi', name: 'Zen-Sumi', tagline: 'ink on paper, hairline borders' },
		{ id: 'rokkit',   name: 'Rokkit',   tagline: 'classic balanced UI' },
		{ id: 'minimal',  name: 'Minimal',  tagline: 'understated, lots of whitespace' },
		{ id: 'material', name: 'Material', tagline: 'elevation + ripples' },
		{ id: 'frosted',  name: 'Frosted',  tagline: 'glassy translucency' }
	]
</script>

<section class="step">
	<h2>Pick a visual style</h2>
	<div class="grid">
		{#each styles as s (s.id)}
			<button
				type="button"
				class="card"
				class:selected={state?.style === s.id}
				onclick={() => state && (state.style = s.id)}
				aria-pressed={state?.style === s.id}
			>
				<span class="name">{s.name}</span>
				<span class="tagline">{s.tagline}</span>
			</button>
		{/each}
	</div>
</section>

<style>
	.step h2 { @apply text-ink-mute; margin: 0 0 16px; font-size: 18px; }
	.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
	.card {
		display: flex;
		flex-direction: column;
		gap: 6px;
		padding: 16px;
		@apply bg-paper border border-paper-mute;
		border-radius: var(--radius-md, 6px);
		text-align: left;
		cursor: pointer;
	}
	.card:hover { @apply border-accent; }
	.card.selected { @apply border-primary; box-shadow: 0 0 0 2px var(--primary); }
	.name { @apply text-ink-mute; font-size: 14px; font-weight: 500; }
	.tagline { @apply text-ink-soft; font-family: var(--font-script, 'Caveat', cursive); font-size: 18px; }
</style>
