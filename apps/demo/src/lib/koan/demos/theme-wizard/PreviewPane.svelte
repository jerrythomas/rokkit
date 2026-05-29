<script lang="ts">
	import { Button, Card } from '@rokkit/ui'
	import type { WizardState } from '../../types'

	let { state }: { state: WizardState } = $props()
</script>

<div
	class="preview"
	data-density={state.density}
	data-radius={state.roundedness}
	data-mode={state.mode}
>
	<div class="row">
		<Button>Primary</Button>
		<Button style="outline">Outline</Button>
		<Button style="ghost">Ghost</Button>
	</div>
	<Card>
		<h3>Sample card</h3>
		<p>Density: {state.density} · Rounded: {state.roundedness} · Mode: {state.mode}</p>
	</Card>
	<label class="field">
		<span>Sample input</span>
		<input type="text" placeholder="type here…" />
	</label>
</div>

<style>
	.preview {
		display: flex;
		flex-direction: column;
		gap: 12px;
		@apply bg-surface-z0 border border-surface-z2;
		padding: 16px;
		border-radius: var(--radius-md, 6px);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 4px;
		@apply text-ink-z3;
		font-size: 12px;
	}
	.field input {
		@apply bg-surface-z1 border border-surface-z2 text-ink-z1;
		padding: 6px 10px;
		border-radius: var(--radius-sm, 4px);
		font: inherit;
	}
</style>
