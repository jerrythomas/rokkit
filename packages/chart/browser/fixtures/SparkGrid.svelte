<script lang="ts">
	import Spark from '../../src/Spark.svelte'
	import Line from '../../src/geoms/Line.svelte'

	type Row = Record<string, unknown>

	type Props = {
		/** Number of independent <Spark> instances — a "table column" of sparklines. */
		count?: number
		/** Shared rows every cell renders. A real table column of sparklines reuses ONE
		 *  dataset shape across many rows, not `count` distinct datasets, so every cell
		 *  reads the same array (mirrors PlotGrid.svelte for a fair comparison). */
		data?: Row[]
	}

	let { count = 200, data = [] }: Props = $props()

	// A plain array to iterate — `{#each}` needs something iterable, `count` itself is not.
	const cells = $derived(Array.from({ length: count }, (_, i) => i))
</script>

<!--
	Composes the SAME <Line> geom Plot uses, inside <Spark> instead — see
	spark-perf.browser.spec.ts for what this fixture measures and why.

	`x`/`y` are passed explicitly to <Line>: geoms do not inherit channels from their
	container (SparkState.geomData only merges a geom's OWN registered channels), so
	omitting them here would render `count` empty <Line> geoms and the benchmark would
	time nothing.
-->
<div data-spark-grid>
	{#each cells as i (i)}
		<Spark {data} x="x" y="y" width={80} height={24}>
			<Line x="x" y="y" options={{ curve: 'linear' }} />
		</Spark>
	{/each}
</div>
