<script lang="ts">
	import { Sparkline } from '@rokkit/chart'
	import { sparkline, SAMPLE_SERIES } from './store.svelte'

	const p = $derived(sparkline.props)
</script>

<div class="sparkline-explorer">
	<header class="head">
		<span class="eyebrow" data-sparkline-eyebrow>Data · live</span>
		<h3 data-sparkline-title>Sparkline</h3>
	</header>

	<!-- Primary, store-driven sparkline. The e2e hook `data-sparkline-demo`
	     scopes ONLY this one so control toggles don't get confused with the
	     fixed KPI example below. -->
	<div class="stage" data-sparkline-demo>
		{#key p.type}
			<Sparkline
				data={SAMPLE_SERIES}
				type={p.type}
				baseline={p.baseline}
				highlight={p.highlight}
				trend={p.trend}
				width={280}
				height={80}
			/>
		{/key}
	</div>

	<!-- The inline use case: a sparkline living in a table row next to a KPI. -->
	<section class="kpi" data-sparkline-kpi>
		<table>
			<thead>
				<tr><th>Metric</th><th>Last 8</th><th>Now</th></tr>
			</thead>
			<tbody>
				<tr>
					<td>Signups</td>
					<td class="spark-cell">
						<Sparkline data={SAMPLE_SERIES} type="line" highlight={['last']} width={120} height={24} />
					</td>
					<td class="num">41</td>
				</tr>
			</tbody>
		</table>
	</section>
</div>

<style>
	.sparkline-explorer {
		display: flex;
		flex-direction: column;
		gap: 16px;
		padding: 20px;
	}
	.head {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.eyebrow {
		font: 500 10.5px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.08em;
		text-transform: uppercase;
	}
	h3 {
		margin: 0;
		font: 600 15px var(--font-ui);
		color: var(--ink);
	}
	.stage {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 120px;
		padding: 16px;
		border: 1px solid var(--paper-edge);
		border-radius: var(--density-radius-base);
		background: var(--paper);
	}
	.kpi table {
		width: 100%;
		border-collapse: collapse;
		font: 400 12.5px var(--font-ui);
		color: var(--ink);
	}
	.kpi th {
		text-align: left;
		font: 500 10.5px var(--font-mono);
		color: var(--ink-soft);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		padding: 4px 8px;
		border-bottom: 1px solid var(--paper-edge);
	}
	.kpi td {
		padding: 8px;
		border-bottom: 1px solid var(--paper-edge);
	}
	.spark-cell {
		width: 130px;
	}
	.num {
		text-align: right;
		font: 500 13px var(--font-mono);
		color: var(--primary);
	}
</style>
