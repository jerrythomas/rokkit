<script lang="ts">
	/**
	 * The Architecture recipes — each one a composition of generic primitives over real
	 * metrics measured from this repo. Nothing here is a chart-package component: the zones
	 * and thresholds are the analysis, so they live with the demo.
	 */
	import { PlotChart, Plot } from '@rokkit/chart'
	import { explorer } from './store.svelte'
	import { datasets } from './datasets'
	import { mainSequenceZones, thresholds as t } from './architecture'

	const config = $derived(explorer.config)
	const data = $derived(datasets[config.dataset] as Record<string, unknown>[])
	const f = $derived(config.fields)
	const s = $derived(explorer.settings)
	const zones = mainSequenceZones(0.5)
	const size = { width: 640, height: 460 }
</script>

<div class="architecture" data-architecture-recipe={explorer.type}>
	{#if explorer.type === 'main-sequence'}
		<!-- The plane is [0,1]×[0,1] by definition, so the domain is fixed rather than
			 inferred: a zone must not shrink because no component happens to sit in it. -->
		<PlotChart {data} {...size} xDomain={[0, 1]} yDomain={[0, 1]} legend={s.legend} tooltip>
			<Plot.Region name="pain" points={zones.pain} label="Zone of pain" />
			<Plot.Region name="uselessness" points={zones.uselessness} label="Zone of uselessness" />
			{#if s.hull}
				<Plot.Hull x={f.x} y={f.y} color={f.color} padding={8} />
			{/if}
			{#if s.contour}
				<Plot.Contour x={f.x} y={f.y} bandwidth={28} thresholds={6} />
			{/if}
			<Plot.Rule slope={-1} intercept={1} label="main sequence" />
			<Plot.Point x={f.x} y={f.y} color={f.color} size={f.size} alpha={s.alpha} />
		</PlotChart>
	{:else if explorer.type === 'hotspots'}
		<PlotChart {data} {...size} legend={s.legend} tooltip>
			<Plot.Region name="hotspot" x={[t.complexity, null]} y={[t.churn, null]} label="Hotspots" />
			{#if s.contour}
				<Plot.Contour x={f.x} y={f.y} bandwidth={24} />
			{/if}
			<Plot.Point x={f.x} y={f.y} color={f.color} size={f.size} alpha={s.alpha} />
		</PlotChart>
	{:else if explorer.type === 'coverage'}
		<PlotChart {data} {...size} yDomain={[0, 1]} legend={s.legend} tooltip>
			<Plot.Region name="risk" x={[t.complexity, null]} y={[0, 0.8]} label="Complex, under-tested" />
			<Plot.Rule y={0.8} label="80%" />
			<Plot.Point x={f.x} y={f.y} color={f.color} alpha={s.alpha} />
		</PlotChart>
	{:else if explorer.type === 'coupling'}
		<PlotChart {data} {...size} legend={s.legend} tooltip>
			<Plot.Region name="hub" y={[t.fanIn, null]} label="Hubs" labelAt={[t.fanOut / 2, t.fanIn]} />
			<Plot.Region name="reach" x={[t.fanOut, null]} label="Reaches everywhere" />
			{#if s.contour}
				<Plot.Contour x={f.x} y={f.y} bandwidth={24} />
			{/if}
			<Plot.Point x={f.x} y={f.y} color={f.color} alpha={s.alpha} />
		</PlotChart>
	{:else if explorer.type === 'smells'}
		<PlotChart {data} {...size} legend={s.legend} tooltip>
			<Plot.Region name="god" x={[t.complexity, null]} y={[t.fanOut, null]} label="God modules" />
			<Plot.Point x={f.x} y={f.y} color={f.color} size={f.size} alpha={s.alpha} />
		</PlotChart>
	{/if}
	{#if config.axes}
		<p class="axes" data-architecture-axes>
			<span>x — {config.axes.x}</span>
			<span>y — {config.axes.y}</span>
		</p>
	{/if}
</div>

<style>
	.axes {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 1.25rem;
		margin: 0.5rem 0 0;
		font-size: 0.75rem;
		color: var(--color-ink-mute, #888);
	}
	/* The zones carry meaning, so they are tinted by it: pain and the risky corners in the
	   danger role, uselessness in the neutral one. Out-specifies the geom's :not([fill]) rule. */
	.architecture :global([data-plot-region='pain'] [data-plot-element='region']),
	.architecture :global([data-plot-region='hotspot'] [data-plot-element='region']),
	.architecture :global([data-plot-region='risk'] [data-plot-element='region']),
	.architecture :global([data-plot-region='god'] [data-plot-element='region']) {
		fill: var(--danger);
		fill-opacity: 0.1;
	}
	.architecture :global([data-plot-region='uselessness'] [data-plot-element='region']) {
		fill: var(--ink-mute);
		fill-opacity: 0.1;
	}
</style>
