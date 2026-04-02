<script>
	// @ts-nocheck
	import { PlotChart } from '@rokkit/chart'
	import { Plot } from '@rokkit/chart'
	import PlaySection from '$lib/components/PlaySection.svelte'

	// Profit/loss by quarter — bars span positive and negative
	const quarterlyData = [
		{ quarter: 'Q1', profit: 42 },
		{ quarter: 'Q2', profit: -18 },
		{ quarter: 'Q3', profit: 35 },
		{ quarter: 'Q4', profit: -8 },
		{ quarter: 'Q5', profit: 27 },
		{ quarter: 'Q6', profit: 61 }
	]

	// Scatter data spanning all 4 quadrants
	const scatterData = [
		{ x: -3, y: 4, label: 'A' },
		{ x: 2, y: 5, label: 'B' },
		{ x: -1, y: -3, label: 'C' },
		{ x: 4, y: -2, label: 'D' },
		{ x: -4, y: 1, label: 'E' },
		{ x: 3, y: 3, label: 'F' },
		{ x: 1, y: -4, label: 'G' },
		{ x: -2, y: -1, label: 'H' }
	]
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-col gap-10 p-6" data-quadrant-demo>
			<!-- Negative bar chart — axes cross at zero -->
			<div>
				<h4
					class="text-surface-z5 m-0 mb-3 text-xs font-semibold tracking-widest uppercase"
					data-chart-title="negative-bars"
				>
					Quarterly Profit/Loss (negative bars)
				</h4>
				<PlotChart
					data={quarterlyData}
					spec={{ x: 'quarter', y: 'profit', geoms: [{ type: 'bar' }] }}
					axes
					grid
					width={560}
					height={300}
				/>
			</div>

			<!-- Multi-quadrant scatter — axes cross at origin -->
			<div>
				<h4
					class="text-surface-z5 m-0 mb-3 text-xs font-semibold tracking-widest uppercase"
					data-chart-title="quadrant-scatter"
				>
					Multi-quadrant scatter (axes at origin)
				</h4>
				<Plot.Root data={scatterData} x="x" y="y" width={560} height={320}>
					<Plot.Grid />
					<Plot.Axis type="x" />
					<Plot.Axis type="y" />
					<Plot.Point data={scatterData} x="x" y="y" fill="#e15759" r={6} />
				</Plot.Root>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<div class="text-surface-z4 p-4 text-sm">
			<p class="mb-2 font-medium">Quadrant-aware Axes</p>
			<p class="text-xs leading-relaxed">
				Axes automatically cross at the data origin when data spans multiple quadrants:
			</p>
			<ul class="mt-2 list-disc pl-4 text-xs leading-relaxed">
				<li>Q1 only → axes at edges (default)</li>
				<li>y spans ± → x-axis at y=0</li>
				<li>x spans ± → y-axis at x=0</li>
				<li>All quadrants → both axes cross at origin</li>
			</ul>
			<p class="mt-2 text-xs leading-relaxed">
				Negative bars grow downward from the zero baseline.
			</p>
		</div>
	{/snippet}
</PlaySection>
