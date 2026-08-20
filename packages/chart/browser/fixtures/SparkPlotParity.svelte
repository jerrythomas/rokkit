<script lang="ts">
	import Spark from '../../src/Spark.svelte'
	import Plot from '../../src/Plot.svelte'
	import Line from '../../src/geoms/Line.svelte'

	/**
	 * Renders the SAME <Line> geom inside <Spark> and inside <Plot> (chrome disabled, zero
	 * margin, matching width/height) so a browser-mode test can assert the rendered path is
	 * pixel-for-pixel identical. This is the guard against SparkState's no-op members
	 * (`place`, `setHovered`, `handleSelect`, `interactive`) silently changing what a geom
	 * produces — a geom never branches on which container it's inside, so if the two ever
	 * diverge, SparkState is the thing that's wrong.
	 *
	 * Both panels are absolutely positioned at the SAME origin inside `data-parity-harness`
	 * (the offset parent) so their `getBoundingClientRect()`s are directly comparable with no
	 * manual coordinate normalization — if the geometry is genuinely identical, the two rects
	 * land exactly on top of each other.
	 *
	 * Domain: `<Spark>` builds its x-scale from the data extent and takes an explicit
	 * min/max for y, both under `nice: false` (SparkState's own doc comment: a spark's
	 * peak/edge should reach the box edge, so no nice()-padding). `<Plot>` has no equivalent
	 * opt-out for y — PlotState.yScale calls buildUnifiedYScale with no `nice` override at
	 * all, so it ALWAYS nice()s, even a fully-explicit domain. [0, 3] and [0, 30] are both
	 * "nice-invariant" under d3 (verified directly: `scaleLinear().domain([0,30]).nice()` →
	 * `[0,30]`, `scaleLinear().domain([0,3]).nice()` → `[0,3]`, unchanged), so passing them
	 * explicitly via `spec` here is a fair apples-to-apples comparison, not a workaround
	 * papering over a real scale difference.
	 */
	const data = [
		{ x: 0, y: 10 },
		{ x: 1, y: 30 },
		{ x: 2, y: 5 },
		{ x: 3, y: 20 }
	]
	const width = 80
	const height = 24
	// A literal CSS color (not a design-token var) — irrelevant to this fixture's point
	// (path geometry), so kept simple and independent of any theme/token CSS.
	const color = 'rgb(51, 102, 204)'
</script>

<div data-parity-harness style="position: relative; width: {width}px; height: {height}px;">
	<div data-parity-spark style="position: absolute; top: 0; left: 0; width: {width}px;">
		<Spark {data} x="x" y="y" min={0} max={30} {width} {height}>
			<Line x="x" y="y" {color} options={{ curve: 'linear' }} />
		</Spark>
	</div>
	<div data-parity-plot style="position: absolute; top: 0; left: 0; width: {width}px;">
		<Plot
			{data}
			{width}
			{height}
			axes={false}
			grid={false}
			legend={false}
			margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
			spec={{ xDomain: [0, 3], yDomain: [0, 30] }}
		>
			<Line x="x" y="y" {color} options={{ curve: 'linear' }} />
		</Plot>
	</div>
</div>
