<script lang="ts">
	import { PlotChart, Plot } from '@rokkit/chart'
	import { explorer } from './store.svelte'
	import { datasets } from './datasets'

	const config = $derived(explorer.config)
	const data = $derived(datasets[config.dataset] as Record<string, unknown>[])
	const f = $derived(config.fields)
	const s = $derived(explorer.settings)
	// Pie + Sankey ribbon are radial/flow layouts — no cartesian axes/grid.
	const noAxes = $derived(explorer.type === 'pie' || explorer.type === 'ribbon')
</script>

<div class="explorer" data-plot-explorer>
	<header class="explorer-head">
		<span class="eyebrow" data-plot-explorer-eyebrow>{config.group} · live</span>
		<h3 data-plot-explorer-title>{config.label}</h3>
	</header>

	<div class="chart" data-plot-explorer-chart>
		{#key explorer.type}
			<PlotChart {data} width={640} height={460} grid={!noAxes} axes={!noAxes} legend={s.legend} orientation={s.orientation}>
				{#if explorer.type === 'bar'}
					<Plot.Bar x={f.x} y={f.y} fill={s.fill || undefined} position={s.position} alpha={s.alpha} pattern={s.pattern || undefined} />
				{:else if explorer.type === 'line'}
					<Plot.Line x={f.x} y={f.y} color={s.color || undefined} alpha={s.alpha} />
				{:else if explorer.type === 'area'}
					<Plot.Area x={f.x} y={f.y} fill={s.fill || undefined} position={s.position} alpha={s.alpha} pattern={s.pattern || undefined} />
				{:else if explorer.type === 'pie'}
					<Plot.Arc theta={f.y} fill={s.fill || undefined} alpha={s.alpha} pattern={s.pattern || undefined} options={{ innerRadius: s.innerRadius }} />
				{:else if explorer.type === 'scatter'}
					<Plot.Point x={f.x} y={f.y} color={s.color || undefined} alpha={s.alpha} />
				{:else if explorer.type === 'bubble'}
					<Plot.Point x={f.x} y={f.y} size={f.size} color={s.color || undefined} alpha={s.alpha} />
				{:else if explorer.type === 'box'}
					<Plot.Box x={f.x} y={f.y} fill={s.fill || undefined} alpha={s.alpha} pattern={s.pattern || undefined} />
				{:else if explorer.type === 'violin'}
					<Plot.Violin x={f.x} y={f.y} fill={s.fill || undefined} alpha={s.alpha} pattern={s.pattern || undefined} />
				{:else if explorer.type === 'heatmap'}
					<Plot.Heatmap x={f.x} y={f.y} color={f.color} alpha={s.alpha} />
				{:else if explorer.type === 'hexbin'}
					<Plot.Hexbin x={f.x} y={f.y} alpha={s.alpha} options={{ radius: 16 }} />
				{:else if explorer.type === 'candlestick'}
					<Plot.Candlestick x={f.x} alpha={s.alpha} options={{ open: 'open', high: 'high', low: 'low', close: 'close' }} />
				{:else if explorer.type === 'waterfall'}
					<Plot.Waterfall x={f.x} y={f.y} alpha={s.alpha} options={{ totalField: 'total' }} />
				{:else if explorer.type === 'ribbon'}
					<Plot.Ribbon alpha={s.alpha} options={{ source: 'source', target: 'target', value: 'value' }} />
				{:else if explorer.type === 'rule'}
					<Plot.Line x={f.x} y={f.y} alpha={s.alpha} />
					<Plot.Rule y={[60, 85]} label="target" />
				{/if}
			</PlotChart>
		{/key}
	</div>
</div>

<style>
	.explorer {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.eyebrow {
		font-size: 0.7rem;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--color-ink-mute, #888);
	}
	h3 {
		margin: 0.1rem 0 0;
		font-size: 1.25rem;
		color: var(--color-ink, #222);
	}
	.chart {
		width: 100%;
	}
</style>
