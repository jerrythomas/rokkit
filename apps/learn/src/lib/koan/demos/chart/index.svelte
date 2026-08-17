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
		Sparkline,
		PlotChart,
		AnimatedPlot,
		GeomArea,
		GeomLine,
		Plot
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

	// 30-day daily metric — gently rising with wobble (deterministic, no RNG).
	const metrics = Array.from({ length: 30 }, (_, i) => ({
		day: i - 29, // -29 … 0 (today)
		value: Math.round(40 + i * 1.6 + 8 * Math.sin(i / 2))
	}))
	const dayFormat = (d: unknown) => (Number(d) === 0 ? 'today' : `${d}d`)
	// Literal CSS color (matches Highlight geom's accent dot) — see isLiteralColor()
	// in packages/chart/src/lib/brewing/colors.js, which recognizes rgb(...) as a literal.
	const accentColor = 'rgb(var(--color-accent-500))'

	let picked = $state<{ day: number; value: number } | null>(null)

	// ── Animation demos ──────────────────────────────────────────────────────
	// (a) Data-change / flip animation: two value sets over the same segments;
	//     toggling swaps values (or orientation) and the bars glide via the
	//     [data-plot-animate] CSS geometry transitions (no JS tweening).
	const barsA = [
		{ segment: 'Mobile', share: 42 },
		{ segment: 'Desktop', share: 35 },
		{ segment: 'Tablet', share: 15 },
		{ segment: 'Smart TV', share: 5 },
		{ segment: 'Other', share: 3 }
	]
	const barsB = [
		{ segment: 'Mobile', share: 22 },
		{ segment: 'Desktop', share: 48 },
		{ segment: 'Tablet', share: 9 },
		{ segment: 'Smart TV', share: 12 },
		{ segment: 'Other', share: 9 }
	]
	let barSet = $state<'A' | 'B'>('A')
	let barOrient = $state<'vertical' | 'horizontal'>('vertical')
	const bars = $derived(barSet === 'A' ? barsA : barsB)
	// AnimatedPlot orientation — flips a standard animation via the same geom place() path.
	let animOrient = $state<'vertical' | 'horizontal'>('vertical')

	// Numeric-category flip: x is a NUMBER (year) the bar geom bands — flips like a string category.
	const yearlyRevenue = [
		{ year: 2019, revenue: 120 },
		{ year: 2020, revenue: 150 },
		{ year: 2021, revenue: 135 },
		{ year: 2022, revenue: 180 },
		{ year: 2023, revenue: 210 }
	]

	// (b) AnimatedPlot bar-chart race: revenue per company across years (frames).
	//     Deterministic (Math.sin wobble, no RNG); rankings cross so the race moves.
	const raceCompanies = ['Acme', 'Globex', 'Initech', 'Umbrella', 'Wayne']
	const raceBase: Record<string, number> = { Acme: 60, Globex: 20, Initech: 35, Umbrella: 50, Wayne: 10 }
	const raceGrowth: Record<string, number> = { Acme: 8, Globex: 14, Initech: 11, Umbrella: 6, Wayne: 17 }
	const raceData = Array.from({ length: 6 }, (_, t) => t).flatMap((t) =>
		raceCompanies.map((company) => ({
			year: 2019 + t,
			company,
			revenue: Math.round(raceBase[company] + raceGrowth[company] * t + 6 * Math.sin(t + company.length))
		}))
	)
</script>

