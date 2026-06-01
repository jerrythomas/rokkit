<script lang="ts">
	import {
		BarChart,
		LineChart,
		AreaChart,
		PieChart,
		ScatterPlot,
		BubbleChart,
		BoxPlot,
		ViolinPlot,
		Sparkline
	} from '@rokkit/chart'

	// Quarterly revenue across two products — drives Bar / Line / Area.
	const productSeries = [
		{ quarter: 'Q1', product: 'Pro', revenue: 80 },
		{ quarter: 'Q2', product: 'Pro', revenue: 120 },
		{ quarter: 'Q3', product: 'Pro', revenue: 110 },
		{ quarter: 'Q4', product: 'Pro', revenue: 165 },
		{ quarter: 'Q1', product: 'Lite', revenue: 40 },
		{ quarter: 'Q2', product: 'Lite', revenue: 60 },
		{ quarter: 'Q3', product: 'Lite', revenue: 50 },
		{ quarter: 'Q4', product: 'Lite', revenue: 45 }
	]

	// Market share by segment — drives Pie.
	const segments = [
		{ segment: 'Mobile', share: 42 },
		{ segment: 'Desktop', share: 35 },
		{ segment: 'Tablet', share: 15 },
		{ segment: 'Smart TV', share: 5 },
		{ segment: 'Other', share: 3 }
	]

	// Synthesized "mpg-ish" dataset — engine size vs efficiency by car class.
	// Drives Scatter / Bubble / Box / Violin.
	const cars = [
		{ class: 'compact', drv: 'f', displ: 1.4, cty: 28, hwy: 35 },
		{ class: 'compact', drv: 'f', displ: 1.6, cty: 26, hwy: 33 },
		{ class: 'compact', drv: 'f', displ: 1.8, cty: 24, hwy: 31 },
		{ class: 'compact', drv: 'r', displ: 2.0, cty: 22, hwy: 29 },
		{ class: 'midsize', drv: 'f', displ: 2.0, cty: 22, hwy: 30 },
		{ class: 'midsize', drv: 'f', displ: 2.4, cty: 20, hwy: 28 },
		{ class: 'midsize', drv: '4', displ: 2.5, cty: 19, hwy: 26 },
		{ class: 'midsize', drv: '4', displ: 3.0, cty: 17, hwy: 25 },
		{ class: 'suv', drv: '4', displ: 3.0, cty: 17, hwy: 23 },
		{ class: 'suv', drv: '4', displ: 3.5, cty: 16, hwy: 22 },
		{ class: 'suv', drv: '4', displ: 4.0, cty: 14, hwy: 20 },
		{ class: 'suv', drv: 'r', displ: 4.6, cty: 13, hwy: 18 },
		{ class: 'pickup', drv: '4', displ: 4.0, cty: 14, hwy: 19 },
		{ class: 'pickup', drv: '4', displ: 5.0, cty: 12, hwy: 17 },
		{ class: 'pickup', drv: '4', displ: 5.7, cty: 11, hwy: 16 },
		{ class: 'subcompact', drv: 'f', displ: 1.4, cty: 30, hwy: 38 },
		{ class: 'subcompact', drv: 'f', displ: 1.6, cty: 27, hwy: 34 },
		{ class: 'subcompact', drv: 'r', displ: 2.0, cty: 22, hwy: 28 }
	]

	const sparkSeries = [12, 45, 23, 67, 34, 89, 56, 72, 41, 90, 78, 84]
	const sparkRevenue = [110, 145, 132, 168, 154, 192]
</script>

<div class="grid">
	<section>
		<header>BarChart — quarterly revenue, grouped by product</header>
		<div class="chart-stage">
			<BarChart data={productSeries} x="quarter" y="revenue" fill="product" legend grid />
		</div>
	</section>

	<section>
		<header>LineChart — same data, lines per product</header>
		<div class="chart-stage">
			<LineChart data={productSeries} x="quarter" y="revenue" color="product" legend grid />
		</div>
	</section>

	<section>
		<header>AreaChart — stacked</header>
		<div class="chart-stage">
			<AreaChart data={productSeries} x="quarter" y="revenue" fill="product" stack legend grid />
		</div>
	</section>

	<section>
		<header>PieChart — market share by segment (donut)</header>
		<div class="chart-stage center">
			<PieChart data={segments} y="share" fill="segment" innerRadius={60} legend />
		</div>
	</section>

	<section>
		<header>ScatterPlot — engine displ vs highway mpg, coloured by class</header>
		<div class="chart-stage">
			<ScatterPlot data={cars} x="displ" y="hwy" color="class" legend grid />
		</div>
	</section>

	<section>
		<header>BubbleChart — city vs highway mpg, size = displ</header>
		<div class="chart-stage">
			<BubbleChart data={cars} x="cty" y="hwy" size="displ" color="class" legend grid />
		</div>
	</section>

	<section>
		<header>BoxPlot — highway mpg distribution by class</header>
		<div class="chart-stage">
			<BoxPlot data={cars} x="class" y="hwy" fill="drv" legend grid />
		</div>
	</section>

	<section>
		<header>ViolinPlot — same data as BoxPlot, with density</header>
		<div class="chart-stage">
			<ViolinPlot data={cars} x="class" y="hwy" fill="drv" legend grid />
		</div>
	</section>

	<section>
		<header>Sparkline — three inline shapes</header>
		<div class="spark-row">
			<div class="spark-tile">
				<span class="spark-label">Signups</span>
				<Sparkline data={sparkSeries} type="line" width={120} height={32} />
				<span class="spark-value">+78</span>
			</div>
			<div class="spark-tile">
				<span class="spark-label">Revenue</span>
				<Sparkline data={sparkRevenue} type="area" width={120} height={32} />
				<span class="spark-value">$192k</span>
			</div>
			<div class="spark-tile">
				<span class="spark-label">Errors</span>
				<Sparkline data={[8, 4, 12, 6, 3, 9, 5, 2]} type="bar" width={120} height={32} color="danger" />
				<span class="spark-value">2</span>
			</div>
		</div>
	</section>
</div>

<style>
	.grid {
		display: flex;
		flex-direction: column;
		gap: 22px;
	}
	section {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	header {
		font: 500 11px var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--ink-soft);
	}
	.chart-stage {
		border: 1px solid var(--paper-edge);
		border-radius: 8px;
		background: var(--paper);
		padding: 14px;
		overflow: hidden;
	}
	.chart-stage.center {
		display: flex;
		justify-content: center;
	}
	.chart-stage :global(svg) {
		max-width: 100%;
		height: auto;
	}
	.spark-row {
		display: flex;
		flex-wrap: wrap;
		gap: 14px;
	}
	.spark-tile {
		display: flex;
		flex-direction: column;
		gap: 4px;
		padding: 10px 14px;
		border: 1px solid var(--paper-edge);
		border-radius: 8px;
		background: var(--paper);
		min-width: 160px;
	}
	.spark-label {
		font: 500 10px var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: var(--ink-soft);
	}
	.spark-value {
		font: 600 16px var(--font-display);
		color: var(--ink);
	}
</style>
