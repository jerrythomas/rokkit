<script>
	// @ts-nocheck
	import { CrossFilter, FilterBar, FilterSlider, BarChart } from '@rokkit/chart'
	import PlaySection from '$lib/components/PlaySection.svelte'
	import { mpg } from '$lib/data/mpg.js'

	// mpg: 234 rows — fields: manufacturer, model, displ, year, cyl, trans, drv, cty, hwy, fl, class
	// CrossFilter demo:
	//   FilterBar(class)   — click to toggle categorical filter on vehicle class
	//   FilterSlider(hwy)  — drag to set range filter on highway MPG
	//   Main BarChart(class × hwy mean) — dims bars excluded by the class filter

	const hwyMin = Math.min(...mpg.map((r) => r.hwy))
	const hwyMax = Math.max(...mpg.map((r) => r.hwy))
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-col gap-6 p-6">
			<CrossFilter>
				<div data-cf-demo-layout>
					<div data-cf-demo-filters>
						<p data-cf-demo-hint>Click bars to filter by class:</p>
						<FilterBar data={mpg} field="class" valueField="hwy" stat="count" width={280} height={110} />

						<p data-cf-demo-hint>Drag to filter highway MPG range:</p>
						<FilterSlider field="hwy" min={hwyMin} max={hwyMax} step={1} label="Highway MPG" />
					</div>

					<div data-cf-demo-chart>
						<h4 data-cf-demo-title>Mean Highway MPG by Class</h4>
						<BarChart
							data={mpg}
							x="class"
							y="hwy"
							stat="mean"
							grid={true}
							legend={false}
							width={420}
							height={260}
						/>
					</div>
				</div>
			</CrossFilter>
		</div>
	{/snippet}

	{#snippet controls()}
		<div data-cf-controls-note>
			<p>
				<strong>CrossFilter</strong> — wraps multiple charts and controls in a shared filter context.
			</p>
			<ul>
				<li><strong>FilterBar</strong> — click a bar to add/remove that category from the active filter. Click again to deselect.</li>
				<li><strong>FilterSlider</strong> — drag the handles to set a min/max range for a continuous field.</li>
			</ul>
			<p>Bars in the main chart are <em>dimmed</em> when excluded by the active class filter.</p>
		</div>
	{/snippet}

	{#snippet data()}
		<div class="overflow-x-auto">
			<table class="w-full text-xs">
				<thead>
					<tr class="border-surface-z2 border-b">
						{#each Object.keys(mpg[0]) as col}
							<th class="text-surface-z4 py-1 pr-3 text-left font-medium">{col}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each mpg as row}
						<tr class="border-surface-z2 border-b last:border-0">
							{#each Object.values(row) as val}
								<td class="py-1 pr-3">{val}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/snippet}
</PlaySection>

<style>
	[data-cf-demo-layout] {
		display: flex;
		gap: 32px;
		align-items: flex-start;
		flex-wrap: wrap;
	}

	[data-cf-demo-filters] {
		display: flex;
		flex-direction: column;
		gap: 16px;
		min-width: 200px;
	}

	[data-cf-demo-hint] {
		margin: 0;
		font-size: 11px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		opacity: 0.6;
	}

	[data-cf-demo-chart] {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	[data-cf-demo-title] {
		margin: 0;
		font-size: 12px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		opacity: 0.7;
	}

	[data-cf-controls-note] {
		padding: 12px 16px;
		font-size: 13px;
		line-height: 1.6;
	}

	[data-cf-controls-note] ul {
		padding-left: 16px;
		margin: 8px 0;
	}

	[data-cf-controls-note] li {
		margin-bottom: 4px;
	}
</style>
