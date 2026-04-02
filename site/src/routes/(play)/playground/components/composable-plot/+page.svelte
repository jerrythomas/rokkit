<script>
	// @ts-nocheck
	import { Plot } from '@rokkit/chart'
	import PlaySection from '$lib/components/PlaySection.svelte'
	import { mpg } from '$lib/data/mpg.js'

	// Aggregate mpg data: average highway MPG by vehicle class
	const classMeans = Object.entries(
		mpg.reduce((acc, row) => {
			if (!acc[row.class]) acc[row.class] = { sum: 0, n: 0 }
			acc[row.class].sum += row.hwy
			acc[row.class].n += 1
			return acc
		}, {})
	)
		.map(([cls, { sum, n }]) => ({ class: cls, hwy: Math.round(sum / n) }))
		.sort((a, b) => b.hwy - a.hwy)

	// Multi-series data: monthly revenue by product line
	const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
	const products = ['Alpha', 'Beta', 'Gamma']
	const colors = ['#4e79a7', '#f28e2b', '#e15759']

	const seriesData = products.map((product, i) => ({
		name: product,
		color: colors[i],
		values: months.map((month, j) => ({
			month,
			revenue: 20 + i * 15 + j * 8 + Math.round(Math.random() * 10)
		}))
	}))

	// Sort line points for correct path rendering
	seriesData.forEach((s) => s.values.sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month)))

	// All data combined for shared x/y scales in multi-line chart
	const allLineData = seriesData.flatMap((s) => s.values)
</script>

<PlaySection>
	{#snippet preview()}
		<div class="flex flex-col gap-10 p-6" data-composable-plot-demo>
			<!-- Bar chart built from primitives -->
			<div>
				<h4
					class="text-surface-z5 m-0 mb-3 text-xs font-semibold tracking-widest uppercase"
					data-chart-title
				>
					Average Highway MPG by Class (composable bars)
				</h4>
				<Plot.Root data={classMeans} x="class" y="hwy" width={560} height={280}>
					<Plot.Grid />
					<Plot.Axis type="x" label="Vehicle Class" />
					<Plot.Axis type="y" label="Avg Hwy MPG" />
					<Plot.Bar data={classMeans} x="class" y="hwy" fill="#4e79a7" />
					<Plot.Legend />
				</Plot.Root>
			</div>

			<!-- Multi-series line chart built from primitives -->
			<div>
				<h4
					class="text-surface-z5 m-0 mb-3 text-xs font-semibold tracking-widest uppercase"
					data-chart-title
				>
					Monthly Revenue by Product (composable lines)
				</h4>
				<Plot.Root data={allLineData} x="month" y="revenue" width={560} height={280}>
					<Plot.Grid />
					<Plot.Axis type="x" />
					<Plot.Axis type="y" format={(v) => `$${v}k`} />
					{#each seriesData as series (series.name)}
						<Plot.Line data={series.values} x="month" y="revenue" stroke={series.color} />
						<Plot.Point data={series.values} x="month" y="revenue" fill={series.color} r={4} />
					{/each}
				</Plot.Root>
			</div>
		</div>
	{/snippet}

	{#snippet controls()}
		<div class="text-surface-z4 p-4 text-sm">
			<p class="mb-2 font-medium">Composable Plot</p>
			<p class="text-xs leading-relaxed">
				Build custom charts by composing primitives: <code>Plot.Root</code>,
				<code>Plot.Bar</code>, <code>Plot.Line</code>, <code>Plot.Axis</code>,
				<code>Plot.Grid</code>, and <code>Plot.Point</code>.
			</p>
			<p class="mt-2 text-xs leading-relaxed">
				Each primitive reads scales from the <code>Root</code> context — no redundant prop
				passing needed.
			</p>
		</div>
	{/snippet}
</PlaySection>
