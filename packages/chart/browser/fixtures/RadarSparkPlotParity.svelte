<script lang="ts">
	import Spark from '../../src/Spark.svelte'
	import Plot from '../../src/Plot.svelte'
	import Radar from '../../src/geoms/Radar.svelte'

	/**
	 * The SAME <Radar> inside <Spark> and inside <Plot>, at the same size and origin, so a
	 * browser test can assert the polygon is pixel-for-pixel identical in both containers.
	 *
	 * Unlike the <Line> parity fixture, no domain fiddling is needed: radar ignores
	 * xScale/yScale entirely and derives its own per-axis domains inside polar.js, so
	 * PlotState's nice()-ing of the y-scale cannot make the two diverge. Declared domains
	 * pin it further.
	 *
	 * SIZE is deliberately well above the 112px micro threshold, so BOTH containers render
	 * the full form. That is the point: the form follows the space available, not the
	 * container's identity, so a Spark given plot-sized dimensions must produce exactly what
	 * a Plot produces. A container-sniffing implementation would fail this.
	 */
	const SIZE = 300

	const data = [
		{ metric: 'a', score: 10, team: 'T' },
		{ metric: 'b', score: 6, team: 'T' },
		{ metric: 'c', score: 3, team: 'T' }
	]

	const axes = [
		{ key: 'a', domain: [0, 10] as [number, number] },
		{ key: 'b', domain: [0, 10] as [number, number] },
		{ key: 'c', domain: [0, 10] as [number, number] }
	]
</script>

<div data-parity-harness style="position: relative; width: {SIZE}px; height: {SIZE}px;">
	<div data-parity-spark style="position: absolute; top: 0; left: 0; width: {SIZE}px;">
		<Spark {data} x="metric" y="score" color="team" width={SIZE} height={SIZE}>
			<Radar axis="metric" value="score" series="team" {axes} />
		</Spark>
	</div>
	<div data-parity-plot style="position: absolute; top: 0; left: 0; width: {SIZE}px;">
		<Plot
			{data}
			width={SIZE}
			height={SIZE}
			axes={false}
			grid={false}
			legend={false}
			animate={false}
			margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
		>
			<Radar axis="metric" value="score" series="team" {axes} />
		</Plot>
	</div>
</div>
