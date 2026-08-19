<script lang="ts">
	import { sparkline } from './store.svelte'
	import type { SparkType, HighlightMode, TrendMode } from './mapping'

	const s = $derived(sparkline.settings)

	const types: SparkType[] = ['line', 'bar', 'area']
	const highlights: HighlightMode[] = ['none', 'minmax', 'last', 'all']
	const trends: TrendMode[] = ['none', 'avg', 'linear']
</script>

<div class="sparkline-controls" data-sparkline-controls>
	<div class="row" data-sparkline-control="type">
		<span>Type</span>
		<div class="seg">
			{#each types as t (t)}
				<button
					type="button"
					data-active={s.type === t ? 'true' : undefined}
					onclick={() => sparkline.set('type', t)}
				>{t}</button>
			{/each}
		</div>
	</div>

	<div class="row" data-sparkline-control="baseline">
		<span>Baseline</span>
		<div class="seg">
			<button
				type="button"
				data-active={s.baseline ? 'true' : undefined}
				onclick={() => sparkline.set('baseline', !s.baseline)}
			>{s.baseline ? 'on' : 'off'}</button>
		</div>
	</div>

	<div class="row" data-sparkline-control="highlight">
		<span>Highlight</span>
		<div class="seg wrap">
			{#each highlights as h (h)}
				<button
					type="button"
					data-active={s.highlight === h ? 'true' : undefined}
					onclick={() => sparkline.set('highlight', h)}
				>{h}</button>
			{/each}
		</div>
	</div>

	<div class="row" data-sparkline-control="trend">
		<span>Trend</span>
		<div class="seg">
			{#each trends as tr (tr)}
				<button
					type="button"
					data-active={s.trend === tr ? 'true' : undefined}
					onclick={() => sparkline.set('trend', tr)}
				>{tr}</button>
			{/each}
		</div>
	</div>
</div>

<style>
	.sparkline-controls {
		display: flex;
		flex-direction: column;
	}
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		margin: 6px 0;
		font: 400 12px var(--font-ui);
		color: var(--ink);
	}
	.seg {
		display: flex;
		gap: 4px;
	}
	.seg.wrap {
		flex-wrap: wrap;
	}
	.seg button {
		border: 1px solid var(--paper-edge);
		background: var(--paper);
		color: var(--ink);
		border-radius: var(--density-radius-base);
		padding: 3px 8px;
		font: 400 11.5px var(--font-ui);
		cursor: pointer;
	}
	.seg button[data-active='true'] {
		background: var(--primary);
		color: var(--on-primary);
		border-color: transparent;
	}
</style>
