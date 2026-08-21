<script lang="ts">
	import Plot from '../../src/Plot.svelte'
	import Radar from '../../src/geoms/Radar.svelte'

	/**
	 * A radar at a known size with DECLARED per-axis domains, so every vertex radius is a
	 * fixed fraction of R rather than "whatever the inferred max happened to be". Values
	 * 10 / 5 / 2.5 on a [0, 10] domain put the three vertices at R, R/2 and R/4 under the
	 * default linear transform — three distinct radii, so a test can catch a vertex pinned
	 * to the outer ring or collapsed to the centre.
	 *
	 * Equal weights, so the angles reduce to the closed form -90 + i*360/n that the browser
	 * spec pins independently.
	 *
	 * The wrapper is fixed at exactly SIZE px because PlotSurface takes its width from a
	 * ResizeObserver on the container, not from the `width` prop — an unconstrained
	 * container would render at the viewport width and every pinned pixel would be wrong.
	 * Zero margin so innerWidth/innerHeight are exactly SIZE and [data-plot-canvas] sits at
	 * the svg origin. `animate={false}`: a mid-flight mark measures wrong and makes
	 * Playwright's stability check flaky.
	 */
	const SIZE = 300

	const data = [
		{ metric: 'a', score: 10, team: 'T' },
		{ metric: 'b', score: 5, team: 'T' },
		{ metric: 'c', score: 2.5, team: 'T' }
	]

	const axes = [
		{ key: 'a', domain: [0, 10] as [number, number] },
		{ key: 'b', domain: [0, 10] as [number, number] },
		{ key: 'c', domain: [0, 10] as [number, number] }
	]
</script>

<div data-radar-harness style="position: relative; width: {SIZE}px; height: {SIZE}px;">
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
		<Radar
			axis="metric"
			value="score"
			series="team"
			{axes}
			options={{ grid: true, radiusScale: 'linear' }}
		/>
	</Plot>
</div>
