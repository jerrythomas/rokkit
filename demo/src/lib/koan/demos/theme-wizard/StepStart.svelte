<script lang="ts">
	import type { WizardState } from '../../types'

	const presets = [
		{ id: 'zen-sumi', name: 'Zen-Sumi', swatches: ['#0d0d0c', '#e2dfd6', '#9c4736', '#557b78', '#5a4a8a'] },
		{ id: 'minimal',  name: 'Minimal',  swatches: ['#1a1a1a', '#f8f8f8', '#1f6feb', '#0e8a4a', '#d35400'] },
		{ id: 'ocean',    name: 'Ocean',    swatches: ['#0d1b2a', '#e0fbfc', '#3a86ff', '#06d6a0', '#118ab2'] },
		{ id: 'violet',   name: 'Violet',   swatches: ['#1a1230', '#f0eaff', '#7c3aed', '#a855f7', '#c084fc'] },
		{ id: 'rose',     name: 'Rose',     swatches: ['#291015', '#fff1f3', '#e11d48', '#f43f5e', '#fb7185'] },
		{ id: 'emerald',  name: 'Emerald',  swatches: ['#022c22', '#ecfdf5', '#059669', '#10b981', '#34d399'] }
	]

	let { state = $bindable<WizardState>() }: { state?: WizardState } = $props()
</script>

<section class="step">
	<h2>Pick a starting point</h2>
	<div class="grid">
		{#each presets as p (p.id)}
			<button
				type="button"
				class="card"
				class:selected={state?.preset === p.id}
				onclick={() => { if (state) state.preset = p.id }}
				aria-pressed={state?.preset === p.id}
			>
				<span class="name">{p.name}</span>
				<span class="swatches">
					{#each p.swatches as c}
						<span class="swatch" style="background: {c}"></span>
					{/each}
				</span>
				<span class="aa">Aa</span>
			</button>
		{/each}
	</div>
</section>

<style>
	.step h2 {
		@apply text-ink-z1;
		margin: 0 0 16px;
		font-size: 18px;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
		gap: 12px;
	}
	.card {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 16px;
		@apply bg-surface-z0 border border-surface-z2;
		border-radius: var(--radius-md, 6px);
		text-align: left;
		cursor: pointer;
	}
	.card:hover {
		@apply border-accent-z5;
	}
	.card.selected {
		@apply border-primary-z5;
		box-shadow: 0 0 0 2px var(--color-primary-z5);
	}
	.name {
		@apply text-ink-z1;
		font-size: 14px;
		font-weight: 500;
	}
	.swatches {
		display: flex;
		gap: 4px;
	}
	.swatch {
		width: 24px;
		height: 24px;
		@apply border border-surface-z2;
		border-radius: var(--radius-sm, 4px);
	}
	.aa {
		@apply text-ink-z3;
		font-size: 24px;
	}
</style>
