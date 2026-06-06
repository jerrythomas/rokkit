<script lang="ts">
	import type { WizardState } from '../../types'
	import { skinDefinitions, getPaletteColor } from '$lib/data/skins'

	let { state = $bindable<WizardState>() }: { state?: WizardState } = $props()

	function swatches(skin: typeof skinDefinitions[number]) {
		const entries: { role: string; palette: string }[] = [
			{ role: 'surface', palette: skin.surface }
		]
		if (skin.darkSurface) entries.push({ role: 'surface (dark)', palette: skin.darkSurface })
		entries.push({ role: 'ink', palette: skin.ink })
		entries.push({ role: 'primary', palette: skin.primary })
		entries.push({ role: 'secondary', palette: skin.secondary })
		entries.push({ role: 'accent', palette: skin.accent })
		return entries
	}
</script>

<section class="step">
	<h2>Pick a skin</h2>
	<div class="grid">
		{#each skinDefinitions as skin (skin.name)}
			<button
				type="button"
				class="card"
				class:selected={state?.preset === skin.name}
				onclick={() => { if (state) state.preset = skin.name }}
				aria-pressed={state?.preset === skin.name}
			>
				<span class="name">{skin.label}</span>
				<div class="swatches">
					{#each swatches(skin) as s (s.role)}
						<div class="swatch-cell">
							<span class="swatch" style="background: {getPaletteColor(s.palette)}"></span>
							<span class="role">{s.role}</span>
							<span class="palette">{s.palette}</span>
						</div>
					{/each}
				</div>
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
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 12px;
	}
	.card {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 16px;
		@apply bg-surface-z0 border border-surface-z2;
		border-radius: var(--radius-md, 6px);
		text-align: left;
		cursor: pointer;
		transition: border-color 120ms ease, box-shadow 120ms ease;
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
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(60px, 1fr));
		gap: 6px;
	}
	.swatch-cell {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 2px;
	}
	.swatch {
		width: 28px;
		height: 28px;
		@apply border border-surface-z2;
		border-radius: var(--radius-sm, 4px);
	}
	.role {
		@apply text-ink-z4;
		font-size: 9px;
		text-transform: uppercase;
		letter-spacing: 0.04em;
	}
	.palette {
		@apply text-ink-z3;
		font-size: 10px;
		font-family: var(--font-mono);
	}
</style>