<div class="grid">
	<section>
		<header>Metrics — last 30 days · daily (grid + trend + highlight)</header>
		<div class="chart-stage">
			<PlotChart
				data={metrics}
				x="day"
				y="value"
				grid="both"
				trend="avg"
				highlight="last"
				xFormat={dayFormat}
				width={720}
				height={240}
				selectable
				onselect={(d) => {
					const detail = d as { x: unknown; value: unknown }
					picked = { day: Number(detail.x), value: Number(detail.value) }
				}}
			>
				<GeomArea x="day" y="value" color={accentColor} />
				<GeomLine x="day" y="value" color={accentColor} />
			</PlotChart>
			{#if picked}
				<p class="metrics-pick">Selected: {picked.day === 0 ? 'today' : `${picked.day}d`} · {picked.value}</p>
			{/if}
		</div>
	</section>

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
			<BoxPlot data={cars} x="class" y="hwy" legend grid />
		</div>
	</section>

	<section>
		<header>ViolinPlot — same data as BoxPlot, with density</header>
		<div class="chart-stage">
			<ViolinPlot data={cars} x="class" y="hwy" legend grid />
		</div>
	</section>

	<section>
		<header>Distribution — hwy by class (composable Plot.Box + outliers + beeswarm)</header>
		<div class="chart-stage">
			<Plot.Root data={cars} x="class" y="hwy" width={520} height={280}>
				<Plot.Axis />
				<Plot.Box x="class" y="hwy" />
				<Plot.Jitter x="class" y="hwy" method="swarm" r={2.5} />
			</Plot.Root>
		</div>
		<div class="chart-stage">
			<Plot.Root data={cars} x="class" y="hwy" width={520} height={280}>
				<Plot.Axis />
				<Plot.Violin x="class" y="hwy" />
				<Plot.Jitter x="class" y="hwy" method="jitter" r={2} />
			</Plot.Root>
		</div>
	</section>

	<section>
		<header>Raincloud — half-violin + thin box + jittered points (composable `side`)</header>
		<div class="chart-stage">
			<Plot.Root data={cars} x="class" y="hwy" width={560} height={300} margin={{ top: 10, right: 20, bottom: 40, left: 50 }}>
				<Plot.Axis type="x" />
				<Plot.Axis type="y" />
				<Plot.Violin x="class" y="hwy" side="left" />
				<Plot.Box x="class" y="hwy" side="center" width={0.16} />
				<Plot.Jitter x="class" y="hwy" side="right" method="swarm" r={2.5} />
			</Plot.Root>
		</div>
	</section>

	<section>
		<header>Sort by value — bars ordered by size (sort="desc"), not by axis label</header>
		<div class="chart-stage">
			<Plot.Root data={yearlyRevenue} x="year" y="revenue" sort="desc" width={560} height={280} margin={{ top: 10, right: 20, bottom: 40, left: 50 }}>
				<Plot.Axis type="x" />
				<Plot.Axis type="y" />
				<Plot.Bar x="year" y="revenue" fill="year" />
			</Plot.Root>
		</div>
	</section>

	<section>
		<header>Reference lines — Plot.Rule (thresholds/targets), transpose with the chart</header>
		<div class="chart-stage">
			<Plot.Root data={yearlyRevenue} x="year" y="revenue" width={560} height={280} margin={{ top: 10, right: 20, bottom: 40, left: 50 }}>
				<Plot.Axis type="x" />
				<Plot.Axis type="y" />
				<Plot.Bar x="year" y="revenue" fill="year" />
				<Plot.Rule y={150} label="target" stroke="var(--danger)" />
			</Plot.Root>
		</div>
	</section>

	<section>
		<header>Pattern fills — Box & Violin textured (an option beside solid/transparent)</header>
		<div class="chart-stage">
			<Plot.Root data={cars} x="class" y="hwy" width={560} height={280} margin={{ top: 10, right: 20, bottom: 40, left: 50 }}>
				<Plot.Axis type="x" />
				<Plot.Axis type="y" />
				<Plot.Box x="class" y="hwy" pattern="class" />
			</Plot.Root>
		</div>
		<div class="chart-stage">
			<Plot.Root data={cars} x="class" y="hwy" width={560} height={280} margin={{ top: 10, right: 20, bottom: 40, left: 50 }}>
				<Plot.Axis type="x" />
				<Plot.Axis type="y" />
				<Plot.Violin x="class" y="hwy" pattern="class" />
			</Plot.Root>
		</div>
	</section>

		<section>
			<header>Orientation flip — horizontal box + jitter (same x/y, orientation="horizontal")</header>
			<div class="chart-stage">
				<Plot.Root data={cars} x="class" y="hwy" orientation="horizontal" width={520} height={280} margin={{ top: 10, right: 20, bottom: 40, left: 80 }}>
					<Plot.Axis type="x" />
					<Plot.Axis type="y" />
					<Plot.Box x="class" y="hwy" />
					<Plot.Jitter x="class" y="hwy" method="jitter" r={3} />
				</Plot.Root>
			</div>
			<div class="chart-stage">
				<Plot.Root data={cars} x="class" y="hwy" orientation="horizontal" width={520} height={280} margin={{ top: 10, right: 20, bottom: 40, left: 80 }}>
					<Plot.Axis type="x" />
					<Plot.Axis type="y" />
					<Plot.Violin x="class" y="hwy" />
					<Plot.Jitter x="class" y="hwy" method="jitter" r={2} />
				</Plot.Root>
			</div>
		</section>

		<section>
			<header>Composable Plot.Bar — unified geom, vertical + horizontal (flip)</header>
			<div class="chart-stage">
				<Plot.Root data={segments} x="segment" y="share" width={520} height={280} margin={{ top: 10, right: 20, bottom: 40, left: 50 }}>
					<Plot.Axis type="x" />
					<Plot.Axis type="y" />
					<Plot.Bar x="segment" y="share" fill="segment" />
				</Plot.Root>
			</div>
			<div class="chart-stage">
				<Plot.Root data={segments} x="segment" y="share" orientation="horizontal" width={520} height={280} margin={{ top: 10, right: 20, bottom: 40, left: 80 }}>
					<Plot.Axis type="x" />
					<Plot.Axis type="y" />
					<Plot.Bar x="segment" y="share" fill="segment" />
				</Plot.Root>
			</div>
		</section>

	<section>
		<header>Animate on change — bars glide on value & orientation changes (data-plot-animate)</header>
		<div class="demo-controls">
			<button type="button" onclick={() => (barSet = barSet === 'A' ? 'B' : 'A')}>
				Toggle data (set {barSet})
			</button>
			<button
				type="button"
				onclick={() => (barOrient = barOrient === 'vertical' ? 'horizontal' : 'vertical')}
			>
				Orientation: {barOrient}
			</button>
		</div>
		<div class="chart-stage">
			<Plot.Root
				data={bars}
				x="segment"
				y="share"
				orientation={barOrient}
				width={520}
				height={280}
				margin={{ top: 10, right: 20, bottom: 40, left: 80 }}
			>
				<Plot.Axis type="x" />
				<Plot.Axis type="y" />
				<Plot.Bar x="segment" y="share" fill="segment" />
			</Plot.Root>
		</div>
	</section>

	<section>
		<header>Numeric-category flip — revenue by year (numeric x), horizontal</header>
		<div class="chart-stage">
			<Plot.Root
				data={yearlyRevenue}
				x="year"
				y="revenue"
				orientation="horizontal"
				width={520}
				height={280}
				margin={{ top: 10, right: 20, bottom: 40, left: 60 }}
			>
				<Plot.Axis type="x" />
				<Plot.Axis type="y" />
				<Plot.Bar x="year" y="revenue" fill="year" />
			</Plot.Root>
		</div>
	</section>

	<section>
		<header>AnimatedPlot orientation — a standard animation flips via the same geom place() path</header>
		<div class="demo-controls">
			<button
				type="button"
				onclick={() => (animOrient = animOrient === 'vertical' ? 'horizontal' : 'vertical')}
			>
				Orientation: {animOrient}
			</button>
		</div>
		<div class="chart-stage">
			<AnimatedPlot
				data={raceData}
				animate={{ by: 'year', duration: 900, loop: true }}
				x="company"
				y="revenue"
				color="company"
				orientation={animOrient}
				width={600}
				height={280}
			/>
		</div>
	</section>

	<section>
		<header>AnimatedPlot — revenue bar-chart race (frames by year · press play)</header>
		<div class="chart-stage">
			<AnimatedPlot
				data={raceData}
				animate={{ by: 'year', duration: 900, loop: true }}
				x="revenue"
				y="company"
				color="company"
				sorted
				label
				width={600}
				height={280}
			/>
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
	.metrics-pick {
		margin: 8px 0 0;
		font: 500 12px var(--font-mono);
		color: var(--ink-soft);
	}
	.demo-controls {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.demo-controls button {
		font: 500 11px var(--font-mono);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--ink-soft);
		background: var(--paper);
		border: 1px solid var(--paper-edge);
		border-radius: 6px;
		padding: 6px 12px;
		cursor: pointer;
	}
	.demo-controls button:hover {
		color: var(--ink);
		border-color: var(--paper-edge-hover, var(--paper-edge));
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
