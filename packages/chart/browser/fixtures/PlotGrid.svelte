<script lang="ts">
	import Plot from '../../src/Plot.svelte'
	import Line from '../../src/geoms/Line.svelte'

	type Row = Record<string, unknown>

	type Props = {
		/** Number of independent <Plot> instances — the <Plot>-based counterpart to
		 *  SparkGrid.svelte's "table column" of sparks. */
		count?: number
		/** Shared rows every cell renders — same array as SparkGrid.svelte for a fair
		 *  comparison (same data, same box, same geom). */
		data?: Row[]
	}

	let { count = 200, data = [] }: Props = $props()

	const cells = $derived(Array.from({ length: count }, (_, i) => i))
</script>

<!--
	Same <Line> geom as SparkGrid.svelte, same 80x24 box, same shared rows — but composed
	inside <Plot> with its chrome fully disabled (axes/grid/legend off, zero margin) so the
	comparison isolates PlotState's extra machinery (zoom/facets/selection/format/tooltip/
	orientation-flip/etc — see SparkState.svelte.js's doc comment) rather than measuring
	axis or legend rendering Spark never had in the first place. See spark-perf.browser.spec.ts.

	`x`/`y` passed explicitly to <Line> for the same reason as SparkGrid: geoms don't
	inherit channels from their container (PlotState.geomData has the identical merge-only-
	the-registered-channels behaviour as SparkState.geomData).
-->
<div data-plot-grid>
	{#each cells as i (i)}
		<Plot
			{data}
			width={80}
			height={24}
			axes={false}
			grid={false}
			legend={false}
			margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
		>
			<Line x="x" y="y" options={{ curve: 'linear' }} />
		</Plot>
	{/each}
</div>
