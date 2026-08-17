<script lang="ts">
	import { explorer } from './store.svelte'
	import { chartTypes } from './registry'

	const config = $derived(explorer.config)
	const s = $derived(explorer.settings)
	const positionOptions = $derived(
		explorer.type === 'area' ? ['stack', 'fill', 'identity'] : ['stack', 'dodge', 'fill', 'identity']
	)
	const groups = ['Charts', 'Geoms'] as const
</script>

<aside class="drawer" data-plot-drawer aria-label="Chart settings">
	<section data-plot-drawer-section>
		<span class="label">Chart type</span>
		{#each groups as group (group)}
			<span class="group-label">{group}</span>
			<div class="picker" data-plot-drawer-picker>
				{#each chartTypes.filter((t) => t.group === group) as t (t.id)}
					<button
						type="button"
						class="chip"
						data-active={explorer.type === t.id ? 'true' : undefined}
						data-plot-drawer-type={t.id}
						onclick={() => explorer.select(t.id)}>{t.label}</button
					>
				{/each}
			</div>
		{/each}
	</section>

	<section data-plot-drawer-section>
		<span class="label">Settings</span>

		{#if explorer.applies('orientation')}
			<div class="row">
				<span>Orientation</span>
				<div class="seg">
					{#each ['vertical', 'horizontal'] as o (o)}
						<button type="button" data-active={s.orientation === o ? 'true' : undefined} onclick={() => explorer.set('orientation', o as 'vertical' | 'horizontal')}>{o}</button>
					{/each}
				</div>
			</div>
		{/if}

		{#if explorer.applies('position')}
			<div class="row">
				<span>Position</span>
				<div class="seg wrap">
					{#each positionOptions as p (p)}
						<button type="button" data-active={s.position === p ? 'true' : undefined} onclick={() => explorer.set('position', p as typeof s.position)}>{p}</button>
					{/each}
				</div>
			</div>
		{/if}

		{#if explorer.applies('fill')}
			<label class="row check">
				<input type="checkbox" checked={Boolean(s.fill)} onchange={(e) => explorer.set('fill', e.currentTarget.checked ? (config.fields.fill ?? '') : '')} />
				<span>Fill by <code>{config.fields.fill}</code></span>
			</label>
		{/if}

		{#if explorer.applies('color')}
			<label class="row check">
				<input type="checkbox" checked={Boolean(s.color)} onchange={(e) => explorer.set('color', e.currentTarget.checked ? (config.fields.color ?? '') : '')} />
				<span>Color by <code>{config.fields.color}</code></span>
			</label>
		{/if}

		{#if explorer.applies('pattern')}
			<label class="row check">
				<input type="checkbox" checked={Boolean(s.pattern)} onchange={(e) => explorer.set('pattern', e.currentTarget.checked ? (config.fields.fill ?? config.fields.x ?? '') : '')} />
				<span>Pattern fill</span>
			</label>
		{/if}

		{#if explorer.applies('innerRadius')}
			<div class="row">
				<span>Donut hole</span>
				<input type="range" min="0" max="0.8" step="0.1" value={s.innerRadius} oninput={(e) => explorer.set('innerRadius', Number(e.currentTarget.value))} />
			</div>
		{/if}

		{#if explorer.applies('alpha')}
			<div class="row">
				<span>Opacity</span>
				<input type="range" min="0.1" max="1" step="0.1" value={s.alpha ?? 1} oninput={(e) => explorer.set('alpha', Number(e.currentTarget.value))} />
			</div>
		{/if}

		{#if explorer.applies('legend')}
			<label class="row check">
				<input type="checkbox" checked={s.legend} onchange={(e) => explorer.set('legend', e.currentTarget.checked)} />
				<span>Show legend</span>
			</label>
		{/if}
	</section>
</aside>

<style>
	.drawer {
		position: absolute;
		top: 0;
		right: 0;
		width: 15rem;
		max-height: 100%;
		overflow-y: auto;
		background: var(--color-paper, #fff);
		border: 1px solid var(--color-paper-edge, #e5e5e5);
		border-radius: 0.6rem;
		padding: 0.85rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		box-shadow: -8px 0 24px -18px rgba(0, 0, 0, 0.35);
	}
	.label {
		font-size: 0.7rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-ink-mute, #888);
		display: block;
		margin-bottom: 0.4rem;
	}
	.group-label {
		font-size: 0.65rem;
		color: var(--color-ink-mute, #999);
		display: block;
		margin: 0.4rem 0 0.25rem;
	}
	.picker {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem;
	}
	.chip,
	.seg button {
		border: 1px solid var(--color-paper-edge, #ddd);
		background: var(--color-paper, #fff);
		color: var(--color-ink, #333);
		border-radius: 0.4rem;
		padding: 0.25rem 0.5rem;
		font-size: 0.75rem;
		cursor: pointer;
	}
	.chip[data-active='true'],
	.seg button[data-active='true'] {
		background: var(--color-primary, #3b82f6);
		color: var(--color-on-primary, #fff);
		border-color: transparent;
	}
	.row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin: 0.5rem 0;
		font-size: 0.8rem;
		color: var(--color-ink, #333);
	}
	.row.check {
		justify-content: flex-start;
		cursor: pointer;
	}
	.seg {
		display: flex;
		gap: 0.25rem;
	}
	.seg.wrap {
		flex-wrap: wrap;
	}
	code {
		font-size: 0.72rem;
		color: var(--color-primary, #3b82f6);
	}
	input[type='range'] {
		width: 8rem;
	}
</style>
