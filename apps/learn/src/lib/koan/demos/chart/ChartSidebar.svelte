<script lang="ts">
	import { explorer } from './store.svelte'
	import { chartTypes } from './registry'

	const config = $derived(explorer.config)
	const s = $derived(explorer.settings)
	const positionOptions = $derived(
		explorer.type === 'area' ? ['stack', 'fill', 'identity'] : ['stack', 'dodge', 'fill', 'identity']
	)
	const groups = ['Charts', 'Geoms'] as const
	const tips = $derived(explorer.tips.slice(0, 4))
</script>

<div class="chart-sidebar" data-chart-sidebar>
	{#if tips.length}
		<section data-chart-sidebar-hints>
			<span class="eyebrow">Try this</span>
			<div class="hints">
				{#each tips as tip (tip.text)}
					<button type="button" class="hint" data-chart-hint onclick={() => explorer.apply(tip)}>
						<span class="i-mdi:lightbulb-on-outline" aria-hidden="true"></span>
						{tip.text}
						{#if tip.to || tip.set}<span class="arrow" aria-hidden="true">→</span>{/if}
					</button>
				{/each}
			</div>
		</section>
	{/if}

	<section>
		<span class="eyebrow">Chart type</span>
		{#each groups as group (group)}
			<span class="group-label">{group}</span>
			<div class="picker" data-chart-picker>
				{#each chartTypes.filter((t) => t.group === group) as t (t.id)}
					<button
						type="button"
						class="chip"
						data-active={explorer.type === t.id ? 'true' : undefined}
						data-chart-type={t.id}
						onclick={() => explorer.select(t.id)}>{t.label}</button
					>
				{/each}
			</div>
		{/each}
	</section>

	<section>
		<span class="eyebrow">Settings</span>

		{#if explorer.applies('orientation')}
			<div class="row"><span>Orientation</span>
				<div class="seg">
					{#each ['vertical', 'horizontal'] as o (o)}
						<button type="button" data-active={s.orientation === o ? 'true' : undefined} onclick={() => explorer.set('orientation', o as 'vertical' | 'horizontal')}>{o}</button>
					{/each}
				</div>
			</div>
		{/if}
		{#if explorer.applies('position')}
			<div class="row"><span>Position</span>
				<div class="seg wrap">
					{#each positionOptions as p (p)}
						<button type="button" data-active={s.position === p ? 'true' : undefined} onclick={() => explorer.set('position', p as typeof s.position)}>{p}</button>
					{/each}
				</div>
			</div>
		{/if}
		{#if explorer.applies('fill')}
			<label class="row check"><input type="checkbox" checked={Boolean(s.fill)} onchange={(e) => explorer.set('fill', e.currentTarget.checked ? (config.fields.fill ?? '') : '')} /><span>Fill by <code>{config.fields.fill}</code></span></label>
		{/if}
		{#if explorer.applies('color')}
			<label class="row check"><input type="checkbox" checked={Boolean(s.color)} onchange={(e) => explorer.set('color', e.currentTarget.checked ? (config.fields.color ?? '') : '')} /><span>Color by <code>{config.fields.color}</code></span></label>
		{/if}
		{#if explorer.applies('pattern')}
			<label class="row check"><input type="checkbox" checked={Boolean(s.pattern)} onchange={(e) => explorer.set('pattern', e.currentTarget.checked ? (config.fields.fill ?? config.fields.x ?? '') : '')} /><span>Pattern fill</span></label>
		{/if}
		{#if explorer.applies('innerRadius')}
			<div class="row"><span>Donut hole</span><input type="range" min="0" max="0.8" step="0.1" value={s.innerRadius} oninput={(e) => explorer.set('innerRadius', Number(e.currentTarget.value))} /></div>
		{/if}
		{#if explorer.applies('alpha')}
			<div class="row"><span>Opacity</span><input type="range" min="0.1" max="1" step="0.1" value={s.alpha ?? 1} oninput={(e) => explorer.set('alpha', Number(e.currentTarget.value))} /></div>
		{/if}
		{#if explorer.applies('legend')}
			<label class="row check"><input type="checkbox" checked={s.legend} onchange={(e) => explorer.set('legend', e.currentTarget.checked)} /><span>Show legend</span></label>
		{/if}
	</section>
</div>

<style>
	.chart-sidebar {
		flex: 1;
		overflow-y: auto;
		padding: 18px 16px;
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	.eyebrow {
		font: 500 10.5px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.16em;
		text-transform: uppercase;
		display: block;
		margin-bottom: 8px;
	}
	.group-label {
		font: 400 11px var(--font-ui);
		color: var(--ink-mute);
		display: block;
		margin: 10px 0 5px;
	}
	.hints,
	.picker {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.hints {
		flex-direction: column;
	}
	.hint {
		display: flex;
		align-items: center;
		gap: 6px;
		text-align: left;
		border: 1px solid var(--paper-edge);
		background: var(--paper-mute);
		color: var(--ink);
		border-radius: var(--density-radius-base);
		padding: 7px 10px;
		font: 400 12.5px var(--font-ui);
		cursor: pointer;
	}
	.hint:hover {
		border-color: var(--primary);
		color: var(--primary);
	}
	.arrow {
		margin-left: auto;
		opacity: 0.6;
	}
	.chip,
	.seg button {
		border: 1px solid var(--paper-edge);
		background: var(--paper);
		color: var(--ink);
		border-radius: var(--density-radius-base);
		padding: 4px 9px;
		font: 400 12px var(--font-ui);
		cursor: pointer;
	}
	.chip[data-active='true'],
	.seg button[data-active='true'] {
		background: var(--primary);
		color: var(--on-primary);
		border-color: transparent;
	}
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		margin: 8px 0;
		font: 400 12.5px var(--font-ui);
		color: var(--ink);
	}
	.row.check {
		justify-content: flex-start;
		cursor: pointer;
	}
	.seg {
		display: flex;
		gap: 4px;
	}
	.seg.wrap {
		flex-wrap: wrap;
	}
	code {
		font: 400 11.5px var(--font-mono);
		color: var(--primary);
	}
	input[type='range'] {
		width: 7rem;
	}
</style>
